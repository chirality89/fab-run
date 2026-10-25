// doe.test.js — checks the DOE half of the PM/DOE stop (M3 item 2d):
// doeCard in src/engine/run.js and src/engine/doe.js.
// Expected values are hand-computed (tasks/todo.md, M3 item 2d). Never edit
// one to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lotYield } from '../src/engine/lot.js';
import {
  createRun, enterStep, resolveStep, walkCorridor, playCard, pmTool, doeCard, whyCannotDoe, legalCards,
} from '../src/engine/run.js';
import { cardInRun, doeOffers } from '../src/engine/doe.js';

const SEED = 123456;
const TOLERANCE = 1e-6;
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < TOLERANCE, `${label}: got ${actual}, expected ${expected}`);

// Seed 123456: the corridor after step 2 (index 1) offers PM/DOE, and its
// DOE offers timed over-etch and measure all.
const DOE_CORRIDOR = 1;
const ETCH = 3;
const handCheckRun = () => createRun({ seed: SEED, scatterStrength: 0, toolDrift: false });

// Runs rooms doing nothing, straight on, until the lot stands in the DOE
// corridor; then takes the PM/DOE stop.
function openStop(state) {
  let current = resolveStep(enterStep(state));
  while (current.corridor < DOE_CORRIDOR) current = resolveStep(enterStep(walkCorridor(current, null)));
  return walkCorridor(current, 'pm');
}

// From a stop, plays nothing (straight on) until the lot is IN etch.
function onToEtch(state) {
  let current = state;
  while (current.stepIndex < ETCH) {
    current = resolveStep(enterStep(current));
    current = walkCorridor(current, null);
  }
  return enterStep(current);
}

test('a DOE stop offers 2–3 practices from the deck whose rooms are still ahead', () => {
  const atStop = openStop(handCheckRun());
  assert.deepEqual(atStop.pm.doeOffers, ['timedOveretch', 'measureAll'], `seed ${SEED}`);
  // After step 8 (CMP) only metrology is left: measure all is the only one.
  assert.deepEqual(doeOffers(atStop, 7), ['measureAll']);
});

test('a DOE costs 100 cash and the card then plays as its DOE version', () => {
  const atStop = openStop(handCheckRun());
  const after = doeCard(atStop, 'timedOveretch');
  assert.equal(after.cash, atStop.cash - 100);
  assert.deepEqual(after.upgraded, ['timedOveretch']);
  assert.equal(cardInRun(after, 'timedOveretch').name, 'Timed over-etch, DOE-centred');
  assert.equal(cardInRun(atStop, 'timedOveretch').name, 'Timed over-etch (+20%)', 'not upgraded before');
  assert.equal(after.rngState, atStop.rngState, 'the lot\'s generator is untouched');
});

test('one choice per stop: after a DOE no PM, after a PM no DOE', () => {
  const atStop = openStop(handCheckRun());
  const afterDoe = doeCard(atStop, 'timedOveretch');
  assert.throws(() => pmTool(afterDoe, 'cmp'), /already used/);
  assert.throws(() => doeCard(afterDoe, 'measureAll'), /already used/);
  const afterPm = pmTool(atStop, 'cmp');
  assert.match(whyCannotDoe(afterPm, 'timedOveretch'), /already used/);
});

test('doeCard refuses a card not offered, too little cash, and no stop open', () => {
  const atStop = openStop(handCheckRun());
  assert.throws(() => doeCard(atStop, 'reworkLitho'), /not offered/);
  assert.throws(() => doeCard({ ...atStop, cash: 50 }, 'timedOveretch'), /not enough cash/);
  const inRoom = enterStep(atStop);
  assert.equal(inRoom.pm, null, 'the stop closes on entering the next room');
  assert.throws(() => doeCard(inRoom, 'timedOveretch'), /no PM\/DOE stop open/);
});

test('an upgraded card is not offered again', () => {
  const upgraded = { ...openStop(handCheckRun()), upgraded: ['timedOveretch'] };
  assert.ok(!doeOffers(upgraded, DOE_CORRIDOR).includes('timedOveretch'));
});

test('the tuned measure-all costs 12 minutes', () => {
  const state = { ...handCheckRun(), upgraded: ['measureAll'] };
  assert.equal(cardInRun(state, 'measureAll').cost.time, 12);
});

// Hand check (tasks/todo.md, M3 item 2d): scatter off, drift off. DOE the
// timed over-etch after step 2, then play it at etch. Underlayer attack is
// 0.05 × 1.25 = 0.0625 instead of 0.05 × 1.5 = 0.075. It is an even
// pattern, so yield after etch = the plain card's result × e^(0.0125)
// = × 1.012578. Residue ×0.3 is the same in both.
test('hand check: the DOE-centred over-etch gives × 1.012578 after etch', () => {
  const atStop = openStop(handCheckRun());
  const plain = onToEtch(atStop);   // the same stop, left without a choice
  const tuned = onToEtch(doeCard(atStop, 'timedOveretch'));
  assert.ok(legalCards(tuned).includes('timedOveretch'), `seed ${SEED}`);
  close(tuned.lot.risks.underlayer_attack, 0.05, 'underlayer attack before playing');
  const plainAfter = resolveStep(playCard(plain, 'timedOveretch'));
  const tunedAfter = resolveStep(playCard(tuned, 'timedOveretch'));
  close(lotYield(tunedAfter.lot) / lotYield(plainAfter.lot), 1.012578, `yield ratio (seed ${SEED})`);
});
