/* The Health OS UI presents the current adaptive programme and its live records. */
const HealthUI = (() => {
  'use strict';
  const M = HealthModel;
  let selectedDate = M.dateKey();
  let activeReminder = null;
  const openDisclosures = new Set();
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
    try { if (!health().settings.aiWeeklyReview) M.ensureGeneratedWeeks(health(), selectedDate, state.goals); saveState(); return true; }
    catch { showToast('Could not save. Export a backup; browser storage may be full.'); return false; }
  }
  function header(eyebrow, title, text = '') {
    return `<div class="os-heading"><div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2>${text ? `<p>${text}</p>` : ''}</div><span class="os-wordmark">MOVE<br><b>STRONG</b></span></div>`;
  }
  const latestPlannedWeek = () => [M.weekStart(M.dateKey()), ...Object.keys(health().generatedWeeks), ...Object.entries(health().days).filter(([, day]) => day.plan?.title).map(([key]) => M.weekStart(key))].sort().at(-1);
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
  function adaptationState() {
    const sourceDate = M.dateKey(); const targetDate = M.addDays(sourceDate, 1); const connection = PushReminders.status();
    const review = health().dailyReviews?.[sourceDate]; const draft = health().reviewDrafts?.[targetDate]; const plan = M.planFor(health(), targetDate);
    const active = review?.cadence === 'daily' && review.targetDate === targetDate && review.status === 'active';
    if (!connection.reviewing) return { sourceDate, targetDate, plan, review, tone: 'off', badge: 'OFF', title: 'Automatic adaptation is off', text: 'Tomorrow follows the stable base programme until you turn daily adaptation on.' };
    if (!connection.connected) return { sourceDate, targetDate, plan, review, tone: 'setup', badge: 'SETUP', title: 'Connect once to start', text: 'Daily adaptation is enabled, but this device still needs its private service connection.' };
    if (active) return { sourceDate, targetDate, plan, review, tone: 'ready', badge: 'READY', title: 'Tomorrow is adapted', text: review.summary || 'Tomorrow reflects your latest performance, recovery, notes and long-term goals.' };
    if (draft?.status === 'draft') return { sourceDate, targetDate, plan, review, tone: 'working', badge: 'SYNCING', title: 'Tomorrow’s review is being applied', text: 'The app is validating the latest data-and-notes fingerprint before changing the plan.' };
    return { sourceDate, targetDate, plan, review, tone: 'scheduled', badge: 'TONIGHT', title: 'Tomorrow follows the base plan for now', text: 'The private review runs at 20:00 and will adjust only tomorrow if the evidence supports it.' };
  }
  function tomorrowBanner() {
    if (!health().settings.aiWeeklyReview || selectedDate !== M.dateKey()) return '';
    const adaptation = adaptationState();
    return `<button class="os-tomorrow-banner ${adaptation.tone}" data-os="progress"><span><small>${adaptation.badge} · ${h(labelDate(adaptation.targetDate))}</small><strong>${h(adaptation.plan.title)}</strong><em>${h(adaptation.title)}</em></span><b>Review →</b></button>`;
  }
  function doneEvent(event, day) {
    return event.id === 'workout' ? day.workout?.complete : event.id === 'sauna' ? day.sauna?.complete : event.id === 'shoulder-check' ? !M.dueRecoveryCheck(health(), selectedDate) : event.kind === 'routine' ? day.routine?.[event.id] : day.activities?.[event.id]?.status === 'done';
  }
  function todayView() {
    const day = current(); const plan = M.planFor(health(), selectedDate); const r = day.recovery || {}; const recoveryDue = M.dueRecoveryCheck(health(), selectedDate);
    const completed = routineFor().filter(([id]) => id === 'workout' ? day.workout?.complete : day.routine?.[id]).length;
    return header(labelDate(selectedDate), 'Make space for<br>feeling stronger.', 'A little structure. A day that works for you.') + weekStrip() + tomorrowBanner() +
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
    return header(generated ? 'Adaptive week' : 'Weekly structure', range, 'Each evening, your complete history, recent sessions and notes can adapt only the following unstarted day.') + `<div class="os-toolbar os-week-actions">${btn('prev-period', '← Previous week')}${btn('today', 'Current week')}${btn('next-period', 'Next planned week →', 'secondary-btn', nextUnavailable)}${btn('export-calendar', 'Export planned dates')}</div>
      <div class="os-week-plan">${keys.map((key, index) => {
        const day = health().days[key] || {}; const plan = M.planFor(health(), key); const complete = day.workout?.complete; const due = M.dueRecoveryCheck(health(), key);
        return `<button class="os-week-row ${key === M.dateKey() ? 'is-today' : ''} ${complete ? 'is-complete' : ''}" data-date="${key}" data-open-day><span class="os-week-date"><small>${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][index]}</small><strong>${M.date(key).getDate()}</strong></span><span class="os-week-session"><small>${h(health().settings.workout)} · ${plan.minutes} min · ${h(plan.kind)}</small><strong>${h(plan.title)}</strong><span>${due ? 'Shoulder recovery check due' : complete ? 'Session complete' : day.workout?.updatedAt ? 'Session in progress' : generated ? 'Adaptive prescription ready' : 'Planned'}</span></span><span class="os-week-status ${due ? 'due' : complete ? 'complete' : ''}">${due ? 'CHECK IN' : complete ? 'DONE' : 'OPEN'} →</span></button>`;
      }).join('')}</div>${nextUnavailable ? '<p class="help-text os-plan-limit">Later dates appear one day at a time after the evening review.</p>' : ''}`;
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
      <section class="section"><div class="section-heading"><div><p class="eyebrow">Committed plan</p><h3>This week only</h3></div>${btn('calendar', 'Open week →', 'text-btn')}</div><div class="os-training-week">${weekPlans.map(([key, p, record]) => `<button data-date="${key}" data-open-training class="${key === selectedDate ? 'selected' : ''}"><small>${M.date(key).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}</small><strong>${h(p.short)}</strong><span>${record.workout?.complete ? 'Done ✓' : `${p.minutes} min`}</span></button>`).join('')}</div></section>`;
  }
  function sessionView() {
    const day = current(); const plan = M.planFor(health(), selectedDate);
    if (plan.pending) return header('Your programme', 'Starts Monday 21 September', 'Your weekly training begins then. Your morning routine and recovery check-ins are available now.') + btn('home', '← Today');
    const log = day.workout ||= { exercises: {}, complete: false };
    log.exercises ||= {};
    const exercises = exercisesFor(plan);
    return header(labelDate(selectedDate), plan.title, 'Leave room in reserve. Record what you actually did.') + `<div class="os-toolbar">${btn('train', '← Training')}${btn('rest', '90-second rest timer')}</div><div class="card os-recovery-note">${M.recoveryMessage(day.recovery, health().settings.upperBodyCleared)}<p class="help-text">Your physio has cleared all exercise categories. Progression is limited by current strength, control, RIR, symptoms and next-day response—not by a blanket restriction. Advanced skills are earned progressively.</p></div>
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
  function progressView() {
    const start = M.weekStart(selectedDate); const end = M.addDays(start, 7);
    const days = Object.entries(health().days).filter(([key]) => key >= start && key < end);
    const sessions = days.filter(([, d]) => d.workout?.complete);
    const sleep = days.map(([, d]) => d.recovery?.sleep).filter(v => v !== undefined && v !== '').map(Number);
    const cardio = sessions.reduce((sum, [, d]) => sum + Number(d.workout.cardioMinutes || 0), 0);
    const saunas = days.filter(([, d]) => d.sauna?.complete);
    const adaptation = adaptationState(); const review = adaptation.review;
    const reviewItems = value => `<div class="os-review-list">${value.items.map(item => `<article class="card os-review-item"><div><span class="os-state ${item.state.toLowerCase()}">${h(item.state)}</span><h3>${h(item.name)}</h3></div><p><strong>Next:</strong> ${h(item.to)}</p><p class="help-text"><strong>Why:</strong> ${h(item.reason)}</p></article>`).join('')}</div>`;
    const changes = review ? `<section class="section"><div class="section-heading"><div><p class="eyebrow">What changed</p><h3>Tomorrow’s decisions</h3><p>${h(review.summary || 'The reviewed prescription is ready.')}</p></div></div>${reviewItems(review)}<p class="help-text os-guardrail">Safety gates always win: missing data produces HOLD; pain, worse recovery, plate-site symptoms, poor technique or significant asthma symptoms produce REGRESS / MODIFY.</p></section>` : '';
    const reviewedAt = review?.reviewedAt ? new Date(review.reviewedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
    const scheduleMeta = reviewedAt ? `Reviewed ${h(reviewedAt)}` : adaptation.tone === 'off' ? 'Turn on to schedule the 20:00 review' : adaptation.tone === 'setup' ? 'Connect once to schedule the 20:00 review' : 'Review scheduled daily at 20:00';
    const durationConcern = adaptation.plan.kind === 'cardio' && Number(adaptation.plan.minutes) > 90;
    const durationAlert = durationConcern ? `<div class="os-duration-alert"><strong>Check this duration before training.</strong><span>${adaptation.plan.minutes} minutes is unusually long for an automatically adapted cardio session. Turn on daily adaptation so the next review can reassess it from your individual session records and symptoms.</span></div>` : '';
    const automationCard = `<section class="os-adaptation-card ${adaptation.tone}${durationConcern ? ' has-concern' : ''}"><div class="os-adaptation-heading"><div><p class="eyebrow">${h(labelDate(adaptation.targetDate))}</p><h3>${h(adaptation.plan.title)}</h3></div><span class="os-status-pill ${adaptation.tone === 'ready' ? 'is-ready' : ''}">${adaptation.badge}</span></div><h4>${h(adaptation.title)}</h4><p>${h(adaptation.text)}</p>${durationAlert}<div class="os-adaptation-meta"><span>${adaptation.plan.minutes} min · ${h(adaptation.plan.kind)}</span><span>${scheduleMeta}</span><span>Started workouts are locked</span></div><div class="os-toolbar">${btn('open-tomorrow', 'Open tomorrow →', 'primary-btn')}${adaptation.tone === 'off' || adaptation.tone === 'setup' ? btn('settings', 'Set up daily adaptation') : ''}</div></section>`;
    const contextCard = `<section class="card os-context-card"><div class="section-heading"><div><p class="eyebrow">What informs tomorrow</p><h3>A complete picture, with recent days weighted most</h3></div></div><div class="os-context-grid"><span>All prior training trends</span><span>Latest 14 days in detail</span><span>Workout + recovery notes</span><span>Goals + equipment</span><span>Shoulder safety fields</span><span>Asthma response</span></div><p class="help-text">Your notes add context. Numeric pain, recovery, RIR, technique and breathing fields remain authoritative.</p></section>`;
    const weekSnapshot = `<details class="card os-disclosure section" data-disclosure="current-week"><summary><span><small>This week</small><strong>Progress snapshot</strong></span><b>Show</b></summary><div class="os-disclosure-body">${dateControls()}<div class="os-metrics">${[[sessions.length, 'Sessions completed'], [cardio, 'Cardio minutes'], [saunas.length, 'Sauna sessions'], [sleep.length ? (sleep.reduce((a, b) => a + b, 0) / sleep.length).toFixed(1) + 'h' : '—', 'Average recorded sleep']].map(([v, t]) => `<div class="metric"><strong>${v}</strong><span>${t}</span></div>`).join('')}</div></div></details>`;
    const pathways = M.skillPathways(health(), M.dateKey());
    const pathwayCards = pathways.map(pathway => `<article class="card os-milestone"><div class="os-pathway-heading"><div><p class="eyebrow">${h(pathway.title)}</p><h3>${h(pathway.current)}</h3></div><span class="os-state ${pathway.status === 'HOLD' ? 'hold' : 'progress'}">${pathway.status === 'HOLD' ? 'AUTO · HOLD' : 'AUTO'}</span></div><div class="os-stage-track" aria-label="${h(pathway.title)} pathway, stage ${pathway.level + 1} of ${pathway.stages.length}">${pathway.stages.map((stage, index) => `<span class="${index <= pathway.level ? 'reached' : ''}" title="${h(stage)}"></span>`).join('')}</div><p class="os-pathway-route">${pathway.stages.map((stage, index) => `<span class="${index === pathway.level ? 'current' : ''}">${h(stage)}</span>`).join('<b>→</b>')}</p>${pathway.next ? `<div class="os-pathway-next"><small>NEXT LEVEL</small><strong>${h(pathway.next)}</strong></div>` : '<div class="os-pathway-next"><small>CURRENT FOCUS</small><strong>Consolidate this skill</strong></div>'}<p><strong>Target:</strong> ${h(pathway.target)}</p><p class="help-text"><strong>Recorded evidence:</strong> ${h(pathway.evidence)}. Targets require two separate clean sessions.</p></article>`).join('');
    return header('Daily review', 'Tomorrow, with context.', 'See what is ready, what changed, and what informed it.') + automationCard + contextCard + changes + weekSnapshot + `<details class="card os-disclosure section" data-disclosure="skill-pathways"><summary><span><small>Updates from your records</small><strong>Skill pathways</strong></span><b>Show</b></summary><div class="os-disclosure-body"><p class="help-text">These stages update automatically from completed sets, level or assistance, technique, RIR, symptoms and recovery. Reaching a target twice moves you forward and places the next supported exercise into an upcoming unstarted plan. Shoulder-loading progress also requires stable next-morning recovery; missing or concerning data holds the stage.</p><div class="os-plan-grid">${pathwayCards}</div></div></details><details class="card os-disclosure section" data-disclosure="workout-history"><summary><span><small>Your records</small><strong>Workout history</strong></span><b>Show</b></summary><div class="os-disclosure-body">${Object.entries(health().days).filter(([, d]) => d.workout?.updatedAt).sort(([a], [b]) => b.localeCompare(a)).slice(0, 30).map(([key, d]) => `<button class="os-history-row" data-date="${key}" data-open-session><strong>${labelDate(key)}</strong><span>${h(M.planFor(health(), key).title)} · ${d.workout.complete ? 'Complete ✓' : 'In progress'}</span></button>`).join('') || '<p class="help-text">Complete your first session to start your history.</p>'}</div></details>`;
  }
  function settingsView() {
    const s = health().settings; const equipment = M.normalizeEquipment(s.equipment); const cloud = CloudSync.status();
    return header('You', 'A rhythm that fits.', 'Set your schedule. Keep your records yours.') + `<form id="settings-form" class="card"><h3>Your daily schedule</h3><p class="help-text">Programme starts Monday 21 September 2026. Meditation takes the 10 minutes immediately before your work start time.</p><div class="form-grid">${[['wake', 'Wake'], ['workout', 'Workout'], ['work', 'Start work'], ['windDown', 'Wind-down'], ['bedtime', 'Bedtime'], ['saunaTime', 'Sauna']].map(([key, title]) => field(key, title, s[key], 'time', 'required')).join('')}</div><p class="help-text">Times follow your device’s local timezone. Morning steps are scheduled around your workout. Adjust times when travelling.</p><div class="field"><label for="os-movementTimes">Weekday movement reminders (comma-separated)</label><input id="os-movementTimes" name="movementTimes" value="${h(s.movementTimes.join(', '))}" placeholder="11:00, 13:00, 15:30" required></div><p class="eyebrow section">Available home equipment</p><p class="help-text">The programme generator and daily review use only the implements and exact loads listed here. List each dumbbell separately (for example, 5, 5). List band labels from lightest to strongest.</p><div class="os-equipment-checks">${check('pullUpBar', 'Pull-up bar', equipment.pullUpBar)}${check('rowingMachine', 'Rowing machine', equipment.rowingMachine)}</div><div class="form-grid">${field('dumbbellsKg', 'Dumbbells (kg, comma-separated)', equipment.dumbbellsKg.join(', '), 'text', 'placeholder="5, 5"')}${field('kettlebellsKg', 'Kettlebells (kg, comma-separated)', equipment.kettlebellsKg.join(', '), 'text', 'placeholder="10"')}${field('bands', 'Resistance-band labels', equipment.bands.join(', '), 'text', 'placeholder="yellow, red, black"')}</div><p class="help-text">If a heavier weight is unavailable, progression uses reps, tempo, pauses, 1.5 reps, assistance or leverage. Equipment edits refresh unstarted prescriptions; workouts already begun stay unchanged.</p><p class="eyebrow section">Optional sauna days</p><div class="os-day-checks">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => check(`sauna-${i}`, d, s.saunaDays.includes(i))).join('')}</div>${check('recoveryReminders', 'Require and remind me about next-morning shoulder recovery', s.recoveryReminders)}${check('upperBodyCleared', 'My clinician has cleared me for all exercise categories', true)}${field('clearanceNotes', 'Clearance / loading notes', s.clearanceNotes, 'text', 'maxlength="500"')}<p class="help-text">All exercise categories can be trained. The app still builds load, volume and skill difficulty gradually from your logged capacity.</p><button class="primary-btn">Save preferences</button></form>
      ${PushReminders.panel()}<section class="card section"><p class="eyebrow">Gentle nudges</p><h3>Movement + sauna reminders</h3><p>Open-app reminders: <strong>${s.reminders ? 'On' : 'Off'}</strong>. Notification permission: <strong>${'Notification' in window ? Notification.permission : 'Unavailable'}</strong>.</p><p class="help-text">Without a push connection, these reminders need the app to stay open. When push is connected, the server sends reminders instead to avoid duplicate alerts. While it is running, reminders offer Start, Snooze or Skip and pause after logged movement. Export only the selected committed week to a calendar; later weeks remain hidden until reviewed.</p><div class="os-toolbar">${btn('notifications', s.reminders ? 'Turn off app reminders' : 'Enable app reminders', 'primary-btn')}${btn('test-reminder', 'Preview reminder')}${btn('export-calendar', 'Export selected week (.ics)')}</div><p class="help-text">The calendar export is a one-week snapshot, not a live sync. Replace it whenever a daily review changes an exported session to avoid stale entries or duplicates.</p></section>
      <section class="card section"><p class="eyebrow">Local-first cloud backup</p><h3>${cloud.configured ? 'Firestore sync connected' : 'Connect Firebase / Firestore'}</h3><p class="help-text">Every change saves locally first. When connected and online, the complete encrypted-in-transit app state syncs to your own Firebase project using Firebase Authentication. Your Firebase password is never stored by this app.</p>${cloud.configured ? `<p><strong>${h(cloud.email)}</strong><br><span class="help-text">Project: ${h(cloud.projectId)} · ${cloud.lastSyncedAt ? `Last synced ${h(new Date(cloud.lastSyncedAt).toLocaleString('en-GB'))}` : 'Waiting for first sync'}${cloud.error ? ` · ${h(cloud.error)}` : ''}</span></p><div class="os-toolbar">${btn('cloud-sync', cloud.syncing ? 'Syncing…' : 'Sync now', 'primary-btn')}${btn('cloud-disconnect', 'Disconnect this device')}</div>` : `<form id="cloud-form"><div class="form-grid">${field('firebaseProjectId', 'Firebase project ID', cloud.projectId, 'text', 'required autocomplete="off"')}${field('firebaseApiKey', 'Firebase web API key', '', 'password', 'required autocomplete="off"')}${field('firebaseEmail', 'Sync account email', cloud.email, 'email', 'required autocomplete="email"')}${field('firebasePassword', 'Password', '', 'password', 'required minlength="6" autocomplete="current-password"')}</div><div class="os-toolbar"><button class="primary-btn" name="cloudIntent" value="signin">Sign in + sync</button><button class="secondary-btn" name="cloudIntent" value="create">Create sync account</button></div></form>`}<p class="help-text">Enable Email/Password Authentication and create Firestore with rules allowing each signed-in user to read/write only <code>users/{userId}</code>. Setup details are in the README. Exported backups exclude sign-in tokens and Firebase configuration.</p></section>
      <section class="card section"><p class="eyebrow">On-device copy</p><h3>History + backups</h3><p class="help-text">Your current training, recovery and adaptation records stay together. Export before clearing browser data even when cloud sync is enabled.</p><div class="os-toolbar">${btn('export', 'Export all data', 'primary-btn')}${btn('import', 'Merge backup')}</div><p class="help-text">Import merges missing records. When the same record exists in both places, the current device’s record is kept. A pre-import snapshot is saved locally.</p></section>
      <section class="card section"><h3>Training principles</h3><p class="help-text">Recovery decisions depend on symptoms and clinical clearance, not time since surgery alone. Exercise should follow your asthma action plan. Heat and sweat may aggravate eczema.</p><div class="os-source-links"><a href="https://www.massgeneral.org/assets/mgh/pdf/orthopaedics/sports-medicine/physical-therapy/rehabilitation-protocol-for-clavicle-orif.pdf" target="_blank" rel="noopener">Clavicle ORIF rehabilitation ↗</a><a href="https://www.nhs.uk/conditions/asthma/" target="_blank" rel="noopener">NHS asthma guidance ↗</a><a href="https://www.aad.org/public/diseases/eczema/types/atopic-dermatitis/atopic-dermatitis-coping" target="_blank" rel="noopener">Eczema skin care ↗</a></div><p class="help-text">Move Strong 3.9 · Automatic skill pathways</p></section>`;
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
    main.querySelectorAll('details[data-disclosure]').forEach(details => {
      details.open = openDisclosures.has(details.dataset.disclosure);
      details.addEventListener('toggle', () => details.open ? openDisclosures.add(details.dataset.disclosure) : openDisclosures.delete(details.dataset.disclosure));
    });
    main.querySelectorAll('[data-os]').forEach(el => el.addEventListener('click', () => action(el.dataset.os)));
    main.querySelectorAll('[data-date]').forEach(el => el.addEventListener('click', () => { selectedDate = el.dataset.date; routeTo(el.hasAttribute('data-open-session') ? 'session' : el.hasAttribute('data-open-recovery') ? 'recovery' : el.hasAttribute('data-open-training') ? 'train' : 'home'); }));
    main.querySelector('#os-date')?.addEventListener('change', e => { if (e.target.value) { if (e.target.value > latestPlannedDate()) { e.target.value = selectedDate; return showToast('Later dates appear after daily review.'); } selectedDate = e.target.value; render(); } });
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
      const readLoads = value => String(value || '').split(',').map(v => v.trim()).filter(Boolean).map(Number);
      const dumbbellsKg = readLoads(data.dumbbellsKg); const kettlebellsKg = readLoads(data.kettlebellsKg);
      if ([...dumbbellsKg, ...kettlebellsKg].some(v => !Number.isFinite(v) || v <= 0 || v > 200)) return showToast('Enter equipment loads as positive kg values separated by commas.');
      const bands = [...new Set(String(data.bands || '').split(',').map(v => v.trim()).filter(Boolean))];
      if (bands.length > 10) return showToast('List no more than 10 band levels.');
      const s = health().settings;
      for (const key of ['wake', 'workout', 'work', 'windDown', 'bedtime', 'saunaTime', 'clearanceNotes']) s[key] = data[key];
      s.movementTimes = times; s.recoveryReminders = e.target.recoveryReminders.checked; s.upperBodyCleared = true; s.saunaDays = Array.from({ length: 7 }, (_, i) => i).filter(i => e.target.elements[`sauna-${i}`].checked);
      s.equipment = M.normalizeEquipment({ pullUpBar: e.target.pullUpBar.checked, rowingMachine: e.target.rowingMachine.checked, dumbbellsKg, kettlebellsKg, bands });
      if (commit()) showToast('Preferences and equipment saved'); render();
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
    if (name === 'settings') { routeTo('settings'); requestAnimationFrame(() => main.querySelector('.os-automation-card')?.scrollIntoView({ block: 'start', behavior: 'smooth' })); return; }
    const routes = { home: 'home', calendar: 'plan', train: 'train', session: 'session', recovery: 'recovery', progress: 'progress' };
    if (routes[name]) return routeTo(routes[name]);
    if (name === 'open-tomorrow') { selectedDate = M.addDays(M.dateKey(), 1); return routeTo('train'); }
    if (name === 'today') { selectedDate = M.dateKey(); return render(); }
    if (name === 'prev-day' || name === 'next-day') { const candidate = M.addDays(selectedDate, name === 'prev-day' ? -1 : 1); if (candidate > latestPlannedDate()) return showToast('Later dates appear after daily review.'); selectedDate = candidate; return render(); }
    if (name === 'prev-period' || name === 'next-period') {
      const dir = name === 'prev-period' ? -1 : 1;
      const candidate = M.addDays(M.weekStart(selectedDate), dir * 7);
      const latestPlanned = latestPlannedWeek();
      if (dir > 0 && candidate > latestPlanned) return showToast('Later dates appear after daily review.');
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
    try {
      const currentHealth = health();
      if (!currentHealth.settings.aiWeeklyReview) {
        const before = JSON.stringify([currentHealth.generatedWeeks, currentHealth.weeklyReviews]);
        M.ensureGeneratedWeeks(currentHealth, selectedDate, state.goals);
        if (before !== JSON.stringify([currentHealth.generatedWeeks, currentHealth.weeklyReviews])) saveState();
      }
      main.innerHTML = views[route](); bind();
    }
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
