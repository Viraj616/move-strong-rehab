/* Date-based records live alongside, never in place of, the original six-week logs. */
(function (root) {
  'use strict';
  const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const date = key => new Date(`${key}T12:00:00`);
  const addDays = (key, count) => { const d = date(key); d.setDate(d.getDate() + count); return dateKey(d); };
  const weekday = key => (date(key).getDay() + 6) % 7;
  const weekStart = key => addDays(key, -weekday(key));
  const defaults = () => ({ schemaVersion: 2, settings: { wake: '06:30', workout: '07:05', work: '09:00', windDown: '22:15', bedtime: '22:45', saunaTime: '18:00', saunaDays: [1, 3], movementTimes: ['11:00', '13:00', '15:30'], reminders: false, upperBodyCleared: false, clearanceNotes: '' }, days: {}, milestones: {}, reminderState: {} });
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  function normalize(value) {
    const base = defaults();
    if (!value) return base;
    if (!isObject(value) || value.schemaVersion !== 2 || !isObject(value.days) || !isObject(value.settings)) throw new Error('Unsupported health data');
    const result = { ...base, ...value, settings: { ...base.settings, ...value.settings } };
    for (const key of ['wake', 'workout', 'work', 'windDown', 'bedtime', 'saunaTime']) if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(result.settings[key])) throw new Error('Invalid schedule');
    if (!Array.isArray(result.settings.movementTimes) || result.settings.movementTimes.length > 10 || result.settings.movementTimes.some(t => !/^([01]\d|2[0-3]):[0-5]\d$/.test(t))) throw new Error('Invalid reminder times');
    if (!Array.isArray(result.settings.saunaDays) || result.settings.saunaDays.some(d => !Number.isInteger(d) || d < 0 || d > 6)) throw new Error('Invalid sauna schedule');
    if (!isObject(result.milestones) || !isObject(result.reminderState)) throw new Error('Invalid health records');
    for (const [key, day] of Object.entries(result.days)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || dateKey(date(key)) !== key || !isObject(day)) throw new Error('Invalid day');
      for (const field of ['routine', 'activities', 'recovery', 'workout', 'sauna']) if (day[field] !== undefined && !isObject(day[field])) throw new Error('Invalid day record');
      if (day.workout?.exercises && !isObject(day.workout.exercises)) throw new Error('Invalid exercises');
    }
    return result;
  }
  function dayRecord(health, key) {
    return health.days[key] ||= { routine: {}, activities: {}, recovery: {}, workout: { complete: false, exercises: {} } };
  }
  function mergeHealth(incoming, existing) {
    const restored = normalize(incoming);
    if (!existing) return restored;
    const local = normalize(existing);
    const days = { ...restored.days };
    for (const [key, day] of Object.entries(local.days)) {
      const saved = restored.days[key] || {};
      days[key] = { ...saved, ...day,
        routine: { ...saved.routine, ...day.routine },
        activities: { ...saved.activities, ...day.activities },
        recovery: { ...saved.recovery, ...day.recovery },
        workout: day.workout?.updatedAt || Object.keys(day.workout?.exercises || {}).length ? day.workout : saved.workout || day.workout
      };
    }
    return { ...restored, ...local, days, milestones: { ...restored.milestones, ...local.milestones } };
  }
  function shift(time, minutes) {
    const [h, m] = time.split(':').map(Number); const n = (h * 60 + m + minutes + 1440) % 1440;
    return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  }
  const plans = [
    { title: 'Pull + shoulder control', short: 'Pull', kind: 'strength', minutes: 45, ids: ['d3e-warm', 'd3e-scap-pull', 'd3e-pullup-single', 'd3e-row', 'd3e-er', 'd1m-deadbug'] },
    { title: 'Legs + aerobic base', short: 'Legs', kind: 'strength', minutes: 45, ids: ['d2e-warm', 'd2e-bss', 'd2e-slrdl', 'd2e-calf', 'd2e-zone2'] },
    { title: 'Push + control foundations', short: 'Push', kind: 'strength', minutes: 45, ids: ['d1e-warm', 'd1e-pushup', 'd1m-scap', 'd2m-er', 'd1m-deadbug'] },
    { title: 'Easy run / walk', short: 'Cardio', kind: 'cardio', minutes: 30, ids: [] },
    { title: 'Calisthenics foundations', short: 'Skills', kind: 'strength', minutes: 40, ids: ['d3e-warm', 'd3e-pullup-single', 'd1e-pushup', 'd3e-row', 'd1m-deadbug'] },
    { title: 'Longer easy cardio', short: 'Endurance', kind: 'cardio', minutes: 45, ids: [] },
    { title: 'Recovery + mobility', short: 'Recovery', kind: 'recovery', minutes: 20, ids: ['d2m-9090', 'd2m-hinge', 'd1m-hiprot'] }
  ];
  function planFor(health, key) {
    const day = health.days[key];
    // Retain the identity of previously logged sessions; unstarted days follow the weekly plan.
    const recorded = day?.workout?.complete || day?.workout?.updatedAt || Object.keys(day?.workout?.exercises || {}).length;
    const override = day?.planIndex;
    return plans[recorded && Number.isInteger(override) && override >= 0 && override < 7 ? override : weekday(key)];
  }
  function timeline(health, key) {
    const s = health.settings; const plan = planFor(health, key);
    return [
      { id: 'water', time: s.wake, title: 'Wake + water', minutes: 5, kind: 'routine' },
      { id: 'light', time: shift(s.wake, 10), title: 'Outside light + walk', minutes: 10, kind: 'routine' },
      { id: 'warmup', time: shift(s.workout, -10), title: 'Gentle warm-up', minutes: 10, kind: 'routine' },
      { id: 'workout', time: s.workout, title: plan.title, minutes: plan.minutes, kind: plan.kind },
      { id: 'shower', time: shift(s.workout, plan.minutes + 5), title: 'Shower + moisturise', minutes: 15, kind: 'routine' },
      { id: 'breakfast', time: shift(s.workout, plan.minutes + 20), title: 'Breakfast + daily creatine', minutes: 20, kind: 'routine' },
      { id: 'work', time: s.work, title: 'Deep work', minutes: 90, kind: 'focus' },
      ...(weekday(key) < 5 ? s.movementTimes.map(t => ({ id: `move-${t}`, time: t, title: t === s.movementTimes[1] ? 'Post-lunch walk' : 'Movement break', minutes: t === s.movementTimes[1] ? 10 : 5, kind: 'movement' })) : []),
      ...(s.saunaDays.includes(weekday(key)) ? [{ id: 'sauna', time: s.saunaTime, title: 'Optional sauna', minutes: 10, kind: 'sauna' }] : []),
      { id: 'winddown', time: s.windDown, title: 'Wind down', minutes: 30, kind: 'rest' },
      { id: 'bedtime', time: s.bedtime, title: 'Target bedtime', minutes: 0, kind: 'rest' }
    ].sort((a, b) => a.time.localeCompare(b.time));
  }
  function recoveryMessage(r = {}, cleared = false) {
    if (r.redFlag) return 'Stop training and seek medical assessment for sharp plate-site pain, new weakness or swelling.';
    if (r.breathing === 'symptoms') return 'Pause exercise and follow your prescribed asthma action plan. Seek help if symptoms do not settle.';
    if ((r.shoulder !== '' && Number(r.shoulder) > 2) || r.worse) return 'Reduce shoulder loading today. Review persistent or worsening symptoms with your physiotherapist.';
    if (!cleared) return 'Upper-body clearance is not recorded. Use only movements already cleared by your clinician.';
    if (r.energy === 'low') return 'Consider a shorter, easier session today. Keep your effort comfortable.';
    if (r.shoulder === undefined || r.shoulder === '' || !r.energy) return 'Add a check-in before deciding today’s training load.';
    return 'Use your agreed loading limits. Progress only when symptoms and next-day response allow.';
  }
  function dueReminders(health, now = new Date()) {
    if (!health.settings.reminders) return [];
    const key = dateKey(now); const day = health.days[key] || {}; const minute = now.getHours() * 60 + now.getMinutes();
    return timeline(health, key).filter(e => e.kind === 'movement' || e.kind === 'sauna').filter(e => {
      const status = health.reminderState[`${key}/${e.id}`];
      if (status?.done || day.activities?.[e.id]?.status === 'done' || day.activities?.[e.id]?.status === 'skipped' || (e.id === 'sauna' && day.sauna?.complete)) return false;
      const [h, m] = e.time.split(':').map(Number);
      const due = status?.snoozeUntil ? new Date(status.snoozeUntil) : new Date(`${key}T${e.time}:00`);
      if (now < due || now - due >= 15 * 60000) return false;
      if (!status?.snoozeUntil && minute < h * 60 + m) return false;
      const moved = new Date(day.lastMovementAt || 0);
      return e.kind !== 'movement' || now - moved >= 45 * 60000;
    });
  }
  function calendarExport(health, from, days = 28) {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Move Strong//Health OS//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Move Strong'];
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    for (let i = 0; i < days; i++) {
      const key = addDays(from, i);
      for (const e of timeline(health, key)) {
        const start = new Date(`${key}T${e.time}:00`); const end = new Date(start.getTime() + Math.max(5, e.minutes) * 60000);
        const local = d => `${dateKey(d).replaceAll('-', '')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
        lines.push('BEGIN:VEVENT', `UID:${key}-${e.id.replace(':', '')}@movestrong.local`, `DTSTAMP:${stamp}`, `DTSTART:${local(start)}`, `DTEND:${local(end)}`, `SUMMARY:${e.title}`, 'DESCRIPTION:Personal schedule. Adjust to your agreed health and training limits.');
        if (e.kind === 'movement' || e.kind === 'sauna') lines.push('BEGIN:VALARM', 'TRIGGER:PT0S', 'ACTION:DISPLAY', `DESCRIPTION:${e.title}`, 'END:VALARM');
        lines.push('END:VEVENT');
      }
    }
    lines.push('END:VCALENDAR'); return lines.join('\r\n') + '\r\n';
  }
  const api = { dateKey, date, addDays, weekday, weekStart, defaults, normalize, mergeHealth, dayRecord, plans, planFor, timeline, recoveryMessage, dueReminders, calendarExport };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HealthModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
