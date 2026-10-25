// run.test.js — checks the run rules in src/engine/run.js.
// Expected values are hand-computed (tasks/todo.md, M1 item 6). Never edit
// one to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addRisk, lotYield } from '../src/engine/lot.js';
import {
  createRun, enterStep, legalCards, playCard, resolveStep,
  starterDeck, fullPool, defaultLoadout, slotEntry,
} from '../src/engine/run.js';

const SEED = 123456;
const TOLERANCE = 1e-6;
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < TOLERANCE, `${label}: got ${actual}, expected ${expected} (seed ${SEED})`);

// cuLine step numbers (0-based index into the route).
const LITHO = 2;
const ETCH = 3;
const METRO = 8;

// Walks the route playing nothing until the lot is IN the given step's room.
function enterStepNumber(state, stepIndex) {
  let current = state;
  while (current.stepIndex < stepIndex) current = resolveStep(enterStep(current));
  return enterStep(current);
}

// Plays the whole route doing nothing.
function playIdle(state) {
  let current = state;
  while (current.status === 'running') current = resolveStep(enterStep(current));
  return current;
}

const scatterOff = (changes = {}) => createRun({ seed: SEED, scatterStrength: 0, ...changes });

test('createRun: defaults are the cuLine, the starter deck, i-line resist loaded free', () => {
  const state = createRun({ seed: SEED });
  assert.equal(state.seed, SEED);
  assert.equal(state.rngState, SEED);
  assert.equal(state.lotTypeId, 'cuLine');
  assert.deepEqual(state.deck, ['timedOveretch', 'measureAll', 'reworkLitho']);
  assert.deepEqual(state.deck, starterDeck());
  assert.deepEqual(state.slots, { resist: { id: 'resistIline', shelfLife: 8, decay: 1 } });
  assert.equal(state.cash, 1500);
  assert.deepEqual(state.lotTraits, ['narrowFeatures']);
  assert.deepEqual(state.lot.risks, { depth_variation: 0.08, dishing: 0.08 });
  assert.equal(state.tools.etch.health, 100);
  assert.equal(state.status, 'running');
  assert.equal(state.room, null);
});

test('createRun refuses a bad seed, an unknown lot type and an unknown card', () => {
  assert.throws(() => createRun({ seed: -1 }), /seed/);
  assert.throws(() => createRun({ seed: 1, lotTypeId: 'nope' }), /nope/);
  assert.throws(() => createRun({ seed: 1, deck: ['nopeCard'] }), /nopeCard/);
});

test('fullPool holds every practice', () => {
  assert.equal(fullPool().length, 10);
  assert.ok(fullPool().includes('endpointEtch'));
});

test('idle, scatter off: yield 0.517954, rejected, cash 1500, 0 minutes played', () => {
  const end = playIdle(scatterOff());
  close(lotYield(end.lot), 0.517954, 'yield');
  assert.equal(end.status, 'rejected');
  assert.equal(end.cash, 1500);
  assert.equal(end.minutesUsed, 0);
});

test('idle, scatter off: cycle time 133 (litho 30 + 5 given back by the i-line resist; David OK 24 Oct 2026)', () => {
  const end = playIdle(scatterOff());
  assert.equal(end.cycleTime, 133, `seed ${SEED}`);
});

test('enterStep adds the step risks and deals only cards for this room', () => {
  const inEtch = enterStepNumber(scatterOff({ deck: fullPool() }), ETCH);
  close(inEtch.lot.risks.residue, 0.10, 'residue');
  close(inEtch.lot.risks.underlayer_attack, 0.05, 'underlayer_attack');
  assert.deepEqual([...inEtch.hand].sort(), ['endpointEtch', 'timedOveretch']);
  assert.equal(inEtch.room.timeLeft, 8);
});

test('equipment acts once on entering its room: endpoint detector', () => {
  const loadout = { equipment: ['oesEndpoint'], slots: {} };
  const inLitho = enterStepNumber(scatterOff({ loadout }), LITHO);
  assert.deepEqual(inLitho.enabled, [], 'not applied outside etch');
  const inEtch = enterStepNumber(scatterOff({ loadout }), ETCH);
  close(inEtch.lot.risks.depth_variation, 0.056, 'depth_variation 0.08 × 0.7');
  assert.deepEqual(inEtch.enabled, ['endpointEtch']);
});

test('timedOveretch costs 4 minutes and scales residue ×0.3, underlayer attack ×1.5', () => {
  const inEtch = enterStepNumber(scatterOff(), ETCH);
  assert.deepEqual(legalCards(inEtch), ['timedOveretch']);
  const after = playCard(inEtch, 'timedOveretch');
  assert.equal(after.room.timeLeft, 4);
  close(after.lot.risks.residue, 0.03, 'residue');
  close(after.lot.risks.underlayer_attack, 0.075, 'underlayer_attack');
  assert.deepEqual(after.hand, []);
  assert.equal(resolveStep(after).minutesUsed, 4);
});

