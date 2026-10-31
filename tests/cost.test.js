// cost.test.js — cash and cycle time count toward winning (David, 31 Oct
// 2026; src/engine/cost.js). Expected values are hand-computed (python,
// 31 Oct 2026; tasks/todo.md). Never edit one to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lotMoney, DIE_PER_LOT } from '../src/engine/cost.js';
import { createRun, enterStep, resolveStep, walkCorridor } from '../src/engine/run.js';
import { LOT_TYPES } from '../src/content/lotTypes.js';
import { COST_TARGET_PER_GOOD_DIE } from '../src/content/balance.js';
import { mapView, costSoFarText } from '../src/ui/view.js';

const SEED = 123456;
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < 1e-4, `${label}: got ${actual}, expected ${expected} (seed ${SEED})`);

// No scatter and no drift, so yields are exact (0.723578 doing nothing).
const handCheckRun = () => createRun({ seed: SEED, scatterStrength: 0, toolDrift: false });

function idleRoom(state) {
  const after = resolveStep(enterStep(state));
  return after.corridor === null ? after : walkCorridor(after, null);
}

// Idle up to the last room, inside it, not yet resolved.
function inLastRoom(state) {
  let current = state;
  const last = LOT_TYPES[state.lotTypeId].route.length - 1;
  while (current.stepIndex < last) current = idleRoom(current);
  return enterStep(current);
}

test('every lot type has a cost target', () => {
  for (const id of Object.keys(LOT_TYPES)) {
    assert.ok(COST_TARGET_PER_GOOD_DIE[id] > 0, `${id} has no cost target`);
  }
});

test('lot cost counts cycle time: 2000 base + 0 cash + 133 min × 2 = 2266; ÷ (0.74 × 625) = 4.8995', () => {
  const state = { ...handCheckRun(), cash: 1500, cycleTime: 133, lot: { sites: Array(25).fill(0.74), risks: {}, flags: [] } };
  const money = lotMoney(state);
  assert.equal(DIE_PER_LOT, 625);
  assert.equal(money.timeCost, 266);
  assert.equal(money.lotCost, 2266);
  close(money.costPerGoodDie, 4.899459, 'cost per good die');
});

test('doing nothing ships under the cost target: 2266 ÷ (0.723578 × 625) = 5.0107 ≤ 6.00, a win', () => {
  const end = resolveStep(inLastRoom(handCheckRun()));
  assert.equal(end.cycleTime, 133);
  close(lotMoney(end).costPerGoodDie, 5.010655, 'cost per good die');
  assert.equal(end.status, 'shipped');
});

test('spending 800 cash ships at a loss: (2000 + 800 + 266) ÷ 452.236 = 6.7796 > 6.00', () => {
  const room = inLastRoom(handCheckRun());
  const end = resolveStep({ ...room, cash: 700 });
  close(lotMoney(end).costPerGoodDie, 6.779642, 'cost per good die');
  assert.equal(end.status, 'shippedAtLoss');
});

test('a lot under the yield spec is rejected whatever it cost', () => {
  const room = inLastRoom(handCheckRun());
  const sites = room.lot.sites.map(s => s * 0.9);   // 0.723578 × 0.9 = 0.651 < 0.70
  const end = resolveStep({ ...room, lot: { ...room.lot, sites } });
  assert.equal(end.status, 'rejected');
});

test('the header shows cost per good die so far: 2000 ÷ (1 × 625) = 3.20 at the door', () => {
  assert.equal(costSoFarText(handCheckRun()), 'Cost per good die 3.20 (target 6.00)');
  assert.equal(mapView(handCheckRun()).costText, 'Cost per good die 3.20 (target 6.00)');
});
