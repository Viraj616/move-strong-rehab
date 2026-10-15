/* Device credentials deliberately stay outside the health backup/export. */
const PushReminders = (() => {
  const KEY = 'moveStrongPushDeviceV1';
  let error = ''; let syncing = false; let lastSnapshot = ''; let lastReviewSnapshot = ''; let timer;
  function connection() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } }
  function snapshot() {
    const health = state.healthOS || HealthModel.defaults();
    const completed = []; let lastMovementAt = 0;
    for (const [day, record] of Object.entries(health.days)) {
      if (day < HealthModel.addDays(HealthModel.dateKey(), -1) || day > HealthModel.dateKey()) continue;
      lastMovementAt = Math.max(lastMovementAt, Date.parse(record.lastMovementAt) || 0);
      if (record.sauna?.complete) completed.push(`${day}/sauna`);
      for (const [id, activity] of Object.entries(record.activities || {})) if (id.startsWith('move-') && ['done', 'skipped'].includes(activity.status)) completed.push(`${day}/${id}`);
    }
    return { settings: { movementTimes: health.settings.movementTimes, saunaDays: health.settings.saunaDays, saunaTime: health.settings.saunaTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }, activity: { completed, lastMovementAt } };
  }
  async function api(url, path, token, data, method = 'POST') {
    const response = await fetch(url + path, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data), signal: AbortSignal.timeout(15000) });
    const result = await response.json();
    if (!response.ok) throw Error(result.error || result.message || 'Connection failed');
    return result;
  }
  function bytes(value) { return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)); }
  function randomToken() { return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''); }
  function panel() {
    const c = connection(); const reviewing = Boolean(state.healthOS?.settings?.aiWeeklyReview);
    const status = reviewing && c ? ['ACTIVE', 'Tonight at 20:00'] : reviewing ? ['CONNECT ONCE', 'Automatic review starts after connection'] : ['OFF', 'Your base programme remains active'];
    const reviewControl = `<div class="os-automation-toggle"><div><strong>Adapt tomorrow automatically</strong><span>No approval step. Only an unstarted next day can change.</span></div><label class="os-switch"><input id="ai-weekly-review" type="checkbox" ${reviewing ? 'checked' : ''}><span aria-hidden="true"></span><em>${reviewing ? 'On' : 'Off'}</em></label></div>`;
    const connectionUi = c ? `<p class="help-text">${error ? escapeHtml(error) : `Last synced: ${c.syncedAt ? escapeHtml(new Date(c.syncedAt).toLocaleString()) : 'Waiting'}`}</p><div class="os-toolbar"><button id="push-test" class="primary-btn">Send test notification</button><button id="push-sync" class="secondary-btn">Sync now</button><button id="push-disable" class="text-btn">Disconnect this phone</button></div>` : `<form id="push-connect"><div class="field"><label for="push-url">Private service address</label><input id="push-url" name="url" type="url" value="https://move-strong-reminders.viraj616.workers.dev" required></div><div class="field"><label for="push-code">Pairing code</label><input id="push-code" name="code" type="password" autocomplete="off" required></div><button class="primary-btn">Connect this phone</button></form>`;
    return `<section class="card os-automation-card"><div class="os-automation-heading"><div><p class="eyebrow">Daily adaptation</p><h3>Your next day, reviewed in context</h3></div><span class="os-status-pill ${reviewing && c ? 'is-ready' : ''}">${status[0]}</span></div><p class="help-text">${status[1]}. The weekly structure stays stable while performance, recovery and goals can refine tomorrow.</p>${reviewControl}${connectionUi}<details class="os-privacy-details"><summary>What the private review uses</summary><p>All-history trends, automatic skill pathways, the latest 14 days in detail, goals, equipment, symptoms, recovery, and session, recovery, goal and clinician/loading notes. Notes are treated as your observations—not instructions. Structured safety fields take precedence, and sign-in details are never sent.</p><p>Turning adaptation off removes shared snapshots and reviewed plans on the next online sync.</p></details></section>`;
  }
  async function syncDailyReview(c, health, force) {
    if (!health.settings.aiWeeklyReview) { lastReviewSnapshot = ''; return false; }
    const today = HealthModel.dateKey();
    const snapshots = [HealthModel.addDays(today, -1), today].map(sourceDate => HealthModel.dailyReviewSnapshot(health, sourceDate, today, state.goals, state.logs));
    const serialized = JSON.stringify(snapshots);
    if (force || serialized !== lastReviewSnapshot) {
      await api(c.url, '/review/sync', c.token, { id: c.id, snapshots });
      lastReviewSnapshot = serialized;
    }
    let changed = false;
    for (const targetDate of [today, HealthModel.addDays(today, 1)]) {
      const result = await api(c.url, '/review/draft', c.token, { id: c.id, targetDate });
      const local = health.reviewDrafts?.[targetDate];
      const freshRevision = result.draft && result.draft.sourceFingerprint !== local?.sourceFingerprint;
      if (result.draft && (freshRevision || !['approved', 'skipped'].includes(local?.status))) {
        HealthModel.storeDailyReviewedPlan(health, result.draft, state.goals, state.logs);
        HealthModel.activateDailyReviewedPlan(health, targetDate, state.goals, state.logs);
        changed = true;
        try { await api(c.url, '/review/approve', c.token, { id: c.id, targetDate }); } catch { /* Local activation is safe; acknowledge on a later sync. */ }
      } else if (result.draft && ['approved', 'skipped'].includes(local?.status)) {
        try { await api(c.url, '/review/approve', c.token, { id: c.id, targetDate }); } catch { /* Retry on the next sync. */ }
      }
    }
    return changed;
  }
  async function sync(force = false) {
    const c = connection(); if (!c || syncing || !navigator.onLine) return;
    const data = snapshot(); const serialized = JSON.stringify(data);
    if (!force && serialized === lastSnapshot && !state.healthOS?.settings?.aiWeeklyReview && !c.reviewSharing) return;
    syncing = true;
    try {
      if (force || serialized !== lastSnapshot) { await api(c.url, '/sync', c.token, { id: c.id, ...data }); lastSnapshot = serialized; }
      const currentHealth = state.healthOS || HealthModel.defaults();
      if (!currentHealth.settings.aiWeeklyReview && c.reviewSharing) await api(c.url, '/review/disable', c.token, { id: c.id }, 'DELETE');
      const changed = await syncDailyReview(c, currentHealth, force);
      error = ''; localStorage.setItem(KEY, JSON.stringify({ ...c, reviewSharing: Boolean(currentHealth.settings.aiWeeklyReview), syncedAt: Date.now() }));
      if (changed) { saveState(); if (typeof render === 'function') render(); }
    }
    catch (e) { error = `Connection has not synced: ${e.message}`; }
    finally { syncing = false; }
  }
  function scheduleSync() { clearTimeout(timer); timer = setTimeout(() => sync(), 1000); }
  function bind() {
    document.getElementById('ai-weekly-review')?.addEventListener('change', e => {
      state.healthOS ||= HealthModel.defaults(); state.healthOS.settings.aiWeeklyReview = e.target.checked; saveState();
      showToast(e.target.checked ? (connection() ? 'Daily Codex adaptation enabled' : 'Daily adaptation enabled. Connect this device to start sharing.') : 'Daily Codex adaptation disabled'); render();
    });
    document.getElementById('push-connect')?.addEventListener('submit', async e => {
      e.preventDefault(); const button = e.target.querySelector('button'); button.disabled = true;
      let subscription; let newlySubscribed = false;
      try {
        const form = new FormData(e.target); const url = new URL(form.get('url'));
        if (url.protocol !== 'https:' || !/^[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev$/.test(url.hostname) || url.port || url.username || url.password) throw Error('Use your Cloudflare workers.dev HTTPS address');
        if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) throw Error('Use an up-to-date Android browser that supports push');
        if (await Notification.requestPermission() !== 'granted') throw Error('Allow notifications in your browser settings first');
        const registration = await Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => setTimeout(() => reject(Error('Reload the app online, then try again')), 10000))]);
        const configResponse = await fetch(url.origin + '/config', { signal: AbortSignal.timeout(15000) });
        if (!configResponse.ok) throw Error('Server is not configured for this app address');
        const config = await configResponse.json();
        subscription = await registration.pushManager.getSubscription();
        if (!subscription) { subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes(config.publicKey) }); newlySubscribed = true; }
        const c = { url: url.origin, id: crypto.randomUUID(), token: randomToken(), syncedAt: Date.now() };
        await api(c.url, '/subscribe', form.get('code'), { id: c.id, deviceToken: c.token, subscription: subscription.toJSON(), ...snapshot() });
        localStorage.setItem(KEY, JSON.stringify(c)); error = ''; showToast('Phone connected. Send a test notification.'); render();
      } catch (err) { if (newlySubscribed) await subscription?.unsubscribe().catch(() => {}); showToast(err.message); }
      finally { button.disabled = false; }
    });
    document.getElementById('push-test')?.addEventListener('click', async () => { const c = connection(); try { await api(c.url, '/test', c.token, { id: c.id }); showToast('Test sent. Check your phone notifications.'); } catch (e) { showToast(e.message); } });
    document.getElementById('push-sync')?.addEventListener('click', async () => { await sync(true); showToast(error || 'Schedule synced'); render(); });
    document.getElementById('push-disable')?.addEventListener('click', async () => {
      const c = connection();
      try {
        await api(c.url, '/disable', c.token, { id: c.id }, 'DELETE');
        const registration = await navigator.serviceWorker.getRegistration(); const subscription = await registration?.pushManager.getSubscription(); await subscription?.unsubscribe();
        localStorage.removeItem(KEY); lastSnapshot = ''; lastReviewSnapshot = ''; showToast('Phone disconnected'); render();
      } catch (e) { showToast(`Could not disconnect: ${e.message}`); }
    });
  }
  window.addEventListener('online', scheduleSync);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleSync(); });
  setInterval(() => sync(), 60000);
  return { panel, bind, scheduleSync, connected: () => Boolean(connection()), status: () => { const c = connection(); return { connected: Boolean(c), syncedAt: c?.syncedAt || null, error, reviewing: Boolean(state.healthOS?.settings?.aiWeeklyReview) }; } };
})();
