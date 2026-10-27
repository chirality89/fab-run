// tools.test.js — checks tool drift, wear and SPC in src/engine/tools.js
// (M3 item 2b). Expected values are hand-computed (tasks/todo.md, M3 item
// 2b). Never edit one to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lotYield } from '../src/engine/lot.js';
import { createRun, enterStep, resolveStep, walkCorridor } from '../src/engine/run.js';
import {
  normalBelow, driftShift, outOfSpecFraction, driftRisk, startingTools, spcRules,
} from '../src/engine/tools.js';
import { TOOL_MONITORS } from '../src/content/toolMonitors.js';
import { PATTERNS } from '../src/content/content.js';
import { LOT_TYPES } from '../src/content/lotTypes.js';

const SEED = 123456;
const TOLERANCE = 1e-6;
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < TOLERANCE, `${label}: got ${actual}, expected ${expected}`);

const ALL_HEALTHY = { clean: 100, dep: 100, litho: 100, etch: 100, plate: 100, cmp: 100 };

// Plays the whole route doing nothing, straight on everywhere.
function playIdle(state) {
  let current = state;
  while (current.status === 'running') {
    current = resolveStep(enterStep(current));
    if (current.corridor !== null) current = walkCorridor(current, null);
  }
  return current;
}

test('every monitor feeds a known pattern that its room realizes on the Cu line', () => {
  const route = LOT_TYPES.cuLine.route;
  for (const [roomId, monitor] of Object.entries(TOOL_MONITORS)) {
    assert.ok(PATTERNS[monitor.pattern], `${roomId}: ${monitor.pattern}`);
    assert.ok([1, -1].includes(monitor.direction), `${roomId} direction`);
    assert.ok(monitor.sigma > 0 && monitor.tradeoff && monitor.physicsNote, roomId);
    const visits = route.filter(step => step.room === roomId);
    assert.ok(visits.every(step => step.realizes.includes(monitor.pattern)), `${roomId} realizes ${monitor.pattern}`);
  }
});

test('the bell curve: Φ(0) 0.5, Φ(−1) 0.158655, Φ(−2) 0.022750, Φ(−3) 0.001350', () => {
  close(normalBelow(0), 0.5, 'Φ(0)');
  close(normalBelow(-1), 0.158655, 'Φ(−1)');
  close(normalBelow(-2), 0.022750, 'Φ(−2)');
  close(normalBelow(-3), 0.001350, 'Φ(−3)');
  close(normalBelow(1) + normalBelow(-1), 1, 'symmetry');
});

test('health → shift: 100 is 0σ, 80 is 1σ, 60 is 2σ, 40 is 3σ', () => {
  assert.equal(driftShift(100), 0);
  assert.equal(driftShift(80), 1);
  assert.equal(driftShift(60), 2);
  assert.equal(driftShift(40), 3);
  close(outOfSpecFraction(0), 0.000063, 'out of spec on target (±4σ)');
});

test('yield factor in the room: 1, 0.998713, 0.977312, 0.933252, 0.841398', () => {
  const factor = health => Math.exp(-driftRisk(health));
  close(driftRisk(100), 0, 'a healthy tool adds nothing');
  close(factor(80), 0.998713, '1σ');
  close(factor(60), 0.977312, '2σ');
  close(factor(50), 0.933252, '2.5σ');
  close(factor(40), 0.841398, '3σ');
});

test('one-sided spec (particles, seams): only the upper tail counts', () => {
  const factor = health => Math.exp(-driftRisk(health, true));
  close(outOfSpecFraction(0, true), 0.000032, 'Φ(−4)');
  close(driftRisk(100, true), 0, 'a healthy tool adds nothing');
  close(factor(80), 0.998682, '1σ');
  close(factor(60), 0.977281, '2σ');
  close(factor(40), 0.841371, '3σ');
});

test('rule 1: one point beyond 3σ, and not at 2.9σ', () => {
  assert.deepEqual(spcRules([0.5, -0.5, 3.2]), [{ rule: 1, side: 'above' }]);
  assert.deepEqual(spcRules([0.5, -3.1, 0.2]), [{ rule: 1, side: 'below' }]);
  assert.deepEqual(spcRules([0.5, -0.5, 2.9]), []);
});

