/* The Health OS UI reuses the original exercise library and archive readers. */
const HealthUI = (() => {
  'use strict';
  const M = HealthModel;
  let selectedDate = M.dateKey();
  let activeReminder = null;
  const h = escapeHtml;
  const health = () => {
    state.healthOS ||= M.defaults();
    state.healthOS.settings.programmeStart ||= '2026-09-21';
    return state.healthOS;
  };
  const current = () => M.dayRecord(health(), selectedDate);
  const labelDate = key => M.date(key).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const btn = (action, text, css = 'secondary-btn', disabled = false) => `<button class="${css}" data-os="${action}" ${disabled ? 'disabled' : ''}>${text}</button>`;
  const field = (name, label, value = '', type = 'number', attrs = '') => `<div class="field"><label for="os-${name}">${label}</label><input id="os-${name}" name="${name}" type="${type}" value="${h(value)}" ${attrs}></div>`;
  const select = (name, label, value, options) => `<div class="field"><label for="os-${name}">${label}</label><select id="os-${name}" name="${name}">${options.map(([v, t]) => `<option value="${v}" ${String(value) === String(v) ? 'selected' : ''}>${t}</option>`).join('')}</select></div>`;
  const check = (name, text, value) => `<label class="os-check"><input type="checkbox" name="${name}" ${value ? 'checked' : ''}> ${text}</label>`;
  const routine = [['water', 'Water'], ['light', 'Outside light'], ['warmup', 'Warm-up'], ['workout', 'Workout'], ['shower', 'Shower + moisturise'], ['breakfast', 'Breakfast + creatine'], ['meditation', 'Meditation · 10 min']];
  const routineFor = () => routine.filter(([id]) => !M.planFor(health(), selectedDate).pending || !['workout', 'warmup'].includes(id));
  function commit() {
    try { M.ensureGeneratedWeeks(health(), selectedDate); saveState(); return true; }
    catch { showToast('Could not save. Export a backup; browser storage may be full.'); return false; }
  }
  function header(eyebrow, title, text = '') {
    return `<div class="os-heading"><div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2>${text ? `<p>${text}</p>` : ''}</div><span class="os-wordmark">MOVE<br><b>STRONG</b></span></div>`;
  }
  const latestPlannedWeek = () => [M.weekStart(M.dateKey()), ...Object.keys(health().generatedWeeks)].sort().at(-1);
  const latestPlannedDate = () => M.addDays(latestPlannedWeek(), 6);
  function dateControls() {
    return `<div class="os-date-controls">${btn('prev-day', '←')}<label class="sr-only" for="os-date">Selected date</label><input id="os-date" type="date" value="${selectedDate}" max="${latestPlannedDate()}">${btn('next-day', '→', 'secondary-btn', selectedDate >= latestPlannedDate())}${btn('today', 'Today')}</div>`;
  }
  function weekStrip() {
    const start = M.weekStart(selectedDate);
    return `<div class="os-week-strip">${Array.from({ length: 7 }, (_, i) => {
      const key = M.addDays(start, i); const day = health().days[key];
      return `<button data-date="${key}" class="${key === selectedDate ? 'selected' : ''}" ${key === M.dateKey() ? 'aria-current="date"' : ''}><small>${['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</small><strong>${M.date(key).getDate()}</strong><span class="os-dot ${day?.workout?.complete ? 'complete' : ''}"></span></button>`;
    }).join('')}</div>`;
  }
  function doneEvent(event, day) {
    return event.id === 'workout' ? day.workout?.complete : event.id === 'sauna' ? day.sauna?.complete : event.id === 'shoulder-check' ? !M.dueRecoveryCheck(health(), selectedDate) : event.kind === 'routine' ? day.routine?.[event.id] : day.activities?.[event.id]?.status === 'done';
  }
  function todayView() {
    const day = current(); const plan = M.planFor(health(), selectedDate); const r = day.recovery || {}; const recoveryDue = M.dueRecoveryCheck(health(), selectedDate);
    const completed = routineFor().filter(([id]) => id === 'workout' ? day.workout?.complete : day.routine?.[id]).length;
    return header(labelDate(selectedDate), 'Make space for<br>feeling stronger.', 'A little structure. A day that works for you.') + weekStrip() +
      `<div class="os-dashboard"><div>${recoveryDue ? `<section class="card os-recovery-due"><p class="eyebrow">Needed before progression</p><h3>How is your shoulder this morning?</h3><p>Yesterday’s session needs a two-minute recovery check. Missing recovery data automatically produces HOLD—not PROGRESS.</p>${btn('recovery', 'Complete shoulder check →', 'primary-btn')}</section>` : ''}<section class="os-feature"><p class="eyebrow">${h(health().settings.workout)} · ${plan.minutes} MIN · ${plan.kind.toUpperCase()}</p><h3>${plan.title}</h3><p>Build control first. Strength follows.</p><div class="hero-actions">${btn('train', day.workout?.complete ? 'Review session ✓' : 'Open today’s session ↗', 'primary-btn')}${btn('recovery', 'Check in', 'os-light-btn')}</div><span class="os-feature-art" aria-hidden="true">↗</span></section>
      <section class="card os-routine"><div class="section-heading"><div><p class="eyebrow">Your morning</p><h3>One step at a time</h3></div><span>${completed}/${routineFor().length}</span></div><progress max="${routineFor().length}" value="${completed}" aria-label="Morning routine progress"></progress><div class="os-routine-grid">${routineFor().map(([id, title]) => `<button data-routine="${id}" class="${(id === 'workout' ? day.workout?.complete : day.routine?.[id]) ? 'done' : ''}" aria-pressed="${Boolean(id === 'workout' ? day.workout?.complete : day.routine?.[id])}"><span>${(id === 'workout' ? day.workout?.complete : day.routine?.[id]) ? '✓' : '○'}</span>${title}</button>`).join('')}</div>${btn('start-morning', 'Continue morning →', 'text-btn')}</section>
      <section class="card os-checkin"><p class="eyebrow">Recovery, in your words</p><div class="os-vitals"><div><strong>${h(r.sleep || '—')}<small> h</small></strong><span>Sleep</span></div><div><strong>${r.shoulder === undefined || r.shoulder === '' ? '—' : h(r.shoulder)}<small>/10</small></strong><span>Shoulder pain</span></div><div><strong>${h(r.energy || '—')}</strong><span>Energy</span></div></div><p class="help-text">${M.recoveryMessage(r, health().settings.upperBodyCleared)}</p>${btn('recovery', 'Update check-in →', 'text-btn')}</section></div>
      <section class="card os-agenda"><div class="section-heading"><div><p class="eyebrow">Your daily rhythm</p><h3>The day ahead</h3></div>${btn('calendar', '↗')}</div>${M.timeline(health(), selectedDate).map(e => `<button data-event="${e.id}" class="os-event ${doneEvent(e, day) ? 'is-done' : ''}"><time>${e.time}</time><span class="os-event-line ${e.kind}"></span><span><strong>${h(e.title)}</strong><small>${doneEvent(e, day) ? 'Completed ✓' : day.activities?.[e.id]?.status === 'skipped' ? 'Skipped' : `${e.minutes || 'Rest'}${e.minutes ? ' min' : ''}`}</small></span><span>↗</span></button>`).join('')}</section></div>`;
  }
  function calendarView() {
    const start = M.weekStart(selectedDate); const keys = Array.from({ length: 7 }, (_, i) => M.addDays(start, i));
    const end = keys[6]; const generated = health().generatedWeeks[start];
    const latestPlanned = latestPlannedWeek();
    const nextUnavailable = M.addDays(start, 7) > latestPlanned;
    const range = `${M.date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${M.date(end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    return header(generated ? 'Adaptive week' : 'Weekly plan', range, generated ? 'Generated from your previous week. Later weeks stay hidden until they are earned.' : 'Only committed training is shown. Future weeks appear after your weekly review.') + `<div class="os-toolbar os-week-actions">${btn('prev-period', '← Previous week')}${btn('today', 'Current week')}${btn('next-period', 'Next planned week →', 'secondary-btn', nextUnavailable)}${btn('export-calendar', 'Export planned dates')}</div>
      <div class="os-week-plan">${keys.map((key, index) => {
        const day = health().days[key] || {}; const plan = M.planFor(health(), key); const complete = day.workout?.complete; const due = M.dueRecoveryCheck(health(), key);
        return `<button class="os-week-row ${key === M.dateKey() ? 'is-today' : ''} ${complete ? 'is-complete' : ''}" data-date="${key}" data-open-day><span class="os-week-date"><small>${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][index]}</small><strong>${M.date(key).getDate()}</strong></span><span class="os-week-session"><small>${h(health().settings.workout)} · ${plan.minutes} min · ${h(plan.kind)}</small><strong>${h(plan.title)}</strong><span>${due ? 'Shoulder recovery check due' : complete ? 'Session complete' : day.workout?.updatedAt ? 'Session in progress' : generated ? 'Adaptive prescription ready' : 'Planned'}</span></span><span class="os-week-status ${due ? 'due' : complete ? 'complete' : ''}">${due ? 'CHECK IN' : complete ? 'DONE' : 'OPEN'} →</span></button>`;
      }).join('')}</div>${nextUnavailable ? '<p class="help-text os-plan-limit">Nothing beyond this committed week is shown yet. Complete your sessions and recovery inputs; the next week will appear after review.</p>' : ''}`;
  }
  function exerciseLibrary() {
    return PROGRAMME.flatMap(day => availableSessionsForDay(day).flatMap(option => day[option.key].exercises));
  }
  function exercisesFor(plan) {
    return plan.ids.map(id => exerciseLibrary().find(e => e.id === id)).filter(Boolean).map(e => ({ ...e, ...(plan.exerciseOverrides?.[e.id] || {}), sets: Math.min(e.sets, 3) }));
  }
  function trainView() {
    const day = current(); const plan = M.planFor(health(), selectedDate);
    const start = M.weekStart(selectedDate); const weekPlans = Array.from({ length: 7 }, (_, i) => { const key = M.addDays(start, i); return [key, M.planFor(health(), key), health().days[key] || {}]; });
    return header('Training', 'Built for the long run.', 'Controlled strength. Calisthenics foundations. Easy aerobic work.') + dateControls() +
      `<section class="os-feature"><p class="eyebrow">${labelDate(selectedDate)} · ${plan.minutes} MIN</p><h3>${plan.title}</h3><p>${day.workout?.complete ? 'Session complete. Your record is saved.' : 'Record your sets, your effort and your shoulder response.'}</p><div class="hero-actions">${btn('session', day.workout?.complete ? 'Review workout →' : 'Start session →', 'primary-btn')}</div></section>
      <section class="section"><div class="section-heading"><div><p class="eyebrow">Committed plan</p><h3>This week only</h3></div>${btn('calendar', 'Open week →', 'text-btn')}</div><div class="os-training-week">${weekPlans.map(([key, p, record]) => `<button data-date="${key}" data-open-training class="${key === selectedDate ? 'selected' : ''}"><small>${M.date(key).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}</small><strong>${h(p.short)}</strong><span>${record.workout?.complete ? 'Done ✓' : `${p.minutes} min`}</span></button>`).join('')}</div></section><section class="card section"><h3>Original programme archive</h3><p class="help-text">Your earlier six-week logs, alternatives and original goals remain available as history. The adaptive calendar above is now the active programme.</p>${btn('archive', 'Open archive →')}${btn('old-progress', 'Original history')}${btn('old-goals', 'Original goals')}</section>`;
  }
  function sessionView() {
    const day = current(); const plan = M.planFor(health(), selectedDate);
    if (plan.pending) return header('Your programme', 'Starts Monday 21 September', 'Your weekly training begins then. Your morning routine and recovery check-ins are available now.') + btn('home', '← Today');
    const log = day.workout ||= { exercises: {}, complete: false };
    log.exercises ||= {};
    const exercises = exercisesFor(plan);
    return header(labelDate(selectedDate), plan.title, 'Leave room in reserve. Record what you actually did.') + `<div class="os-toolbar">${btn('train', '← Training')}${btn('rest', '90-second rest timer')}</div><div class="card os-recovery-note">${M.recoveryMessage(day.recovery, health().settings.upperBodyCleared)}<p class="help-text">Hanging and pull-up exposure require your clinician’s clearance. Muscle-ups, explosive pulls and handstands remain goals, not automatic prescriptions.</p></div>
      ${plan.kind === 'cardio' ? `<section class="card section"><h3>Conversational effort</h3><p>Begin with a gradual walking warm-up. Choose an easy run/walk, bike or row you already tolerate. Keep rowing within your cleared shoulder limits.</p><p class="help-text">Follow your prescribed asthma action plan and keep your reliever available. Stop if breathing symptoms develop.</p></section>` : ''}
      <section class="section">${exercises.map(e => {
        const previous = Object.entries(health().days).filter(([key, d]) => key < selectedDate && d.workout?.exercises?.[e.id]).sort(([a], [b]) => b.localeCompare(a))[0];
        const past = previous ? previous[1].workout.exercises[e.id] : Object.values(state.logs).filter(l => l.exercises?.[e.id]).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))[0]?.exercises[e.id];
        return `<p class="help-text os-previous">${h(e.name)} · Previous: ${past?.sets?.some(v => v !== '') ? h(past.sets.join(' / ')) : 'No sets recorded'} ${h(past?.load || '')}</p>${renderExerciseCard(e, log)}`;
      }).join('')}</section>
      <form id="session-form" class="card section"><h3>Session record</h3><div class="form-grid">${field('minutes', 'Total minutes', log.minutes, 'number', 'min="0" max="600" step="1"')}${field('cardioMinutes', 'Cardio minutes', log.cardioMinutes, 'number', 'min="0" max="600" step="1"')}${field('distance', 'Distance (km)', log.distance, 'number', 'min="0" max="200" step="0.01"')}${field('painDuring', 'Shoulder during (0–10)', log.painDuring, 'number', 'min="0" max="10"')}${field('painNext', 'Next-morning pain (legacy / if known)', log.painNext, 'number', 'min="0" max="10"')}${field('effort', 'Effort (1–10)', log.effort, 'number', 'min="1" max="10"')}${select('breathingSymptoms', 'Cardio breathing / asthma symptoms', log.breathingSymptoms, [['', 'Not recorded'], ['none', 'None'], ['mild', 'Mild · did not change pace'], ['moderate', 'Moderate · slowed down'], ['stopped', 'Stopped exercise']])}${select('relieverUsed', 'Reliever inhaler used', log.relieverUsed, [['', 'Not recorded'], ['no', 'No'], ['yes', 'Yes']])}<div class="field full"><label for="os-notes">Notes / level / assistance</label><textarea id="os-notes" name="notes">${h(log.notes || '')}</textarea></div></div><p class="help-text">After you finish, tomorrow morning’s shoulder check-in is required before any shoulder-loading exercise can receive PROGRESS.</p><div class="os-toolbar"><button class="primary-btn" name="intent" value="save">Save record</button><button class="${log.complete ? 'secondary-btn' : 'primary-btn'}" name="intent" value="complete">${log.complete ? 'Reopen session' : 'Finish session ✓'}</button></div></form>`;
  }
  function recoveryView() {
    const day = current(); const r = day.recovery || {}; const s = day.sauna || {}; const due = M.dueRecoveryCheck(health(), selectedDate); const previous = r.previousWorkout || {};
    const followup = due || previous.workoutDate ? `<form id="morning-recovery-form" class="card os-recovery-due"><p class="eyebrow">${due ? 'Required for progression' : 'Shoulder follow-up saved'}</p><h3>Next-morning shoulder response</h3><p class="help-text">For the workout on ${h(labelDate(due?.workoutDate || previous.workoutDate))}. This does not diagnose an injury; it is a conservative loading guardrail.</p><div class="form-grid">${field('morningPain', 'Shoulder pain now (0–10)', previous.pain, 'number', 'min="0" max="10" required')}${select('morningStatus', 'Compared with pre-workout baseline', previous.status, [['', 'Select one'], ['better', 'Better'], ['same', 'Same / back to baseline'], ['worse', 'Worse']])}</div>${check('plateSymptoms', 'Focal plate-site pain, swelling, weakness or neurological symptoms', previous.plateSymptoms)}<button class="primary-btn">Save morning recovery</button><p class="help-text">Worse symptoms, pain ≥3/10 or plate-site symptoms trigger REGRESS / MODIFY. Missing data triggers HOLD.</p></form>` : '';
    return header('Recovery', 'Listen. Adjust. Repeat.', 'A check-in, not a made-up recovery score.') + dateControls() + followup + `<div class="os-recovery-grid"><form id="recovery-form" class="card"><p class="eyebrow">${labelDate(selectedDate)}</p><h3>How are you feeling?</h3><div class="form-grid">${field('sleep', 'Sleep (hours)', r.sleep, 'number', 'min="0" max="24" step="0.1"')}${field('shoulder', 'Shoulder pain (0–10)', r.shoulder, 'number', 'min="0" max="10"')}${select('energy', 'Energy', r.energy, [['', 'Not recorded'], ['low', 'Low'], ['steady', 'Steady'], ['good', 'Good']])}${select('breathing', 'Breathing', r.breathing, [['', 'Not recorded'], ['normal', 'Normal for me'], ['symptoms', 'Asthma symptoms']])}${select('skin', 'Skin today', r.skin, [['', 'Not recorded'], ['fine', 'Comfortable'], ['irritated', 'Irritated'], ['flare', 'Flare']])}</div>${check('worse', 'Shoulder worse than my usual baseline', r.worse)}${check('redFlag', 'Sharp plate-site pain, new swelling or weakness', r.redFlag)}<div class="field"><label for="os-recovery-notes">Notes</label><textarea id="os-recovery-notes" name="notes">${h(r.notes || '')}</textarea></div><button class="primary-btn">Save check-in</button><p class="help-text">${M.recoveryMessage(r, health().settings.upperBodyCleared)}</p></form>
      <form id="sauna-form" class="card"><p class="eyebrow">Optional recovery time</p><h3>Sauna + skin response</h3><p class="help-text">Heat and sweat can trigger eczema. Leave if you feel unwell or your skin becomes irritated. This tracks tolerance; sauna is not a treatment for your fracture or eczema.</p><div class="form-grid">${field('minutes', 'Actual minutes', s.minutes, 'number', 'min="1" max="120" required')}${field('temperature', 'Temperature °C (optional)', s.temperature, 'number', 'min="20" max="120"')}${select('saunaSkin', 'Skin afterwards', s.skin, [['', 'Not recorded'], ['fine', 'Fine'], ['irritated', 'Slightly irritated'], ['flare', 'Flare']])}${select('nextSkin', 'Skin next morning', s.nextSkin, [['', 'Not recorded'], ['fine', 'Fine'], ['irritated', 'Slightly irritated'], ['flare', 'Flare']])}</div>${check('shower', 'Lukewarm shower', s.shower)}${check('moisturise', 'Moisturised', s.moisturise)}${check('hydrate', 'Rehydrated', s.hydrate)}<button class="primary-btn">${s.complete ? 'Update sauna record' : 'Log sauna session'}</button>${s.complete ? btn('remove-sauna', 'Remove this sauna record', 'text-btn') : ''}</form></div>
      <section class="card section"><h3>Recent check-ins</h3>${Object.entries(health().days).filter(([, d]) => d.recovery?.updatedAt || d.sauna?.complete).sort(([a], [b]) => b.localeCompare(a)).slice(0, 14).map(([key, d]) => `<button class="os-history-row" data-date="${key}" data-open-recovery><strong>${labelDate(key)}</strong><span>${d.recovery?.sleep ? `${h(d.recovery.sleep)}h sleep · ` : ''}${d.sauna?.complete ? `${h(d.sauna.minutes)} min sauna · ${h(d.sauna.skin || 'skin not recorded')}` : 'Check-in saved'}</span></button>`).join('') || '<p class="help-text">Your check-ins will appear here.</p>'}</section>`;
  }
  const tracks = [
    ['pull', 'Pulling', ['Supported row', 'Assisted pull-up', 'Strict pull-up', 'Chest-to-bar', 'Explosive pull', 'Muscle-up']],
    ['push', 'Pushing', ['Incline push-up', 'Floor push-up', 'Pike push-up', 'Handstand push-up']],
    ['core', 'Core', ['Dead bug / hollow hold', 'Knee raise', 'Leg raise', 'Tuck L-sit', 'L-sit']],
    ['balance', 'Balance', ['Shoulder control', 'Wall handstand', 'Freestanding handstand']]
  ];
  function progressView() {
    const start = M.weekStart(selectedDate); const end = M.addDays(start, 7);
    const days = Object.entries(health().days).filter(([key]) => key >= start && key < end);
    const sessions = days.filter(([, d]) => d.workout?.complete);
    const sleep = days.map(([, d]) => d.recovery?.sleep).filter(v => v !== undefined && v !== '').map(Number);
    const cardio = sessions.reduce((sum, [, d]) => sum + Number(d.workout.cardioMinutes || 0), 0);
    const saunas = days.filter(([, d]) => d.sauna?.complete);
    const review = health().weeklyReviews[start] || health().weeklyReviews[M.addDays(start, -7)];
    const reviewPanel = review ? `<section class="section"><div class="section-heading"><div><p class="eyebrow">Deterministic weekly review</p><h3>${review.baseline ? 'First adaptive week' : 'Why next week changed'}</h3><p>Generated for the week of ${h(labelDate(review.nextWeekStart))}. Every decision uses the same conservative rules.</p></div></div><div class="os-review-list">${review.items.map(item => `<article class="card os-review-item"><div><span class="os-state ${item.state.toLowerCase()}">${h(item.state)}</span><h3>${h(item.name)}</h3></div><p><strong>From:</strong> ${h(item.from || 'Recorded work')}</p><p><strong>Next:</strong> ${h(item.to)}</p><p class="help-text"><strong>Why:</strong> ${h(item.reason)}</p></article>`).join('')}</div><p class="help-text">PROGRESS requires completed targets, clean technique, 2–4 RIR, acceptable effort, shoulder pain ≤2/10 and stable next-morning symptoms. Borderline or missing data means HOLD. Pain ≥4 during, ≥3 next morning, worse recovery, plate symptoms or poor technique means REGRESS / MODIFY. Exercises not listed carry forward unchanged.</p></section>` : `<section class="card section"><h3>Weekly review pending</h3><p class="help-text">The next week is generated automatically after five completed sessions or when the week ends. Missing technique, RIR or next-morning recovery data produces HOLD.</p></section>`;
    return header('Progress', 'Small steps. Real progress.', `Week of ${labelDate(start)}`) + dateControls() + `<div class="os-metrics">${[[sessions.length, 'Sessions completed'], [cardio, 'Cardio minutes'], [saunas.length, 'Sauna sessions'], [sleep.length ? (sleep.reduce((a, b) => a + b, 0) / sleep.length).toFixed(1) + 'h' : '—', 'Average recorded sleep']].map(([v, t]) => `<div class="metric"><strong>${v}</strong><span>${t}</span></div>`).join('')}</div>${reviewPanel}<section class="section"><div class="section-heading"><div><p class="eyebrow">Your skill pathways</p><h3>Build the foundations</h3><p>Choose your current level manually. Milestones never increase your workout load automatically.</p></div></div><div class="os-plan-grid">${tracks.map(([id, title, stages]) => {
      const entry = health().milestones[id] || {}; const level = Number.isInteger(entry.level) && entry.level < stages.length ? entry.level : 0;
      return `<form class="card os-milestone" data-track="${id}"><p class="eyebrow">${title}</p><h3>${stages[level]}</h3><div class="os-stage-track">${stages.map((s, i) => `<span class="${i <= level ? 'reached' : ''}" title="${s}"></span>`).join('')}</div><p class="help-text">${stages.join(' → ')}</p>${select(`level-${id}`, 'Current stage', level, stages.map((s, i) => [i, s]))}${field(`best-${id}`, 'Best reps / hold / assistance', entry.best, 'text', 'maxlength="100"')}<button class="secondary-btn">Save milestone</button></form>`;
    }).join('')}</section><section class="card section"><h3>Workout history</h3>${Object.entries(health().days).filter(([, d]) => d.workout?.updatedAt).sort(([a], [b]) => b.localeCompare(a)).slice(0, 30).map(([key, d]) => `<button class="os-history-row" data-date="${key}" data-open-session><strong>${labelDate(key)}</strong><span>${h(M.planFor(health(), key).title)} · ${d.workout.complete ? 'Complete ✓' : 'In progress'}</span></button>`).join('') || '<p class="help-text">Complete your first session to start your history.</p>'}${btn('old-progress', `Original six-week history (${Object.values(state.logs).filter(l => l.complete).length} completed sessions) →`, 'text-btn')}</section>`;
  }
  function settingsView() {
    const s = health().settings; const cloud = CloudSync.status();
    return header('You', 'A rhythm that fits.', 'Set your schedule. Keep your records yours.') + `<form id="settings-form" class="card"><h3>Your daily schedule</h3><p class="help-text">Programme starts Monday 21 September 2026. Meditation takes the 10 minutes immediately before your work start time.</p><div class="form-grid">${[['wake', 'Wake'], ['workout', 'Workout'], ['work', 'Start work'], ['windDown', 'Wind-down'], ['bedtime', 'Bedtime'], ['saunaTime', 'Sauna']].map(([key, title]) => field(key, title, s[key], 'time', 'required')).join('')}</div><p class="help-text">Times follow your device’s local timezone. Morning steps are scheduled around your workout. Adjust times when travelling.</p><div class="field"><label for="os-movementTimes">Weekday movement reminders (comma-separated)</label><input id="os-movementTimes" name="movementTimes" value="${h(s.movementTimes.join(', '))}" placeholder="11:00, 13:00, 15:30" required></div><p class="eyebrow section">Optional sauna days</p><div class="os-day-checks">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => check(`sauna-${i}`, d, s.saunaDays.includes(i))).join('')}</div>${check('recoveryReminders', 'Require and remind me about next-morning shoulder recovery', s.recoveryReminders)}${check('upperBodyCleared', 'My clinician has cleared my current upper-body training', s.upperBodyCleared)}${field('clearanceNotes', 'Cleared movements / limits / date', s.clearanceNotes, 'text', 'maxlength="500"')}<p class="help-text">This records your clinician’s advice; it does not grant clearance for advanced skills.</p><button class="primary-btn">Save preferences</button></form>
      ${PushReminders.panel()}<section class="card section"><p class="eyebrow">Gentle nudges</p><h3>Movement + sauna reminders</h3><p>Open-app reminders: <strong>${s.reminders ? 'On' : 'Off'}</strong>. Notification permission: <strong>${'Notification' in window ? Notification.permission : 'Unavailable'}</strong>.</p><p class="help-text">Without a push connection, these reminders need the app to stay open. When push is connected, the server sends reminders instead to avoid duplicate alerts. While it is running, reminders offer Start, Snooze or Skip and pause after logged movement. Export only the selected committed week to a calendar; later weeks remain hidden until reviewed.</p><div class="os-toolbar">${btn('notifications', s.reminders ? 'Turn off app reminders' : 'Enable app reminders', 'primary-btn')}${btn('test-reminder', 'Preview reminder')}${btn('export-calendar', 'Export selected week (.ics)')}</div><p class="help-text">The calendar export is a one-week snapshot, not a live sync. Replace it after each weekly review to avoid stale sessions or duplicates.</p></section>
      <section class="card section"><p class="eyebrow">Local-first cloud backup</p><h3>${cloud.configured ? 'Firestore sync connected' : 'Connect Firebase / Firestore'}</h3><p class="help-text">Every change saves locally first. When connected and online, the complete encrypted-in-transit app state syncs to your own Firebase project using Firebase Authentication. Your Firebase password is never stored by this app.</p>${cloud.configured ? `<p><strong>${h(cloud.email)}</strong><br><span class="help-text">Project: ${h(cloud.projectId)} · ${cloud.lastSyncedAt ? `Last synced ${h(new Date(cloud.lastSyncedAt).toLocaleString('en-GB'))}` : 'Waiting for first sync'}${cloud.error ? ` · ${h(cloud.error)}` : ''}</span></p><div class="os-toolbar">${btn('cloud-sync', cloud.syncing ? 'Syncing…' : 'Sync now', 'primary-btn')}${btn('cloud-disconnect', 'Disconnect this device')}</div>` : `<form id="cloud-form"><div class="form-grid">${field('firebaseProjectId', 'Firebase project ID', cloud.projectId, 'text', 'required autocomplete="off"')}${field('firebaseApiKey', 'Firebase web API key', '', 'password', 'required autocomplete="off"')}${field('firebaseEmail', 'Sync account email', cloud.email, 'email', 'required autocomplete="email"')}${field('firebasePassword', 'Password', '', 'password', 'required minlength="6" autocomplete="current-password"')}</div><div class="os-toolbar"><button class="primary-btn" name="cloudIntent" value="signin">Sign in + sync</button><button class="secondary-btn" name="cloudIntent" value="create">Create sync account</button></div></form>`}<p class="help-text">Enable Email/Password Authentication and create Firestore with rules allowing each signed-in user to read/write only <code>users/{userId}</code>. Setup details are in the README. Exported backups exclude sign-in tokens and Firebase configuration.</p></section>
      <section class="card section"><p class="eyebrow">On-device copy</p><h3>History + backups</h3><p class="help-text">Your original records remain under their existing storage key. New daily records are added alongside them. Export before clearing browser data even when cloud sync is enabled.</p><div class="os-toolbar">${btn('export', 'Export all data', 'primary-btn')}${btn('import', 'Merge backup')}${btn('archive', 'Original programme')}</div><p class="help-text">Import merges missing records. When the same record exists in both places, the current device’s record is kept. A pre-import snapshot is saved locally.</p></section>
      <section class="card section"><h3>Training principles</h3><p class="help-text">Recovery decisions depend on symptoms and clinical clearance, not time since surgery alone. Exercise should follow your asthma action plan. Heat and sweat may aggravate eczema.</p><div class="os-source-links"><a href="https://www.massgeneral.org/assets/mgh/pdf/orthopaedics/sports-medicine/physical-therapy/rehabilitation-protocol-for-clavicle-orif.pdf" target="_blank" rel="noopener">Clavicle ORIF rehabilitation ↗</a><a href="https://www.nhs.uk/conditions/asthma/" target="_blank" rel="noopener">NHS asthma guidance ↗</a><a href="https://www.aad.org/public/diseases/eczema/types/atopic-dermatitis/atopic-dermatitis-coping" target="_blank" rel="noopener">Eczema skin care ↗</a></div><p class="help-text">Move Strong 3.1 · Adaptive Health OS</p></section>`;
  }
  function download(data, name, type) {
    const url = URL.createObjectURL(new Blob([data], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function eventView(id, restoring = false) {
    const event = M.timeline(health(), selectedDate).find(e => e.id === id); if (!event) return;
    if (id === 'workout') return routeTo('session');
    if (id === 'sauna') return routeTo('recovery');
    if (id === 'shoulder-check') return routeTo('recovery');
    if (!restoring) return routeTo('event:' + id);
    const day = current();
    main.innerHTML = header(labelDate(selectedDate), event.title, `${event.time} · ${event.minutes || 'Rest'}${event.minutes ? ' minutes' : ''}`) + `<section class="card"><p>${event.kind === 'movement' || id === 'light' ? 'Take a comfortable walk. A movement break does not need to be a workout.' : id === 'meditation' ? 'Sit comfortably with your back supported. Set aside 10 minutes. Let your breathing stay natural and gently return your attention to it when your mind wanders.' : id === 'warmup' ? 'Use your familiar, cleared warm-up and check how your shoulder feels.' : id === 'breakfast' ? 'Make time for a protein-rich breakfast and your usual daily creatine, if you use it.' : 'Make a little space for this part of your day.'}</p><div class="os-toolbar">${id === 'meditation' ? btn('meditate', 'Start 10-minute timer') : ''}${btn('event-complete', doneEvent(event, day) ? 'Undo completion' : 'Mark done ✓', 'primary-btn')}${btn('event-skip', 'Skip today')}${btn('home', '← Today')}</div></section>`;
    bind();
    main.querySelector('[data-os="event-complete"]').onclick = () => {
      const done = !doneEvent(event, day);
      if (event.kind === 'routine') { day.routine ||= {}; day.routine[id] = done; }
      else { day.activities ||= {}; day.activities[id] = { status: done ? 'done' : 'pending', updatedAt: new Date().toISOString() }; }
      if (done && (event.kind === 'movement' || id === 'light') && selectedDate === M.dateKey()) day.lastMovementAt = new Date().toISOString();
      commit(); routeTo('home');
    };
    main.querySelector('[data-os="event-skip"]').onclick = () => { day.activities ||= {}; day.activities[id] = { status: 'skipped' }; commit(); routeTo('home'); };
  }
  function bind() {
    PushReminders.bind();
    main.querySelectorAll('[data-os]').forEach(el => el.addEventListener('click', () => action(el.dataset.os)));
    main.querySelectorAll('[data-date]').forEach(el => el.addEventListener('click', () => { selectedDate = el.dataset.date; routeTo(el.hasAttribute('data-open-session') ? 'session' : el.hasAttribute('data-open-recovery') ? 'recovery' : el.hasAttribute('data-open-training') ? 'train' : 'home'); }));
    main.querySelector('#os-date')?.addEventListener('change', e => { if (e.target.value) { if (e.target.value > latestPlannedDate()) { e.target.value = selectedDate; return showToast('Later dates appear after weekly review.'); } selectedDate = e.target.value; render(); } });
    main.querySelectorAll('[data-routine]').forEach(el => el.addEventListener('click', () => {
      const id = el.dataset.routine; if (id === 'workout') return routeTo('session');
      const day = current(); day.routine ||= {}; day.routine[id] = !day.routine[id];
      if (id === 'light' && day.routine[id] && selectedDate === M.dateKey()) day.lastMovementAt = new Date().toISOString();
      commit(); render();
    }));
    main.querySelectorAll('[data-event]').forEach(el => el.addEventListener('click', () => eventView(el.dataset.event)));
    const onForm = (id, callback) => main.querySelector(`#${id}`)?.addEventListener('submit', e => { e.preventDefault(); callback(Object.fromEntries(new FormData(e.target)), e); });
    onForm('morning-recovery-form', (data, e) => {
      if (!data.morningStatus) return showToast('Choose better, same or worse than baseline.');
      const due = M.dueRecoveryCheck(health(), selectedDate); const workoutDate = due?.workoutDate || current().recovery?.previousWorkout?.workoutDate;
      current().recovery ||= {};
      current().recovery.previousWorkout = { workoutDate, pain: data.morningPain, status: data.morningStatus, plateSymptoms: e.target.plateSymptoms.checked, complete: true, updatedAt: new Date().toISOString() };
      current().recovery.updatedAt = new Date().toISOString();
      const workout = health().days[workoutDate]?.workout; if (workout) workout.painNext = data.morningPain;
      if (commit()) showToast('Morning shoulder recovery saved'); render();
    });
    onForm('recovery-form', (data, e) => { current().recovery = { ...data, worse: e.target.worse.checked, redFlag: e.target.redFlag.checked, updatedAt: new Date().toISOString() }; if (commit()) showToast('Check-in saved'); render(); });
    onForm('sauna-form', (data, e) => { current().sauna = { ...data, skin: data.saunaSkin, shower: e.target.shower.checked, moisturise: e.target.moisturise.checked, hydrate: e.target.hydrate.checked, complete: true, updatedAt: new Date().toISOString() }; if (commit()) showToast('Sauna recorded'); render(); });
    onForm('settings-form', (data, e) => {
      const times = [...new Set(data.movementTimes.split(',').map(t => t.trim()))].sort();
      if (times.length > 10 || times.some(t => !/^([01]\d|2[0-3]):[0-5]\d$/.test(t))) return showToast('Use times like 11:00, 13:00, 15:30 (up to 10).');
      const s = health().settings;
      for (const key of ['wake', 'workout', 'work', 'windDown', 'bedtime', 'saunaTime', 'clearanceNotes']) s[key] = data[key];
      s.movementTimes = times; s.recoveryReminders = e.target.recoveryReminders.checked; s.upperBodyCleared = e.target.upperBodyCleared.checked; s.saunaDays = Array.from({ length: 7 }, (_, i) => i).filter(i => e.target.elements[`sauna-${i}`].checked);
      if (commit()) showToast('Schedule saved'); render();
    });
    onForm('cloud-form', async (data, e) => {
      const submitter = e.submitter; submitter.disabled = true; submitter.textContent = 'Connecting…';
      try {
        await CloudSync.connect({ projectId: data.firebaseProjectId, apiKey: data.firebaseApiKey, email: data.firebaseEmail, password: data.firebasePassword }, e.submitter?.value === 'create');
        showToast('Cloud sync connected'); render();
      } catch (error) { submitter.disabled = false; submitter.textContent = e.submitter?.value === 'create' ? 'Create sync account' : 'Sign in + sync'; showToast(error.message || 'Could not connect cloud sync'); }
    });
    onForm('session-form', (data, e) => {
      const log = current().workout;
      if (Number(data.cardioMinutes || 0) > Number(data.minutes || 0)) return showToast('Cardio minutes cannot exceed total minutes.');
      Object.assign(log, data, { updatedAt: new Date().toISOString() });
      if (e.submitter?.value === 'complete') { log.complete = !log.complete; if (log.complete && selectedDate === M.dateKey()) current().lastMovementAt = new Date().toISOString(); }
      if (commit()) showToast(log.complete ? 'Session complete ✓' : 'Session saved'); render();
    });
    main.querySelectorAll('[data-track]').forEach(form => form.addEventListener('submit', e => {
      e.preventDefault(); const id = form.dataset.track; const data = new FormData(form); health().milestones[id] = { level: Number(data.get(`level-${id}`)), best: data.get(`best-${id}`), updatedAt: new Date().toISOString() }; commit(); showToast('Milestone saved'); render();
    }));
    if (route === 'session') bindSession();
  }
  function bindSession() {
    const log = current().workout; const exercises = exercisesFor(M.planFor(health(), selectedDate));
    const entry = id => log.exercises[id] ||= { sets: [], load: '', done: false };
    const save = () => { log.updatedAt = new Date().toISOString(); commit(); };
    main.querySelectorAll('[data-guide-exercise]').forEach(el => el.addEventListener('click', () => openExerciseGuide(exercises.find(e => e.id === el.dataset.guideExercise))));
    main.querySelectorAll('[data-check-exercise]').forEach(el => el.addEventListener('click', () => { const v = entry(el.dataset.checkExercise); v.done = !v.done; el.classList.toggle('checked', v.done); el.setAttribute('aria-pressed', v.done); save(); }));
    main.querySelectorAll('[data-set-index]').forEach(el => {
      el.setAttribute('aria-label', `${exercises.find(e => e.id === el.dataset.exerciseId)?.name} set ${Number(el.dataset.setIndex) + 1}`);
      el.addEventListener('change', () => { entry(el.dataset.exerciseId).sets[Number(el.dataset.setIndex)] = el.value; save(); });
    });
    main.querySelectorAll('[data-exercise-load]').forEach(el => { el.setAttribute('aria-label', 'Load or assistance level'); el.addEventListener('change', () => { entry(el.dataset.exerciseLoad).load = el.value; save(); }); });
    main.querySelectorAll('[data-exercise-rir]').forEach(el => { el.setAttribute('aria-label', 'Reps in reserve'); el.addEventListener('change', () => { entry(el.dataset.exerciseRir).rir = el.value; save(); }); });
    main.querySelectorAll('[data-exercise-technique]').forEach(el => { el.setAttribute('aria-label', 'Technique quality'); el.addEventListener('change', () => { entry(el.dataset.exerciseTechnique).technique = el.value; save(); }); });
    main.querySelectorAll('[data-rest-for]').forEach(el => el.addEventListener('click', () => openTimer(90)));
  }
  async function action(name) {
    if (name === 'meditate') return openTimer(600);
    const routes = { home: 'home', calendar: 'plan', train: 'train', session: 'session', recovery: 'recovery', archive: 'archive', 'old-progress': 'old-progress', 'old-goals': 'goals' };
    if (routes[name]) return routeTo(routes[name]);
    if (name === 'today') { selectedDate = M.dateKey(); return render(); }
    if (name === 'prev-day' || name === 'next-day') { const candidate = M.addDays(selectedDate, name === 'prev-day' ? -1 : 1); if (candidate > latestPlannedDate()) return showToast('Later dates appear after weekly review.'); selectedDate = candidate; return render(); }
    if (name === 'prev-period' || name === 'next-period') {
      const dir = name === 'prev-period' ? -1 : 1;
      const candidate = M.addDays(M.weekStart(selectedDate), dir * 7);
      const latestPlanned = latestPlannedWeek();
      if (dir > 0 && candidate > latestPlanned) return showToast('The next week will appear after your weekly review.');
      selectedDate = candidate;
      return render();
    }
    if (name === 'rest') return openTimer(90);
    if (name === 'start-morning') { const day = current(); const next = routineFor().find(([id]) => id === 'workout' ? !day.workout?.complete : !day.routine?.[id]); return next ? eventView(next[0]) : showToast('Morning complete ✓'); }
    if (name === 'remove-sauna' && confirm('Remove the sauna record for this date?')) { delete current().sauna; commit(); return render(); }
    if (name === 'export') return exportBackup();
    if (name === 'import') return importInput.click();
    if (name === 'export-calendar') { const start = M.weekStart(selectedDate); download(M.calendarExport(health(), start, 7), `move-strong-week-${start}.ics`, 'text/calendar'); return showToast('Committed week exported. Check alert settings after import.'); }
    if (name === 'notifications') {
      const s = health().settings;
      if (s.reminders) s.reminders = false;
      else { s.reminders = true; if ('Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch {} } }
      commit(); render();
    }
    if (name === 'test-reminder') reminderCard({ id: 'preview', title: 'Movement break', minutes: 5 }, true);
    if (name === 'cloud-sync') { const ok = await CloudSync.syncNow(); showToast(ok ? 'Cloud sync complete' : (CloudSync.status().error || 'Cloud sync unavailable')); render(); }
    if (name === 'cloud-disconnect' && confirm('Disconnect cloud sync on this device? Your local records and Firestore copy will remain.')) { CloudSync.disconnect(); showToast('Cloud sync disconnected'); render(); }
  }
  function reminderCard(event, preview = false) {
    if (activeReminder) return;
    activeReminder = event.id;
    const notice = document.createElement('aside'); notice.className = 'os-reminder'; notice.setAttribute('role', 'region'); notice.setAttribute('aria-label', 'Movement reminder');
    notice.innerHTML = `<p class="eyebrow">${preview ? 'Preview' : event.id === 'shoulder-check' ? 'Recovery check' : 'A little reset'}</p><h3>${h(event.title)}</h3><p>${event.id === 'sauna' ? 'Optional sauna time. Check how you feel first.' : event.id === 'shoulder-check' ? 'Record your next-morning shoulder response before the progression engine changes shoulder loading.' : `${event.minutes} minutes away from your desk? Take a comfortable walk.`}</p><div class="os-toolbar"><button data-choice="start" class="primary-btn">${event.id === 'shoulder-check' ? 'Check in now' : `Start ${event.minutes} min`}</button><button data-choice="snooze" class="secondary-btn">In 30 min</button><button data-choice="skip" class="text-btn">Skip</button></div>`;
    document.body.append(notice);
    const key = `${M.dateKey()}/${event.id}`;
    notice.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
      const choice = button.dataset.choice;
      if (!preview) {
        health().reminderState[key] = choice === 'snooze' ? { snoozeUntil: new Date(Date.now() + 30 * 60000).toISOString() } : { done: true };
        if (choice === 'skip') { const day = M.dayRecord(health(), M.dateKey()); day.activities ||= {}; day.activities[event.id] = { status: 'skipped' }; }
        commit();
      }
      notice.remove(); activeReminder = null;
      if (choice === 'start') {
        if (event.id === 'sauna') { selectedDate = M.dateKey(); return routeTo('recovery'); }
        if (event.id === 'shoulder-check') { selectedDate = M.dateKey(); return routeTo('recovery'); }
        notice.innerHTML = `<h3>${h(event.title)} in progress</h3><p>Come back when you’re done.</p><button class="primary-btn">Finish walk ✓</button>`;
        document.body.append(notice); activeReminder = event.id;
        notice.querySelector('button').onclick = () => {
          if (!preview) { const day = M.dayRecord(health(), M.dateKey()); day.activities ||= {}; day.activities[event.id] = { status: 'done', updatedAt: new Date().toISOString() }; day.lastMovementAt = new Date().toISOString(); commit(); }
          notice.remove(); activeReminder = null; render();
        };
      }
    }));
  }
  async function checkReminders() {
    if (PushReminders.connected()) return;
    if (activeReminder || storageReadError) return;
    const event = M.dueReminders(health())[0]; if (!event) return;
    health().reminderState[`${M.dateKey()}/${event.id}`] = { done: true }; commit();
    reminderCard(event);
    if ('Notification' in window && Notification.permission === 'granted' && 'serviceWorker' in navigator) {
      try { const registration = await navigator.serviceWorker.getRegistration(); await registration?.showNotification(event.title, { body: 'Open Move Strong to start, snooze or skip.', tag: `move-strong-${event.id}`, icon: './assets/icons/move-strong-192.png' }); } catch {}
    }
  }
  function renderRoute() {
    if (route.startsWith('event:')) { eventView(route.slice(6), true); return true; }
    const views = { home: todayView, plan: calendarView, train: trainView, session: sessionView, recovery: recoveryView, progress: progressView, settings: settingsView };
    if (!views[route]) return false;
    pageTitle.textContent = 'Move Strong';
    if (storageReadError) { main.innerHTML = `<section class="card"><h2>Your saved data needs attention</h2><p>The app could not read its saved records. Nothing has been overwritten. Export the original data before repairing or restoring it.</p><button id="raw-export" class="primary-btn">Download original stored data</button></section>`; document.getElementById('raw-export').onclick = () => download(localStorage.getItem(STORAGE_KEY) || '', 'move-strong-recovery.json', 'application/json'); return true; }
    try { health(); main.innerHTML = views[route](); bind(); }
    catch (error) { main.innerHTML = `<section class="card"><h2>Unable to open this view</h2><p>Your stored records have not been replaced. Export your data before attempting a repair.</p>${btn('export', 'Export data')}</section>`; bind(); console.error(error); }
    return true;
  }
  setInterval(checkReminders, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkReminders(); });
  return { renderRoute, checkReminders,
    navigationState: () => ({ selectedDate }),
    restoreNavigation: data => { selectedDate = data.selectedDate; }
  };
})();
CloudSync.init(window.MoveStrongCloudBridge);
render();
