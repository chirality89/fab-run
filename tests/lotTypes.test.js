// lotTypes.test.js — checks the lot types in src/content/lotTypes.js.
// The do-nothing yield is hand-computed (tasks/todo.md, M1 item 5). Never
// edit an expected value to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import { TOOL_MONITORS } from '../src/content/toolMonitors.js';
import assert from 'node:assert/strict';
import {
  ROOMS, PATTERNS, PRACTICES, EQUIPMENT, MATERIALS, CONSUMABLES, FAILURE_MODES,
} from '../src/content/content.js';
import { LOT_TYPES } from '../src/content/lotTypes.js';
import { createLot, addRisk, realizeRisks, lotYield } from '../src/engine/lot.js';
import { playRun } from '../tools/bot.js';

const TOLERANCE = 1e-6;
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < TOLERANCE, `${label}: got ${actual}, expected ${expected}`);

const ALL_LOT_TYPES = Object.values(LOT_TYPES);

// Ring of a site (0 center, 1 inner, 2 outer), worked out independently here.
const ring = i => Math.max(Math.abs(Math.floor(i / 5) - 2), Math.abs((i % 5) - 2));

// Traits that something will set during a run (NEEDS NEW LOGIC). They are
// referenced by when: { lot } too, but a lot type must not list them.
const DYNAMIC_TRAITS = new Set(['delayBeforeBake', 'lastStepWasLitho', 'rightPartChosen']);

// Every trait named by a when: { lot } in content, on an item or one of its
// effects, or on a failure mode (which limits a right diagnosis to that lot).
function lotTraitsUsedInContent() {
  const traits = new Set();
  for (const failureMode of FAILURE_MODES) {
    if (failureMode.when?.lot) traits.add(failureMode.when.lot);
  }
  for (const item of [...PRACTICES, ...EQUIPMENT, ...MATERIALS, ...CONSUMABLES]) {
    if (item.when?.lot) traits.add(item.when.lot);
    for (const effect of item.effects ?? []) {
      if (effect.when?.lot) traits.add(effect.when.lot);
    }
  }
  return traits;
}

// Plays a lot type with no cards and no scatter: on each step, add its
// risks, then realize its patterns. Returns the final lot.
function walkRouteDoingNothing(lotType) {
  let lot = createLot();
  for (const [pattern, amount] of Object.entries(lotType.startRisks)) {
    lot = addRisk(lot, pattern, amount);
  }
  for (const step of lotType.route) {
    for (const [pattern, amount] of Object.entries(step.adds)) {
      lot = addRisk(lot, pattern, amount);
    }
    lot = realizeRisks(lot, step.realizes);
  }
  return lot;
}

test('every lot type has an id matching its key, a name, a tradeoff, a physics note and draft', () => {
  for (const [key, lotType] of Object.entries(LOT_TYPES)) {
    assert.equal(lotType.id, key, `${key} has id ${lotType.id}`);
    assert.ok(lotType.name, `${key} has no name`);
    assert.ok(lotType.tradeoff, `${key} has no tradeoff`);
    assert.ok(lotType.physicsNote, `${key} has no physicsNote`);
    assert.equal(lotType.draft, true, `${key} is not marked draft`);
  }
});

test('every room on a route exists in ROOMS', () => {
  for (const lotType of ALL_LOT_TYPES) {
    lotType.route.forEach((step, i) => {
      assert.ok(ROOMS[step.room], `${lotType.id} step ${i + 1} names unknown room ${step.room}`);
      assert.ok(step.label, `${lotType.id} step ${i + 1} has no label`);
    });
  }
});

test('every pattern in startRisks, adds and realizes exists in PATTERNS', () => {
  for (const lotType of ALL_LOT_TYPES) {
    const named = [
      ...Object.keys(lotType.startRisks),
      ...lotType.route.flatMap(step => [...Object.keys(step.adds), ...step.realizes]),
    ];
    for (const pattern of named) {
      assert.ok(pattern in PATTERNS, `${lotType.id} names unknown pattern ${pattern}`);
    }
  }
});

