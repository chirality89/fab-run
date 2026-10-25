// lotTypes.test.js — checks the lot types in src/content/lotTypes.js.
// The do-nothing yield is hand-computed (tasks/todo.md, M1 item 5). Never
// edit an expected value to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ROOMS, PATTERNS, PRACTICES, EQUIPMENT, MATERIALS, CONSUMABLES,
} from '../src/content/content.js';
import { LOT_TYPES } from '../src/content/lotTypes.js';
import { createLot, addRisk, realizeRisks, lotYield } from '../src/engine/lot.js';

const TOLERANCE = 1e-6;
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < TOLERANCE, `${label}: got ${actual}, expected ${expected}`);

const ALL_LOT_TYPES = Object.values(LOT_TYPES);

// Ring of a site (0 center, 1 inner, 2 outer), worked out independently here.
const ring = i => Math.max(Math.abs(Math.floor(i / 5) - 2), Math.abs((i % 5) - 2));

// Traits that something will set during a run (NEEDS NEW LOGIC). They are
// referenced by when: { lot } too, but a lot type must not list them.
const DYNAMIC_TRAITS = new Set(['delayBeforeBake', 'lastStepWasLitho', 'rightPartChosen']);

// Every trait named by a when: { lot } in content, on an item or one of its effects.
function lotTraitsUsedInContent() {
  const traits = new Set();
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
      for (const pattern of step.realizes) {
        assert.ok(waiting.has(pattern),
          `${lotType.id} step ${i + 1} realizes ${pattern}, which has not entered`);
        waiting.delete(pattern);
      }
    });
    assert.deepEqual([...waiting], [], `${lotType.id}: risks that never bite`);
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

test('cuLine doing nothing: center 0.588605, inner 0.559898, outer 0.492567, yield 0.517954', () => {
  const lot = walkRouteDoingNothing(LOT_TYPES.cuLine);
  const byRing = [0.588605, 0.559898, 0.492567];
  lot.sites.forEach((s, i) => close(s, byRing[ring(i)], `site ${i}`));
  close(lotYield(lot), 0.517954, 'yield');
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
});
