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
async function send(env, subscription, payload) {
  const request = webpush.generateRequestDetails(subscription, JSON.stringify({ ...payload, url: env.APP_URL }), { TTL: 600, urgency: 'normal', vapidDetails: { subject: env.APP_URL, publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY } });
  return fetch(request.endpoint, { method: 'POST', headers: request.headers, body: request.body, redirect: 'error' });
}
async function deliver(env, device, event) {
  const claimed = await env.DB.prepare('INSERT OR IGNORE INTO deliveries(device_id,event_key,sent_at) VALUES(?,?,?)').bind(device.id, event.key, Date.now()).run();
  if (!claimed.meta.changes) return false;
  try {
    const result = await send(env, JSON.parse(device.subscription), { title: event.title, body: event.body, tag: event.key });
    if (result.status === 404 || result.status === 410) await env.DB.prepare('UPDATE devices SET enabled=0 WHERE id=?').bind(device.id).run();
    else if (!result.ok) throw Error('Push provider rejected delivery');
    return result.ok;
  } catch {
    // Transient failures can retry during the 10-minute delivery window.
    await env.DB.prepare('DELETE FROM deliveries WHERE device_id=? AND event_key=?').bind(device.id, event.key).run();
    return false;
  }
}
export default {
  async fetch(request, env) {
    if (request.headers.get('Origin') !== env.APP_ORIGIN) return response({ error: 'Origin not allowed' }, 403, env);
    if (request.method === 'OPTIONS') return response({}, 200, env);
    const path = new URL(request.url).pathname;
    if (path === '/config' && request.method === 'GET') return response({ publicKey: env.VAPID_PUBLIC_KEY }, 200, env);
    try {
      if (!['POST','DELETE'].includes(request.method)) return response({ error: 'Not found' }, 404, env);
      const raw = await request.text(); if (raw.length > 16000) return response({ error: 'Request too large' }, 413, env);
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
        await env.DB.batch([env.DB.prepare('DELETE FROM devices WHERE id=?').bind(device.id), env.DB.prepare('DELETE FROM deliveries WHERE device_id=?').bind(device.id)]);
      } else if (path === '/sync' && request.method === 'POST') {
        if (!device.enabled) return response({ error: 'Push subscription expired. Reconnect this device.' }, 410, env);
        await env.DB.prepare('UPDATE devices SET settings=?,activity=?,updated_at=? WHERE id=?').bind(JSON.stringify(validateSettings(data.settings)), JSON.stringify(validateActivity(data.activity)), Date.now(), device.id).run();
      } else if (path === '/test' && request.method === 'POST') {
        const ok = await deliver(env, device, { key: `test/${Math.floor(Date.now()/60000)}`, title: 'Move Strong is connected', body: 'Your phone can now receive scheduled reminders.' });
        return response({ ok, message: ok ? 'Test sent' : 'Test not sent; wait one minute before retrying' }, ok ? 200 : 429, env);
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
    if (now.getUTCHours() === 0 && now.getUTCMinutes() === 0) await env.DB.prepare('DELETE FROM deliveries WHERE sent_at < ?').bind(Date.now() - 7 * 86400000).run();
  }
};
