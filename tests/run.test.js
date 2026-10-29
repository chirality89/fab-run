// run.test.js — checks the run rules in src/engine/run.js.
// Expected values are hand-computed (tasks/todo.md, M1 item 6). Never edit
// one to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addRisk, lotYield } from '../src/engine/lot.js';
import {
  createRun, enterStep, legalCards, playCard, resolveStep, walkCorridor,
  starterDeck, fullPool, defaultLoadout, slotEntry,
} from '../src/engine/run.js';
import { PRACTICES } from '../src/content/content.js';

const SEED = 123456;

// The etch-hand tests name their deck instead of using fullPool(), so new
// etch cards in content.js don't change the hand they check. preclean is a
// deposition card, there to test "not in hand".
const ETCH_TEST_DECK = ['timedOveretch', 'endpointEtch', 'preclean'];
const TOLERANCE = 1e-6;
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < TOLERANCE, `${label}: got ${actual}, expected ${expected} (seed ${SEED})`);

// cuLine step numbers (0-based index into the route).
const LITHO = 2;
const ETCH = 3;
const METRO = 8;

// Runs a room doing nothing, then goes straight on through the corridor
// after it (if the run is still going).
function idleRoom(state) {
  const after = resolveStep(enterStep(state));
  return after.corridor === null ? after : walkCorridor(after, null);
}

// Walks the route playing nothing until the lot is IN the given step's room.
function enterStepNumber(state, stepIndex) {
  let current = state;
  while (current.stepIndex < stepIndex) current = idleRoom(current);
  return enterStep(current);
}

// Plays the whole route doing nothing.
function playIdle(state) {
  let current = state;
  while (current.status === 'running') current = idleRoom(current);
  return current;
}

const scatterOff = (changes = {}) => createRun({ seed: SEED, scatterStrength: 0, toolDrift: false, ...changes });

test('createRun: defaults are the cuLine, the starter deck, i-line resist loaded free', () => {
  const state = createRun({ seed: SEED });
  assert.equal(state.seed, SEED);
  assert.equal(state.rngState, SEED);
  assert.equal(state.lotTypeId, 'cuLine');
  // measureAll is a starter card but is not dealt yet (run.js NOT_DEALT_YET).
  assert.deepEqual(state.deck, [
    'timedOveretch', 'reworkLitho', 'extraDiRinse', 'chamberPurge', 'doseTrimSpc',
  ]);
  assert.deepEqual(state.deck, starterDeck());
  assert.deepEqual(state.slots, { resist: { id: 'resistIline', shelfLife: 8, decay: 1 } });
  assert.equal(state.cash, 1500);
  assert.deepEqual(state.lotTraits, ['narrowFeatures', 'copperLine']);
  assert.deepEqual(state.lot.risks, { depth_variation: 0.042, dishing: 0.056 });
  assert.equal(createRun({ seed: SEED, toolDrift: false }).tools.etch.health, 100, 'with drift off, tools start at 100');
  assert.equal(state.status, 'running');
  assert.equal(state.room, null);
});

test('createRun refuses a bad seed, an unknown lot type and an unknown card', () => {
  assert.throws(() => createRun({ seed: -1 }), /seed/);
  assert.throws(() => createRun({ seed: 1, lotTypeId: 'nope' }), /nope/);
  assert.throws(() => createRun({ seed: 1, deck: ['nopeCard'] }), /nopeCard/);
});

test('fullPool holds every practice', () => {
  assert.equal(fullPool().length, PRACTICES.length);
  assert.ok(fullPool().includes('endpointEtch'));
});

// Hand check (independent python model of the route, 29 Oct 2026): 0.690471
// before pre-wet and pad conditioning became route steps, 0.701678 after,
// 0.723578 once etch's own risks and its carried-in depth variation were cut
// by a quarter. With drift off this lot ships (spec 0.70); with drift on, a
// do-nothing lot almost always fails (npm run exit-check).
test('idle, scatter and drift off: yield 0.723578, shipped (spec 70%), cash 1500, 0 minutes played', () => {
  const end = playIdle(scatterOff());
  close(lotYield(end.lot), 0.723578, 'yield');
  assert.equal(end.status, 'shipped');
  assert.equal(end.cash, 1500);
  assert.equal(end.minutesUsed, 0);
});

test('idle, scatter off: cycle time 133 (litho 30 + 5 given back by the i-line resist; David OK 24 Oct 2026)', () => {
  const end = playIdle(scatterOff());
  assert.equal(end.cycleTime, 133, `seed ${SEED}`);
});

