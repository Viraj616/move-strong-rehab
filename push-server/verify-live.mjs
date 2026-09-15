const origin = 'https://viraj616.github.io';
const base = 'https://move-strong-reminders.viraj616.workers.dev';
const result = await fetch(base + '/config', { headers: { Origin: origin }, signal: AbortSignal.timeout(20000) });
const config = await result.json();
if (!result.ok || config.publicKey?.length !== 87 || result.headers.get('Access-Control-Allow-Origin') !== origin) throw Error('Invalid public push configuration');
const denied = await fetch(base + '/sync', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', Authorization: 'Bearer invalid' }, body: '{}', signal: AbortSignal.timeout(20000) });
if (denied.status !== 401) throw Error('Unauthenticated requests must be denied');
console.log('Live checks passed: public key, exact CORS origin, D1 authentication lookup, unauthorised request rejection.');
