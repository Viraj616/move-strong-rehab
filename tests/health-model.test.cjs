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
  assert.equal(M.normalize(M.defaults()).schemaVersion, 2);
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
