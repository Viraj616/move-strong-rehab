import webpush from 'web-push';

export function validateSettings(s) {
  if (!s || !Array.isArray(s.movementTimes) || s.movementTimes.length > 10 || !Array.isArray(s.saunaDays) || s.saunaDays.length > 7) throw Error('Invalid schedule');
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (s.movementTimes.some(t => !time.test(t)) || !time.test(s.saunaTime) || s.saunaDays.some(n => !Number.isInteger(n) || n < 0 || n > 6)) throw Error('Invalid schedule');
  new Intl.DateTimeFormat('en-GB', { timeZone: s.timeZone }).format();
  if (typeof s.timeZone !== 'string' || s.timeZone.length > 80) throw Error('Invalid timezone');
  return { movementTimes: [...new Set(s.movementTimes)].sort(), saunaDays: s.saunaDays, saunaTime: s.saunaTime, timeZone: s.timeZone };
}
export function validateSubscription(s) {
  const url = new URL(s?.endpoint);
  if (url.protocol !== 'https:' || url.port || url.username || url.password || !/^(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com)$/.test(url.hostname)) throw Error('Unsupported push provider');
  if (s.endpoint.length > 2048 || !/^[A-Za-z0-9_-]{87}$/.test(s.keys?.p256dh || '') || !/^[A-Za-z0-9_-]{22}$/.test(s.keys?.auth || '')) throw Error('Invalid subscription');
  return { endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } };
}
export function validateActivity(a = {}) {
  const result = { completed: [], lastMovementAt: 0 };
  if (Number.isFinite(a.lastMovementAt) && a.lastMovementAt <= Date.now() + 60000) result.lastMovementAt = a.lastMovementAt;
  if (Array.isArray(a.completed)) result.completed = a.completed.filter(v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}\/(move-\d{2}:\d{2}|sauna)$/.test(v)).slice(0, 100);
  return result;
}
export function dueEvents(settings, activity, now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: settings.timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' }).formatToParts(now).map(p => [p.type, p.value]));
  const day = `${parts.year}-${parts.month}-${parts.day}`;
  const weekday = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(parts.weekday);
  const minute = Number(parts.hour) * 60 + Number(parts.minute);
  const events = weekday < 5 ? settings.movementTimes.map(time => ({ id: `move-${time}`, time, title: 'Time for a movement break', body: 'Take a comfortable 5–10 minute walk.', kind: 'movement' })) : [];
  if (settings.saunaDays.includes(weekday)) events.push({ id: 'sauna', time: settings.saunaTime, title: 'Optional sauna time', body: 'Check how you feel before your session.', kind: 'sauna' });
  return events.map(e => ({ ...e, key: `${day}/${e.id}` })).filter(e => {
    const [h, m] = e.time.split(':').map(Number); const elapsed = minute - h * 60 - m;
    return elapsed >= 0 && elapsed < 10 && !activity.completed?.includes(e.key) && (e.kind !== 'movement' || now.getTime() - (activity.lastMovementAt || 0) >= 45 * 60000);
  });
}
const hash = async token => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)))).map(b => b.toString(16).padStart(2, '0')).join('');
function response(data, status, env) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': env.APP_ORIGIN, 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', 'Vary': 'Origin', 'Cache-Control': 'no-store' } });
}
function mcpResponse(data, status = 200, extraHeaders = {}) {
  return new Response(data === null ? null : JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders } });
}
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const FINGERPRINT = /^v1-[a-f0-9]{8}-[a-f0-9]{8}-\d{1,6}$/;
const REVIEW_IDS = new Set(['d3e-scap-pull','d3e-pullup-single','d3e-row','d3e-er','d2m-er','d1e-pushup','d1m-scap','d2e-bss','d2e-slrdl','d2e-calf','d1m-deadbug','cardio','week']);
const cleanText = (value, max = 240) => String(value || '').trim().slice(0, max);
const plusDays = (value, days) => {
  if (!DATE.test(value || '')) throw Error('Invalid week date');
  const date = new Date(`${value}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10);
};
function validateSnapshot(value) {
  if (!value || value.schemaVersion !== 1 || !DATE.test(value.sourceWeekStart || '') || value.nextWeekStart !== plusDays(value.sourceWeekStart, 7)) throw Error('Invalid weekly snapshot');
  if (!FINGERPRINT.test(value.sourceFingerprint || '') || !Array.isArray(value.days) || value.days.length !== 7) throw Error('Invalid weekly snapshot');
  const numberList = input => Array.isArray(input) ? input.map(Number).filter(n => Number.isFinite(n) && n > 0 && n <= 200).slice(0, 20) : [];
  const equipment = value.equipment || {};
  const days = value.days.map((day, index) => {
    if (!day || day.date !== plusDays(value.sourceWeekStart, index)) throw Error('Invalid weekly day');
    const workout = day.workout || {}; const exercises = {};
    for (const [id, entry] of Object.entries(workout.exercises || {})) {
      if (!/^[a-z0-9-]{1,60}$/.test(id) || !entry || Object.keys(exercises).length >= 30) throw Error('Invalid exercise log');
      exercises[id] = { done: Boolean(entry.done), sets: Array.isArray(entry.sets) ? entry.sets.map(v => cleanText(v, 12)).slice(0, 10) : [], load: cleanText(entry.load, 100), rir: cleanText(entry.rir, 8), technique: cleanText(entry.technique, 20) };
    }
    const plan = day.plan || {}; const exerciseOverrides = {};
    for (const [id, target] of Object.entries(plan.exerciseOverrides || {})) {
      if (!/^[a-z0-9-]{1,60}$/.test(id) || !target || Object.keys(exerciseOverrides).length >= 30) continue;
      const reps = Array.isArray(target.targetReps) ? target.targetReps.map(Number).filter(Number.isFinite).slice(0, 10) : Number(target.targetReps);
      exerciseOverrides[id] = { prescription: cleanText(target.prescription, 240), targetSets: Number(target.targetSets) || 0, targetReps: reps, implement: cleanText(target.implement, 80), loadLabel: cleanText(target.loadLabel, 100), variation: cleanText(target.variation, 80) };
      if (target.loadKg !== undefined && Number.isFinite(Number(target.loadKg))) exerciseOverrides[id].loadKg = Number(target.loadKg);
    }
    const recovery = day.nextMorningRecovery && typeof day.nextMorningRecovery === 'object' ? { workoutDate: cleanText(day.nextMorningRecovery.workoutDate, 10), pain: cleanText(day.nextMorningRecovery.pain, 8), status: cleanText(day.nextMorningRecovery.status, 20), plateSymptoms: Boolean(day.nextMorningRecovery.plateSymptoms), complete: Boolean(day.nextMorningRecovery.complete) } : null;
    return { date: day.date, plan: { title: cleanText(plan.title, 120), short: cleanText(plan.short, 80), kind: cleanText(plan.kind, 40), minutes: Number(plan.minutes) || 0, ids: Array.isArray(plan.ids) ? plan.ids.filter(id => typeof id === 'string').slice(0, 30) : [], exerciseOverrides }, workout: { complete: Boolean(workout.complete), minutes: cleanText(workout.minutes, 8), effort: cleanText(workout.effort, 8), painDuring: cleanText(workout.painDuring, 8), painAfter: cleanText(workout.painAfter, 8), painNext: cleanText(workout.painNext, 8), cardioMinutes: cleanText(workout.cardioMinutes, 8), breathingSymptoms: cleanText(workout.breathingSymptoms, 40), relieverUsed: Boolean(workout.relieverUsed), exercises }, nextMorningRecovery: recovery };
  });
  const completedSessions = days.filter(day => day.workout.complete).length; const ready = completedSessions >= 5 || new Date().toISOString().slice(0, 10) >= value.nextWeekStart;
  return { schemaVersion: 1, sourceWeekStart: value.sourceWeekStart, nextWeekStart: value.nextWeekStart, sourceFingerprint: value.sourceFingerprint, ready, completedSessions, equipment: { dumbbellsKg: numberList(equipment.dumbbellsKg), kettlebellsKg: numberList(equipment.kettlebellsKg), bands: Array.isArray(equipment.bands) ? equipment.bands.map(v => cleanText(v, 40)).filter(Boolean).slice(0, 10) : [], pullUpBar: Boolean(equipment.pullUpBar), rowingMachine: Boolean(equipment.rowingMachine) }, days };
}
function validateDraft(value) {
  if (!value || !DATE.test(value.sourceWeekStart || '') || value.nextWeekStart !== plusDays(value.sourceWeekStart, 7) || !FINGERPRINT.test(value.sourceFingerprint || '')) throw Error('Invalid review draft');
  if (!Array.isArray(value.items) || !value.items.length || value.items.length > 30) throw Error('Invalid review items');
  const items = value.items.map(input => {
    if (!REVIEW_IDS.has(input?.id) || !['PROGRESS','HOLD','REGRESS'].includes(input.state)) throw Error('Invalid review item');
    const item = { id: input.id, name: cleanText(input.name, 120) || input.id, state: input.state, from: cleanText(input.from), to: cleanText(input.to), reason: cleanText(input.reason, 500) };
    if (!item.to || !item.reason) throw Error('Review items require a prescription and reason');
    if (item.id === 'cardio') { item.minutes = Number(input.minutes); if (!Number.isInteger(item.minutes) || item.minutes < 5 || item.minutes > 180) throw Error('Invalid cardio duration'); }
    else if (item.id !== 'week') {
      const target = input.target || {}; const reps = Array.isArray(target.targetReps) ? target.targetReps.map(Number) : Number(target.targetReps); const sets = Number(target.targetSets);
      if (!Number.isInteger(sets) || sets < 1 || sets > 10 || (Array.isArray(reps) ? reps.some(n => !Number.isFinite(n) || n < 0 || n > 100) : !Number.isFinite(reps) || reps < 0 || reps > 100)) throw Error('Invalid strength target');
      item.target = { prescription: item.to, targetSets: sets, targetReps: reps, implement: cleanText(target.implement, 80), loadLabel: cleanText(target.loadLabel, 100), variation: cleanText(target.variation, 80) || 'standard' };
      if (target.loadKg !== undefined && target.loadKg !== '') { item.target.loadKg = Number(target.loadKg); if (!Number.isFinite(item.target.loadKg) || item.target.loadKg < 0 || item.target.loadKg > 200) throw Error('Invalid load'); }
    }
    return item;
  });
  return { sourceWeekStart: value.sourceWeekStart, nextWeekStart: value.nextWeekStart, sourceFingerprint: value.sourceFingerprint, summary: cleanText(value.summary, 1000), items, reviewedAt: new Date().toISOString(), reviewedBy: 'codex', status: 'draft' };
}
async function latestSnapshot(env, sourceWeekStart) {
  const query = sourceWeekStart ? 'SELECT snapshot FROM weekly_snapshots WHERE source_week_start=? ORDER BY updated_at DESC LIMIT 1' : 'SELECT snapshot FROM weekly_snapshots ORDER BY updated_at DESC LIMIT 1';
  const row = sourceWeekStart ? await env.DB.prepare(query).bind(sourceWeekStart).first() : await env.DB.prepare(query).first();
  return row ? JSON.parse(row.snapshot) : null;
}
const toolResult = structuredContent => ({ content: [{ type: 'text', text: JSON.stringify(structuredContent) }], structuredContent });
async function callReviewTool(env, name, args = {}) {
  if (name === 'get_profile') {
    const snapshot = await latestSnapshot(env); const draft = await env.DB.prepare("SELECT next_week_start,status,updated_at FROM review_drafts ORDER BY updated_at DESC LIMIT 1").first();
    return toolResult({ profile: 'Move Strong private weekly review', latestSourceWeekStart: snapshot?.sourceWeekStart || null, latestReady: Boolean(snapshot?.ready), latestDraft: draft || null });
  }
  if (name === 'get_review_status') {
    const snapshot = await latestSnapshot(env, args.sourceWeekStart); const draft = snapshot ? await env.DB.prepare('SELECT next_week_start,status,updated_at FROM review_drafts WHERE source_week_start=? ORDER BY updated_at DESC LIMIT 1').bind(snapshot.sourceWeekStart).first() : null;
    return toolResult({ sourceWeekStart: snapshot?.sourceWeekStart || args.sourceWeekStart || null, ready: Boolean(snapshot?.ready), completedSessions: snapshot?.completedSessions || 0, nextWeekStart: snapshot?.nextWeekStart || null, draft: draft || null });
  }
  if (name === 'get_week_for_review') {
    const snapshot = await latestSnapshot(env, args.sourceWeekStart); if (!snapshot) throw Error('No weekly snapshot is available'); if (!snapshot.ready) throw Error('The week is not ready for review'); return toolResult({ snapshot });
  }
  if (name === 'save_next_week_draft') {
    const draft = validateDraft(args); const snapshot = await latestSnapshot(env, draft.sourceWeekStart);
    if (!snapshot?.ready || snapshot.sourceFingerprint !== draft.sourceFingerprint || snapshot.nextWeekStart !== draft.nextWeekStart) throw Error('Workout data changed or the week is not ready; fetch it again');
    const existing = await env.DB.prepare('SELECT created_at FROM review_drafts WHERE next_week_start=?').bind(draft.nextWeekStart).first(); const now = Date.now();
    await env.DB.prepare("INSERT INTO review_drafts(next_week_start,source_week_start,source_fingerprint,draft,status,created_at,updated_at) VALUES(?,?,?,?, 'draft',?,?) ON CONFLICT(next_week_start) DO UPDATE SET source_week_start=excluded.source_week_start,source_fingerprint=excluded.source_fingerprint,draft=excluded.draft,status='draft',updated_at=excluded.updated_at").bind(draft.nextWeekStart, draft.sourceWeekStart, draft.sourceFingerprint, JSON.stringify(draft), existing?.created_at || now, now).run();
    return toolResult({ saved: true, status: 'draft', nextWeekStart: draft.nextWeekStart, message: 'Draft saved. The user must approve it in Move Strong before it changes the plan.' });
  }
  throw Error('Unknown tool');
}
const REVIEW_TOOLS = [
  { name: 'get_profile', description: 'Get the bounded Move Strong weekly-review connection status. No free-text health notes are exposed.', inputSchema: { type: 'object', additionalProperties: false }, annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false } },
  { name: 'get_review_status', description: 'Check whether a weekly snapshot is ready and whether a draft already exists.', inputSchema: { type: 'object', properties: { sourceWeekStart: { type: 'string', description: 'Monday in YYYY-MM-DD format.' } }, additionalProperties: false }, annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false } },
  { name: 'get_week_for_review', description: 'Read one ready, bounded week of completed workout performance, recovery, plan and owned equipment.', inputSchema: { type: 'object', required: ['sourceWeekStart'], properties: { sourceWeekStart: { type: 'string', description: 'Monday in YYYY-MM-DD format.' } }, additionalProperties: false }, annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false } },
  {
    name: 'save_next_week_draft', description: 'Save a conservative next-week proposal for explicit approval in Move Strong. This never activates the plan.',
    inputSchema: {
      type: 'object', required: ['sourceWeekStart','nextWeekStart','sourceFingerprint','summary','items'], additionalProperties: false,
      properties: {
        sourceWeekStart: { type: 'string' }, nextWeekStart: { type: 'string' }, sourceFingerprint: { type: 'string' }, summary: { type: 'string' },
        items: { type: 'array', minItems: 1, maxItems: 30, items: { type: 'object', required: ['id','state','to','reason'], properties: { id: { type: 'string' }, name: { type: 'string' }, state: { enum: ['PROGRESS','HOLD','REGRESS'] }, from: { type: 'string' }, to: { type: 'string' }, reason: { type: 'string' }, minutes: { type: 'integer' }, target: { type: 'object' } } } }
      }
    },
    annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: false }
  }
];
async function handleMcp(request, env) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') || '';
  if (!env.MCP_ACCESS_TOKEN || await hash(token) !== await hash(env.MCP_ACCESS_TOKEN)) return mcpResponse({ error: 'Unauthorised' }, 401, { 'WWW-Authenticate': 'Bearer realm="move-strong-review"' });
  if (request.method !== 'POST') return mcpResponse({ error: 'Method not allowed' }, 405);
  const raw = await request.text(); if (raw.length > 128000) return mcpResponse({ error: 'Request too large' }, 413);
  let message; try { message = JSON.parse(raw || '{}'); } catch { return mcpResponse({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, 400); }
  if (message.method === 'notifications/initialized') return mcpResponse(null, 202);
  const ok = result => mcpResponse({ jsonrpc: '2.0', id: message.id ?? null, result }); const fail = (code, error) => mcpResponse({ jsonrpc: '2.0', id: message.id ?? null, error: { code, message: error.message || String(error) } });
  try {
    if (message.method === 'initialize') return ok({ protocolVersion: '2025-06-18', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'move-strong-weekly-review', version: '1.0.0' } });
    if (message.method === 'ping') return ok({});
    if (message.method === 'tools/list') return ok({ tools: REVIEW_TOOLS });
    if (message.method === 'tools/call') return ok(await callReviewTool(env, message.params?.name, message.params?.arguments || {}));
    return fail(-32601, Error('Method not found'));
  } catch (error) { return fail(-32000, error); }
}
async function send(env, subscription, payload) {
  const request = webpush.generateRequestDetails(subscription, JSON.stringify({ ...payload, url: env.APP_URL }), { TTL: 600, urgency: 'normal', vapidDetails: { subject: env.APP_URL, publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY } });
  // Workers supports only follow/manual. Do not follow a redirect with push credentials.
  return fetch(request.endpoint, { method: 'POST', headers: request.headers, body: request.body, redirect: 'manual' });
}
async function deliver(env, device, event) {
  const claimed = await env.DB.prepare('INSERT OR IGNORE INTO deliveries(device_id,event_key,sent_at) VALUES(?,?,?)').bind(device.id, event.key, Date.now()).run();
  if (!claimed.meta.changes) return { ok: false, status: 429, error: 'A test was already sent this minute. Wait one minute before retrying.' };
  try {
    const result = await send(env, JSON.parse(device.subscription), { title: event.title, body: event.body, tag: event.key });
    if (result.status === 404 || result.status === 410) {
      await env.DB.prepare('UPDATE devices SET enabled=0 WHERE id=?').bind(device.id).run();
      return { ok: false, status: 410, error: 'Your browser subscription expired. Disconnect and reconnect this phone.' };
    }
    if (!result.ok) throw Error(`Push provider rejected delivery (HTTP ${result.status})`);
    return { ok: true, status: 200 };
  } catch (error) {
    const reason = String(error.message || error.name).replace(/https?:\/\/\S+/g, '[provider]').slice(0, 220);
    console.error(JSON.stringify({ event: 'push_delivery_failed', reason }));
    // Transient failures can retry during the 10-minute delivery window.
    await env.DB.prepare('DELETE FROM deliveries WHERE device_id=? AND event_key=?').bind(device.id, event.key).run();
    return { ok: false, status: 502, error: `Notification could not be sent: ${reason}` };
  }
}
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/mcp') return handleMcp(request, env);
    if (request.headers.get('Origin') !== env.APP_ORIGIN) return response({ error: 'Origin not allowed' }, 403, env);
    if (request.method === 'OPTIONS') return response({}, 200, env);
    if (path === '/config' && request.method === 'GET') return response({ publicKey: env.VAPID_PUBLIC_KEY }, 200, env);
    try {
      if (!['POST','DELETE'].includes(request.method)) return response({ error: 'Not found' }, 404, env);
      const raw = await request.text(); if (raw.length > (path.startsWith('/review/') ? 96000 : 16000)) return response({ error: 'Request too large' }, 413, env);
      const data = JSON.parse(raw || '{}');
      const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') || '';
      if (path === '/subscribe' && request.method === 'POST') {
        if (!env.PAIRING_TOKEN || await hash(token) !== await hash(env.PAIRING_TOKEN)) return response({ error: 'Incorrect pairing code' }, 401, env);
        const subscription = validateSubscription(data.subscription); const settings = validateSettings(data.settings);
        if (!/^[a-f0-9-]{36}$/.test(data.id || '') || !/^[A-Za-z0-9_-]{43}$/.test(data.deviceToken || '')) throw Error('Invalid device');
        const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM devices WHERE enabled=1 AND id!=?').bind(data.id).first();
        if (count.n >= 4) return response({ error: 'Four-device limit reached' }, 409, env);
        await env.DB.prepare('INSERT INTO devices(id,token_hash,subscription,settings,activity,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET token_hash=excluded.token_hash,subscription=excluded.subscription,settings=excluded.settings,activity=excluded.activity,enabled=1,updated_at=excluded.updated_at').bind(data.id, await hash(data.deviceToken), JSON.stringify(subscription), JSON.stringify(settings), JSON.stringify(validateActivity(data.activity)), Date.now()).run();
        return response({ ok: true }, 200, env);
      }
      const device = await env.DB.prepare('SELECT * FROM devices WHERE id=? AND token_hash=?').bind(data.id || '', await hash(token)).first();
      if (!device) return response({ error: 'Reconnect this device' }, 401, env);
      if (path === '/disable' && request.method === 'DELETE') {
        await env.DB.batch([env.DB.prepare('DELETE FROM devices WHERE id=?').bind(device.id), env.DB.prepare('DELETE FROM deliveries WHERE device_id=?').bind(device.id), env.DB.prepare('DELETE FROM weekly_snapshots WHERE device_id=?').bind(device.id)]);
      } else if (path === '/sync' && request.method === 'POST') {
        if (!device.enabled) return response({ error: 'Push subscription expired. Reconnect this device.' }, 410, env);
        await env.DB.prepare('UPDATE devices SET settings=?,activity=?,updated_at=? WHERE id=?').bind(JSON.stringify(validateSettings(data.settings)), JSON.stringify(validateActivity(data.activity)), Date.now(), device.id).run();
      } else if (path === '/review/sync' && request.method === 'POST') {
        const snapshots = Array.isArray(data.snapshots) ? data.snapshots : [data.snapshot];
        if (!snapshots.length || snapshots.length > 2) throw Error('Invalid weekly snapshots');
        const retainedSourceWeeks = []; const retainedNextWeeks = [];
        for (const value of snapshots) {
          const snapshot = validateSnapshot(value);
          retainedSourceWeeks.push(snapshot.sourceWeekStart); retainedNextWeeks.push(snapshot.nextWeekStart);
          await env.DB.prepare('INSERT INTO weekly_snapshots(device_id,source_week_start,source_fingerprint,ready,snapshot,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(device_id,source_week_start) DO UPDATE SET source_fingerprint=excluded.source_fingerprint,ready=excluded.ready,snapshot=excluded.snapshot,updated_at=excluded.updated_at').bind(device.id, snapshot.sourceWeekStart, snapshot.sourceFingerprint, snapshot.ready ? 1 : 0, JSON.stringify(snapshot), Date.now()).run();
        }
        if (retainedSourceWeeks.length === 2) await env.DB.batch([
          env.DB.prepare('DELETE FROM weekly_snapshots WHERE device_id=? AND source_week_start NOT IN (?,?)').bind(device.id, ...retainedSourceWeeks),
          env.DB.prepare('DELETE FROM review_drafts WHERE next_week_start NOT IN (?,?)').bind(...retainedNextWeeks)
        ]);
      } else if (path === '/review/draft' && request.method === 'POST') {
        if (!DATE.test(data.nextWeekStart || '')) throw Error('Invalid next week');
        const row = await env.DB.prepare("SELECT draft,status FROM review_drafts WHERE next_week_start=? AND status='draft'").bind(data.nextWeekStart).first();
        return response({ draft: row ? { ...JSON.parse(row.draft), status: row.status } : null }, 200, env);
      } else if (path === '/review/approve' && request.method === 'POST') {
        if (!DATE.test(data.nextWeekStart || '')) throw Error('Invalid next week');
        await env.DB.prepare("UPDATE review_drafts SET status='approved',updated_at=? WHERE next_week_start=? AND status='draft'").bind(Date.now(), data.nextWeekStart).run();
      } else if (path === '/review/disable' && request.method === 'DELETE') {
        await env.DB.batch([env.DB.prepare('DELETE FROM weekly_snapshots WHERE device_id=?').bind(device.id), env.DB.prepare('DELETE FROM review_drafts')]);
      } else if (path === '/test' && request.method === 'POST') {
        const result = await deliver(env, device, { key: `test/${Math.floor(Date.now()/60000)}`, title: 'Move Strong is connected', body: 'Your phone can now receive scheduled reminders.' });
        return response({ ...result, message: result.ok ? 'Test sent' : result.error }, result.status, env);
      } else return response({ error: 'Not found' }, 404, env);
      return response({ ok: true }, 200, env);
    } catch { return response({ error: 'Unable to process request. Check your settings and try again.' }, 400, env); }
  },
  async scheduled(event, env) {
    const now = new Date(event.scheduledTime);
    const { results } = await env.DB.prepare('SELECT * FROM devices WHERE enabled=1 LIMIT 4').all();
    for (const device of results) {
      for (const reminder of dueEvents(JSON.parse(device.settings), JSON.parse(device.activity), now)) await deliver(env, device, reminder);
    }
    if (now.getUTCHours() === 0 && now.getUTCMinutes() === 0) await env.DB.batch([
      env.DB.prepare('DELETE FROM deliveries WHERE sent_at < ?').bind(Date.now() - 7 * 86400000),
      env.DB.prepare('DELETE FROM weekly_snapshots WHERE updated_at < ?').bind(Date.now() - 21 * 86400000),
      env.DB.prepare('DELETE FROM review_drafts WHERE updated_at < ?').bind(Date.now() - 35 * 86400000)
    ]);
  }
};