test('enterStep adds the step risks and deals only cards for this room', () => {
  const inEtch = enterStepNumber(scatterOff({ deck: ETCH_TEST_DECK }), ETCH);
  close(inEtch.lot.risks.residue, 0.021, 'residue');
  close(inEtch.lot.risks.underlayer_attack, 0.016, 'underlayer_attack');
  assert.deepEqual([...inEtch.hand].sort(), ['endpointEtch', 'timedOveretch']);
  assert.equal(inEtch.room.timeLeft, 8);
});

test('equipment acts once on entering its room: endpoint detector', () => {
  const loadout = { equipment: ['oesEndpoint'], slots: {} };
  const inLitho = enterStepNumber(scatterOff({ loadout }), LITHO);
  assert.deepEqual(inLitho.enabled, [], 'not applied outside etch');
  const inEtch = enterStepNumber(scatterOff({ loadout }), ETCH);
  close(inEtch.lot.risks.depth_variation, 0.0294, 'depth_variation 0.042 × 0.7');
  assert.deepEqual(inEtch.enabled, ['endpointEtch']);
});

test('timedOveretch costs 4 minutes and scales residue ×0.3, underlayer attack ×2', () => {
  const inEtch = enterStepNumber(scatterOff(), ETCH);
  assert.deepEqual(legalCards(inEtch), ['timedOveretch']);
  const after = playCard(inEtch, 'timedOveretch');
  assert.equal(after.room.timeLeft, 4);
  close(after.lot.risks.residue, 0.0063, 'residue');   // 0.021 × 0.3
  close(after.lot.risks.underlayer_attack, 0.032, 'underlayer_attack');   // 0.016 × 2
  assert.deepEqual(after.hand, []);
  assert.equal(resolveStep(after).minutesUsed, 4);
});

// measureAll is not dealt yet (NOT_DEALT_YET), but the card still works
// when a deck holds it, so these tests give it one.
test('measureAll pays its base cash and time', () => {
  const inMetro = enterStepNumber(scatterOff({ deck: ['measureAll'] }), METRO);
  const after = playCard(inMetro, 'measureAll');
  assert.equal(after.cash, 1350);
  assert.equal(after.room.timeLeft, 0);
  assert.deepEqual(after.room.revealed, ['allSites']);
});

test('illegal cards are refused with an error naming the card', () => {
  const inEtch = enterStepNumber(scatterOff({ deck: ETCH_TEST_DECK }), ETCH);
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
  const inMetro = enterStepNumber(scatterOff({ deck: ['measureAll'] }), METRO);
  assert.throws(() => playCard({ ...inMetro, cash: 100 }, 'measureAll'), /measureAll.*cash/);
});

test('with the detector installed, endpoint etch becomes legal', () => {
  const loadout = { ...defaultLoadout(), equipment: ['oesEndpoint'] };
  const inEtch = enterStepNumber(scatterOff({ deck: ETCH_TEST_DECK, loadout }), ETCH);
  assert.deepEqual([...legalCards(inEtch)].sort(), ['endpointEtch', 'timedOveretch']);
});

test('a card that an item enables is refused until it is enabled', () => {
  const loadout = { ...defaultLoadout(), equipment: ['oesEndpoint'] };
  const inEtch = enterStepNumber(scatterOff({ deck: ETCH_TEST_DECK, loadout }), ETCH);
  assert.throws(() => playCard({ ...inEtch, enabled: [] }, 'endpointEtch'), /endpointEtch.*not enabled/);
});

test('strip and re-expose is never legal yet (lastStepWasLitho is not set by anything)', () => {
  const inLitho = enterStepNumber(scatterOff(), LITHO);
  // Litho's starter practices: strip and re-expose, and the dose trim (seeded hand order).
  assert.deepEqual(inLitho.hand, ['reworkLitho', 'doseTrimSpc']);
  assert.deepEqual(legalCards(inLitho), ['doseTrimSpc']);
});

