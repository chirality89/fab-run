// view.test.js — checks the display data in src/ui/view.js (no browser).
// Expected values are hand-computed (tasks/todo.md, M2 item 1). Never edit
// one to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, enterStep, resolveStep, fullPool, whyIllegal } from '../src/engine/run.js';
import { lotYield } from '../src/engine/lot.js';
import { roomView, siteBand, yieldBand, parseSeed } from '../src/ui/view.js';

const SEED = 123456;
const TOLERANCE = 1e-6;
const ETCH = 3;   // 0-based step index of etch on the cuLine route
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < TOLERANCE, `${label}: got ${actual}, expected ${expected} (seed ${SEED})`);

// Seed 123456, scatter off, nothing played, until the lot is IN etch.
function idleToEtch(changes = {}) {
  let state = createRun({ seed: SEED, scatterStrength: 0, ...changes });
  while (state.stepIndex < ETCH) state = resolveStep(enterStep(state));
  return enterStep(state);
}

test('yield at etch: 0.913931 raw, shown as 91.4', () => {
  const inEtch = idleToEtch();
  close(lotYield(inEtch.lot), 0.913931, 'raw yield e^(-0.09)');
  assert.equal(roomView(inEtch).yieldPercent, 91.4, `seed ${SEED}`);
});

test('expected loss at etch: 22.8610 points, text says 22.9', () => {
  const view = roomView(idleToEtch());
  assert.ok(Math.abs(view.expectedLossPoints - 22.8610) < 1e-4,
    `expected loss: got ${view.expectedLossPoints}, expected 22.8610 (seed ${SEED})`);
  assert.equal(view.expectedLossText, 'This room will cost about 22.9 points of yield if nothing changes.');
});

test('room header: etch, step 4 of 9, seed shown equals the run seed', () => {
  const view = roomView(idleToEtch());
  assert.equal(view.roomId, 'etch');
  assert.equal(view.roomName, 'Etch');
  assert.equal(view.stepNumber, 4);
  assert.equal(view.stepCount, 9);
  assert.equal(view.seed, SEED);
  assert.equal(view.timeLeft, 8);
  assert.equal(view.budget, 8);
  assert.equal(view.toolHealth, 100);
  assert.equal(view.scrapLine, 40);
  assert.equal(view.spec, 70);
});

test('starter deck: hand is timed over-etch only, playable; etch slots empty', () => {
  const view = roomView(idleToEtch());
  assert.deepEqual(view.hand.map(card => card.id), ['timedOveretch']);
  const card = view.hand[0];
  assert.equal(card.playable, true);
  assert.equal(card.reason, null);
  assert.equal(card.minutes, 4);
  assert.equal(card.cash, 0);
  assert.ok(card.summary.length > 0);
  assert.deepEqual(view.slots, [], 'the i-line resist sits in litho, not etch');
});

test('full pool: endpoint etch shows as not playable, with a reason', () => {
  const view = roomView(idleToEtch({ deck: fullPool() }));
  const endpoint = view.hand.find(card => card.id === 'endpointEtch');
  assert.ok(endpoint, 'endpointEtch is in the hand');
  assert.equal(endpoint.playable, false);
  assert.match(endpoint.reason, /endpoint detector/);
});

test('25 sites, each in 0..1 with a band', () => {
  const view = roomView(idleToEtch());
  assert.equal(view.sites.length, 25);
  for (const site of view.sites) {
    assert.ok(site.value >= 0 && site.value <= 1, `site ${site.value} (seed ${SEED})`);
    assert.equal(site.band, siteBand(site.value));
  }
});

test('site bands: 90% and up pass, 70% to under 90% warn, below 70% fail', () => {
  assert.equal(siteBand(0.95), 'pass');
  assert.equal(siteBand(0.90), 'pass');
  assert.equal(siteBand(0.80), 'warn');
  assert.equal(siteBand(0.70), 'warn');
  assert.equal(siteBand(0.69), 'fail');
});

test('parseSeed: digits give that seed, anything else the fallback', () => {
  assert.equal(parseSeed('?seed=123456', 7), 123456);
  assert.equal(parseSeed('?seed=abc', 7), 7);
  assert.equal(parseSeed('', 7), 7);
  assert.equal(parseSeed('?seed=-5', 7), 7);
  assert.equal(parseSeed('?seed=99999999999', 7), 7, 'too big for a 32-bit seed');
});

test('whyIllegal says "its condition is not met" for endpoint etch without the detector', () => {
  // view.js turns exactly this text into "Needs the Optical endpoint detector".
  const inEtch = idleToEtch({ deck: fullPool() });
  assert.equal(whyIllegal(inEtch, 'endpointEtch'), 'its condition is not met', `seed ${SEED}`);
});

test('yield band uses the raw fraction, not the rounded percent', () => {
  assert.equal(yieldBand(0.70), 'ok');
  assert.equal(yieldBand(0.6996), 'warn', 'shows as 70.0% but is below the spec');
  assert.equal(yieldBand(0.40), 'warn');
  assert.equal(yieldBand(0.3996), 'bad', 'shows as 40.0% but is below the scrap line');
  const view = roomView(idleToEtch());
  close(view.yieldFraction, 0.913931, 'yieldFraction');
  assert.equal(view.yieldBand, 'ok');
});

test('site band agrees with the printed percent', () => {
  assert.equal(siteBand(0.8999), 'warn', 'prints 89');
  assert.equal(siteBand(0.6999), 'fail', 'prints 69');
});

test('wafer map legend is built from the balance numbers', () => {
  assert.equal(roomView(idleToEtch()).mapKeyText,
    'Each site: % of the 25 wafers still good there. Pass 90%+, warning 70–89%, fail under 70%.');
});
