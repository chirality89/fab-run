// ship.test.js — the ship report (M3 item 3): yield by step, the player's
// scrap, and the money (src/ui/shipView.js). Expected values are
// hand-computed (tasks/todo.md). Never edit one to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addRisk, lotYield } from '../src/engine/lot.js';
import { createRun, enterStep, resolveStep, walkCorridor, scrapLot } from '../src/engine/run.js';
import { LOT_TYPES } from '../src/content/lotTypes.js';
import { lotMoney, shipView, DIE_PER_LOT } from '../src/ui/shipView.js';
import { emptyNotebook, diagnosisFor, diagnoseLot } from '../src/engine/notebook.js';

const SEED = 123456;
const ROUTE = LOT_TYPES.cuLine.route;
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${label}: got ${actual}, expected ${expected} (seed ${SEED})`);

// Hand-check mode: no scatter and no drift, so yields are exact.
const handCheckRun = () => createRun({ seed: SEED, scatterStrength: 0, toolDrift: false });

// Runs a room doing nothing, then goes straight on (if the run goes on).
function idleRoom(state) {
  const after = resolveStep(enterStep(state));
  return after.corridor === null ? after : walkCorridor(after, null);
}

function playIdle(state) {
  let current = state;
  while (current.status === 'running') current = idleRoom(current);
  return current;
}

// A finished state with a flat 74% yield and 300 cash spent.
function finished(status) {
  return { ...handCheckRun(), status, cash: 1200, lot: { sites: Array(25).fill(0.74), risks: {}, flags: [] } };
}

test('a lot has 625 die: 25 wafers × 25 sites', () => {
  assert.equal(DIE_PER_LOT, 625);
});

test('cost per good die: (2000 base + 300 spent) ÷ (0.74 × 625) = 2300 ÷ 462.5 = 4.97', () => {
  const money = lotMoney(finished('shipped'));
  assert.equal(money.lotCost, 2300);
  close(money.goodDie, 462.5, 'good die');
  close(money.costPerGoodDie, 2300 / 462.5, 'cost per good die');
  assert.equal(shipView(finished('shipped')).tiles[1].value, '4.97');
});

test('a rejected lot keeps its cost per good die, marked not paid', () => {
  const tile = shipView(finished('rejected')).tiles[1];
  assert.equal(tile.value, '4.97');
  assert.match(tile.detail, /Not paid/);
});

test('the cost tile says it is for reference, not the score (M4.5 small fixes, issue 14)', () => {
  assert.equal(shipView(finished('shipped')).tiles[1].detail,
    'Lot cost 2300 ÷ 462.5 good die. For reference only: shipping at spec is what wins the run.');
});

test('event income lowers the lot cost: 1650 cash at the end → 2000 − 150 = 1850', () => {
  assert.equal(lotMoney({ ...finished('shipped'), cash: 1650 }).lotCost, 1850);
});

test('a scrapped lot ships no good die: lot cost only, no cost per good die', () => {
  const money = lotMoney(finished('scrapped'));
  assert.equal(money.goodDie, 0);
  assert.equal(money.costPerGoodDie, null);
  const view = shipView({ ...finished('scrapped'), scrappedBy: 'player' });
  assert.equal(view.tiles[1].value, 'none');
  assert.equal(view.tiles[0].label, 'Yield at scrap');   // it never shipped
});

test('stepYields: one entry per room on an idle walk, the last equal to the final yield', () => {
  const end = playIdle(handCheckRun());
  assert.equal(end.stepYields.length, ROUTE.length);
  end.stepYields.forEach((entry, index) => {
    assert.equal(entry.stepIndex, index);
    assert.equal(entry.roomId, ROUTE[index].room);
  });
  close(end.stepYields.at(-1).yieldAfter, lotYield(end.lot), 'last step yield');
  // Yield only goes down, so each step's yield is at most the one before.
  end.stepYields.forEach((entry, index) => {
    if (index > 0) assert.ok(entry.yieldAfter <= end.stepYields[index - 1].yieldAfter);
  });
  // The report's points lost add up to 100 − the final yield.
  const view = shipView(end);
  const lost = view.steps.reduce((sum, step) => sum + Number(step.lossPoints), 0);
  assert.ok(Math.abs(lost - (100 - lotYield(end.lot) * 100)) < 0.1 * ROUTE.length, `points lost ${lost}`);
  assert.equal(view.stepsNotRun, 0);
});

test('scrapLot ends the run as scrapped by the player, in a corridor', () => {
  let state = handCheckRun();
  for (let i = 0; i < 3; i += 1) state = idleRoom(state);   // steps 1–3 run and their corridors walked
  state = resolveStep(enterStep(state));                      // step 4 run; the lot stands in its corridor
  const scrapped = scrapLot(state);
  assert.equal(scrapped.status, 'scrapped');
  assert.equal(scrapped.scrappedBy, 'player');
  const view = shipView(scrapped);
  assert.match(view.verdictText, /^Scrapped by you before step 5/);
  assert.equal(view.steps.length, 4);
  assert.equal(view.stepsNotRun, ROUTE.length - 4);
  assert.throws(() => enterStep(scrapped), /run is over/);
});

test('scrapLot is refused inside a room and once the run is over', () => {
  const inRoom = enterStep(handCheckRun());
  assert.throws(() => scrapLot(inRoom), /already in a room/);
  const end = playIdle(handCheckRun());
  assert.throws(() => scrapLot(end), /run is over/);
});

test('falling below the scrap line is scrapped by the scrap line, at that step', () => {
  const start = handCheckRun();
  const pattern = ROUTE[0].realizes[0];
  const doomed = { ...start, lot: addRisk(start.lot, pattern, 5) };
  const end = resolveStep(enterStep(doomed));
  assert.equal(end.status, 'scrapped');
  assert.equal(end.scrappedBy, 'scrapLine');
  assert.match(shipView(end).verdictText, /^Scrapped at step 1, .*scrap line/);
});

test('shipView refuses a run that is still going', () => {
  assert.throws(() => shipView(handCheckRun()), /not over yet/);
});

test('after a guess the diagnose panel says where the yield went and how to spot it (right or wrong)', () => {
  const end = playIdle(createRun({ seed: 123456 }));
  assert.equal(shipView(end, emptyNotebook()).diagnose.evidence, undefined, 'nothing before the guess');
  const { rightIds, candidates } = diagnosisFor(end, emptyNotebook());
  for (const id of [candidates.find(c => rightIds.includes(c)), candidates.find(c => !rightIds.includes(c))]) {
    const done = diagnoseLot(end, emptyNotebook(), id);
    const text = shipView(done.state, done.notebook, done.result).diagnose.evidence;
    assert.match(text, /^It cost [\d.]+ yield points: .+ step \d+ \([\d.]+ points\)/, id);
    assert.match(text, /How to spot it: /, id);
  }
});
