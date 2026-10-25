// pm.test.js — checks the PM half of the PM/DOE stop (M3 item 2c):
// pmTool in src/engine/run.js and pmChoices / restoreTool in tools.js.
// Expected values are hand-computed (tasks/todo.md, M3 item 2c). Never edit
// one to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lotYield } from '../src/engine/lot.js';
import { createRun, enterStep, resolveStep, walkCorridor, pmTool, whyCannotPm } from '../src/engine/run.js';
import { pmChoices } from '../src/engine/tools.js';

const SEED = 123456;
const TOLERANCE = 1e-6;
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < TOLERANCE, `${label}: got ${actual}, expected ${expected}`);

// Seed 123456: the corridor after step 2 (index 1) offers PM/DOE.
const PM_CORRIDOR = 1;
const handCheckRun = (changes = {}) =>
  createRun({ seed: SEED, scatterStrength: 0, toolDrift: false, startingHealth: { cmp: 60 }, ...changes });

// Runs rooms doing nothing, straight on, until the lot stands in corridor
// `corridorIndex`; then takes the PM/DOE stop there.
function openPmStop(state, corridorIndex = PM_CORRIDOR) {
  let current = resolveStep(enterStep(state));
  while (current.corridor < corridorIndex) current = resolveStep(enterStep(walkCorridor(current, null)));
  assert.ok(current.map[corridorIndex].offers.includes('pm'), `PM offered in corridor ${corridorIndex} (seed ${SEED})`);
  return walkCorridor(current, 'pm');
}

// Plays the rest of the route doing nothing, straight on everywhere.
function playIdle(state) {
  let current = state;
  while (current.status === 'running') {
    current = resolveStep(enterStep(current));
    if (current.corridor !== null) current = walkCorridor(current, null);
  }
  return current;
}

test('a PM stop offers the monitored tools still ahead, each once, in route order', () => {
  const atStop = openPmStop(handCheckRun());
  // After step 2 the route goes litho, etch, clean, dep, plate, cmp, metro.
  assert.deepEqual(atStop.pm.choices, ['litho', 'etch', 'clean', 'dep', 'plate', 'cmp'], `seed ${SEED}`);
  assert.deepEqual(atStop.pm.done, []);
  assert.deepEqual(pmChoices(atStop, 7), [], 'after CMP only metrology is left, and it has no tool to PM');
});

test('a PM restores a tool to 75–95, marks the SPC history, and leaves the lot\'s numbers alone', () => {
  const atStop = openPmStop(handCheckRun());
  const after = pmTool(atStop, 'cmp');
  assert.equal(after.tools.cmp.health, 84, `seed ${SEED}`);
  assert.deepEqual(after.tools.cmp.pmAt, [atStop.tools.cmp.spc.length]);
  assert.equal(after.rngState, atStop.rngState, 'the lot\'s generator is untouched');
  for (let seed = SEED; seed < SEED + 30; seed++) {
    const start = createRun({ seed });
    const stop = start.map.findIndex((corridor, i) => i < 7 && corridor.offers.includes('pm'));
    if (stop === -1) continue;
    let state = resolveStep(enterStep(start));
    while (state.corridor < stop) state = resolveStep(enterStep(walkCorridor(state, null)));
    const before = state.tools.cmp.health;
    const health = pmTool(walkCorridor(state, 'pm'), 'cmp').tools.cmp.health;
    // 75–95, or unchanged if the tool was already healthier than that.
    assert.ok(health >= Math.max(75, before) && health <= Math.max(95, before), `health ${before} → ${health} (seed ${seed})`);
  }
});

test('pmTool refuses a second PM, a tool not ahead, metrology, and no stop open', () => {
  const atStop = openPmStop(handCheckRun());
  const done = pmTool(atStop, 'cmp');
  assert.match(whyCannotPm(done, 'etch'), /already used/);
  assert.throws(() => pmTool(done, 'etch'), /already used/);
  assert.throws(() => pmTool(atStop, 'diff'), /not a tool on the route ahead/, 'not on this route at all');
  assert.throws(() => pmTool(atStop, 'metro'), /not a tool on the route ahead/);
  const straightOn = walkCorridor(resolveStep(enterStep(handCheckRun())), null);
  assert.equal(straightOn.pm, null);
  assert.throws(() => pmTool(straightOn, 'cmp'), /no PM stop open/);
});

test('the PM stop closes when the lot enters the next room', () => {
  const atStop = openPmStop(handCheckRun());
  assert.equal(enterStep(atStop).pm, null);
});

// Hand check (tasks/todo.md, M3 item 2c): scatter off, drift off (no wear),
// CMP starting at 60 (2σ). Seed 123456's PM on CMP after step 2 draws health
// 84, a 0.8σ shift: (1 − P(0.8)) / (1 − P(0)) = 0.999375. Without the PM the
// lot gets CMP's 2σ factor 0.977312 (M3 item 2b).
test('hand check: a PM on a CMP tool at 60 brings the loss from × 0.977312 to × 0.999375', () => {
  const healthy = playIdle(createRun({ seed: SEED, scatterStrength: 0, toolDrift: false }));
  const noPm = playIdle(handCheckRun());
  const withPm = playIdle(pmTool(openPmStop(handCheckRun()), 'cmp'));
  close(lotYield(noPm.lot) / lotYield(healthy.lot), 0.977312, `no PM (seed ${SEED})`);
  close(lotYield(withPm.lot) / lotYield(healthy.lot), 0.999375, `PM to health 84 (seed ${SEED})`);
  assert.equal(withPm.cycleTime, noPm.cycleTime + 40, `the stop costs 40 min (seed ${SEED})`);
});

test('a tool behind the lot cannot be PM\'d', () => {
  // The first seed from SEED up with PM offered after step 7 (plating):
  // deposition is behind the lot there and never visited again.
  for (let seed = SEED; seed < SEED + 200; seed++) {
    const start = createRun({ seed });
    if (!start.map[6].offers.includes('pm')) continue;
    let state = resolveStep(enterStep(start));
    while (state.corridor < 6) state = resolveStep(enterStep(walkCorridor(state, null)));
    const atStop = walkCorridor(state, 'pm');
    assert.deepEqual(atStop.pm.choices, ['cmp'], `seed ${seed}`);
    assert.throws(() => pmTool(atStop, 'dep'), /not a tool on the route ahead/, `seed ${seed}`);
    return;
  }
  assert.fail('no seed offers PM after step 7');
});

test('a PM never lowers a tool already healthier than its roll', () => {
  // Drift off: every tool is at 100. Seed 123456's PM roll is 84 (above).
  const atStop = openPmStop(createRun({ seed: SEED, scatterStrength: 0, toolDrift: false }));
  assert.equal(pmTool(atStop, 'cmp').tools.cmp.health, 100, `seed ${SEED}`);
});
