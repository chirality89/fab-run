// notebook.test.js — kills per pattern (lot.js) and the diagnosis that
// writes the engineering notebook (notebook.js), M4 item 1. Expected values
// are hand-computed (tasks/todo.md). Never edit one to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLot, addRisk, realizeRisks, lotYield, pointsLostByPattern } from '../src/engine/lot.js';
import { createRun, enterStep, resolveStep, walkCorridor, runDeck, starterDeck } from '../src/engine/run.js';
import { emptyNotebook, diagnosisFor, diagnoseLot, findFailureMode, unlockedIds, stepsThatLost } from '../src/engine/notebook.js';
import { DIAGNOSE_MIN_POINTS, DIAGNOSE_CANDIDATES } from '../src/content/balance.js';
import { LOT_TYPES } from '../src/content/lotTypes.js';
import { FAILURE_MODES, PRACTICES } from '../src/content/content.js';

// Sorts practice ids the way content.js lists them.
const byContentOrder = (a, b) => PRACTICES.findIndex(card => card.id === a) - PRACTICES.findIndex(card => card.id === b);

const SEED = 123456;
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${label}: got ${actual}, expected ${expected} (seed ${SEED})`);

function playIdle(state) {
  let current = state;
  while (current.status === 'running') {
    current = resolveStep(enterStep(current));
    if (current.status === 'running') current = walkCorridor(current, null);
  }
  return current;
}

test('loss split site by site: particles 0.1 (even) and edge ring 0.2 (outer 16 sites, weight 1.5625)', () => {
  let lot = addRisk(addRisk(createLot(), 'particles', 0.1), 'edge_ring', 0.2);
  lot = realizeRisks(lot, ['particles', 'edge_ring']);
  // Inner 9 sites: only particles, drop 1 − e^−0.1.
  // Outer 16 sites: exponent 0.1 + 0.2 × 1.5625 = 0.4125, drop 1 − e^−0.4125,
  // shared 0.1 : 0.3125 between particles and the edge ring.
  const inner = 1 - Math.exp(-0.1);
  const outer = 1 - Math.exp(-0.4125);
  close(lot.lost.particles, (9 * inner + 16 * outer * (0.1 / 0.4125)) / 25, 'particles lost');
  close(lot.lost.edge_ring, (16 * outer * (0.3125 / 0.4125)) / 25, 'edge ring lost');
  const points = pointsLostByPattern(lot);
  close(points.particles + points.edge_ring, (1 - lotYield(lot)) * 100, 'shares add up to all points lost');
});

test('a pattern on only some sites is credited only there (physics review case)', () => {
  // Edge ring kills the outer sites outright (exponent 10); particles 0.1
  // everywhere. The 9 inner sites lose 1 − e^−0.1 = 9.5% each to particles
  // alone, so particles cost at least 9 × 9.5% / 25 = 3.4 points of the lot.
  let lot = addRisk(addRisk(createLot(), 'particles', 0.1), 'edge_ring', 6.4);
  lot = realizeRisks(lot, ['particles', 'edge_ring']);
  const points = pointsLostByPattern(lot);
  assert.ok(points.particles >= 9 * (1 - Math.exp(-0.1)) * 100 / 25, `particles ${points.particles}`);
});

test('loss adds up over steps and never changes the yield', () => {
  const once = realizeRisks(addRisk(createLot(), 'particles', 0.1), ['particles']);
  const twice = realizeRisks(addRisk(once, 'particles', 0.1), ['particles']);
  close(lotYield(twice), Math.exp(-0.2), 'yield after two steps');
  close(pointsLostByPattern(twice).particles, (1 - Math.exp(-0.2)) * 100, 'points after two steps');
});

test('T-top is only right when the lot waited before bake, whatever the CD loss', () => {
  // Since the base risks were cut to 70% (28 Oct 2026) an idle run's CD error
  // costs under DIAGNOSE_MIN_POINTS, so 0.02 more CD-error risk is added at the
  // start to make it cost points, which is what this test needs.
  const start = createRun({ seed: SEED });
  const end = playIdle({ ...start, lot: addRisk(start.lot, 'cd_error', 0.02) });
  assert.ok(pointsLostByPattern(end.lot).cd_error >= DIAGNOSE_MIN_POINTS, 'CD error did cost points');
  assert.ok(!diagnosisFor(end, emptyNotebook()).rightIds.includes('fm_ped_ttop'));
});

test('diagnosisFor on an idle walk: right ids cost ≥ 3 points, wrong ones less, 4 distinct choices', () => {
  const end = playIdle(createRun({ seed: SEED }));
  const points = pointsLostByPattern(end.lot);
  const { rightIds, candidates } = diagnosisFor(end, emptyNotebook());
  assert.ok(rightIds.length > 0, `something cost ${DIAGNOSE_MIN_POINTS} points (seed ${SEED})`);
  for (const id of rightIds) assert.ok(points[findFailureMode(id).pattern] >= DIAGNOSE_MIN_POINTS, id);
  assert.equal(candidates.length, DIAGNOSE_CANDIDATES);
  assert.equal(new Set(candidates).size, DIAGNOSE_CANDIDATES);
  assert.ok(candidates.some(id => rightIds.includes(id)), 'at least one right answer offered');
  // A wrong one cost too little, or its cause was not there (its `when`).
  for (const id of candidates.filter(id => !rightIds.includes(id))) {
    const mode = findFailureMode(id);
    assert.ok((points[mode.pattern] ?? 0) < DIAGNOSE_MIN_POINTS || mode.when, id);
  }
  assert.deepEqual(diagnosisFor(end, emptyNotebook()).candidates, candidates, 'same seed, same order');
  // A wrong choice from another lot type (implant damage on a Cu line) only
  // appears once every wrong choice the Cu line can make is already offered.
  const onRoute = id => LOT_TYPES.cuLine.route.some(step => step.realizes.includes(findFailureMode(id).pattern));
  const wrongOnRoute = FAILURE_MODES.filter(mode => !rightIds.includes(mode.id) && onRoute(mode.id));
  if (candidates.some(id => !onRoute(id))) {
    for (const mode of wrongOnRoute) assert.ok(candidates.includes(mode.id), `${mode.id} offered before off-route ones`);
  }
});

test('a right diagnosis writes the notebook once; a second guess on the lot is refused', () => {
  const end = playIdle(createRun({ seed: SEED }));
  const { rightIds, candidates } = diagnosisFor(end, emptyNotebook());
  const right = candidates.find(id => rightIds.includes(id));
  const done = diagnoseLot(end, emptyNotebook(), right);
  assert.equal(done.result.correct, true);
  assert.deepEqual(done.notebook.entries, [{ id: right, seed: SEED }]);
  assert.equal(done.state.diagnosed, right);
  assert.throws(() => diagnoseLot(done.state, done.notebook, right), /already diagnosed/);

  // Next time, the right answer offered is one not yet in the notebook (if any).
  const later = diagnosisFor(end, done.notebook);
  const offeredRight = later.candidates.filter(id => rightIds.includes(id));
  if (rightIds.length > 1) assert.ok(offeredRight.some(id => id !== right), 'a new right answer is offered');

  // With every right answer already known, naming one adds nothing.
  const full = { version: 1, entries: rightIds.map(id => ({ id, seed: 1 })) };
  const known = diagnosisFor(end, full).candidates.find(id => rightIds.includes(id));
  const repeat = diagnoseLot(end, full, known);
  assert.equal(repeat.result.alreadyKnown, true);
  assert.equal(repeat.notebook.entries.length, rightIds.length);
});

test('a wrong diagnosis writes nothing and names a right answer', () => {
  const end = playIdle(createRun({ seed: SEED }));
  const { rightIds, candidates } = diagnosisFor(end, emptyNotebook());
  const wrong = candidates.find(id => !rightIds.includes(id));
  const done = diagnoseLot(end, emptyNotebook(), wrong);
  assert.equal(done.result.correct, false);
  assert.deepEqual(done.notebook.entries, []);
  assert.ok(rightIds.includes(done.result.revealedId));
});

test('only an offered failure mode can be named; a running lot cannot be diagnosed', () => {
  const end = playIdle(createRun({ seed: SEED }));
  const { candidates } = diagnosisFor(end, emptyNotebook());
  const notOffered = ['fm_particles', 'fm_keyhole', 'fm_edge_ring', 'fm_qtime', 'fm_dishing']
    .find(id => !candidates.includes(id));
  assert.throws(() => diagnoseLot(end, emptyNotebook(), notOffered), /not one of the choices/);
  assert.throws(() => diagnosisFor(createRun({ seed: SEED }), emptyNotebook()), /not over yet/);
});

test('a lot that lost too little has nothing to diagnose', () => {
  const start = createRun({ seed: SEED });
  const quiet = { ...start, status: 'scrapped', scrappedBy: 'player' };   // scrapped at the door
  assert.deepEqual(diagnosisFor(quiet, emptyNotebook()), { rightIds: [], candidates: [] });
});

// --- the unlocked pool (M4 item 4) -----------------------------------------

test('unlockedIds: what the notebook has earned, in content order', () => {
  const notebook = { version: 1, entries: [{ id: 'fm_keyhole', seed: 1 }, { id: 'fm_edge_ring', seed: 2 }] };
  // Content order: practices, then equipment, materials, consumables.
  assert.deepEqual(unlockedIds(notebook), ['slowStartPlate', 'eChuckUpgrade', 'additiveBath', 'bathAnalysis']);
  assert.deepEqual(unlockedIds(emptyNotebook()), []);
  const unknown = { version: 1, entries: [{ id: 'fm_renamed_long_ago', seed: 1 }] };
  assert.deepEqual(unlockedIds(unknown), []);
  assert.deepEqual(unlockedIds({ version: 1, entries: [{ id: 'fm_residue', seed: 1 }] }), [], 'residue unlocks nothing');
});

test('runDeck: the starter deck plus unlocked practices only', () => {
  assert.deepEqual(runDeck([]), starterDeck());
  const keyhole = unlockedIds({ version: 1, entries: [{ id: 'fm_keyhole', seed: 1 }] });
  // The bath and bath analysis are not practices, so only the card joins.
  assert.deepEqual(runDeck(keyhole), [...starterDeck(), 'slowStartPlate'].sort(byContentOrder));
  assert.deepEqual(runDeck(['noSuchCard']), starterDeck(), 'an unknown id adds nothing');
});

test('a run keeps the unlocked list it began with', () => {
  const unlocked = ['slowStartPlate', 'additiveBath'];
  const state = createRun({ seed: 123456, unlocked });
  assert.deepEqual(state.unlocked, unlocked);
  unlocked.push('eChuckUpgrade');   // the caller's list changing later...
  assert.deepEqual(state.unlocked, ['slowStartPlate', 'additiveBath'], '...does not change the run');
  assert.deepEqual(createRun({ seed: 123456 }).unlocked, [], 'none by default');
});

// --- P4: diagnosis explains itself (28 Oct 2026). No yield numbers here: these
// check rules that must hold on every seed, not one hand-computed value.

test('every wrong choice could have happened: its pattern is on the route and its `when` holds', () => {
  for (const lotTypeId of Object.keys(LOT_TYPES)) {
    for (let seed = 1; seed <= 20; seed++) {
      const end = playIdle(createRun({ seed, lotTypeId }));
      const { rightIds, candidates } = diagnosisFor(end, emptyNotebook());
      if (candidates.length === 0) continue;
      assert.equal(candidates.length, DIAGNOSE_CANDIDATES, `${lotTypeId} seed ${seed}`);
      for (const id of candidates.filter(id => !rightIds.includes(id))) {
        const mode = findFailureMode(id);
        const onRoute = LOT_TYPES[lotTypeId].route.some(step => step.realizes.includes(mode.pattern));
        assert.ok(onRoute, `${id} is on the ${lotTypeId} route (seed ${seed})`);
        assert.ok(!mode.when || end.lotTraits.some(trait => trait === mode.when.lot), `${id} cause present (seed ${seed})`);
      }
    }
  }
});

test('T-top is not offered as a wrong choice on a lot that never waited before bake', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const end = playIdle(createRun({ seed }));
    if (end.lotTraits.includes('delayBeforeBake')) continue;
    assert.ok(!diagnosisFor(end, emptyNotebook()).candidates.includes('fm_ped_ttop'), `seed ${seed}`);
  }
});

test('stepsThatLost: the steps add up to the pattern total and follow route order', () => {
  const end = playIdle(createRun({ seed: SEED }));
  const points = pointsLostByPattern(end.lot);
  for (const [pattern, total] of Object.entries(points)) {
    const steps = stepsThatLost(end, pattern, 0);
    const sum = steps.reduce((acc, step) => acc + step.points, 0);
    assert.ok(Math.abs(sum - total) < 1e-9, `${pattern}: steps add to ${total}, got ${sum}`);
    steps.forEach((step, index) => { if (index > 0) assert.ok(step.stepIndex > steps[index - 1].stepIndex); });
  }
  assert.deepEqual(stepsThatLost(end, 'no_such_pattern'), []);
});

test('stepsThatLost skips steps from an old save that has no lostAfter', () => {
  const end = playIdle(createRun({ seed: SEED }));
  const old = { ...end, stepYields: end.stepYields.map(({ lostAfter, ...rest }) => rest) };
  assert.deepEqual(stepsThatLost(old, 'particles'), []);
});
