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

  const RULES_VERSION = 3;
  const equipmentDefaults = { pullUpBar: true, bands: ['Unlabelled band'], dumbbellsKg: [5, 5], kettlebellsKg: [10], rowingMachine: true };
  const settingsDefaults = { programmeStart: '2026-09-21', wake: '06:30', workout: '07:05', work: '09:00', windDown: '22:15', bedtime: '22:45', saunaTime: '18:00', saunaDays: [1, 3], movementTimes: ['11:00', '13:00', '15:30'], reminders: false, recoveryReminders: true, upperBodyCleared: true, clearanceNotes: 'Physio cleared all exercise categories; rebuild load, volume and skill complexity gradually.', equipment: equipmentDefaults };
  function normalizeEquipment(value) {
    const source = isObject(value) ? value : equipmentDefaults;
    const loads = key => Array.isArray(source[key]) ? source[key].map(Number).filter(n => Number.isFinite(n) && n > 0 && n <= 200).slice(0, 20).sort((a, b) => a - b) : clone(equipmentDefaults[key]);
    const bands = Array.isArray(source.bands) ? [...new Set(source.bands.map(v => String(v).trim()).filter(Boolean))].slice(0, 10) : clone(equipmentDefaults.bands);
    return { pullUpBar: source.pullUpBar !== false, bands, dumbbellsKg: loads('dumbbellsKg'), kettlebellsKg: loads('kettlebellsKg'), rowingMachine: source.rowingMachine !== false };
  }
  const defaults = () => ({ schemaVersion: 4, settings: { ...settingsDefaults, equipment: normalizeEquipment(equipmentDefaults) }, days: {}, milestones: {}, reminderState: {}, generatedWeeks: {}, weeklyReviews: {} });
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
    if (!isObject(value) || ![2, 3, 4].includes(value.schemaVersion) || !isObject(value.days) || !isObject(value.settings)) throw new Error('Unsupported health data');
    const result = { ...base, ...clone(value), schemaVersion: 4, settings: { ...base.settings, ...value.settings, equipment: normalizeEquipment(value.settings.equipment) } };
    result.settings.upperBodyCleared = true;
    result.settings.clearanceNotes = result.settings.clearanceNotes || base.settings.clearanceNotes;
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
    const localHadEquipment = isObject(existing?.settings?.equipment); const local = normalize(existing); const days = { ...restored.days };
    for (const [key, day] of Object.entries(local.days)) {
      const saved = restored.days[key] || {};
      days[key] = { ...saved, ...day, routine: { ...saved.routine, ...day.routine }, activities: { ...saved.activities, ...day.activities }, recovery: { ...saved.recovery, ...day.recovery }, workout: day.workout?.updatedAt || Object.keys(day.workout?.exercises || {}).length ? day.workout : saved.workout || day.workout };
    }
    return { ...restored, ...local, schemaVersion: 4, settings: { ...restored.settings, ...local.settings, equipment: localHadEquipment ? local.settings.equipment : restored.settings.equipment }, days, milestones: { ...restored.milestones, ...local.milestones }, generatedWeeks: { ...restored.generatedWeeks, ...local.generatedWeeks }, weeklyReviews: { ...restored.weeklyReviews, ...local.weeklyReviews } };
  }
  function mergeCloud(remote, local) {
    const localHadEquipment = isObject(local?.settings?.equipment); const a = normalize(remote); const b = normalize(local); const localHasRecords = Object.values(b.days).some(day => day.workout?.updatedAt || day.recovery?.updatedAt || day.sauna?.updatedAt || Object.keys(day.workout?.exercises || {}).length);
    const result = { ...a, ...b, schemaVersion: 4, settings: localHasRecords ? { ...a.settings, ...b.settings } : { ...b.settings, ...a.settings }, days: {}, milestones: { ...a.milestones, ...b.milestones }, reminderState: { ...a.reminderState, ...b.reminderState }, generatedWeeks: { ...a.generatedWeeks, ...b.generatedWeeks }, weeklyReviews: { ...a.weeklyReviews, ...b.weeklyReviews } };
    if (localHasRecords && !localHadEquipment) result.settings.equipment = a.settings.equipment;
    for (const key of new Set([...Object.keys(a.days), ...Object.keys(b.days)])) {
      const x = a.days[key] || {}; const y = b.days[key] || {};
      result.days[key] = { ...x, ...y, routine: { ...x.routine, ...y.routine }, activities: { ...x.activities, ...y.activities }, recovery: newest(x.recovery, y.recovery) || {}, workout: newest(x.workout, y.workout) || { complete: false, exercises: {} }, sauna: newest(x.sauna, y.sauna) };
      if (!result.days[key].sauna) delete result.days[key].sauna;
    }
    return result;
  }

  function planFor(health, key) {
    const day = health.days[key];
    // A started day is frozen to the exact plan that was active when logging began.
    if (day?.plan?.title && Array.isArray(day.plan.ids)) return day.plan;
    const generated = health.generatedWeeks?.[weekStart(key)]?.days?.[weekday(key)];
    if (generated?.title && Array.isArray(generated.ids)) return generated;
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
  function exerciseEvidence(health, start, id) { return sessionsInWeek(health, start).filter(([, d]) => d.workout.exercises?.[id]).map(([key, d]) => ({ key, entry: d.workout.exercises[id], workout: d.workout, recovery: recoveryForWorkout(health, key), plan: d.plan })); }
  function decideExercise(health, start, id, name = id) {
    const evidence = exerciseEvidence(health, start, id); const shoulder = isShoulderLoading(id);
    if (!evidence.length) return { id, name, state: 'HOLD', reason: 'No completed exposure was recorded, so the prescription stays unchanged.', evidence: 'No completed sets' };
    const highPain = evidence.some(x => Number(x.workout.painDuring) >= 4 || Number(x.recovery?.pain) >= 3 || x.recovery?.status === 'worse' || x.recovery?.plateSymptoms);
    const poor = evidence.some(x => x.entry.technique === 'poor');
    if (highPain || poor) return { id, name, state: 'REGRESS', reason: highPain ? 'Symptoms crossed the progression guardrail or were worse next morning.' : 'Technique was recorded as poor; reduce the challenge until clean control returns.', evidence: `${evidence.length} exposure${evidence.length > 1 ? 's' : ''}` };
    const latest = evidence[evidence.length - 1];
    const missingRecovery = shoulder && !latest.recovery?.complete; const incomplete = !latest.entry.done;
    const hasRir = latest.entry.rir !== undefined && latest.entry.rir !== '' && Number.isFinite(Number(latest.entry.rir));
    const technique = latest.entry.technique || '';
    const borderline = Number(latest.workout.painDuring) === 3 || Number(latest.workout.effort) >= 9 || technique === 'okay' || (hasRir && Number(latest.entry.rir) < 2);
    if (missingRecovery || incomplete || borderline || technique !== 'clean' || !hasRir) {
      const reason = missingRecovery ? 'Next-morning recovery is missing; progression is held until recovery is confirmed.' : incomplete ? 'The latest target was not fully completed, so the same movement is retained.' : borderline ? 'Technique, RIR, effort or symptoms were borderline, so load and variation stay unchanged.' : 'Record clean/okay/poor technique and RIR on the latest exposure before automatic progression.';
      return { id, name, state: 'HOLD', reason, evidence: `${evidence.length} exposure${evidence.length > 1 ? 's' : ''}` };
    }
    return { id, name, state: 'PROGRESS', reason: 'Latest target completed with clean technique, 2–4 RIR, acceptable effort and stable next-morning recovery.', evidence: `${evidence.length} exposure${evidence.length > 1 ? 's' : ''}` };
  }

  const conservativePrescription = {
    'd3e-scap-pull': { name: 'Scapular pull-up' },
    'd3e-pullup-single': { name: 'Strict pull-up' },
    'd3e-row': { name: 'Row' },
    'd3e-er': { name: 'Band external rotation' },
    'd2m-er': { name: 'Band external rotation' },
    'd1e-pushup': { name: 'Push-up' },
    'd1m-scap': { name: 'Scapular push-up' },
    'd2e-bss': { name: 'Bulgarian split squat' },
    'd2e-slrdl': { name: 'Single-leg RDL' },
    'd2e-calf': { name: 'Calf raise' },
    'd1m-deadbug': { name: 'Dead bug' }
  };
  const exerciseEquipment = {
    'd3e-scap-pull': ['pullUpBar', 'bands'], 'd3e-pullup-single': ['pullUpBar', 'bands'], 'd3e-row': ['dumbbellsKg', 'kettlebellsKg', 'bands'],
    'd3e-er': ['bands'], 'd2m-er': ['bands'], 'd1e-pushup': ['bodyweight'], 'd1m-scap': ['bodyweight'],
    'd2e-bss': ['dumbbellsKg', 'kettlebellsKg', 'bodyweight'], 'd2e-slrdl': ['dumbbellsKg', 'kettlebellsKg', 'bodyweight'],
    'd2e-calf': ['dumbbellsKg', 'kettlebellsKg', 'bodyweight'], 'd1m-deadbug': ['bodyweight'], cardio: ['rowingMachine', 'walking']
  };
  const equipmentSignature = health => JSON.stringify(normalizeEquipment(health.settings.equipment));
  const numericSets = entry => (entry?.sets || []).map(Number).filter(Number.isFinite).filter(n => n >= 0);
  const setSummary = entry => {
    const reps = numericSets(entry); if (!reps.length) return 'No completed reps recorded';
    const sets = reps.length; const work = reps.every(n => n === reps[0]) ? `${sets} × ${reps[0]}` : `${sets} sets: ${reps.join(' / ')}`;
    return `${work}${entry.load?.trim() ? ` · ${entry.load.trim()}` : ' · bodyweight / level not recorded'}`;
  };
  const parseKg = value => {
    const text = String(value || '').toLowerCase(); const pair = text.match(/2\s*[x×]\s*(\d+(?:\.\d+)?)\s*kg/); if (pair) return Number(pair[1]) * 2;
    const match = text.match(/(\d+(?:\.\d+)?)\s*kg/); return match ? Number(match[1]) : 0;
  };
  const distribute = (total, sets = 3) => Array.from({ length: sets }, (_, i) => Math.floor(total / sets) + (i < total % sets ? 1 : 0));
  function latestExercise(health, start, id) {
    return exerciseEvidence(health, start, id).sort((a, b) => b.key.localeCompare(a.key))[0] || null;
  }
  function sourceTarget(latest, id) { return latest?.plan?.exerciseOverrides?.[id] || {}; }
  function lowerBodyLoad(equipment) {
    const pairs = equipment.dumbbellsKg.reduce((counts, load) => (counts[load] = (counts[load] || 0) + 1, counts), {});
    const pair = Object.keys(pairs).map(Number).filter(load => pairs[load] >= 2).sort((a, b) => a - b)[0];
    if (pair) return { loadKg: pair * 2, implement: 'dumbbells', label: `2 × ${pair} kg dumbbells at the sides` };
    const kettlebell = equipment.kettlebellsKg[0];
    return kettlebell ? { loadKg: kettlebell, implement: 'kettlebell', label: `${kettlebell} kg kettlebell` } : null;
  }
  function rowLoads(equipment) {
    return [...new Set([
      ...equipment.dumbbellsKg.map(loadKg => ({ loadKg, implement: 'dumbbell', label: `${loadKg} kg dumbbell` })),
      ...equipment.kettlebellsKg.map(loadKg => ({ loadKg, implement: 'kettlebell', label: `${loadKg} kg kettlebell` }))
    ].sort((a, b) => a.loadKg - b.loadKg).map(x => JSON.stringify(x)))].map(value => JSON.parse(value));
  }
  function bandFor(entry, equipment, strongest = false) {
    if (!equipment.bands.length) return null;
    const current = equipment.bands.find(label => String(entry?.load || '').toLowerCase().includes(label.toLowerCase()));
    return current || equipment.bands[strongest ? equipment.bands.length - 1 : 0];
  }
  function target(prescription, details = {}) { return { prescription, ...details }; }
  function equipmentAwarePrescription(health, start, id, state) {
    const equipment = normalizeEquipment(health.settings.equipment); const latest = latestExercise(health, start, id); const entry = latest?.entry || {};
    const prior = sourceTarget(latest, id); const reps = numericSets(entry); const sets = reps.length || Number(prior.targetSets) || 3;
    const minReps = reps.length ? Math.min(...reps) : Number(prior.targetReps) || 8; const totalReps = reps.reduce((sum, n) => sum + n, 0);
    const actualLoad = entry.load?.trim() || prior.loadLabel || ''; const currentKg = parseKg(actualLoad) || Number(prior.loadKg) || 0;
    const from = latest ? setSummary(entry) : 'No completed sets';
    const sameLoad = actualLoad || (currentKg ? `${currentKg} kg` : 'bodyweight');
    const holdAvailable = (id === 'd3e-pullup-single' || id === 'd3e-scap-pull') ? equipment.pullUpBar
      : (id === 'd3e-er' || id === 'd2m-er') ? equipment.bands.length > 0
      : id === 'd3e-row' && currentKg ? rowLoads(equipment).some(x => x.loadKg === currentKg)
      : ['d2e-bss', 'd2e-slrdl', 'd2e-calf'].includes(id) && currentKg ? Boolean(lowerBodyLoad(equipment)?.loadKg === currentKg)
      : true;
    if (state === 'HOLD' && holdAvailable) {
      const heldReps = prior.targetReps !== undefined ? prior.targetReps : reps.length ? reps : minReps;
      const heldWork = Array.isArray(heldReps) ? `${heldReps.length} sets of ${heldReps.join(' / ')}` : `${sets} × ${heldReps}`;
      return { from, to: target(`${heldWork} with ${sameLoad}; keep the same controlled variation`, { targetSets: sets, targetReps: heldReps, loadKg: currentKg, loadLabel: sameLoad, variation: prior.variation || 'standard' }) };
    }
    if (state === 'HOLD') state = 'REGRESS';

    if (id === 'd3e-row') {
      const loads = rowLoads(equipment); const current = loads.find(x => x.loadKg === currentKg); const chosen = current || loads[0];
      if (!chosen && equipment.bands.length) {
        const band = bandFor({ load: actualLoad }, equipment); const bandIndex = equipment.bands.indexOf(band); const count = state === 'REGRESS' ? Math.max(8, minReps - 2) : Math.min(15, minReps + 2);
        if (state === 'PROGRESS' && minReps >= 15 && prior.variation === 'tempo-band-row' && bandIndex < equipment.bands.length - 1) {
          const nextBand = equipment.bands[bandIndex + 1]; return { from, to: target(`3 × 10 standing band rows with ${nextBand}`, { targetSets: 3, targetReps: 10, implement: 'band', loadLabel: nextBand, variation: 'band-row' }) };
        }
        const tempo = state === 'PROGRESS' && minReps >= 15;
        return { from, to: target(`3 × ${tempo ? 15 : count} standing band rows with ${band}${tempo ? ', 3-sec return + 1-sec squeeze' : ''}`, { targetSets: 3, targetReps: tempo ? 15 : count, implement: 'band', loadLabel: band, variation: tempo ? 'tempo-band-row' : 'band-row' }) };
      }
      if (!chosen) return { from, to: target(state === 'REGRESS' ? '2 × 8 bodyweight prone W pulls with a 2-sec squeeze' : '3 × 10 bodyweight prone W pulls with a 2-sec squeeze', { targetSets: state === 'REGRESS' ? 2 : 3, targetReps: state === 'REGRESS' ? 8 : 10, implement: 'bodyweight', variation: 'prone-w' }) };
      if (state === 'REGRESS') return { from, to: target(`2 × ${Math.max(6, minReps - 2)} chest-supported rows with the ${chosen.label}`, { targetSets: 2, targetReps: Math.max(6, minReps - 2), ...chosen, loadLabel: chosen.label, variation: 'chest-supported' }) };
      if (currentKg && chosen.loadKg !== currentKg) return { from, to: target(`3 × 6 supported rows with the ${chosen.label}; stop at 3 RIR`, { targetSets: 3, targetReps: 6, ...chosen, loadLabel: chosen.label, variation: 'standard' }) };
      if (minReps < 12) return { from, to: target(`${sets} × ${Math.min(12, minReps + 2)} rows with the ${chosen.label}`, { targetSets: sets, targetReps: Math.min(12, minReps + 2), ...chosen, loadLabel: chosen.label, variation: 'standard' }) };
      if (minReps < 15 && prior.variation !== 'tempo') return { from, to: target(`${sets} × ${minReps} rows with the ${chosen.label}, 3-sec lowering + 1-sec top pause`, { targetSets: sets, targetReps: minReps, ...chosen, loadLabel: chosen.label, variation: 'tempo' }) };
      const heavier = loads.find(x => x.loadKg > chosen.loadKg);
      if (heavier && (minReps >= 15 || prior.variation === 'tempo' || prior.variation === 'one-and-half')) return { from, to: target(`3 × 6 supported rows with the ${heavier.label}; stop at 3 RIR`, { targetSets: 3, targetReps: 6, ...heavier, loadLabel: heavier.label, variation: 'standard' }) };
      return { from, to: target(`3 × 8 one-and-a-half reps with the ${chosen.label}`, { targetSets: 3, targetReps: 8, ...chosen, loadLabel: chosen.label, variation: 'one-and-half' }) };
    }

    if (id === 'd2e-bss' || id === 'd2e-slrdl' || id === 'd2e-calf') {
      const name = id === 'd2e-bss' ? 'split squats' : id === 'd2e-slrdl' ? 'single-leg RDLs' : 'calf raises';
      const cap = id === 'd2e-calf' ? 20 : 12; const increment = id === 'd2e-calf' ? 3 : 2; const available = lowerBodyLoad(equipment);
      if (state === 'REGRESS') return { from, to: target(`2 × ${Math.max(6, minReps - 2)} ${name}, bodyweight with support and a shorter pain-free range`, { targetSets: 2, targetReps: Math.max(6, minReps - 2), implement: 'bodyweight', variation: 'supported' }) };
      if (!currentKg && minReps < cap) return { from, to: target(`${sets} × ${Math.min(cap, minReps + increment)} ${name}, bodyweight`, { targetSets: sets, targetReps: Math.min(cap, minReps + increment), implement: 'bodyweight', variation: 'standard' }) };
      if (!currentKg && available) {
        const carry = available.implement === 'kettlebell' ? (id === 'd2e-bss' ? ' in a suitcase hold on the non-operated side' : id === 'd2e-slrdl' ? ' held centrally or in the non-operated hand' : ' in a suitcase hold') : '';
        const nextReps = id === 'd2e-calf' ? 12 : 8;
        return { from, to: target(`3 × ${nextReps} ${name} with ${available.label}${carry}; keep 3 RIR`, { targetSets: 3, targetReps: nextReps, ...available, loadLabel: available.label, variation: 'standard' }) };
      }
      if (currentKg && minReps < cap) return { from, to: target(`${sets} × ${Math.min(cap, minReps + increment)} ${name} with ${sameLoad}`, { targetSets: sets, targetReps: Math.min(cap, minReps + increment), loadKg: currentKg, loadLabel: sameLoad, variation: 'standard' }) };
      return { from, to: target(`${sets} × ${minReps} ${name} with ${sameLoad}, 3-sec lowering + 1-sec pause`, { targetSets: sets, targetReps: minReps, loadKg: currentKg, loadLabel: sameLoad, variation: 'tempo' }) };
    }

    if (id === 'd3e-pullup-single' || id === 'd3e-scap-pull') {
      const pullup = id === 'd3e-pullup-single'; const movement = pullup ? 'pull-ups' : 'scapular pull-ups';
      if (!equipment.pullUpBar) {
        const band = bandFor({ load: actualLoad }, equipment); if (band) return { from, to: target(`3 × ${state === 'REGRESS' ? 8 : 10} kneeling lat pulldowns with ${band}`, { targetSets: 3, targetReps: state === 'REGRESS' ? 8 : 10, implement: 'band', loadLabel: band, variation: 'lat-pulldown' }) };
        return { from, to: target(`3 × ${state === 'REGRESS' ? 6 : 8} prone W pulls, bodyweight`, { targetSets: 3, targetReps: state === 'REGRESS' ? 6 : 8, implement: 'bodyweight', variation: 'prone-w' }) };
      }
      const band = bandFor({ load: actualLoad }, equipment, state === 'REGRESS'); const assistance = state === 'REGRESS' && band ? `${band} assistance` : actualLoad || (band ? `${band} assistance` : 'bodyweight');
      if (state === 'REGRESS') return { from, to: target(`3 × ${pullup ? 1 : Math.max(5, minReps - 2)} ${movement} with ${assistance}; stop at 4 RIR`, { targetSets: 3, targetReps: pullup ? 1 : Math.max(5, minReps - 2), implement: 'pull-up bar', loadLabel: assistance, variation: 'assisted' }) };
      if (pullup) {
        const currentBand = equipment.bands.find(label => assistance.toLowerCase().includes(label.toLowerCase())); const bandIndex = equipment.bands.indexOf(currentBand);
        if (totalReps >= 9 && bandIndex > 0) { const lighter = equipment.bands[bandIndex - 1]; return { from, to: target(`3 sets of 2 / 2 / 1 pull-ups with ${lighter} assistance; stop at 3 RIR`, { targetSets: 3, targetReps: [2, 2, 1], implement: 'pull-up bar', loadLabel: `${lighter} assistance`, variation: 'assisted' }) }; }
        const next = Math.max(4, totalReps + 1); const split = distribute(next);
        return { from, to: target(`3 sets of ${split.join(' / ')} ${movement} with ${assistance}; stop at 3 RIR`, { targetSets: 3, targetReps: split, implement: 'pull-up bar', loadLabel: assistance, variation: band ? 'assisted' : 'bodyweight' }) };
      }
      const next = Math.min(12, minReps + 1); return { from, to: target(`3 × ${next} ${movement} on the pull-up bar with a 2-sec top hold`, { targetSets: 3, targetReps: next, implement: 'pull-up bar', variation: 'paused' }) };
    }

    if (id === 'd3e-er' || id === 'd2m-er') {
      const band = bandFor({ load: actualLoad }, equipment, state === 'REGRESS');
      if (!band) return { from, to: target(`${state === 'REGRESS' ? 2 : 3} × ${state === 'REGRESS' ? 15 : 20}-sec towel external-rotation isometric at the wall`, { targetSets: state === 'REGRESS' ? 2 : 3, targetReps: state === 'REGRESS' ? 15 : 20, implement: 'bodyweight', variation: 'isometric' }) };
      const bandIndex = equipment.bands.indexOf(band);
      if (state === 'PROGRESS' && minReps >= 15 && prior.variation === 'tempo' && bandIndex < equipment.bands.length - 1) { const nextBand = equipment.bands[bandIndex + 1]; return { from, to: target(`2 × 10 external rotations with ${nextBand}; keep 3 RIR`, { targetSets: 2, targetReps: 10, implement: 'band', loadLabel: nextBand, variation: 'standard' }) }; }
      const next = state === 'REGRESS' ? Math.max(8, minReps - 2) : Math.min(15, minReps + 2);
      return { from, to: target(`${state === 'REGRESS' ? 2 : sets} × ${next} external rotations with ${band}${state === 'PROGRESS' && minReps >= 15 ? ', 3-sec return' : ''}`, { targetSets: state === 'REGRESS' ? 2 : sets, targetReps: next, implement: 'band', loadLabel: band, variation: state === 'PROGRESS' && minReps >= 15 ? 'tempo' : 'standard' }) };
    }

    if (id === 'd1e-pushup' || id === 'd1m-scap') {
      const scap = id === 'd1m-scap'; const movement = scap ? 'scapular push-ups' : 'push-ups'; const level = actualLoad || prior.loadLabel || 'current incline';
      if (state === 'REGRESS') return { from, to: target(`2 × ${Math.max(5, minReps - 2)} ${movement} at a higher, pain-free incline`, { targetSets: 2, targetReps: Math.max(5, minReps - 2), implement: 'bodyweight', loadLabel: 'higher incline', variation: 'incline' }) };
      if (!scap && minReps >= 10 && !/floor/i.test(level) && prior.variation !== 'floor-exposure') return { from, to: target(`1 × 6 floor push-ups + 2 × ${minReps} at ${level}; keep 3 RIR`, { targetSets: 3, targetReps: [6, minReps, minReps], implement: 'bodyweight', loadLabel: level, variation: 'floor-exposure' }) };
      const next = Math.min(scap ? 15 : 12, minReps + 1); const tempo = minReps >= (scap ? 15 : 12);
      return { from, to: target(`${sets} × ${tempo ? minReps : next} ${movement} at ${level}${tempo ? ' with 3-sec lowering' : ''}`, { targetSets: sets, targetReps: tempo ? minReps : next, implement: 'bodyweight', loadLabel: level, variation: tempo ? 'tempo' : prior.variation || 'standard' }) };
    }

    if (id === 'd1m-deadbug') {
      const next = state === 'REGRESS' ? Math.max(5, minReps - 1) : minReps + 1;
      return { from, to: target(`${state === 'REGRESS' ? 2 : sets} × ${next} dead bugs each side, bodyweight with a 3-sec reach`, { targetSets: state === 'REGRESS' ? 2 : sets, targetReps: next, implement: 'bodyweight', variation: 'tempo' }) };
    }
    return { from, to: target(`${sets} × ${minReps} with ${sameLoad}`, { targetSets: sets, targetReps: minReps, loadKg: currentKg, loadLabel: sameLoad }) };
  }
  function firstAdaptiveReview(health) {
    const sourceWeekStart = '2026-09-21'; const nextWeekStart = '2026-09-28';
    const signature = equipmentSignature(health); const existing = health.generatedWeeks[nextWeekStart];
    if (existing?.rulesVersion === RULES_VERSION && existing.equipmentSignature === signature) return health.weeklyReviews[sourceWeekStart] || null;
    if (sessionsInWeek(health, sourceWeekStart).length < 5) return null;
    const baseline = [
      { id: 'd3e-pullup-single', name: 'Strict pull-up', state: 'HOLD', from: '3 singles earlier; 3 / 2 / 2 latest', to: '8–9 clean total reps across 3 sets; same variation', reason: 'Total reps improved quickly, but the latest target was marked incomplete. Keep the variation and add only modest volume.' },
      { id: 'd3e-row', name: '5 kg dumbbell row', state: 'PROGRESS', from: '3 × 8 → 3 × 10', to: '3 × 12 at the same 5 kg load', reason: 'Reps were completed and the progression changes reps only—not load.' },
      { id: 'd1e-pushup', name: 'Push-up', state: 'PROGRESS', from: 'Bench incline: 3 × 8 → 12 / 10 / 10', to: '1 controlled floor set + 2 incline back-off sets', reason: 'Incline work was completed at low effort with 2/10 during and 1/10 next-morning pain. Floor exposure remains deliberately limited.' },
      { id: 'd2e-bss', name: 'Bulgarian split squat', state: 'PROGRESS', from: '3 × 8 bodyweight', to: '3 × 10 bodyweight', reason: 'Completed with 0/10 shoulder pain during and next morning; reps rise without adding load.' },
      { id: 'd2e-slrdl', name: 'Single-leg RDL', state: 'PROGRESS', from: '3 × 8 bodyweight', to: '3 × 10 bodyweight', reason: 'Completed with stable shoulder response; progress reps while keeping the same load.' },
      { id: 'd2e-calf', name: 'Calf raise', state: 'PROGRESS', from: '3 × 12 bodyweight', to: '3 × 15 bodyweight', reason: 'Completed with no shoulder reaction; this is a small rep-only progression.' },
      { id: 'cardio', name: 'Easy cardio', state: 'PROGRESS', from: '18 min Zone 2; 30 min bike latest', to: '32 min conversational cardio', reason: 'The 30-minute bike produced only 1/10 during and next-morning discomfort. Volume rises by under 10%.' },
      { id: 'd1m-deadbug', name: 'Dead bug', state: 'HOLD', from: '8 / 8 latest', to: '2 × 8 with slower, cleaner control', reason: 'Hold volume and prioritise trunk and shoulder position rather than adding difficulty.' }
    ];
    const equipment = normalizeEquipment(health.settings.equipment);
    const items = baseline.map(item => {
      if (item.id === 'cardio') { const mode = equipment.rowingMachine ? 'rowing machine' : 'brisk walk'; return { ...item, to: `32 min on the ${mode} at conversational effort after a gradual warm-up`, minutes: 32 }; }
      if (item.id === 'd3e-pullup-single' && equipment.pullUpBar) return { ...item, target: target(item.to, { targetSets: 3, targetReps: [3, 3, 2], implement: 'pull-up bar', loadLabel: 'bodyweight', variation: 'bodyweight' }) };
      const next = equipmentAwarePrescription(health, sourceWeekStart, item.id, item.state);
      return { ...item, from: next.from, to: next.to.prescription, target: next.to };
    });
    return installGeneratedWeek(health, { sourceWeekStart, nextWeekStart, items, baseline: true, equipmentSignature: signature });
  }
  function sourceFingerprint(health, start) {
    return JSON.stringify(Array.from({ length: 7 }, (_, i) => {
      const key = addDays(start, i); const d = health.days[key] || {}; const w = d.workout || {};
      return {
        key,
        workout: {
          complete: Boolean(w.complete), painDuring: w.painDuring || '', painNext: w.painNext || '', effort: w.effort || '',
          cardioMinutes: w.cardioMinutes || '', breathingSymptoms: w.breathingSymptoms || '', relieverUsed: w.relieverUsed || '', exercises: w.exercises || {}
        },
        recovery: recoveryForWorkout(health, key)
      };
    }));
  }
  function weekHasWorkoutActivity(health, start) {
    return Array.from({ length: 7 }, (_, i) => health.days[addDays(start, i)]?.workout)
      .some(workout => workout?.updatedAt || workout?.complete || Object.keys(workout?.exercises || {}).length);
  }
  function installGeneratedWeek(health, review) {
    const overrides = {};
    for (const item of review.items) if (item.id !== 'cardio' && item.id !== 'week') { const config = conservativePrescription[item.id]; overrides[item.id] = { ...(config?.name ? { name: config.name } : {}), ...(item.target || {}), prescription: item.to }; }
    const generatedAt = new Date().toISOString(); const days = {};
    const previousGenerated = health.generatedWeeks[review.nextWeekStart];
    for (let i = 0; i < 7; i++) {
      const base = clone(plans[i]); base.exerciseOverrides = Object.fromEntries(base.ids.filter(id => overrides[id]).map(id => [id, overrides[id]]));
      if (i === 3) base.minutes = review.items.find(item => item.id === 'cardio')?.minutes || (review.baseline ? 32 : base.minutes);
      days[i] = base;
      const key = addDays(review.nextWeekStart, i); const day = dayRecord(health, key);
      const started = day.workout?.updatedAt || day.workout?.complete || Object.keys(day.workout?.exercises || {}).length;
      if (started) {
        if (!day.plan?.title) day.plan = clone(previousGenerated?.days?.[i] || plans[i]);
      } else {
        day.plan = clone(base);
      }
    }
    const fingerprint = review.sourceFingerprint || sourceFingerprint(health, review.sourceWeekStart);
    const finalReview = { ...review, sourceFingerprint: fingerprint, generatedAt, rulesVersion: RULES_VERSION, equipmentSignature: review.equipmentSignature || equipmentSignature(health) };
    health.generatedWeeks[review.nextWeekStart] = { sourceWeekStart: review.sourceWeekStart, sourceFingerprint: fingerprint, generatedAt, rulesVersion: RULES_VERSION, equipmentSignature: finalReview.equipmentSignature, baseline: Boolean(review.baseline), days };
    health.weeklyReviews[review.sourceWeekStart] = finalReview; return finalReview;
  }
  function generateNextWeek(health, sourceStart) {
    const sourceWeekStart = weekStart(sourceStart); const nextWeekStart = addDays(sourceWeekStart, 7);
    if (sourceWeekStart < health.settings.programmeStart) return null;
    const sessions = sessionsInWeek(health, sourceWeekStart);
    const fingerprint = sourceFingerprint(health, sourceWeekStart); const signature = equipmentSignature(health);
    const existing = health.generatedWeeks[nextWeekStart]; const existingReview = health.weeklyReviews[sourceWeekStart] || null;
    const followingWeekStarted = weekHasWorkoutActivity(health, nextWeekStart);
    if (existing?.rulesVersion === RULES_VERSION && followingWeekStarted && existing.equipmentSignature === signature) return existingReview;
    if (existing?.rulesVersion === RULES_VERSION && existing.sourceFingerprint === fingerprint && existing.equipmentSignature === signature) return existingReview;
    if (sessions.length < 5 && dateKey() < nextWeekStart) return existingReview;
    const ids = [...new Set(sessions.flatMap(([, d]) => Object.keys(d.workout.exercises || {})))].filter(id => conservativePrescription[id]);
    const items = ids.map(id => { const config = conservativePrescription[id]; const decision = decideExercise(health, sourceWeekStart, id, config.name); const next = equipmentAwarePrescription(health, sourceWeekStart, id, decision.state); return { ...decision, from: next.from, to: next.to.prescription, target: next.to }; });
    const cardio = sessions.filter(([, d]) => Number(d.workout.cardioMinutes) > 0);
    if (cardio.length) {
      const easy = cardio.filter(([key]) => weekday(key) === 3); const basis = easy.length ? easy : cardio;
      const maxMinutes = Math.max(...basis.map(([, d]) => Number(d.workout.cardioMinutes)));
      const severeSymptoms = cardio.some(([, d]) => ['moderate', 'stopped'].includes(d.workout.breathingSymptoms));
      const mildOrMissing = cardio.some(([, d]) => !d.workout.breathingSymptoms || d.workout.breathingSymptoms === 'mild');
      const symptomFlare = cardio.some(([key, d]) => Number(d.workout.painDuring) >= 4 || Number(recoveryForWorkout(health, key)?.pain) >= 3 || recoveryForWorkout(health, key)?.status === 'worse');
      const highEffort = cardio.some(([, d]) => Number(d.workout.effort) >= 9);
      const state = severeSymptoms || symptomFlare ? 'REGRESS' : mildOrMissing || highEffort ? 'HOLD' : 'PROGRESS';
      const minutes = state === 'PROGRESS' ? Math.max(maxMinutes + 1, Math.floor(maxMinutes * 1.1)) : state === 'REGRESS' ? Math.max(10, Math.floor(maxMinutes * 0.8)) : maxMinutes;
      const mode = normalizeEquipment(health.settings.equipment).rowingMachine ? 'rowing machine' : 'brisk walk';
      const to = state === 'REGRESS' ? `${minutes} min easy ${mode} after a gradual warm-up; follow the asthma action plan` : state === 'HOLD' ? `Repeat ${maxMinutes} min on the ${mode} at conversational effort after a gradual warm-up` : `${minutes} min on the ${mode} at conversational effort after a gradual warm-up (≤10% increase)`;
      const reason = severeSymptoms ? 'Moderate symptoms or an exercise stop were recorded.' : symptomFlare ? 'Shoulder recovery crossed the conservative limit.' : mildOrMissing ? 'Breathing was mild or not recorded, so duration is held.' : highEffort ? 'Effort was too high for an automatic aerobic progression.' : 'Breathing was symptom-free, effort was controlled and shoulder recovery stayed within limits.';
      items.push({ id: 'cardio', name: 'Easy cardio', state, from: `${maxMinutes} min recorded`, to, reason, minutes });
    }
    if (!items.length) items.push({ id: 'week', name: 'Programme', state: 'HOLD', from: 'No qualifying exercise records', to: 'Repeat the current schedule', reason: 'There was not enough exercise-level data for a safe change.' });
    return installGeneratedWeek(health, { sourceWeekStart, nextWeekStart, sourceFingerprint: fingerprint, items, baseline: false, equipmentSignature: signature });
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
  const api = { dateKey, date, addDays, weekday, weekStart, defaults, normalize, normalizeEquipment, mergeHealth, mergeCloud, dayRecord, plans, planFor, timeline, recoveryMessage, dueRecoveryCheck, recoveryForWorkout, dueReminders, calendarExport, decideExercise, generateNextWeek, ensureGeneratedWeeks, isShoulderLoading, exerciseEquipment };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.HealthModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
