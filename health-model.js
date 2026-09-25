/* Date-based records live alongside, never in place of, the original six-week logs. */
(function (root) {
  'use strict';
  const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const date = key => new Date(`${key}T12:00:00`);
  const addDays = (key, count) => { const d = date(key); d.setDate(d.getDate() + count); return dateKey(d); };
  const weekday = key => (date(key).getDay() + 6) % 7;
  const weekStart = key => addDays(key, -weekday(key));
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const clone = value => JSON.parse(JSON.stringify(value));

  const settingsDefaults = { programmeStart: '2026-09-21', wake: '06:30', workout: '07:05', work: '09:00', windDown: '22:15', bedtime: '22:45', saunaTime: '18:00', saunaDays: [1, 3], movementTimes: ['11:00', '13:00', '15:30'], reminders: false, recoveryReminders: true, upperBodyCleared: false, clearanceNotes: '' };
  const defaults = () => ({ schemaVersion: 3, settings: { ...settingsDefaults }, days: {}, milestones: {}, reminderState: {}, generatedWeeks: {}, weeklyReviews: {} });
  const plans = [
    { title: 'Pull + shoulder control', short: 'Pull', kind: 'strength', minutes: 45, ids: ['d3e-warm', 'd3e-scap-pull', 'd3e-pullup-single', 'd3e-row', 'd3e-er', 'd1m-deadbug'] },
    { title: 'Legs + aerobic base', short: 'Legs', kind: 'strength', minutes: 45, ids: ['d2e-warm', 'd2e-bss', 'd2e-slrdl', 'd2e-calf', 'd2e-zone2'] },
    { title: 'Push + control foundations', short: 'Push', kind: 'strength', minutes: 45, ids: ['d1e-warm', 'd1e-pushup', 'd1m-scap', 'd2m-er', 'd1m-deadbug'] },
    { title: 'Easy run / walk', short: 'Cardio', kind: 'cardio', minutes: 30, ids: [] },
    { title: 'Calisthenics foundations', short: 'Skills', kind: 'strength', minutes: 40, ids: ['d3e-warm', 'd3e-pullup-single', 'd1e-pushup', 'd3e-row', 'd1m-deadbug'] },
    { title: 'Longer easy cardio', short: 'Endurance', kind: 'cardio', minutes: 45, ids: [] },
    { title: 'Recovery + mobility', short: 'Recovery', kind: 'recovery', minutes: 20, ids: ['d2m-9090', 'd2m-hinge', 'd1m-hiprot'] }
  ];

  function dayRecord(health, key) { return health.days[key] ||= { routine: {}, activities: {}, recovery: {}, workout: { complete: false, exercises: {} } }; }
  function validDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && dateKey(date(value)) === value; }
  function normalize(value) {
    const base = defaults();
    if (!value) return base;
    if (!isObject(value) || ![2, 3].includes(value.schemaVersion) || !isObject(value.days) || !isObject(value.settings)) throw new Error('Unsupported health data');
    const result = { ...base, ...clone(value), schemaVersion: 3, settings: { ...base.settings, ...value.settings } };
    result.generatedWeeks = isObject(result.generatedWeeks) ? result.generatedWeeks : {};
    result.weeklyReviews = isObject(result.weeklyReviews) ? result.weeklyReviews : {};
    if (!validDate(result.settings.programmeStart)) throw new Error('Invalid programme start');
    for (const key of ['wake', 'workout', 'work', 'windDown', 'bedtime', 'saunaTime']) if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(result.settings[key])) throw new Error('Invalid schedule');
    if (!Array.isArray(result.settings.movementTimes) || result.settings.movementTimes.length > 10 || result.settings.movementTimes.some(t => !/^([01]\d|2[0-3]):[0-5]\d$/.test(t))) throw new Error('Invalid reminder times');
    if (!Array.isArray(result.settings.saunaDays) || result.settings.saunaDays.some(d => !Number.isInteger(d) || d < 0 || d > 6)) throw new Error('Invalid sauna schedule');
    if (!isObject(result.milestones) || !isObject(result.reminderState)) throw new Error('Invalid health records');
    for (const [key, day] of Object.entries(result.days)) {
      if (!validDate(key) || !isObject(day)) throw new Error('Invalid day');
      for (const field of ['routine', 'activities', 'recovery', 'workout', 'sauna', 'plan']) if (day[field] !== undefined && !isObject(day[field])) throw new Error('Invalid day record');
      if (day.workout?.exercises && !isObject(day.workout.exercises)) throw new Error('Invalid exercises');
      for (const exercise of Object.values(day.workout?.exercises || {})) {
        if (!isObject(exercise)) throw new Error('Invalid exercise record');
        if (exercise.rir !== undefined && exercise.rir !== '' && (!Number.isFinite(Number(exercise.rir)) || Number(exercise.rir) < 0 || Number(exercise.rir) > 4)) throw new Error('Invalid RIR');
        if (exercise.technique && !['clean', 'okay', 'poor'].includes(exercise.technique)) throw new Error('Invalid technique');
      }
    }
    for (const key of Object.keys(result.generatedWeeks)) if (!validDate(key) || !isObject(result.generatedWeeks[key])) throw new Error('Invalid generated week');
    ensureInitialAdaptiveWeek(result);
    return result;
  }

  function newest(a, b) {
    const aTime = Date.parse(a?.updatedAt || '') || 0; const bTime = Date.parse(b?.updatedAt || '') || 0;
    if (!aTime && !bTime) return b || a;
    return bTime >= aTime ? b : a;
  }
  function mergeHealth(incoming, existing) {
    const restored = normalize(incoming);
    if (!existing) return restored;
    const local = normalize(existing); const days = { ...restored.days };
    for (const [key, day] of Object.entries(local.days)) {
      const saved = restored.days[key] || {};
      days[key] = { ...saved, ...day, routine: { ...saved.routine, ...day.routine }, activities: { ...saved.activities, ...day.activities }, recovery: { ...saved.recovery, ...day.recovery }, workout: day.workout?.updatedAt || Object.keys(day.workout?.exercises || {}).length ? day.workout : saved.workout || day.workout };
    }
    return { ...restored, ...local, schemaVersion: 3, days, milestones: { ...restored.milestones, ...local.milestones }, generatedWeeks: { ...restored.generatedWeeks, ...local.generatedWeeks }, weeklyReviews: { ...restored.weeklyReviews, ...local.weeklyReviews } };
  }
  function mergeCloud(remote, local) {
    const a = normalize(remote); const b = normalize(local); const localHasRecords = Object.values(b.days).some(day => day.workout?.updatedAt || day.recovery?.updatedAt || day.sauna?.updatedAt || Object.keys(day.workout?.exercises || {}).length);
    const result = { ...a, ...b, schemaVersion: 3, settings: localHasRecords ? { ...a.settings, ...b.settings } : { ...b.settings, ...a.settings }, days: {}, milestones: { ...a.milestones, ...b.milestones }, reminderState: { ...a.reminderState, ...b.reminderState }, generatedWeeks: { ...a.generatedWeeks, ...b.generatedWeeks }, weeklyReviews: { ...a.weeklyReviews, ...b.weeklyReviews } };
    for (const key of new Set([...Object.keys(a.days), ...Object.keys(b.days)])) {
      const x = a.days[key] || {}; const y = b.days[key] || {};
      result.days[key] = { ...x, ...y, routine: { ...x.routine, ...y.routine }, activities: { ...x.activities, ...y.activities }, recovery: newest(x.recovery, y.recovery) || {}, workout: newest(x.workout, y.workout) || { complete: false, exercises: {} }, sauna: newest(x.sauna, y.sauna) };
      if (!result.days[key].sauna) delete result.days[key].sauna;
    }
    return result;
  }

  function planFor(health, key) {
    const day = health.days[key];
    if (day?.plan?.title && Array.isArray(day.plan.ids)) return day.plan;
    const recorded = day?.workout?.complete || day?.workout?.updatedAt || Object.keys(day?.workout?.exercises || {}).length;
    if (!recorded && key < (health.settings.programmeStart || '2026-09-21')) return { title: 'Programme starts 21 September', short: 'Starts 21 Sept', kind: 'rest', minutes: 0, ids: [], pending: true };
    const override = day?.planIndex;
    return plans[recorded && Number.isInteger(override) && override >= 0 && override < 7 ? override : weekday(key)];
  }

  const isShoulderLoading = id => /pull|row|push|scap|wallslide|(^|-)er$|warm/.test(id) && !/deadbug/.test(id);
  function recoveryForWorkout(health, key) {
    const next = health.days[addDays(key, 1)]?.recovery?.previousWorkout;
    if (next?.workoutDate === key) return next;
    const log = health.days[key]?.workout || {};
    if (log.painNext !== undefined && log.painNext !== '') return { workoutDate: key, pain: log.painNext, status: Number(log.painNext) > Number(log.painDuring || 0) ? 'worse' : 'same', complete: true, legacy: true };
    return null;
  }
  function dueRecoveryCheck(health, key) {
    const prior = addDays(key, -1); const workout = health.days[prior]?.workout;
    if (!health.settings.recoveryReminders || !workout?.complete) return null;
    const check = health.days[key]?.recovery?.previousWorkout;
    return check?.complete && check.workoutDate === prior ? null : { workoutDate: prior, key, workout };
  }
  function sessionsInWeek(health, start) { return Array.from({ length: 7 }, (_, i) => { const key = addDays(start, i); return [key, health.days[key]]; }).filter(([, d]) => d?.workout?.complete); }
  function exerciseEvidence(health, start, id) { return sessionsInWeek(health, start).filter(([, d]) => d.workout.exercises?.[id]).map(([key, d]) => ({ key, entry: d.workout.exercises[id], workout: d.workout, recovery: recoveryForWorkout(health, key) })); }
  function decideExercise(health, start, id, name = id) {
    const evidence = exerciseEvidence(health, start, id); const shoulder = isShoulderLoading(id);
    if (!evidence.length) return { id, name, state: 'HOLD', reason: 'No completed exposure was recorded, so the prescription stays unchanged.', evidence: 'No completed sets' };
    const highPain = evidence.some(x => Number(x.workout.painDuring) >= 4 || Number(x.recovery?.pain) >= 3 || x.recovery?.status === 'worse' || x.recovery?.plateSymptoms);
    const poor = evidence.some(x => x.entry.technique === 'poor');
    if (highPain || poor) return { id, name, state: 'REGRESS', reason: highPain ? 'Shoulder symptoms crossed the conservative progression limit or were worse next morning.' : 'Technique was recorded as poor; reduce the challenge until clean control returns.', evidence: `${evidence.length} exposure${evidence.length > 1 ? 's' : ''}` };
    const missingRecovery = shoulder && evidence.some(x => !x.recovery?.complete); const incomplete = evidence.some(x => !x.entry.done);
    const technique = evidence.map(x => x.entry.technique).filter(Boolean); const rirs = evidence.map(x => Number(x.entry.rir)).filter(Number.isFinite);
    const borderline = evidence.some(x => Number(x.workout.painDuring) === 3 || Number(x.workout.effort) >= 9) || technique.some(x => x !== 'clean') || rirs.some(x => x < 2);
    if (missingRecovery || incomplete || borderline || technique.length < evidence.length || rirs.length < evidence.length) {
      const reason = missingRecovery ? 'Next-morning shoulder recovery is missing; progression is held until recovery is confirmed.' : incomplete ? 'The target was not fully completed, so the same movement is retained.' : borderline ? 'Technique, RIR, effort or pain was borderline, so load and variation stay unchanged.' : 'RIR or technique was not recorded for every exposure; the safe deterministic result is HOLD.';
      return { id, name, state: 'HOLD', reason, evidence: `${evidence.length} exposure${evidence.length > 1 ? 's' : ''}` };
    }
    return { id, name, state: 'PROGRESS', reason: 'Target completed with clean technique, 2–4 RIR, acceptable effort and stable shoulder recovery.', evidence: `${evidence.length} qualified exposure${evidence.length > 1 ? 's' : ''}` };
  }

  const conservativePrescription = {
    'd3e-pullup-single': { name: 'Strict pull-up', hold: 'Accumulate 8–9 clean total reps across 3 sets; keep the same variation', progress: 'Add only 1 total clean rep across 3 sets; keep the same variation', regress: 'Use assistance and stop 3–4 reps before failure' },
    'd3e-row': { name: 'Dumbbell row', hold: 'Repeat the same reps and load', progress: 'Add 1–2 reps per set at the same load', regress: 'Reduce reps or support the torso; keep both shoulders level' },
    'd1e-pushup': { name: 'Push-up', hold: 'Repeat the same incline and reps', progress: 'One controlled floor set, then 2 incline back-off sets; leave at least 3 RIR', regress: 'Raise the incline and use a pain-free symmetrical range' },
    'd2e-bss': { name: 'Bulgarian split squat', hold: 'Repeat the same reps and load', progress: 'Add 1–2 reps per set; do not add load in the same week', regress: 'Reduce range or use supported split squats' },
    'd2e-slrdl': { name: 'Single-leg RDL', hold: 'Repeat the same reps and load', progress: 'Add 1–2 reps per set with the same support and load', regress: 'Use a kickstand stance and shorter range' },
    'd2e-calf': { name: 'Calf raise', hold: 'Repeat the same reps', progress: 'Add up to 3 reps per set; keep load unchanged', regress: 'Use two legs and a comfortable range' },
    'd1m-deadbug': { name: 'Dead bug', hold: 'Keep the same reps and improve control', progress: 'Add 1 rep per set only', regress: 'Shorten the lever and keep the operated arm comfortable' }
  };
  function firstAdaptiveReview(health) {
    const sourceWeekStart = '2026-09-21'; const nextWeekStart = '2026-09-28';
    if (health.generatedWeeks[nextWeekStart] || sessionsInWeek(health, sourceWeekStart).length < 5) return null;
    const items = [
      { id: 'd3e-pullup-single', name: 'Strict pull-up', state: 'HOLD', from: '3 singles earlier; 3 / 2 / 2 latest', to: '8–9 clean total reps across 3 sets; same variation', reason: 'Total reps improved quickly, but the latest target was marked incomplete. Keep the variation and add only modest volume.' },
      { id: 'd3e-row', name: '5 kg dumbbell row', state: 'PROGRESS', from: '3 × 8 → 3 × 10', to: '3 × 12 at the same 5 kg load', reason: 'Reps were completed and the progression changes reps only—not load.' },
      { id: 'd1e-pushup', name: 'Push-up', state: 'PROGRESS', from: 'Bench incline: 3 × 8 → 12 / 10 / 10', to: '1 controlled floor set + 2 incline back-off sets', reason: 'Incline work was completed at low effort with 2/10 during and 1/10 next-morning pain. Floor exposure remains deliberately limited.' },
      { id: 'd2e-bss', name: 'Bulgarian split squat', state: 'PROGRESS', from: '3 × 8 bodyweight', to: '3 × 10 bodyweight', reason: 'Completed with 0/10 shoulder pain during and next morning; reps rise without adding load.' },
      { id: 'd2e-slrdl', name: 'Single-leg RDL', state: 'PROGRESS', from: '3 × 8 bodyweight', to: '3 × 10 bodyweight', reason: 'Completed with stable shoulder response; progress reps while keeping the same load.' },
      { id: 'd2e-calf', name: 'Calf raise', state: 'PROGRESS', from: '3 × 12 bodyweight', to: '3 × 15 bodyweight', reason: 'Completed with no shoulder reaction; this is a small rep-only progression.' },
      { id: 'cardio', name: 'Easy cardio', state: 'PROGRESS', from: '18 min Zone 2; 30 min bike latest', to: '32 min conversational cardio', reason: 'The 30-minute bike produced only 1/10 during and next-morning discomfort. Volume rises by under 10%.' },
      { id: 'd1m-deadbug', name: 'Dead bug', state: 'HOLD', from: '8 / 8 latest', to: '2 × 8 with slower, cleaner control', reason: 'Hold volume and prioritise trunk and shoulder position rather than adding difficulty.' }
    ];
    return installGeneratedWeek(health, { sourceWeekStart, nextWeekStart, items, baseline: true });
  }
  function installGeneratedWeek(health, review) {
    const overrides = {};
    for (const item of review.items) if (item.id !== 'cardio') { const config = conservativePrescription[item.id]; overrides[item.id] = { ...(config?.name ? { name: config.name } : {}), prescription: item.to || config?.[item.state.toLowerCase()] }; }
    const generatedAt = new Date().toISOString(); const days = {};
    for (let i = 0; i < 7; i++) {
      const base = clone(plans[i]); base.exerciseOverrides = Object.fromEntries(base.ids.filter(id => overrides[id]).map(id => [id, overrides[id]]));
      if (i === 3) base.minutes = review.items.find(item => item.id === 'cardio')?.minutes || (review.baseline ? 32 : base.minutes);
      days[i] = base; const key = addDays(review.nextWeekStart, i); const day = dayRecord(health, key);
      if (!day.workout?.updatedAt && !Object.keys(day.workout?.exercises || {}).length) day.plan = clone(base);
    }
    const finalReview = { ...review, generatedAt, rulesVersion: 1 };
    health.generatedWeeks[review.nextWeekStart] = { sourceWeekStart: review.sourceWeekStart, generatedAt, rulesVersion: 1, baseline: Boolean(review.baseline), days };
    health.weeklyReviews[review.sourceWeekStart] = finalReview; return finalReview;
  }
  function generateNextWeek(health, sourceStart) {
    const sourceWeekStart = weekStart(sourceStart); const nextWeekStart = addDays(sourceWeekStart, 7);
    if (sourceWeekStart < health.settings.programmeStart) return null;
    if (health.generatedWeeks[nextWeekStart]) return health.weeklyReviews[sourceWeekStart] || null;
    const sessions = sessionsInWeek(health, sourceWeekStart);
    if (sessions.length < 5 && dateKey() < nextWeekStart) return null;
    const ids = [...new Set(sessions.flatMap(([, d]) => Object.keys(d.workout.exercises || {})))].filter(id => conservativePrescription[id]);
    const items = ids.map(id => { const config = conservativePrescription[id]; const decision = decideExercise(health, sourceWeekStart, id, config.name); return { ...decision, from: 'This week’s recorded prescription', to: config[decision.state.toLowerCase()] }; });
    const cardio = sessions.filter(([, d]) => Number(d.workout.cardioMinutes) > 0);
    if (cardio.length) {
      const easy = cardio.filter(([key]) => weekday(key) === 3); const basis = easy.length ? easy : cardio;
      const maxMinutes = Math.max(...basis.map(([, d]) => Number(d.workout.cardioMinutes)));
      const severeSymptoms = cardio.some(([, d]) => ['moderate', 'stopped'].includes(d.workout.breathingSymptoms));
      const mildOrMissing = cardio.some(([, d]) => !d.workout.breathingSymptoms || d.workout.breathingSymptoms === 'mild');
      const symptomFlare = cardio.some(([key, d]) => Number(d.workout.painDuring) >= 4 || Number(recoveryForWorkout(health, key)?.pain) >= 3 || recoveryForWorkout(health, key)?.status === 'worse');
      const highEffort = cardio.some(([, d]) => Number(d.workout.effort) >= 9);
      const state = severeSymptoms || symptomFlare ? 'REGRESS' : mildOrMissing || highEffort ? 'HOLD' : 'PROGRESS';
      const minutes = state === 'PROGRESS' ? Math.max(maxMinutes + 1, Math.floor(maxMinutes * 1.1)) : maxMinutes;
      const to = state === 'REGRESS' ? 'Reduce duration or intensity and follow the asthma action plan' : state === 'HOLD' ? `Repeat ${maxMinutes} min at conversational effort` : `${minutes} min conversational cardio (≤10% increase)`;
      const reason = severeSymptoms ? 'Moderate symptoms or an exercise stop were recorded.' : symptomFlare ? 'Shoulder recovery crossed the conservative limit.' : mildOrMissing ? 'Breathing was mild or not recorded, so duration is held.' : highEffort ? 'Effort was too high for an automatic aerobic progression.' : 'Breathing was symptom-free, effort was controlled and shoulder recovery stayed within limits.';
      items.push({ id: 'cardio', name: 'Easy cardio', state, from: `${maxMinutes} min recorded`, to, reason, minutes });
    }
    if (!items.length) items.push({ id: 'week', name: 'Programme', state: 'HOLD', from: 'No qualifying exercise records', to: 'Repeat the current schedule', reason: 'There was not enough exercise-level data for a safe change.' });
    return installGeneratedWeek(health, { sourceWeekStart, nextWeekStart, items, baseline: false });
  }
  function ensureInitialAdaptiveWeek(health) { return firstAdaptiveReview(health); }
  function ensureGeneratedWeeks(health, around = dateKey()) { ensureInitialAdaptiveWeek(health); const start = weekStart(around); generateNextWeek(health, addDays(start, -7)); generateNextWeek(health, start); }

  function shift(time, minutes) { const [h, m] = time.split(':').map(Number); const n = (h * 60 + m + minutes + 1440) % 1440; return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`; }
  function timeline(health, key) {
    const s = health.settings; const plan = planFor(health, key); const recoveryDue = dueRecoveryCheck(health, key);
    return [
      { id: 'water', time: s.wake, title: 'Wake + water', minutes: 5, kind: 'routine' }, ...(recoveryDue ? [{ id: 'shoulder-check', time: shift(s.wake, 5), title: 'Shoulder recovery check-in', minutes: 2, kind: 'checkin' }] : []),
      { id: 'light', time: shift(s.wake, 10), title: 'Outside light + walk', minutes: 10, kind: 'routine' }, { id: 'warmup', time: shift(s.workout, -10), title: 'Gentle warm-up', minutes: 10, kind: 'routine' }, { id: 'workout', time: s.workout, title: plan.title, minutes: plan.minutes, kind: plan.kind }, { id: 'shower', time: shift(s.workout, plan.minutes + 5), title: 'Shower + moisturise', minutes: 15, kind: 'routine' }, { id: 'breakfast', time: shift(s.workout, plan.minutes + 20), title: 'Breakfast + daily creatine', minutes: 20, kind: 'routine' }, { id: 'meditation', time: shift(s.work, -10), title: 'Meditation', minutes: 10, kind: 'routine' }, { id: 'work', time: s.work, title: 'Deep work', minutes: 90, kind: 'focus' },
      ...(weekday(key) < 5 ? s.movementTimes.map(t => ({ id: `move-${t}`, time: t, title: t === s.movementTimes[1] ? 'Post-lunch walk' : 'Movement break', minutes: t === s.movementTimes[1] ? 10 : 5, kind: 'movement' })) : []), ...(s.saunaDays.includes(weekday(key)) ? [{ id: 'sauna', time: s.saunaTime, title: 'Optional sauna', minutes: 10, kind: 'sauna' }] : []), { id: 'winddown', time: s.windDown, title: 'Wind down', minutes: 30, kind: 'rest' }, { id: 'bedtime', time: s.bedtime, title: 'Target bedtime', minutes: 0, kind: 'rest' }
    ].filter(e => !plan.pending || !['workout', 'warmup'].includes(e.id)).sort((a, b) => a.time.localeCompare(b.time));
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
    return timeline(health, key).filter(e => ['movement', 'sauna', 'checkin'].includes(e.kind)).filter(e => {
      const status = health.reminderState[`${key}/${e.id}`]; if (status?.done || day.activities?.[e.id]?.status === 'done' || day.activities?.[e.id]?.status === 'skipped' || (e.id === 'sauna' && day.sauna?.complete) || (e.id === 'shoulder-check' && !dueRecoveryCheck(health, key))) return false;
      const [h, m] = e.time.split(':').map(Number); const due = status?.snoozeUntil ? new Date(status.snoozeUntil) : new Date(`${key}T${e.time}:00`); if (now < due || now - due >= 15 * 60000) return false; if (!status?.snoozeUntil && minute < h * 60 + m) return false; const moved = new Date(day.lastMovementAt || 0); return e.kind !== 'movement' || now - moved >= 45 * 60000;
    });
  }
  function calendarExport(health, from, days = 28) {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Move Strong//Health OS//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Move Strong']; const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    for (let i = 0; i < days; i++) { const key = addDays(from, i); for (const e of timeline(health, key)) { const start = new Date(`${key}T${e.time}:00`); const end = new Date(start.getTime() + Math.max(5, e.minutes) * 60000); const local = d => `${dateKey(d).replaceAll('-', '')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`; lines.push('BEGIN:VEVENT', `UID:${key}-${e.id.replace(':', '')}@movestrong.local`, `DTSTAMP:${stamp}`, `DTSTART:${local(start)}`, `DTEND:${local(end)}`, `SUMMARY:${e.title}`, 'DESCRIPTION:Personal schedule. Adjust to your agreed health and training limits.'); if (['movement', 'sauna', 'checkin'].includes(e.kind)) lines.push('BEGIN:VALARM', 'TRIGGER:PT0S', 'ACTION:DISPLAY', `DESCRIPTION:${e.title}`, 'END:VALARM'); lines.push('END:VEVENT'); } }
    lines.push('END:VCALENDAR'); return lines.join('\r\n') + '\r\n';
  }
  const api = { dateKey, date, addDays, weekday, weekStart, defaults, normalize, mergeHealth, mergeCloud, dayRecord, plans, planFor, timeline, recoveryMessage, dueRecoveryCheck, recoveryForWorkout, dueReminders, calendarExport, decideExercise, generateNextWeek, ensureGeneratedWeeks, isShoulderLoading };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.HealthModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