test('every risk amount is a finite number above 0', () => {
  for (const lotType of ALL_LOT_TYPES) {
    const amounts = [lotType.startRisks, ...lotType.route.map(step => step.adds)]
      .flatMap(table => Object.entries(table));
    for (const [pattern, amount] of amounts) {
      assert.ok(Number.isFinite(amount) && amount > 0, `${lotType.id}: ${pattern} amount ${amount}`);
    }
  }
});

// Walks the route keeping a set of risks that have entered but not yet bitten.
test('every risk that enters bites later, and nothing bites before it enters', () => {
  for (const lotType of ALL_LOT_TYPES) {
    const waiting = new Set(Object.keys(lotType.startRisks));
    lotType.route.forEach((step, i) => {
      for (const pattern of Object.keys(step.adds)) waiting.add(pattern);
      // A drifted tool also adds risk to its pattern on entering (run.js):
      // the step's own driftPattern, else its monitor's; null means none.
      const driftPattern = step.driftPattern === undefined ? TOOL_MONITORS[step.room]?.pattern : step.driftPattern;
      if (TOOL_MONITORS[step.room] && driftPattern) waiting.add(driftPattern);
      for (const pattern of step.realizes) {
        assert.ok(waiting.has(pattern),
          `${lotType.id} step ${i + 1} realizes ${pattern}, which has not entered`);
        waiting.delete(pattern);
      }
    });
    assert.deepEqual([...waiting], [], `${lotType.id}: risks that never bite`);
  }
});

test('a step\'s driftPattern is a pattern its room has a monitor for, and the step realizes it', () => {
  for (const lotType of ALL_LOT_TYPES) {
    lotType.route.forEach((step, i) => {
      if (step.driftPattern === undefined || step.driftPattern === null) return;   // null: no drift here
      const where = `${lotType.id} step ${i + 1}`;
      assert.ok(TOOL_MONITORS[step.room], `${where}: room ${step.room} has no monitor`);
      assert.ok(Object.hasOwn(PATTERNS, step.driftPattern), `${where}: ${step.driftPattern} is not a pattern`);
      assert.ok(step.realizes.includes(step.driftPattern), `${where}: ${step.driftPattern} is not realized here`);
    });
  }
});

test('traits are static traits that content checks with when: { lot }', () => {
  const used = lotTraitsUsedInContent();
  for (const lotType of ALL_LOT_TYPES) {
    for (const trait of lotType.traits) {
      assert.ok(used.has(trait), `${lotType.id} trait ${trait} is not used by any when: { lot }`);
      assert.ok(!DYNAMIC_TRAITS.has(trait), `${lotType.id} trait ${trait} is set during a run, not by the lot type`);
    }
  }
});

// Values from an independent python model of the route (29 Oct 2026, after
// etch's own risks and its carried-in depth variation were cut by a quarter);
// the same model first gave the previous 0.745276 / 0.719643 / 0.672460 / 0.690471.
test('cuLine route risks alone (adds and realizes, no step effects): center 0.754274, inner 0.734732, outer 0.698025, yield 0.712021', () => {
  const lot = walkRouteDoingNothing(LOT_TYPES.cuLine);
  const byRing = [0.754274, 0.734732, 0.698025];
  lot.sites.forEach((s, i) => close(s, byRing[ring(i)], `site ${i}`));
  close(lotYield(lot), 0.712021, 'yield');
});

// NMOS has no center-to-edge pattern (no depth_variation), so center and
// inner sites match; only the edge ring sets the outer sites apart.
// Hand check (risks cut to 50% on 31 Oct 2026; python first): even risk
// realized 0.285 (12 steps of particles 0.005, plus cd 0.030, residue 0.040,
// dishing 0.030, rr_drift 0.020, gate oxide 0.020, Q-time 0.015, underlayer
// 0.015, channeling 0.020, implant damage 0.020, junction spread 0.015);
// e^-0.285 = 0.752014. Edge ring 0.030 × 1.5625 more on the outer 16 sites:
// 0.717577. Yield (9 × center and inner + 16 × outer) / 25 = 0.729974.
// At 52% (30 Oct): 0.743044, 0.706805, 0.719851. Before any cut: 0.565525,
// 0.514917, 0.533136.
test('nmos doing nothing: center 0.752014, inner 0.752014, outer 0.717577, yield 0.729974', () => {
  const lot = walkRouteDoingNothing(LOT_TYPES.nmos);
  const byRing = [0.752014, 0.752014, 0.717577];
  lot.sites.forEach((s, i) => close(s, byRing[ring(i)], `site ${i}`));
  close(lotYield(lot), 0.729974, 'yield');
});

