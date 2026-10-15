const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../health-model.js');

test('local calendar crosses month, leap day and year boundaries', () => {
  assert.equal(M.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(M.addDays('2024-02-28', 1), '2024-02-29');
  assert.equal(M.weekStart('2026-09-20'), '2026-09-14');
  assert.equal(M.addDays('2026-03-28', 1), '2026-03-29');
});
test('new records do not change a legacy log or collide after six weeks', () => {
  const state = { logs: { 'w1-d1-home': { complete: true, exercises: { row: { sets: ['8'] } } } } };
  const before = JSON.stringify(state.logs); state.healthOS = M.defaults();
  M.dayRecord(state.healthOS, '2026-09-14').workout.complete = true;
  M.dayRecord(state.healthOS, '2026-11-02').workout.complete = false;
  assert.equal(JSON.stringify(state.logs), before);
  assert.equal(Object.keys(state.healthOS.days).length, 2);
});
test('normalization rejects incompatible or corrupted records', () => {
  assert.throws(() => M.normalize({ schemaVersion: 3 }));
  const data = M.defaults(); data.settings.workout = '25:00';
  assert.throws(() => M.normalize(data));
  const bad = M.defaults(); bad.days['2026-02-31'] = {};
  assert.throws(() => M.normalize(bad));
  assert.equal(M.normalize(M.defaults()).schemaVersion, 4);
});

test('older schemas migrate to v4 without changing dated records and gain the known home-kit profile', () => {
  const old = M.defaults(); old.schemaVersion = 2; delete old.generatedWeeks; delete old.weeklyReviews;
  M.dayRecord(old, '2026-09-21').workout = { complete: true, exercises: { row: { done: true, sets: ['8'], load: '5 kg' } }, updatedAt: '2026-09-21T08:00:00Z' };
  const before = JSON.stringify(old.days);
  const migrated = M.normalize(old);
  assert.equal(migrated.schemaVersion, 4);
  assert.equal(JSON.stringify(migrated.days), before);
  assert.deepEqual(migrated.generatedWeeks, {});
  assert.deepEqual(migrated.settings.equipment.dumbbellsKg, [5, 5]);
  assert.deepEqual(migrated.settings.equipment.kettlebellsKg, [10]);
  assert.equal(migrated.settings.equipment.pullUpBar, true);
});

test('21–25 September baseline generates the agreed first adaptive week', () => {
  const old = M.defaults(); old.schemaVersion = 2; delete old.generatedWeeks; delete old.weeklyReviews;
  const sessions = {
    '2026-09-21': { 'd3e-pullup-single': { done: true, sets: ['1', '1', '1'] }, 'd3e-row': { done: true, sets: ['8', '8', '8'], load: '5kg' } },
    '2026-09-22': { 'd2e-bss': { done: true, sets: ['8', '8', '8'] }, 'd2e-slrdl': { done: true, sets: ['8', '8', '8'] }, 'd2e-calf': { done: true, sets: ['12', '12', '12'] } },
    '2026-09-23': { 'd1e-pushup': { done: true, sets: ['8', '8', '8'] } },
    '2026-09-24': {},
    '2026-09-25': { 'd3e-pullup-single': { done: false, sets: ['3', '2', '2'] }, 'd3e-row': { done: true, sets: ['10', '10', '10'], load: '5kg' }, 'd1e-pushup': { done: true, sets: ['12', '10', '10'] } }
  };
  for (const [key, exercises] of Object.entries(sessions)) M.dayRecord(old, key).workout = { complete: true, exercises, cardioMinutes: key === '2026-09-24' ? '30' : '', updatedAt: `${key}T08:00:00Z` };
  const migrated = M.normalize(old); const review = migrated.weeklyReviews['2026-09-21'];
  assert.equal(review.items.find(x => x.id === 'd3e-pullup-single').state, 'HOLD');
  assert.match(review.items.find(x => x.id === 'd1e-pushup').to, /floor push-ups/i);
  assert.equal(M.planFor(migrated, '2026-09-28').exerciseOverrides['d3e-row'].prescription, '3 × 12 rows with the 5 kg dumbbell');
  assert.equal(M.planFor(migrated, '2026-10-01').minutes, 32);
});

function addQualifiedWeek(data, id, entry, extra = {}) {
  for (let i = 0; i < 5; i++) {
    const key = M.addDays('2026-10-05', i);
    M.dayRecord(data, key).workout = { complete: true, painDuring: '1', painNext: '1', effort: '6', breathingSymptoms: 'none', exercises: i === 0 ? { [id]: { done: true, rir: '3', technique: 'clean', ...entry } } : {}, updatedAt: `${key}T08:00:00Z`, ...extra };
  }
}

test('row progression uses exact owned loads, then tempo when no heavier implement exists', () => {
  const loaded = M.defaults();
  addQualifiedWeek(loaded, 'd3e-row', { sets: ['15', '15', '15'], load: '5 kg dumbbell' });
  const loadedRow = M.generateNextWeek(loaded, '2026-10-05').items.find(item => item.id === 'd3e-row');
  assert.match(loadedRow.to, /3 × 6 supported rows with the 10 kg kettlebell/);
  assert.doesNotMatch(loadedRow.to, /next available/i);

  const limited = M.defaults(); limited.settings.equipment.kettlebellsKg = [];
  addQualifiedWeek(limited, 'd3e-row', { sets: ['12', '12', '12'], load: '5 kg dumbbell' });
  const limitedRow = M.generateNextWeek(limited, '2026-10-05').items.find(item => item.id === 'd3e-row');
  assert.match(limitedRow.to, /5 kg dumbbell, 3-sec lowering \+ 1-sec top pause/);
  assert.doesNotMatch(limitedRow.to, /heavier|next available/i);
});

test('lower-body progression selects the owned 2 × 5 kg pair or 10 kg kettlebell', () => {
  const dumbbells = M.defaults();
  addQualifiedWeek(dumbbells, 'd2e-bss', { sets: ['12', '12', '12'], load: 'bodyweight' });
  assert.match(M.generateNextWeek(dumbbells, '2026-10-05').items.find(item => item.id === 'd2e-bss').to, /2 × 5 kg dumbbells at the sides/);

  const kettlebell = M.defaults(); kettlebell.settings.equipment.dumbbellsKg = [];
  addQualifiedWeek(kettlebell, 'd2e-slrdl', { sets: ['12', '12', '12'], load: 'bodyweight' });
  assert.match(M.generateNextWeek(kettlebell, '2026-10-05').items.find(item => item.id === 'd2e-slrdl').to, /10 kg kettlebell held centrally or in the non-operated hand/);
});

test('bodyweight pulling and pushing progress by assistance, leverage or volume without invented load', () => {
  const pull = M.defaults();
  addQualifiedWeek(pull, 'd3e-pullup-single', { sets: ['2', '2', '2'], load: 'bodyweight' });
  const pullNext = M.generateNextWeek(pull, '2026-10-05').items.find(item => item.id === 'd3e-pullup-single').to;
  assert.match(pullNext, /3 sets of 3 \/ 2 \/ 2 pull-ups with bodyweight/);

  const push = M.defaults();
  addQualifiedWeek(push, 'd1e-pushup', { sets: ['10', '10', '10'], load: '76 cm counter incline' });
  const pushNext = M.generateNextWeek(push, '2026-10-05').items.find(item => item.id === 'd1e-pushup').to;
  assert.match(pushNext, /floor push-ups \+ 2 × 10 at 76 cm counter incline/);
  assert.doesNotMatch(`${pullNext} ${pushNext}`, /kg|external load|next available/i);
});

test('band progressions use the exact configured labels', () => {
  const rotation = M.defaults(); rotation.settings.equipment.bands = ['yellow', 'red'];
  addQualifiedWeek(rotation, 'd3e-er', { sets: ['15', '15'], load: 'yellow' });
  rotation.days['2026-10-05'].plan = { ...M.plans[0], exerciseOverrides: { 'd3e-er': { targetSets: 2, targetReps: 15, loadLabel: 'yellow', variation: 'tempo' } } };
  assert.match(M.generateNextWeek(rotation, '2026-10-05').items.find(item => item.id === 'd3e-er').to, /2 × 10 external rotations with red/);

  const pull = M.defaults(); pull.settings.equipment.bands = ['yellow', 'red'];
  addQualifiedWeek(pull, 'd3e-pullup-single', { sets: ['3', '3', '3'], load: 'red assistance' });
  assert.match(M.generateNextWeek(pull, '2026-10-05').items.find(item => item.id === 'd3e-pullup-single').to, /yellow assistance/);

  const lightest = M.defaults(); lightest.settings.equipment.bands = ['yellow', 'red'];
  addQualifiedWeek(lightest, 'd3e-pullup-single', { sets: ['3', '3', '3'], load: 'yellow assistance' });
  assert.match(M.generateNextWeek(lightest, '2026-10-05').items.find(item => item.id === 'd3e-pullup-single').to, /bodyweight pull-up singles/);
});

test('cardio prescription uses the configured rower and preserves asthma-safe progression', () => {
  const data = M.defaults();
  addQualifiedWeek(data, 'd2e-calf', { sets: ['15', '15', '15'], load: 'bodyweight' }, { cardioMinutes: '30' });
  const cardio = M.generateNextWeek(data, '2026-10-05').items.find(item => item.id === 'cardio');
  assert.match(cardio.to, /33 min on the rowing machine at conversational effort after a gradual warm-up/);
  data.settings.equipment.rowingMachine = false;
  const refreshed = M.generateNextWeek(data, '2026-10-05').items.find(item => item.id === 'cardio');
  assert.match(refreshed.to, /brisk walk/);
});

test('equipment edits refresh unstarted days but preserve an already-started workout', () => {
  const data = M.defaults();
  addQualifiedWeek(data, 'd3e-row', { sets: ['15', '15', '15'], load: '5 kg dumbbell' });
  M.generateNextWeek(data, '2026-10-05');
  const started = M.dayRecord(data, '2026-10-12');
  started.workout.updatedAt = '2026-10-12T08:00:00Z';
  const startedPrescription = M.planFor(data, '2026-10-12').exerciseOverrides['d3e-row'].prescription;
  assert.match(startedPrescription, /10 kg kettlebell/);

  data.settings.equipment.kettlebellsKg = [];
  M.generateNextWeek(data, '2026-10-05');
  assert.equal(M.planFor(data, '2026-10-12').exerciseOverrides['d3e-row'].prescription, startedPrescription);
  assert.doesNotMatch(M.planFor(data, '2026-10-16').exerciseOverrides['d3e-row'].prescription, /10 kg kettlebell/);
});

test('deterministic rules hold missing recovery and regress symptom flares', () => {
  const data = M.defaults();
  M.dayRecord(data, '2026-10-05').workout = { complete: true, painDuring: '1', effort: '6', exercises: { 'd3e-row': { done: true, sets: ['12', '12', '12'], rir: '3', technique: 'clean' } }, updatedAt: '2026-10-05T08:00:00Z' };
  assert.equal(M.decideExercise(data, '2026-10-05', 'd3e-row').state, 'HOLD');
  M.dayRecord(data, '2026-10-06').recovery.previousWorkout = { workoutDate: '2026-10-05', pain: '4', status: 'worse', complete: true };
  assert.equal(M.decideExercise(data, '2026-10-05', 'd3e-row').state, 'REGRESS');
  data.days['2026-10-06'].recovery.previousWorkout = { workoutDate: '2026-10-05', pain: '1', status: 'same', complete: true };
  assert.equal(M.decideExercise(data, '2026-10-05', 'd3e-row').state, 'PROGRESS');
});

test('cardio progression is symptom-aware and capped at ten percent', () => {
  const data = M.defaults();
  for (let i = 0; i < 5; i++) {
    const key = M.addDays('2026-10-05', i);
    M.dayRecord(data, key).workout = { complete: true, cardioMinutes: i === 3 ? '30' : '', breathingSymptoms: 'none', painDuring: '1', painNext: '1', effort: '6', exercises: {}, updatedAt: `${key}T08:00:00Z` };
  }
  const review = M.generateNextWeek(data, '2026-10-05'); const cardio = review.items.find(item => item.id === 'cardio');
  assert.equal(cardio.state, 'PROGRESS');
  assert.equal(cardio.minutes, 33);
  assert.equal(M.planFor(data, '2026-10-15').minutes, 33);
});

test('weekly review snapshot includes all-history trends, recent detail and excludes free-text notes', () => {
  const data = M.defaults(); data.settings.aiWeeklyReview = true;
  addQualifiedWeek(data, 'd3e-row', { sets: ['12', '12', '12'], load: '5 kg dumbbell' });
  M.dayRecord(data, '2026-09-29').workout = { complete: true, painDuring: '1', painNext: '1', effort: '6', exercises: { 'd3e-row': { done: true, sets: ['10', '10', '10'], load: '5 kg dumbbell', rir: '3', technique: 'clean' } }, notes: 'older private note' };
  data.days['2026-10-05'].recovery.notes = 'private journal text';
  const snapshot = M.weeklyReviewSnapshot(data, '2026-10-05', '2026-10-09', { pullups: '3', hollow: '20', notes: 'private goal note', checklist: { pull3: true } });
  assert.equal(snapshot.ready, true);
  assert.deepEqual(snapshot.equipment.dumbbellsKg, [5, 5]);
  assert.equal(snapshot.days.length, 7);
  assert.equal(snapshot.previousWeek.days.length, 7);
  assert.equal(snapshot.previousWeek.days[1].workout.exercises['d3e-row'].sets[0], '10');
  assert.equal(snapshot.schemaVersion, 2);
  assert.equal(snapshot.history.completedSessions, 6);
  assert.equal(snapshot.history.exerciseTrends['d3e-row'].exposures, 2);
  assert.equal(snapshot.history.exerciseTrends['d3e-row'].bestSetReps, 12);
  assert.ok(snapshot.history.weeks.length >= 2);
  assert.equal(snapshot.goals.pullups, 3);
  assert.equal(snapshot.goals.checklist.pull3, true);
  assert.match(JSON.stringify(snapshot), /d3e-row/);
  assert.doesNotMatch(JSON.stringify(snapshot), /private journal text|older private note|private goal note|notes/);
});

test('editing an older training record invalidates the complete-history review fingerprint', () => {
  const data = M.defaults();
  M.dayRecord(data, '2026-09-22').workout = { complete: true, painDuring: '1', painNext: '1', effort: '6', exercises: { 'd2e-bss': { done: true, sets: ['8', '8', '8'], load: 'bodyweight', rir: '3', technique: 'clean' } }, updatedAt: '2026-09-22T08:00:00Z' };
  addQualifiedWeek(data, 'd3e-row', { sets: ['12', '12', '12'], load: '5 kg dumbbell' });
  const before = M.weeklyReviewSnapshot(data, '2026-10-05', '2026-10-12').sourceFingerprint;
  data.days['2026-09-22'].workout.exercises['d2e-bss'].sets[0] = '9';
  const after = M.weeklyReviewSnapshot(data, '2026-10-05', '2026-10-12').sourceFingerprint;
  assert.notEqual(after, before);
});

test('daily review includes notes as observations and any note edit invalidates tomorrow', () => {
  const data = M.defaults();
  M.dayRecord(data, '2026-10-13').workout = { complete: true, painDuring: '1', painNext: '1', effort: '6', notes: 'Yellow band assistance felt smooth.', exercises: { 'd3e-pullup-single': { done: true, sets: ['3', '3', '2'], load: 'yellow band', rir: '3', technique: 'clean' } }, updatedAt: '2026-10-13T08:00:00Z' };
  M.dayRecord(data, '2026-10-14').recovery = { shoulder: '1', notes: 'No plate tenderness this morning.', previousWorkout: { workoutDate: '2026-10-13', pain: '1', status: 'same', complete: true, notes: 'Slept well.' } };
  const goals = { pullups: '5', notes: 'Work toward a controlled muscle-up.', checklist: { pull3: true } };
  const legacyLogs = { 'w1-d1-home': { complete: true, notes: 'Original programme row felt easy.', exercises: { 'd3e-row': { done: true, sets: ['8', '8', '8'], load: '5 kg' } } } };
  const snapshot = M.dailyReviewSnapshot(data, '2026-10-14', '2026-10-14', goals, legacyLogs);
  assert.equal(snapshot.cadence, 'daily');
  assert.equal(snapshot.targetDate, '2026-10-15');
  assert.match(JSON.stringify(snapshot.notes), /Yellow band assistance felt smooth|No plate tenderness|controlled muscle-up/);
  assert.match(JSON.stringify(snapshot.legacyHistory), /Original programme row felt easy/);
  const before = snapshot.sourceFingerprint;
  data.days['2026-10-13'].workout.notes = 'Yellow band assistance felt difficult.';
  assert.notEqual(M.dailyReviewSnapshot(data, '2026-10-14', '2026-10-14', goals, legacyLogs).sourceFingerprint, before);
});

test('daily reviewed plan changes only tomorrow and never rewrites a started target day', () => {
  const data = M.defaults(); const goals = { pullups: '5', checklist: {} };
  M.dayRecord(data, '2026-10-14').workout = { complete: true, painDuring: '1', painNext: '1', effort: '6', exercises: {}, updatedAt: '2026-10-14T08:00:00Z' };
  const snapshot = M.dailyReviewSnapshot(data, '2026-10-14', '2026-10-14', goals);
  const value = { cadence: 'daily', sourceDate: snapshot.sourceDate, targetDate: snapshot.targetDate, sourceFingerprint: snapshot.sourceFingerprint, summary: 'Small next-day adjustment.', items: [{ id: 'cardio', name: 'Easy cardio', state: 'HOLD', from: '30 min planned', to: 'Repeat 30 min conversational run / walk', reason: 'Preserve aerobic dose while recovery evidence accumulates.', minutes: 30 }] };
  M.storeDailyReviewedPlan(data, value, goals); M.activateDailyReviewedPlan(data, '2026-10-15', goals);
  assert.equal(M.planFor(data, '2026-10-15').minutes, 30);
  assert.equal(data.dailyReviews['2026-10-14'].targetDate, '2026-10-15');
  assert.equal(data.days['2026-10-14'].plan, undefined);
  assert.equal(M.dailyReviewSnapshot(data, '2026-10-14', '2026-10-14', goals).sourceFingerprint, snapshot.sourceFingerprint);

  const blocked = M.defaults(); const blockedSnapshot = M.dailyReviewSnapshot(blocked, '2026-10-14', '2026-10-14', goals);
  const blockedValue = { ...value, sourceFingerprint: blockedSnapshot.sourceFingerprint };
  M.storeDailyReviewedPlan(blocked, blockedValue, goals); M.dayRecord(blocked, '2026-10-15').workout.updatedAt = '2026-10-15T07:00:00Z';
  assert.equal(M.activateDailyReviewedPlan(blocked, '2026-10-15', goals), null);
  assert.equal(blocked.reviewDrafts['2026-10-15'].status, 'skipped');
});

test('recorded skill targets automatically rotate in the next exercise without a manual milestone', () => {
  const data = M.defaults();
  M.dayRecord(data, '2026-09-29').workout = { complete: true, painDuring: '1', painNext: '1', effort: '6', exercises: { 'd3e-pullup-single': { done: true, sets: ['3', '3', '2'], load: 'bodyweight', rir: '3', technique: 'clean' } }, updatedAt: '2026-09-29T08:00:00Z' };
  addQualifiedWeek(data, 'd3e-pullup-single', { sets: ['3', '3', '2'], load: 'bodyweight' });
  const review = M.generateNextWeek(data, '2026-10-05');
  const rotation = review.items.find(item => item.id === 'd5s-rowline');
  assert.ok(rotation);
  assert.match(rotation.reason, /Friday row angle/i);
  const friday = M.planFor(data, '2026-10-16');
  assert.ok(friday.ids.includes('d5s-rowline'));
  assert.ok(!friday.ids.includes('d3e-row'));
  assert.match(friday.exerciseOverrides['d5s-rowline'].prescription, /chest-to-bar line rows/i);
});

test('skill pathways derive stages from two clean target sessions and ignore manual milestones', () => {
  const data = M.defaults(); data.milestones.pull = { level: 5, best: 'manual override' };
  let pull = M.skillPathways(data, '2026-10-10').find(pathway => pathway.id === 'pull');
  assert.equal(pull.current, 'Supported row');
  for (const key of ['2026-10-05', '2026-10-09']) {
    M.dayRecord(data, key).workout = { complete: true, painDuring: '1', painNext: '1', effort: '6', exercises: { 'd3e-row': { done: true, sets: ['10', '10', '10'], load: '5 kg dumbbell', rir: '3', technique: 'clean' } }, updatedAt: `${key}T08:00:00Z` };
  }
  pull = M.skillPathways(data, '2026-10-10').find(pathway => pathway.id === 'pull');
  assert.equal(pull.current, 'Assisted pull-up');
  assert.equal(pull.evidence, '0/2 clean target sessions');
});

test('shoulder pathways require stable next-morning recovery and reset after a concern', () => {
  const data = M.defaults();
  for (const key of ['2026-10-05', '2026-10-09']) {
    M.dayRecord(data, key).workout = { complete: true, painDuring: '1', effort: '6', exercises: { 'd3e-row': { done: true, sets: ['10', '10', '10'], load: '5 kg dumbbell', rir: '3', technique: 'clean' } }, updatedAt: `${key}T08:00:00Z` };
  }
  const missing = M.skillPathways(data, '2026-10-10').find(pathway => pathway.id === 'pull');
  assert.equal(missing.current, 'Supported row');
  assert.equal(missing.status, 'HOLD');
  data.days['2026-10-05'].workout.painNext = '1'; data.days['2026-10-09'].workout.painNext = '3';
  const pull = M.skillPathways(data, '2026-10-10').find(pathway => pathway.id === 'pull');
  assert.equal(pull.current, 'Supported row');
  assert.equal(pull.status, 'HOLD');
});

test('core target automatically replaces one future dead-bug slot with hollow holds', () => {
  const data = M.defaults();
  for (let i = 0; i < 5; i++) {
    const key = M.addDays('2026-10-05', i); const hasCore = i === 0 || i === 2;
    M.dayRecord(data, key).workout = { complete: true, painDuring: '1', effort: '6', exercises: hasCore ? { 'd1m-deadbug': { done: true, sets: ['8', '8'], load: 'bodyweight', rir: '3', technique: 'clean' } } : {}, updatedAt: `${key}T08:00:00Z` };
  }
  const review = M.generateNextWeek(data, '2026-10-05');
  assert.ok(review.items.some(item => item.id === 'd3s-hollow'));
  const friday = M.planFor(data, '2026-10-16');
  assert.ok(friday.ids.includes('d3s-hollow'));
  assert.ok(!friday.ids.includes('d1m-deadbug'));
});

test('a prior-week symptom concern prevents progression until two clean current exposures exist', () => {
  const data = M.defaults();
  M.dayRecord(data, '2026-09-29').workout = { complete: true, painDuring: '4', painNext: '3', effort: '8', exercises: { 'd3e-row': { done: true, sets: ['10', '10', '10'], load: '5 kg dumbbell', rir: '2', technique: 'clean' } }, updatedAt: '2026-09-29T08:00:00Z' };
  addQualifiedWeek(data, 'd3e-row', { sets: ['12', '12', '12'], load: '5 kg dumbbell' });
  const decision = M.decideExercise(data, '2026-10-05', 'd3e-row');
  assert.equal(decision.state, 'HOLD');
  assert.match(decision.reason, /previous week/i);
});

test('Codex reviewed plan can be activated automatically and rejects stale workout data', () => {
  const data = M.defaults();
  addQualifiedWeek(data, 'd3e-row', { sets: ['12', '12', '12'], load: '5 kg dumbbell' });
  const snapshot = M.weeklyReviewSnapshot(data, '2026-10-05', '2026-10-09');
  const value = { sourceWeekStart: snapshot.sourceWeekStart, nextWeekStart: snapshot.nextWeekStart, sourceFingerprint: snapshot.sourceFingerprint, summary: 'Hold loading conservative.', items: [{ id: 'd3e-row', name: 'Row', state: 'PROGRESS', from: '3 × 12 at 5 kg', to: '3 × 12 at 5 kg with a pause', reason: 'Clean work with stable symptoms; change tempo only.', target: { targetSets: 3, targetReps: 12, implement: 'dumbbell', loadKg: 5, loadLabel: '5 kg dumbbell', variation: 'paused' } }] };
  M.storeReviewedDraft(data, value);
  assert.equal(data.reviewDrafts['2026-10-12'].status, 'draft');
  assert.equal(data.generatedWeeks['2026-10-12'], undefined);
  M.approveReviewedDraft(data, '2026-10-12');
  assert.equal(data.reviewDrafts['2026-10-12'].status, 'approved');
  assert.match(M.planFor(data, '2026-10-12').exerciseOverrides['d3e-row'].prescription, /pause/);

  const stale = M.defaults(); addQualifiedWeek(stale, 'd3e-row', { sets: ['12', '12', '12'], load: '5 kg dumbbell' });
  M.storeReviewedDraft(stale, value); stale.days['2026-10-05'].workout.exercises['d3e-row'].sets[0] = '13';
  assert.throws(() => M.approveReviewedDraft(stale, '2026-10-12'), /changed/);
});


test('adaptive generation uses the latest logged reps to create a concrete next target', () => {
  const data = M.defaults();
  const start = '2026-10-05';
  const rows = [
    ['2026-10-05', ['10', '10', '10']],
    ['2026-10-07', ['11', '11', '11']],
    ['2026-10-09', ['12', '12', '12']]
  ];
  for (const [key, sets] of rows) {
    M.dayRecord(data, key).workout = {
      complete: true, painDuring: '1', effort: '6',
      exercises: { 'd3e-row': { done: true, sets, load: '5kg', rir: '3', technique: 'clean' } },
      updatedAt: `${key}T08:00:00Z`
    };
    M.dayRecord(data, M.addDays(key, 1)).recovery.previousWorkout = {
      workoutDate: key, pain: '1', status: 'same', complete: true
    };
  }
  // Two additional completed sessions make the week eligible for generation.
  for (const key of ['2026-10-06', '2026-10-08']) {
    M.dayRecord(data, key).workout = { complete: true, painDuring: '0', effort: '6', exercises: {}, updatedAt: `${key}T08:00:00Z` };
  }
  const review = M.generateNextWeek(data, start);
  const row = review.items.find(item => item.id === 'd3e-row');
  assert.equal(row.state, 'PROGRESS');
  assert.match(row.from, /3 × 12 · 5kg/);
  assert.match(row.to, /5 kg dumbbell, 3-sec lowering \+ 1-sec top pause/);
  assert.match(M.planFor(data, '2026-10-12').exerciseOverrides['d3e-row'].prescription, /5 kg dumbbell, 3-sec lowering \+ 1-sec top pause/);
  assert.doesNotMatch(row.to, /next available load\/resistance/i);
});

test('stale v1 generated weeks refresh before the following week is started', () => {
  const data = M.defaults();
  const source = '2026-10-05';
  for (let i = 0; i < 5; i++) {
    const key = M.addDays(source, i);
    M.dayRecord(data, key).workout = {
      complete: true, painDuring: '1', painNext: '1', effort: '6',
      exercises: i === 0 ? { 'd3e-row': { done: true, sets: ['10', '10', '10'], load: '5kg', rir: '3', technique: 'clean' } } : {},
      updatedAt: `${key}T08:00:00Z`
    };
    if (i === 0) M.dayRecord(data, M.addDays(key, 1)).recovery.previousWorkout = { workoutDate: key, pain: '1', status: 'same', complete: true };
  }
  data.generatedWeeks['2026-10-12'] = {
    sourceWeekStart: source, generatedAt: '2026-10-10T00:00:00Z', rulesVersion: 1,
    days: { 0: { ...M.plans[0], exerciseOverrides: {} } }
  };
  const before = M.planFor(data, '2026-10-12');
  assert.equal(before.exerciseOverrides?.['d3e-row'], undefined);
  M.ensureGeneratedWeeks(data, '2026-10-12');
  const after = M.planFor(data, '2026-10-12');
  assert.ok(after.exerciseOverrides['d3e-row']);
  assert.equal(data.generatedWeeks['2026-10-12'].rulesVersion, 7);
});

test('started days are preserved while later days of a refreshed week can update', () => {
  const data = M.defaults();
  const source = '2026-10-05';
  for (let i = 0; i < 5; i++) {
    const key = M.addDays(source, i);
    M.dayRecord(data, key).workout = {
      complete: true, painDuring: '1', painNext: '1', effort: '6',
      exercises: i === 0 ? { 'd3e-row': { done: true, sets: ['10', '10', '10'], load: '5kg', rir: '3', technique: 'clean' } } : {},
      updatedAt: `${key}T08:00:00Z`
    };
    if (i === 0) M.dayRecord(data, M.addDays(key, 1)).recovery.previousWorkout = { workoutDate: key, pain: '1', status: 'same', complete: true };
  }
  const monday = M.dayRecord(data, '2026-10-12');
  monday.workout = { complete: false, exercises: { 'd3e-row': { sets: ['8'], load: '5kg' } }, updatedAt: '2026-10-12T07:30:00Z' };
  monday.plan = { ...M.plans[0], exerciseOverrides: { 'd3e-row': { prescription: 'started-plan' } } };

  M.ensureGeneratedWeeks(data, '2026-10-12');
  assert.equal(M.planFor(data, '2026-10-12').exerciseOverrides['d3e-row'].prescription, 'started-plan');
  assert.ok(data.generatedWeeks['2026-10-12'].days[4].exerciseOverrides['d3e-row']);
});

test('cloud merge restores remote settings on an empty device and keeps newest workouts', () => {
  const remote = M.defaults(); remote.settings.workout = '08:00';
  M.dayRecord(remote, '2026-10-05').workout = { complete: true, exercises: { row: { sets: ['10'] } }, updatedAt: '2026-10-05T08:00:00Z' };
  const restored = M.mergeCloud(remote, M.defaults());
  assert.equal(restored.settings.workout, '08:00');
  const local = M.defaults(); local.settings.workout = '07:00';
  M.dayRecord(local, '2026-10-05').workout = { complete: true, exercises: { row: { sets: ['12'] } }, updatedAt: '2026-10-05T09:00:00Z' };
  const merged = M.mergeCloud(remote, local);
  assert.equal(merged.settings.workout, '07:00');
  assert.equal(merged.days['2026-10-05'].workout.exercises.row.sets[0], '12');
});
test('cloud merge does not let an older device invent equipment over an explicit remote profile', () => {
  const remote = M.defaults(); remote.settings.equipment = { pullUpBar: true, bands: [], dumbbellsKg: [], kettlebellsKg: [10], rowingMachine: false };
  const oldLocal = M.defaults(); oldLocal.schemaVersion = 3; delete oldLocal.settings.equipment;
  M.dayRecord(oldLocal, '2026-10-05').workout = { complete: true, exercises: {}, updatedAt: '2026-10-05T09:00:00Z' };
  const merged = M.mergeCloud(remote, oldLocal);
  assert.deepEqual(merged.settings.equipment.dumbbellsKg, []);
  assert.deepEqual(merged.settings.equipment.kettlebellsKg, [10]);
  assert.equal(merged.settings.equipment.rowingMachine, false);
});
test('reminders respect weekday, completion, snooze, stale alerts and recent activity', () => {
  const data = M.defaults(); data.settings.reminders = true;
  const now = new Date('2026-09-14T11:01:00');
  assert.equal(M.dueReminders(data, now)[0].id, 'move-11:00');
  const day = M.dayRecord(data, '2026-09-14'); day.lastMovementAt = '2026-09-14T10:40:00';
  assert.equal(M.dueReminders(data, now).length, 0);
  delete day.lastMovementAt;
  data.reminderState['2026-09-14/move-11:00'] = { snoozeUntil: '2026-09-14T11:31:00' };
  assert.equal(M.dueReminders(data, now).length, 0);
  assert.equal(M.dueReminders(data, new Date('2026-09-14T11:32:00')).length, 1);
  data.reminderState['2026-09-14/move-11:00'] = { done: true };
  assert.equal(M.dueReminders(data, now).length, 0);
  assert.equal(M.dueReminders(data, new Date('2026-09-19T11:01:00')).length, 0);
  assert.equal(M.dueReminders(data, new Date('2026-09-15T11:45:00')).length, 0);
});
test('recovery never treats missing pain as clearance; flags take precedence', () => {
  assert.match(M.recoveryMessage({}, false), /clearance is not recorded/);
  assert.match(M.recoveryMessage({}, true), /Add a check-in/);
  assert.match(M.recoveryMessage({ redFlag: true, shoulder: '0' }, true), /Stop training/);
  assert.match(M.recoveryMessage({ breathing: 'symptoms' }, true), /asthma action plan/);
  assert.match(M.recoveryMessage({ shoulder: '4' }, true), /Reduce shoulder/);
});
test('calendar contains independent dated events and movement alarms', () => {
  const calendar = M.calendarExport(M.defaults(), '2026-09-14', 7);
  assert.match(calendar, /DTSTART:20260914T110000/);
  assert.match(calendar, /BEGIN:VALARM\r\nTRIGGER:PT0S/);
  assert.equal((calendar.match(/SUMMARY:Optional sauna/g) || []).length, 2);
  const ids = [...calendar.matchAll(/UID:(.+)/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test('visiting a blank date cannot hide an imported workout', () => {
  const incoming = M.defaults();
  M.dayRecord(incoming, '2026-09-14').workout = { complete: true, exercises: { row: { sets: ['8'] } }, updatedAt: '2026-09-14T08:00:00Z' };
  const local = M.defaults(); M.dayRecord(local, '2026-09-14');
  const result = M.mergeHealth(incoming, local);
  assert.equal(result.days['2026-09-14'].workout.complete, true);
  local.days['2026-09-14'].workout = { complete: true, exercises: { row: { sets: ['12'] } }, updatedAt: '2026-09-14T09:00:00Z' };
  assert.equal(M.mergeHealth(incoming, local).days['2026-09-14'].workout.exercises.row.sets[0], '12');
});

test('meditation follows work time and programme starts without altering history', () => {
 const data = M.defaults();
 assert.equal(M.weekday(data.settings.programmeStart), 0);
 assert.equal(M.planFor(data, '2026-09-20').pending, true);
 assert.equal(M.planFor(data, '2026-09-21').short, 'Pull');
 assert.equal(M.timeline(data, '2026-09-20').some(e => e.id === 'workout'), false);
 let meditation = M.timeline(data, '2026-09-21').find(e => e.id === 'meditation');
 assert.equal(meditation.time, '08:50'); assert.equal(meditation.minutes, 10);
 data.settings.work = '10:30';
 assert.equal(M.timeline(data, '2026-09-21').find(e => e.id === 'meditation').time, '10:20');
 M.dayRecord(data, '2026-09-14').workout.complete = true;
 const before = JSON.stringify(data.days);
 assert.equal(M.planFor(data, '2026-09-14').short, 'Pull');
 assert.equal(JSON.stringify(data.days), before);
 delete data.settings.programmeStart;
 assert.equal(M.normalize(data).settings.programmeStart, '2026-09-21');
});
