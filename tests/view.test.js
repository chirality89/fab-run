// view.test.js — checks the display data in src/ui/view.js (no browser).
// Expected values are hand-computed (tasks/todo.md, M2 items 1 and 2). Never edit
// one to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createRun, enterStep, resolveStep, playCard, walkCorridor, buyItem, fullPool, whyIllegal,
} from '../src/engine/run.js';
import { lotYield } from '../src/engine/lot.js';
import { seedSellingTestItems } from './shopSeed.js';
import { roomView, resultView, mapView, stopView, shopView, siteBand, yieldBand, parseSeed } from '../src/ui/view.js';

const SEED = 123456;
const TOLERANCE = 1e-6;
const ETCH = 3;   // 0-based step index of etch on the cuLine route
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < TOLERANCE, `${label}: got ${actual}, expected ${expected} (seed ${SEED})`);

// Runs a room doing nothing, then goes straight on through the corridor
// after it (if the run is still going).
function idleRoom(state) {
  const after = resolveStep(enterStep(state));
  return after.corridor === null ? after : walkCorridor(after, null);
}

// Seed 123456, scatter off, nothing played, until the lot is IN etch.
function idleToEtch(changes = {}) {
  let state = createRun({ seed: SEED, scatterStrength: 0, toolDrift: false, ...changes });
  while (state.stepIndex < ETCH) state = idleRoom(state);
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

// --- M2 item 2: playing a card and running the room ---------------------
// Hand check in tasks/todo.md (M2 item 2). Over-etch: residue x 0.3,
// underlayer attack x 1.5, so the even part of the etch exponent is 0.115.

test('playing timed over-etch: 4 of 8 min left, card leaves the hand', () => {
  const view = roomView(playCard(idleToEtch(), 'timedOveretch'));
  assert.equal(view.timeLeft, 4, `seed ${SEED}`);
  assert.equal(view.budget, 8);
  assert.deepEqual(view.hand, []);
});

test('playing timed over-etch: expected loss drops from 22.9 to 19.7 points', () => {
  const view = roomView(playCard(idleToEtch(), 'timedOveretch'));
  assert.ok(Math.abs(view.expectedLossPoints - 19.7066) < 1e-4,
    `expected loss: got ${view.expectedLossPoints}, expected 19.7066 (seed ${SEED})`);
  assert.equal(view.expectedLossText, 'This room will cost about 19.7 points of yield if nothing changes.');
});

test('run etch with nothing played: 91.4% -> 68.5%, 22.9 points lost', () => {
  const before = idleToEtch();
  const view = resultView(before, resolveStep(before));
  assert.equal(view.yieldBeforePercent, 91.4, `seed ${SEED}`);
  assert.equal(view.yieldAfterPercent, 68.5);
  close(view.yieldAfterFraction, 0.685321, 'yield after etch, idle');
  assert.equal(view.lossText, 'This room cost 22.9 points of yield.');
  assert.equal(view.yieldBand, 'warn', 'below the 70% spec, above the scrap line');
  assert.equal(view.status, 'running');
  assert.equal(view.outcomeText, 'The lot moves on to step 5: Resist strip + wet clean.');
  assert.equal(view.sites.length, 25);
});

test('run etch after timed over-etch: 91.4% -> 71.7%, 19.7 points lost', () => {
  const before = playCard(idleToEtch(), 'timedOveretch');
  const view = resultView(before, resolveStep(before));
  assert.equal(view.yieldAfterPercent, 71.7, `seed ${SEED}`);
  close(view.yieldAfterFraction, 0.716865, 'yield after etch, over-etch');
  assert.equal(view.lossText, 'This room cost 19.7 points of yield.');
});

test('resultView names the scrap when the lot dies', () => {
  const before = idleToEtch();
  const scrapped = { ...resolveStep(before), status: 'scrapped' };
  assert.equal(resultView(before, scrapped).outcomeText,
    'Lot scrapped: yield fell below the scrap line (40%).');
});

// --- M3 item 1: the floor-plan map ----------------------------------------

test('map at the start: lot at the door, bay 1 next, no side stops', () => {
  const view = mapView(createRun({ seed: SEED, scatterStrength: 0, toolDrift: false }));
  assert.equal(view.position, 'start');
  assert.equal(view.bays.length, 9);
  assert.deepEqual(view.bays.map(bay => bay.status), ['next', ...Array(8).fill('ahead')]);
  assert.equal(view.corridors.length, 8);
  assert.deepEqual(view.offers, []);
  assert.equal(view.qtimeText, null);
  assert.equal(view.goText, 'Enter step 1: Wet clean');
  assert.equal(view.seed, SEED);
});

test('map in the corridor after step 1: its offers, bay 1 done, bay 2 next', () => {
  const inCorridor = resolveStep(enterStep(createRun({ seed: SEED, scatterStrength: 0, toolDrift: false })));
  const view = mapView(inCorridor);
  assert.equal(view.position, 'corridor');
  assert.deepEqual(view.offers.map(offer => offer.kind), inCorridor.map[0].offers, `seed ${SEED}`);
  assert.deepEqual(view.bays.slice(0, 3).map(bay => bay.status), ['done', 'next', 'ahead']);
  assert.equal(view.corridors[0].here, true);
  assert.equal(view.goText, 'Go straight to step 2: Deposition (SiN + oxide)');
  for (const offer of view.offers) assert.equal(offer.qtimeRisk, 0, 'not a Q-time corridor');
});

test('map in the Q-time corridor: warning shown, each stop shows its oxide risk', () => {
  let state = createRun({ seed: SEED, scatterStrength: 0, toolDrift: false });
  while (state.stepIndex < 4) state = idleRoom(state);
  const view = mapView(resolveStep(enterStep(state)));
  assert.match(view.qtimeText, /Q-time window/);
  assert.equal(view.corridors[4].qtime, true);
  for (const offer of view.offers) {
    close(offer.qtimeRisk, 0.001 * offer.minutes, `${offer.kind} risk (seed ${SEED})`);
  }
});

test('stopView: names the stop and its minutes, and the step that comes next', () => {
  const inCorridor = resolveStep(enterStep(createRun({ seed: SEED, scatterStrength: 0, toolDrift: false })));
  const kind = inCorridor.map[0].offers[0];
  const view = stopView(inCorridor, walkCorridor(inCorridor, kind), kind);
  const minutes = { metrology: 20, pm: 40, procurement: 10, event: 10 }[kind];
  assert.equal(view.minutes, minutes, `${kind}, seed ${SEED}`);
  assert.match(view.text, new RegExp(`cost ${minutes} min`));
  assert.equal(view.goText, 'Continue to step 2: Deposition (SiN + oxide)');
});

test('mapView refuses to draw while the lot is in a room', () => {
  assert.throws(() => mapView(enterStep(createRun({ seed: SEED }))), /in a room/);
});

// --- the procurement stop (M3 item 2a) -------------------------------------
// SHOP_SEED: the first seed from 123456 up whose corridor after step 2
// offers procurement and sells the pad conditioner, the DUV resist and the
// thick resist (tests/shopSeed.js). Searched, so new content can't break it.
const SHOP_SEED = seedSellingTestItems();

function shopAfterStep2() {
  const afterStep1 = walkCorridor(resolveStep(enterStep(createRun({ seed: SHOP_SEED }))), null);
  return walkCorridor(resolveStep(enterStep(afterStep1)), 'procurement');
}

test('shopView: 3 items with price, kind, room, tradeoff and where each acts next', () => {
  const view = shopView(shopAfterStep2());
  assert.equal(view.cash, 1500);
  assert.equal(view.goText, 'Continue to step 3: Litho (trench)');
  assert.deepEqual(view.items.map(item => item.id), ['padConditioner', 'resistCAR', 'resistThick'], `seed ${SHOP_SEED}`);
  const [pad, car] = view.items;
  assert.equal(pad.kindText, 'Equipment');
  assert.equal(pad.roomName, 'CMP');
  assert.equal(pad.price, 350);
  assert.equal(pad.nextUseText, 'Next used at step 8: CMP');
  assert.equal(pad.replacesText, null);
  assert.equal(car.kindText, 'Material, resist slot');
  assert.equal(car.nextUseText, 'Next used at step 3: Litho (trench)');
  assert.equal(car.replacesText, 'Replaces the i-line positive resist');
  assert.ok(view.items.every(item => item.buyable && item.reason === null && item.tradeoff));
});

test('shopView after buying: cash drops, the item says Bought, the other resist replaces it', () => {
  const view = shopView(buyItem(shopAfterStep2(), 'resistCAR'));
  assert.equal(view.cash, 1360);
  const car = view.items.find(item => item.id === 'resistCAR');
  assert.equal(car.bought, true);
  assert.equal(car.buyable, false);
  assert.equal(car.reason, 'Bought');
  const thick = view.items.find(item => item.id === 'resistThick');
  assert.equal(thick.replacesText, 'Replaces the Chemically amplified DUV resist');
});

test('shopView: an item you cannot afford says so', () => {
  const view = shopView({ ...shopAfterStep2(), cash: 100 });
  const pad = view.items.find(item => item.id === 'padConditioner');
  assert.equal(pad.buyable, false);
  assert.equal(pad.reason, 'Not enough cash');
});

test('a bought item shows in its room\'s Slots panel', () => {
  let state = buyItem(shopAfterStep2(), 'resistCAR');
  state = enterStep(state);   // step 3, litho
  assert.deepEqual(roomView(state).slots.map(item => item.id), ['resistCAR']);
});

// --- the SPC chart (M3 item 2b) ---------------------------------------------

test('spcView: etch rate in nm/min with centre, control and spec limits in units', () => {
  const state = idleToEtch();   // drift off, so the etch tool is at 100
  const spc = roomView(state).spc;
  assert.equal(spc.parameter, 'Etch rate');
  assert.equal(spc.unit, 'nm/min');
  assert.equal(spc.zs.length, 11, 'earlier lots only: this lot has not run yet');
  // target 300, sigma 8: control 300 ± 24, spec 300 ± 32.
  assert.equal(spc.limitsText, 'Centre 300.0 · control 276.0–324.0 · spec 268.0–332.0 nm/min');
});

test('spcView: rules in words, and the verdict', () => {
  const state = idleToEtch();
  const below8 = [0.1, -0.2, -0.5, -0.1, -0.9, -0.3, -0.4, -0.2, -0.6, -3.4, 0.2];
  const tools = { ...state.tools, etch: { ...state.tools.etch, spc: below8 } };
  const spc = roomView({ ...state, tools }).spc;
  assert.deepEqual(spc.rules, ['A point beyond the lower control limit', '8 points in a row below the centre line']);
  assert.equal(spc.inControl, false);
  assert.match(spc.verdictText, /^Out of control: the etch rate may be shifting/);
  assert.deepEqual(spc.outOfControl.map((out, i) => (out ? i : null)).filter(i => i !== null), [9]);

  const calm = { ...state.tools, etch: { ...state.tools.etch, spc: [0.5, -0.5, 0.2] } };
  assert.equal(roomView({ ...state, tools: calm }).spc.verdictText, 'In control: no rule tripped in the last 3 lots.');
});

test('the metrology room has no SPC chart', () => {
  let state = createRun({ seed: SEED, scatterStrength: 0, toolDrift: false });
  while (state.stepIndex < 8) state = idleRoom(state);
  assert.equal(roomView(enterStep(state)).spc, null);
});

test('spcView: a one-sided spec (particle adders) shows only an upper spec limit', () => {
  const spc = roomView(enterStep(createRun({ seed: SEED, scatterStrength: 0, toolDrift: false }))).spc;
  assert.equal(spc.parameter, 'Particle adders');
  assert.deepEqual(spc.specSides, [1]);
  // target 20, sigma 4: control 8–32, spec up to 36.
  assert.equal(spc.limitsText, 'Centre 20.0 · control 8.0–32.0 · spec up to 36.0 per wafer');
});

// --- PM and the map's SPC chip (M3 item 2c) ---------------------------------

test('mapView: a bay ahead whose tool trips an SPC rule has spcAlarm', () => {
  const state = idleToEtch();   // drift off: tools at 100, so only chance alarms
  const forced = { ...state.tools, cmp: { ...state.tools.cmp, spc: [-0.2, -0.5, -0.1, -0.9, -0.3, -0.4, -0.2, -0.6] } };
  const view = mapView(resolveStep({ ...state, tools: forced }));   // in the corridor after etch
  const cmpBay = view.bays.find(bay => bay.roomId === 'cmp');
  assert.equal(cmpBay.spcAlarm, true);
  assert.equal(view.bays.find(bay => bay.roomId === 'metro').spcAlarm, false, 'metrology has no chart');
});

test('spcView: a PM mark sits before the next point', () => {
  const state = idleToEtch();
  const tool = { ...state.tools.etch, spc: [0, 0, 0], pmAt: [2] };
  assert.deepEqual(roomView({ ...state, tools: { ...state.tools, etch: tool } }).spc.pmMarks, [2]);
});

test('spcView: after a PM the rules look only at lots measured since it', () => {
  const state = idleToEtch();
  const drifting = [-0.2, -0.5, -0.1, -0.9, -0.3, -0.4, -0.2, -0.6];
  const justPmd = { ...state.tools.etch, spc: drifting, pmAt: [8] };
  const view = roomView({ ...state, tools: { ...state.tools, etch: justPmd } }).spc;
  assert.equal(view.inControl, true);
  assert.equal(view.verdictText, "Just PM'd: no lots measured since the PM yet.");
  const oneLater = { ...justPmd, spc: [...drifting, 0.3] };
  assert.equal(roomView({ ...state, tools: { ...state.tools, etch: oneLater } }).spc.verdictText,
    'In control: no rule tripped in the last 1 lot since the PM.');
});

// --- the event screen (M3 item 2e) -----------------------------------------

test('eventView: consequences in words, tool health said as a service, Q-time wait shown', async () => {
  const { eventView } = await import('../src/ui/eventView.js');
  let state = createRun({ seed: SEED, scatterStrength: 0, toolDrift: false });
  state = resolveStep(enterStep(state));
  while (state.corridor < 4) state = resolveStep(enterStep(walkCorridor(state, null)));
  const atAudit = { ...state, corridor: null, event: { corridor: 4, eventId: 'audit', chosen: null } };
  const view = eventView(atAudit);
  assert.equal(view.name, 'Quality audit');
  assert.equal(view.options[0].consequences, '+30 min cycle time · +0.030 risk: native oxide grew while the lot waited (Q-time wait) · Wet clean tool serviced');
  assert.equal(view.options[1].consequences, '−100 cash');
  assert.equal(view.resultText, null);
  assert.equal(view.goText, 'Continue to step 6: Deposition (barrier + seed)');
});
