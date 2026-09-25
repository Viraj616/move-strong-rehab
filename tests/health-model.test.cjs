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
  assert.equal(M.normalize(M.defaults()).schemaVersion, 3);
});

test('schema v2 migrates to v3 without changing dated records', () => {
  const old = M.defaults(); old.schemaVersion = 2; delete old.generatedWeeks; delete old.weeklyReviews;
  M.dayRecord(old, '2026-09-21').workout = { complete: true, exercises: { row: { done: true, sets: ['8'], load: '5 kg' } }, updatedAt: '2026-09-21T08:00:00Z' };
  const before = JSON.stringify(old.days);
  const migrated = M.normalize(old);
  assert.equal(migrated.schemaVersion, 3);
  assert.equal(JSON.stringify(migrated.days), before);
  assert.deepEqual(migrated.generatedWeeks, {});
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
  assert.match(review.items.find(x => x.id === 'd1e-pushup').to, /floor set/i);
  assert.equal(M.planFor(migrated, '2026-09-28').exerciseOverrides['d3e-row'].prescription, '3 × 12 at the same 5 kg load');
  assert.equal(M.planFor(migrated, '2026-10-01').minutes, 32);
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
