const { test } = require('node:test');
const assert = require('node:assert/strict');
const G = require('../massage-guidance.js');

const ex = name => ({ name });

test('lower-body workouts map to the exercised muscle groups', () => {
  const guide = G.forExercises([
    ex('Goblet squat, hack squat or leg press'),
    ex('Single-leg Romanian deadlift'),
    ex('Standing calf raise')
  ]);
  assert.deepEqual(guide.targets.map(target => target.id), ['quads', 'glutes', 'hamstrings', 'calves']);
  assert.match(guide.before.speed, /2,000 rpm/);
  assert.match(guide.after.heat, /40°C/);
});

test('upper-body guidance identifies only muscle-belly targets and flags shoulder caution', () => {
  const guide = G.forExercises([
    ex('Incline push-up'),
    ex('Chest-supported row'),
    ex('Cable triceps press-down')
  ]);
  assert.deepEqual(guide.targets.map(target => target.id), ['upper-back', 'arms']);
  assert.equal(guide.hasShoulderAdjacentTarget, true);
  assert.equal(guide.targets.some(target => /chest|clavicle/i.test(target.label)), false);
});

test('mobility-only sessions do not invent a percussion target', () => {
  const guide = G.forExercises([ex('Relaxed diaphragmatic breathing'), ex('Cat–cow')]);
  assert.deepEqual(guide.targets, []);
  assert.equal(guide.hasShoulderAdjacentTarget, false);
});

test('rowing cardio maps to legs without being mistaken for a cable-row shoulder target', () => {
  const guide = G.forExercises([ex('Rowing machine Zone 2')]);
  assert.deepEqual(guide.targets.map(target => target.id), ['quads', 'glutes']);
  assert.equal(guide.hasShoulderAdjacentTarget, false);
});
