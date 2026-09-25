/* Optional Firebase Auth + Firestore sync. Credentials stay outside exported health data. */
const CloudSync = (() => {
  'use strict';
  const CONFIG_KEY = 'moveStrongFirebaseSyncV1';
  let bridge = null;
  let timer = null;
  let syncing = false;
  let lastError = '';
  let lastSyncedAt = '';

  function read() {
    try { return JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null') || {}; } catch { return {}; }
  }
  function write(value) { localStorage.setItem(CONFIG_KEY, JSON.stringify(value)); }
  function status() {
    const c = read();
    return { configured: Boolean(c.projectId && c.apiKey && c.refreshToken && c.uid), email: c.email || '', projectId: c.projectId || '', lastSyncedAt: lastSyncedAt || c.lastSyncedAt || '', syncing, error: lastError };
  }
  async function jsonFetch(url, options = {}) {
    const response = await fetch(url, options); const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error?.message || `Cloud request failed (${response.status})`);
    return data;
  }
  async function authenticate({ projectId, apiKey, email, password }, create) {
    if (!projectId || !apiKey || !email || !password) throw new Error('Firebase project ID, web API key, email and password are required');
    const action = create ? 'signUp' : 'signInWithPassword';
    const data = await jsonFetch(`https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${encodeURIComponent(apiKey)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }) });
    const config = { projectId: projectId.trim(), apiKey: apiKey.trim(), email: email.trim(), uid: data.localId, refreshToken: data.refreshToken, idToken: data.idToken, expiresAt: Date.now() + Number(data.expiresIn || 3600) * 1000 };
    write(config); return config;
  }
  async function token(config) {
    if (config.idToken && Number(config.expiresAt) > Date.now() + 60000) return config;
    const data = await jsonFetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(config.apiKey)}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: config.refreshToken }) });
    const updated = { ...config, uid: data.user_id, idToken: data.id_token, refreshToken: data.refresh_token, expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000 };
    write(updated); return updated;
  }
  const documentUrl = c => `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(c.projectId)}/databases/(default)/documents/users/${encodeURIComponent(c.uid)}/healthData/current`;
  async function pull(config) {
    const response = await fetch(documentUrl(config), { headers: { Authorization: `Bearer ${config.idToken}` } });
    if (response.status === 404) return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error?.message || `Cloud download failed (${response.status})`);
    const payload = data.fields?.payload?.stringValue;
    if (!payload) return null;
    const parsed = JSON.parse(payload);
    if (!parsed || typeof parsed !== 'object') throw new Error('Cloud data is invalid');
    return parsed;
  }
  async function push(config, state) {
    await jsonFetch(documentUrl(config), { method: 'PATCH', headers: { Authorization: `Bearer ${config.idToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { payload: { stringValue: JSON.stringify(state) }, schemaVersion: { integerValue: '3' }, updatedAt: { timestampValue: new Date().toISOString() } } }) });
  }
  async function syncNow() {
    if (syncing || !bridge || !navigator.onLine) return false;
    let config = read(); if (!config.refreshToken) return false;
    syncing = true; lastError = '';
    try {
      config = await token(config); const remote = await pull(config);
      if (remote) await bridge.mergeRemote(remote);
      await push(config, bridge.getState());
      lastSyncedAt = new Date().toISOString(); write({ ...read(), lastSyncedAt });
      return true;
    } catch (error) { lastError = error.message || 'Cloud sync failed'; return false; }
    finally { syncing = false; }
  }
  function schedule() { clearTimeout(timer); if (status().configured) timer = setTimeout(syncNow, 1200); }
  async function connect(details, create = false) { await authenticate(details, create); const ok = await syncNow(); if (!ok) throw new Error(lastError || 'Cloud sync could not complete'); return status(); }
  function disconnect() { clearTimeout(timer); localStorage.removeItem(CONFIG_KEY); lastError = ''; lastSyncedAt = ''; }
  function init(value) { bridge = value; window.addEventListener('online', schedule); if (status().configured) setTimeout(syncNow, 100); }
  return { init, status, schedule, syncNow, connect, disconnect };
})();