test('rule 2: 2 of 3 beyond 2σ on the same side, not on opposite sides', () => {
  assert.deepEqual(spcRules([2.5, 0.1, 2.2]), [{ rule: 2, side: 'above' }]);
  assert.deepEqual(spcRules([-2.1, -2.4, 0.3]), [{ rule: 2, side: 'below' }]);
  assert.deepEqual(spcRules([2.5, -0.1, -2.2]), [], 'opposite sides');
  assert.deepEqual(spcRules([2.5, 0.1, 0.1, 2.2]), [], 'four apart, not 2 of 3');
});

test('rule 3: 8 in a row on one side, not 7', () => {
  const below8 = [-0.2, -0.5, -0.1, -0.9, -0.3, -0.4, -0.2, -0.6];
  assert.deepEqual(spcRules([0.3, ...below8]), [{ rule: 3, side: 'below' }]);
  assert.deepEqual(spcRules([0.3, ...below8.slice(1), 0.4]), [], 'only 7');
});

test('starting tools: from the seed, 50–100, same seed same tools; metrology has no chart', () => {
  const first = startingTools(SEED);
  assert.deepEqual(startingTools(SEED), first);
  for (const roomId of Object.keys(TOOL_MONITORS)) {
    const health = first.tools[roomId].health;
    assert.ok(health >= 50 && health <= 100, `${roomId} health ${health} (seed ${SEED})`);
    assert.equal(first.tools[roomId].spc.length, 11, `${roomId} history`);
  }
  assert.equal(first.tools.metro.health, 100);
  assert.deepEqual(first.tools.metro.spc, []);
  const healths = seed => Object.keys(TOOL_MONITORS).map(id => startingTools(seed).tools[id].health).join(',');
  assert.notEqual(healths(SEED), healths(SEED + 1), 'different seeds, different tools');
});

test('the tools never touch the lot\'s random numbers', () => {
  const withDrift = createRun({ seed: SEED });
  const without = createRun({ seed: SEED, toolDrift: false });
  assert.equal(withDrift.rngState, SEED);
  const a = resolveStep(enterStep(withDrift));
  const b = resolveStep(enterStep(without));
  assert.equal(a.rngState, b.rngState, `seed ${SEED}`);
  assert.deepEqual(a.hand, b.hand);
});

test('wear: each run in a room costs its tool 5 health and adds one SPC point', () => {
  const end = playIdle(createRun({ seed: SEED, scatterStrength: 0, startingHealth: ALL_HEALTHY }));
  assert.equal(end.tools.clean.health, 90, 'clean, visited twice');
  assert.equal(end.tools.dep.health, 90, 'dep, visited twice');
  for (const roomId of ['litho', 'etch', 'plate', 'cmp']) assert.equal(end.tools[roomId].health, 95, roomId);
  assert.equal(end.tools.metro.health, 100, 'metrology does not wear');
  assert.equal(end.tools.clean.spc.length, 13);
  assert.equal(end.tools.cmp.spc.length, 12);

  const noDrift = playIdle(createRun({ seed: SEED, scatterStrength: 0, toolDrift: false }));
  assert.equal(noDrift.tools.clean.health, 100, 'drift off: no wear');
});

// Hand check (tasks/todo.md, M3 item 2b): scatter off, nothing played, drift
// off (no wear), every tool at 100 except CMP at 60. CMP's mean has shifted
// 2σ, so rr_drift (an even pattern, realized only at CMP) gets the extra risk
// −ln(0.977312), and the final yield is the healthy run × 0.977312.
test('hand check: a CMP tool at health 60 costs the lot × 0.977312', () => {
  const healthy = playIdle(createRun({ seed: SEED, scatterStrength: 0, toolDrift: false }));
  const worn = playIdle(createRun({ seed: SEED, scatterStrength: 0, toolDrift: false, startingHealth: { cmp: 60 } }));
  close(lotYield(healthy.lot), 0.589352, `the healthy run is today's idle run (seed ${SEED})`);
  close(lotYield(worn.lot) / lotYield(healthy.lot), 0.977312, `yield ratio (seed ${SEED})`);
});

test('a rule tripped on both sides is reported for each side', () => {
  assert.deepEqual(spcRules([3.5, 0, -3.2]), [{ rule: 1, side: 'above' }, { rule: 1, side: 'below' }]);
});