// The NMOS lot is not offered on screen yet, so the bot plays it through
// the engine: every room, card, shop and event must work on its route.
test('nmos runs to the end: seeds 1–20 x {idle, random} x {starter, full}, all numbers finite', () => {
  const numbersIn = (value, path, found = []) => {
    if (typeof value === 'number') found.push({ path, value });
    else if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) numbersIn(child, `${path}.${key}`, found);
    }
    return found;
  };
  for (let seed = 1; seed <= 20; seed++) {
    for (const policy of ['idle', 'random']) {
      for (const deck of ['starter', 'full']) {
        const label = `nmos seed ${seed}, ${policy}, ${deck} deck`;
        const { state, summary } = playRun(seed, policy, { deck, lotTypeId: 'nmos' });
        assert.equal(state.lotTypeId, 'nmos', label);
        assert.notEqual(state.status, 'running', `${label}: run did not finish`);
        for (const { path, value } of numbersIn(state, 'state')) {
          assert.ok(Number.isFinite(value), `${label}: ${path} is ${value}`);
        }
        assert.ok(summary.yield >= 0 && summary.yield <= 1, `${label}: yield ${summary.yield}`);
      }
    }
  }
});

test('a Q-time step names a known pattern that a later step realizes', () => {
  for (const lotType of Object.values(LOT_TYPES)) {
    lotType.route.forEach((step, index) => {
      if (!step.qtime) return;
      assert.ok(step.qtime in PATTERNS, `${lotType.id} step ${index + 1}: unknown pattern ${step.qtime}`);
      assert.ok(index < lotType.route.length - 1, `${lotType.id}: the last step has no corridor after it`);
      const laterSteps = lotType.route.slice(index + 1);
      assert.ok(laterSteps.some(later => later.realizes.includes(step.qtime)),
        `${lotType.id} step ${index + 1}: ${step.qtime} is never realized later`);
    });
  }
  assert.equal(LOT_TYPES.cuLine.route[4].qtime, 'qtime_oxide', 'the Cu line Q-time window is after step 5');
  assert.equal(LOT_TYPES.nmos.route[5].qtime, 'qtime_oxide', 'the NMOS Q-time window is after step 6 (pre-gate clean)');
});

// A route step's own effects (M4.5 item 3) use the same operations as
// content.js and name real patterns; a `when` may only check a flag.
test('every route step effect uses a known operation, a known pattern and a flag condition', () => {
  const STEP_OPS = new Set(['defectMult']);   // the only one a step needs so far
  for (const lotType of ALL_LOT_TYPES) {
    for (const step of lotType.route) {
      for (const effect of step.effects ?? []) {
        assert.ok(STEP_OPS.has(effect.op), `${lotType.id} ${step.label}: op ${effect.op}`);
        assert.ok(effect.pattern in PATTERNS, `${lotType.id} ${step.label}: pattern ${effect.pattern}`);
        assert.ok(effect.mult >= 0, `${lotType.id} ${step.label}: mult ${effect.mult}`);
        if (effect.when) assert.deepEqual(Object.keys(effect.when), ['flag'], `${lotType.id} ${step.label}: when`);
      }
    }
  }
});

test('every startRisks pattern has a startRiskNotes sentence (the forecast shows it)', () => {
  for (const lotType of ALL_LOT_TYPES) {
    for (const pattern of Object.keys(lotType.startRisks)) {
      assert.ok(lotType.startRiskNotes?.[pattern], `${lotType.id}: no startRiskNotes for ${pattern}`);
    }
  }
});