test('measureAll pays its base cash and time', () => {
  const inMetro = enterStepNumber(scatterOff(), METRO);
  const after = playCard(inMetro, 'measureAll');
  assert.equal(after.cash, 1350);
  assert.equal(after.room.timeLeft, 0);
  assert.deepEqual(after.room.revealed, ['allSites']);
});

test('illegal cards are refused with an error naming the card', () => {
  const inEtch = enterStepNumber(scatterOff({ deck: fullPool() }), ETCH);
  // `when` not met: endpoint etch without the detector.
  assert.deepEqual(legalCards(inEtch), ['timedOveretch']);
  assert.throws(() => playCard(inEtch, 'endpointEtch'), /endpointEtch.*condition/);
  // Not in hand.
  assert.throws(() => playCard(inEtch, 'preclean'), /preclean.*not in hand/);
  // Wrong room (forced into the hand, which a deal never does).
  assert.throws(() => playCard({ ...inEtch, hand: ['preclean'] }, 'preclean'), /preclean.*dep/);
  // Not enough time.
  const shortOfTime = { ...inEtch, room: { ...inEtch.room, timeLeft: 3 } };
  assert.throws(() => playCard(shortOfTime, 'timedOveretch'), /timedOveretch.*time/);
  // Not enough cash.
  const inMetro = enterStepNumber(scatterOff(), METRO);
  assert.throws(() => playCard({ ...inMetro, cash: 100 }, 'measureAll'), /measureAll.*cash/);
});

test('with the detector installed, endpoint etch becomes legal', () => {
  const loadout = { ...defaultLoadout(), equipment: ['oesEndpoint'] };
  const inEtch = enterStepNumber(scatterOff({ deck: fullPool(), loadout }), ETCH);
  assert.deepEqual([...legalCards(inEtch)].sort(), ['endpointEtch', 'timedOveretch']);
});

test('a card that an item enables is refused until it is enabled', () => {
  const loadout = { ...defaultLoadout(), equipment: ['oesEndpoint'] };
  const inEtch = enterStepNumber(scatterOff({ deck: fullPool(), loadout }), ETCH);
  assert.throws(() => playCard({ ...inEtch, enabled: [] }, 'endpointEtch'), /endpointEtch.*not enabled/);
});

test('strip and re-expose is never legal yet (lastStepWasLitho is not set by anything)', () => {
  const inLitho = enterStepNumber(scatterOff(), LITHO);
  assert.deepEqual(inLitho.hand, ['reworkLitho']);
  assert.deepEqual(legalCards(inLitho), []);
});

test('scrap: yield below 0.40 mid-route stops the run there', () => {
  // Heavy particles added to the lot in the first room: e^(−1.01) ≈ 0.364.
  const inClean = enterStepNumber(scatterOff(), 0);
  const dirty = { ...inClean, lot: addRisk(inClean.lot, 'particles', 1.0) };
  const end = resolveStep(dirty);
  assert.equal(end.status, 'scrapped');
  assert.equal(end.stepIndex, 0);
  close(lotYield(end.lot), Math.exp(-1.01), 'yield');
  assert.throws(() => enterStep(end), /over/);
  assert.throws(() => playCard(end, 'timedOveretch'), /over/);
  assert.throws(() => resolveStep(end), /over/);
});

test('a finished run refuses further calls; calls out of order throw', () => {
  const end = playIdle(scatterOff());
  assert.throws(() => enterStep(end), /over/);
  assert.throws(() => resolveStep(end), /over/);
  assert.deepEqual(legalCards(end), []);
  const start = scatterOff();
  assert.throws(() => resolveStep(start), /not in a room/);
  assert.throws(() => playCard(start, 'timedOveretch'), /not in a room/);
  assert.throws(() => enterStep(enterStep(start)), /already in a room/);
});

test('nothing is changed in place', () => {
  const start = scatterOff();
  const before = structuredClone(start);
  playIdle(start);
  assert.deepEqual(start, before);
  const inEtch = enterStepNumber(start, ETCH);
  const etchBefore = structuredClone(inEtch);
  playCard(inEtch, 'timedOveretch');
  assert.deepEqual(inEtch, etchBefore);
});

test('slotEntry builds the slot shape resolve.js expects', () => {
  assert.deepEqual(slotEntry('additiveBath'), { id: 'additiveBath', shelfLife: null, decay: 1 });
  assert.throws(() => slotEntry('nope'), /nope/);
});