test('scrap: yield below 0.40 mid-route stops the run there', () => {
  // Heavy particles added to the lot in the first room: e^(−1.007) ≈ 0.365.
  const inClean = enterStepNumber(scatterOff(), 0);
  const dirty = { ...inClean, lot: addRisk(inClean.lot, 'particles', 1.0) };
  const end = resolveStep(dirty);
  assert.equal(end.status, 'scrapped');
  assert.equal(end.stepIndex, 0);
  close(lotYield(end.lot), Math.exp(-1.007), 'yield');
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

// --- M3 item 1: corridors and side stops ---------------------------------
// Hand check (tasks/todo.md, M3 item 1). The corridor after step 5 (index 4,
// "Resist strip + wet clean") is the Q-time window. Going straight on, the
// lot carries qtime_oxide 0.028 into step 6 (base risks cut to 70%, 28 Oct 2026).
// A 40-minute PM stop there adds 0.001 × 40 = 0.04 more, so 0.068. qtime_oxide is an even pattern (weight 1
// at every site), so every site, and the final yield, is × e^(−0.04).

const QTIME_CORRIDOR = 4;

// The first seed from SEED up whose Q-time corridor offers PM. Scatter is
// off in these tests, so which seed it is doesn't change the yield.
function seedWithPmInQtimeCorridor() {
  for (let seed = SEED; seed < SEED + 1000; seed++) {
    if (createRun({ seed }).map[QTIME_CORRIDOR].offers.includes('pm')) return seed;
  }
  throw new Error('no seed near SEED offers PM in the Q-time corridor');
}

// Plays the whole route doing nothing, taking `stopKind` in one corridor
// and going straight on everywhere else.
function playIdleWithStop(state, corridorIndex, stopKind) {
  let current = state;
  while (current.status === 'running') {
    current = resolveStep(enterStep(current));
    if (current.corridor === null) continue;
    current = walkCorridor(current, current.corridor === corridorIndex ? stopKind : null);
  }
  return current;
}

test('after a room the lot stands in the corridor; enterStep waits for walkCorridor', () => {
  const afterClean = resolveStep(enterStep(scatterOff()));
  assert.equal(afterClean.corridor, 0, `seed ${SEED}`);
  assert.throws(() => enterStep(afterClean), /still in a corridor/);
  const walked = walkCorridor(afterClean, null);
  assert.equal(walked.corridor, null);
  assert.equal(walked.map[0].walked, true);
  assert.equal(walked.map[0].taken, null);
  assert.equal(walked.cycleTime, afterClean.cycleTime, 'straight on costs no time');
});

test('a side stop costs its minutes and is marked on the map', () => {
  const afterClean = resolveStep(enterStep(scatterOff()));
  const kind = afterClean.map[0].offers[0];
  const minutes = { metrology: 20, pm: 40, procurement: 10, event: 10 }[kind];
  const walked = walkCorridor(afterClean, kind);
  assert.equal(walked.cycleTime, afterClean.cycleTime + minutes, `${kind}, seed ${SEED}`);
  assert.equal(walked.map[0].taken, kind);
  assert.deepEqual(walked.lot, afterClean.lot, 'outside a Q-time corridor the lot is untouched');
});

test('walkCorridor refuses a stop that is not offered, or no corridor', () => {
  const afterClean = resolveStep(enterStep(scatterOff()));
  const missing = ['metrology', 'pm', 'procurement', 'event'].find(kind => !afterClean.map[0].offers.includes(kind));
  if (missing) assert.throws(() => walkCorridor(afterClean, missing), /not offered/);
  assert.throws(() => walkCorridor(afterClean, 'cafeteria'), /not offered/);
  assert.throws(() => walkCorridor(scatterOff(), null), /not in a corridor/);
  const inClean = enterStep(scatterOff());
  assert.throws(() => walkCorridor(inClean, null), /not in a corridor/);
});

test('the last room ends the run with no corridor after it', () => {
  const end = playIdle(scatterOff());
  assert.equal(end.corridor, null);
  assert.ok(end.map.every(corridor => corridor.walked), 'all 8 corridors walked');
  assert.throws(() => walkCorridor(end, null), /over/);
});

test('PM in the Q-time corridor: qtime_oxide 0.068, final yield × e^(−0.04), +40 min', () => {
  const seed = seedWithPmInQtimeCorridor();
  const start = createRun({ seed, scatterStrength: 0, toolDrift: false });
  const straight = playIdle(start);
  const withPm = playIdleWithStop(start, QTIME_CORRIDOR, 'pm');
  close(lotYield(straight.lot), 0.723578, `straight on everywhere is today's idle run (seed ${seed})`);
  close(lotYield(withPm.lot) / lotYield(straight.lot), 0.960789, `yield ratio e^(-0.04) (seed ${seed})`);
  assert.equal(withPm.cycleTime, straight.cycleTime + 40, `seed ${seed}`);

  // The risk itself, just after the stop and before step 6 realizes it.
  const atStop = walkCorridor(resolveStep(enterStepNumber(start, QTIME_CORRIDOR)), 'pm');
  close(atStop.lot.risks.qtime_oxide, 0.068, `qtime_oxide after a PM stop (seed ${seed})`);
});
