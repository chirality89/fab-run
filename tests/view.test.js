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
import { seedSellingTestItems, SHOP_TEST_UNLOCKS } from './shopSeed.js';
import {
  roomView, resultView, mapView, stopView, shopView, siteBand, siteView, yieldBand, parseSeed, pointsChangeText, badSeedText, stopKeyText,
} from '../src/ui/view.js';

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

test('yield at etch: 0.95887 raw, shown as 95.9', () => {
  const inEtch = idleToEtch();
  close(lotYield(inEtch.lot), 0.95887, 'raw yield e^(-0.042)');
  assert.equal(roomView(inEtch).yieldPercent, 95.9, `seed ${SEED}`);
});

test('expected loss at etch: 11.8893 points, text says 11.9', () => {
  const view = roomView(idleToEtch());
  assert.ok(Math.abs(view.expectedLossPoints - 11.8893) < 1e-4,
    `expected loss: got ${view.expectedLossPoints}, expected 11.8893 (seed ${SEED})`);
  assert.equal(view.expectedLossText, 'This room will cost about 11.9 points of yield if nothing changes.');
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
  assert.equal(view.spec, 68);
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

test('site bands: 90% and up pass, 68% to under 90% warn, below 68% fail', () => {
  assert.equal(siteBand(0.95), 'pass');
  assert.equal(siteBand(0.90), 'pass');
  assert.equal(siteBand(0.80), 'warn');
  assert.equal(siteBand(0.68), 'warn');
  assert.equal(siteBand(0.67), 'fail');
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
  assert.equal(yieldBand(0.68), 'ok');
  assert.equal(yieldBand(0.6796), 'warn', 'shows as 68.0% but is below the spec');
  assert.equal(yieldBand(0.40), 'warn');
  assert.equal(yieldBand(0.3996), 'bad', 'shows as 40.0% but is below the scrap line');
  const view = roomView(idleToEtch());
  close(view.yieldFraction, 0.95887, 'yieldFraction');
  assert.equal(view.yieldBand, 'ok');
});

test('site band agrees with the printed percent', () => {
  // Rounded to the nearest whole percent since the M4.5 small fixes (David,
  // 26 Oct 2026): the band follows the printed number either way.
  assert.equal(siteBand(0.8999), 'pass', 'prints 90');
  assert.equal(siteBand(0.8949), 'warn', 'prints 89');
  assert.equal(siteBand(0.6799), 'warn', 'prints 68');
  assert.equal(siteBand(0.6749), 'fail', 'prints 67');
  assert.equal(siteView(0.285).percent, 29, '28.5 rounds up, despite 0.285 × 100 = 28.4999…');
});

test('wafer map legend is built from the balance numbers', () => {
  assert.equal(roomView(idleToEtch()).mapKeyText,
    'Each site: % of this die position expected good across the lot. Pass 90%+, warning 68–89%, fail under 68%.');
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

// Hand check (independent python model, 29 Oct 2026): with underlayer ×2
// and a tool that is not drifting (drift off here), the over-etch costs a
// little more than it saves: 11.8893 → 12.0068 points.
test('playing timed over-etch on a steady tool: expected loss rises from 11.9 to 12.0 points', () => {
  const view = roomView(playCard(idleToEtch(), 'timedOveretch'));
  assert.ok(Math.abs(view.expectedLossPoints - 12.0068) < 1e-4,
    `expected loss: got ${view.expectedLossPoints}, expected 12.0068 (seed ${SEED})`);
  assert.equal(view.expectedLossText, 'This room will cost about 12.0 points of yield if nothing changes.');
});

test('run etch with nothing played: 95.9% -> 84.0%, 11.9 points lost', () => {
  const before = idleToEtch();
  const view = resultView(before, resolveStep(before));
  assert.equal(view.yieldBeforePercent, 95.9, `seed ${SEED}`);
  assert.equal(view.yieldAfterPercent, 84.0);
  close(view.yieldAfterFraction, 0.839977, 'yield after etch, idle');
  assert.equal(view.lossText, 'This room cost 11.9 points of yield.');
  assert.equal(view.yieldBand, 'ok', 'at 84.0% the lot is now above the 70% spec after etch (was warn at 68.5%)');
  assert.equal(view.status, 'running');
  assert.equal(view.outcomeText, 'The lot moves on to step 5: Resist strip + wet clean.');
  assert.equal(view.sites.length, 25);
});

test('run etch after timed over-etch: 95.9% -> 83.9%, 12.0 points lost', () => {
  const before = playCard(idleToEtch(), 'timedOveretch');
  const view = resultView(before, resolveStep(before));
  assert.equal(view.yieldAfterPercent, 83.9, `seed ${SEED}`);
  close(view.yieldAfterFraction, 0.838802, 'yield after etch, over-etch');
  assert.equal(view.lossText, 'This room cost 12.0 points of yield.');
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
  assert.equal(view.goText, 'Go straight to step 2: Deposition (oxide)');
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
  assert.equal(view.goText, 'Continue to step 2: Deposition (oxide)');
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
  const afterStep1 = walkCorridor(resolveStep(enterStep(createRun({ seed: SHOP_SEED, unlocked: SHOP_TEST_UNLOCKS }))), null);
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
  assert.deepEqual(spc.axisLabels.map(label => label.text), ['332', '268', '324', '276', '300'], 'axis numbers');
});

test('spcView: rules in words, and the verdict', () => {
  const state = idleToEtch();
  const below8 = [0.1, -0.2, -0.5, -0.1, -0.9, -0.3, -0.4, -0.2, -0.6, -3.4, 0.2];
  const tools = { ...state.tools, etch: { ...state.tools.etch, spc: below8 } };
  const spc = roomView({ ...state, tools }).spc;
  assert.deepEqual(spc.rules, ['A point beyond the lower control limit', '8 points in a row below the centre line']);
  assert.equal(spc.inControl, false);
  assert.equal(spc.verdictText, "Shift: the etch rate chart has moved off centre. A shifted tool costs yield in this room until it is PM'd or serviced.");
  assert.deepEqual(spc.outOfControl.map((out, i) => (out ? i : null)).filter(i => i !== null), [9]);

  const calm = { ...state.tools, etch: { ...state.tools.etch, spc: [0.5, -0.5, 0.2] } };
  assert.equal(roomView({ ...state, tools: calm }).spc.verdictText, 'In control: no rule tripped in the last 3 lots.');
});

// Verdicts by rule (M4.5 item 4): one point is an excursion, not a shift.
test('spcView: the verdict names the worst finding: excursion, trend, shift and trend', () => {
  const state = idleToEtch();
  const verdictFor = spc => roomView({ ...state, tools: { ...state.tools, etch: { ...state.tools.etch, spc } } }).spc;
  const spike = verdictFor([0.5, -0.5, 3.2, 0.1]);
  assert.deepEqual(spike.rules, ['A point beyond the upper control limit']);
  assert.equal(spike.verdictText, 'Excursion: one lot measured past the control limit. Standard practice is to re-measure and check the tool. If it was a bad measurement or a one-off, the next lots come back inside the limits.');
  const rising = verdictFor([-0.5, -0.3, 0, 0.2, 0.6, 0.7]);
  assert.deepEqual(rising.rules, ['6 points in a row steadily rising']);
  assert.equal(rising.verdictText, 'Trend: the etch rate chart is moving lot by lot. The further it goes, the more yield it costs.');
  const both = verdictFor([-0.1, -0.2, -0.3, -0.4, -0.5, -0.6, -0.7, -0.8]);
  assert.deepEqual(both.rules, ['8 points in a row below the centre line', '6 points in a row steadily falling']);
  assert.match(both.verdictText, /^Shift and trend: the etch rate chart has moved off centre and is still moving lot by lot\./);
});

test('spcView: on a one-sided chart a low-side run costs nothing, and the verdict says so', () => {
  const inClean = enterStep(createRun({ seed: SEED, scatterStrength: 0, toolDrift: false }));
  const withSpc = spc => roomView({ ...inClean, tools: { ...inClean.tools, clean: { ...inClean.tools.clean, spc } } }).spc;
  const low = withSpc([-0.2, -0.5, -0.1, -0.9, -0.3, -0.4, -0.2, -0.6]);
  assert.deepEqual(low.rules, ['8 points in a row below the centre line']);
  assert.equal(low.verdictText, 'Shift (low side): the particle adders chart reads below its centre line. Fewer is never out of spec, so no yield cost, but an engineer still checks the gauge and the centre line.');
  const high = withSpc([0.2, 0.5, 0.1, 0.9, 0.3, 0.4, 0.2, 0.6]);
  assert.match(high.verdictText, /^Shift: the particle adders chart has moved off centre\./);
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
  assert.deepEqual(spc.axisLabels.map(label => label.text), ['36', '32', '8', '20'], 'one spec number only');
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
  assert.equal(view.verdictText, "Just PM'd or serviced: no lots measured since yet.");
  const oneLater = { ...justPmd, spc: [...drifting, 0.3] };
  assert.equal(roomView({ ...state, tools: { ...state.tools, etch: oneLater } }).spc.verdictText,
    'In control: no rule tripped in the last 1 lot since the last PM or service.');
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
  // Hand check: 100 × (1 − e^−0.03) = 2.96, shown as 3.0.
  assert.equal(view.options[0].consequences, '+30 min cycle time · +0.030 risk (about 3.0 points of yield): native oxide grew while the lot waited (Q-time wait) · Wet clean tool serviced');
  assert.equal(view.options[1].consequences, '−100 cash');
  assert.equal(view.resultText, null);
  assert.equal(view.goText, 'Continue to step 6: Deposition (barrier + seed)');
});

// --- M4.5 item 5: effects shown before you commit -------------------------
// Hand check: on seed 123456 the etch forecast is 11.8893 points with
// nothing played and 12.0068 after timed over-etch (tests above), so on
// this steady tool playing it costs 11.8893 − 12.0068 = −0.1175 points.

test('a card in the hand shows its effects and how much it saves or costs in this room', () => {
  const [card] = roomView(idleToEtch()).hand;
  assert.equal(card.id, 'timedOveretch', `seed ${SEED}`);
  assert.equal(card.effectsText, 'residue ×0.3 · underlayer attack ×2 · underlayer attack ×0.525 with etch stop');
  assert.ok(Math.abs(card.pointsChange - (-0.1175)) < 1e-4, `points change: got ${card.pointsChange} (seed ${SEED})`);
  assert.equal(card.pointsText, 'About 0.1 points more lost in this room.');
});

test('an unplayable card shows its effects but no points line', () => {
  const card = roomView(idleToEtch({ deck: fullPool() })).hand.find(entry => entry.id === 'endpointEtch');
  assert.equal(card.playable, false, `seed ${SEED}`);
  assert.equal(card.pointsChange, null);
  assert.equal(card.pointsText, null);
  assert.ok(card.effectsText.length > 0);
});

test('the points line: rounding, singular, "more", and nothing under 0.05', () => {
  assert.equal(pointsChangeText(1.0204), 'About 1.0 point less lost in this room.');
  assert.equal(pointsChangeText(2.46), 'About 2.5 points less lost in this room.');
  assert.equal(pointsChangeText(-0.3), 'About 0.3 points more lost in this room.');
  assert.equal(pointsChangeText(0.04), null);
  assert.equal(pointsChangeText(0), null);
});

test('shop items show their effects', () => {
  const view = shopView(shopAfterStep2());
  const effects = Object.fromEntries(view.items.map(item => [item.id, item.effectsText]));
  assert.deepEqual(effects, {
    padConditioner: 'rr drift ×0.4 · −20 cash',
    resistCAR: 'cd error ×0.6 · cd error ×1.4 (delay before bake only)',
    resistThick: 'underlayer attack ×0.5 (deep etch only) · cd error ×1.3 · uses 10 min of room time',
  });
});

// --- M4.5 small fixes: where cash went (Lane F issue 9) -------------------
// Hand check: the pad conditioner takes 20 cash every time the lot enters
// CMP (its cashCost effect). Nothing else here costs cash, so the lot has
// 1500 − 20 = 1480 on entering CMP, and no note in any earlier room.
const CMP = 7;   // 0-based step index of CMP on the cuLine route

test('the room says which item took cash on entering: pad conditioner at CMP', () => {
  const loadout = { equipment: ['padConditioner'], slots: {} };
  let state = createRun({ seed: SEED, scatterStrength: 0, toolDrift: false, loadout });
  while (state.stepIndex < CMP) {
    assert.equal(roomView(enterStep(state)).cashNoteText, null, `step ${state.stepIndex + 1} (seed ${SEED})`);
    state = idleRoom(state);
  }
  const inCmp = enterStep(state);
  assert.equal(inCmp.cash, 1480, `seed ${SEED}`);
  assert.deepEqual(inCmp.room.itemCash, [{ id: 'padConditioner', delta: -20 }]);
  assert.equal(roomView(inCmp).cashNoteText, 'On entering, In-situ pad conditioner took 20 cash.');
});

// --- M4.5 small fixes: a seed in the address that isn't one (issue 15) ----

test('a bad ?seed= says so and names the seed that started instead', () => {
  const tail = 'is not a seed (a whole number from 0 to 4294967295), so this is seed 77.';
  assert.equal(badSeedText('?seed=abc', 77), `"abc" ${tail}`);
  assert.equal(badSeedText('?seed=-5', 77), `"-5" ${tail}`);
  assert.equal(badSeedText('?seed=1.5', 77), `"1.5" ${tail}`);
  assert.equal(badSeedText('?seed=99999999999', 77), `"99999999999" ${tail}`, 'too big for a 32-bit seed');
  assert.equal(badSeedText('?seed=123456789012345678901234', 77), `"12345678901234567890…" ${tail}`, 'cut short');
  assert.equal(badSeedText('?seed=', 77), `"" ${tail}`, 'an empty seed is not one either');
});

test('a good ?seed= or none at all shows no note', () => {
  assert.equal(badSeedText('?seed=123456', 77), null);
  assert.equal(badSeedText('?seed=4294967295', 77), null, 'the largest seed');
  assert.equal(badSeedText('', 77), null);
  assert.equal(badSeedText('?other=1', 77), null);
});

test('the floor-plan legend lists only the stops the map offers (no metrology since M4.5 item 5)', () => {
  assert.equal(stopKeyText(), 'PM PM / DOE · BUY Procurement · EVT Event');
});

// --- M4.5 small fixes: the PM stop's exit says what you leave with (issue 8)

test('a PM/DOE stop: "Leave without a PM or DOE" until something is chosen, then Continue', async () => {
  const { pmView } = await import('../src/ui/pmView.js');
  const { pmTool } = await import('../src/engine/run.js');
  // Seed 123456: the corridor after step 2 offers PM/DOE (doe.test.js).
  let state = resolveStep(enterStep(createRun({ seed: SEED, scatterStrength: 0, toolDrift: false })));
  state = resolveStep(enterStep(walkCorridor(state, null)));
  const atStop = walkCorridor(state, 'pm');
  assert.equal(pmView(atStop).goText, 'Leave without a PM or DOE: on to step 3, Litho (trench)', `seed ${SEED}`);
  assert.equal(pmView(pmTool(atStop, 'etch')).goText, 'Continue to step 3: Litho (trench)');
});

// --- M4.5 item 3: etch-stop logic, and what the etch forecast carries in --
// Hand check in tasks/todo.md (M4.5 item 3), from an independent model of
// the 5 × 5 rings: with the stop, depth variation is 0.056 × 0.4 = 0.0224 and
// etch's underlayer attack 0.021 × 0.3 = 0.0063 (the route step's effect).
// Values recomputed 28 Oct 2026 for base risks cut to 70%, with the same model.

// Seed 123456, scatter and drift off: lay down the etch stop in the first
// deposition room (the only card played), then idle into etch.
function stopToEtch() {
  let state = createRun({ seed: SEED, scatterStrength: 0, toolDrift: false, deck: ['timedOveretch', 'etchStopLayer'] });
  state = idleRoom(state);                       // step 1, wet clean
  state = resolveStep(playCard(enterStep(state), 'etchStopLayer'));
  state = walkCorridor(state, null);             // step 2 done, with the stop
  while (state.stepIndex < ETCH) state = idleRoom(state);
  return enterStep(state);
}

test('etch stop: etch adds 0.0063 underlayer attack with it, 0.021 without', () => {
  close(stopToEtch().lot.risks.underlayer_attack, 0.0063, 'with the stop');
  close(idleToEtch().lot.risks.underlayer_attack, 0.021, 'without the stop');
});

test('etch stop, nothing played at etch: 7.7630 points, yield after 0.881240', () => {
  const before = stopToEtch();
  assert.ok(Math.abs(roomView(before).expectedLossPoints - 7.7630) < 1e-4,
    `expected loss: got ${roomView(before).expectedLossPoints}, expected 7.7630 (seed ${SEED})`);
  close(lotYield(resolveStep(before).lot), 0.881240, 'yield after etch, stop');
});

test('etch stop, timed over-etch: 6.0471 points, yield after 0.898399 (attack ×1.05)', () => {
  const before = playCard(stopToEtch(), 'timedOveretch');
  close(before.lot.risks.underlayer_attack, 0.006615, 'attack 0.0063 × 1.5 × 0.7');
  assert.ok(Math.abs(roomView(before).expectedLossPoints - 6.0471) < 1e-4,
    `expected loss: got ${roomView(before).expectedLossPoints}, expected 6.0471 (seed ${SEED})`);
  close(lotYield(resolveStep(before).lot), 0.898399, 'yield after etch, stop and over-etch');
});

test('etch forecast says how much is carried in: 5.0 of 11.9 points, 2.1 with the stop', () => {
  const carried = 'The film stack set how big this is before the lot got here: without an etch stop, trench depth follows the etch rate across the wafer.';
  assert.equal(roomView(idleToEtch()).carriedInText,
    `About 5.0 of these points come from depth variation (etch depth differs center to edge). ${carried}`);
  assert.equal(roomView(stopToEtch()).carriedInText,
    `About 2.1 of these points come from depth variation (etch depth differs center to edge). ${carried}`);
});

test('a room that realizes nothing carried in has no carried-in sentence', () => {
  const inClean = enterStep(createRun({ seed: SEED, scatterStrength: 0, toolDrift: false }));
  assert.equal(roomView(inClean).carriedInText, null);
});

// --- M4.5 item 4: what the tool's drift cost, after the room -------------
// Hand check (tasks/todo.md, M4.5 item 4; independent python model): etch
// tool at health 60 = 2σ shift, drift risk −ln((1 − Φ(−2) − Φ(−6)) ÷
// (1 − 2Φ(−4))) = 0.022950 on residue, beside etch's own 0.028 (base risks cut to 70%, 28 Oct 2026).

test('result: the etch tool at health 60 cost 2.0380 of 13.7950 points, said in words', () => {
  const before = idleToEtch({ startingHealth: { etch: 60 } });
  close(before.room.driftShare.fraction, 0.450436, 'drift share of residue: 0.0229496 ÷ 0.0509496');
  const view = resultView(before, resolveStep(before));
  assert.ok(Math.abs(view.lossPoints - 13.7950) < 1e-4, `loss: got ${view.lossPoints}, expected 13.7950 (seed ${SEED})`);
  assert.ok(Math.abs(view.driftPoints - 2.0380) < 1e-4, `drift: got ${view.driftPoints}, expected 2.0380 (seed ${SEED})`);
  assert.equal(view.driftText, "Of this, about 2.0 points came from the Etch tool's drift (see its SPC chart).");
});

test('result: over-etch cuts the drift share too (0.6158 points), a healthy tool has no drift line', () => {
  const before = playCard(idleToEtch({ startingHealth: { etch: 60 } }), 'timedOveretch');
  const view = resultView(before, resolveStep(before));
  // 0.6158: independent python model, 29 Oct 2026 (0.6189 with underlayer ×1.5)
  assert.ok(Math.abs(view.driftPoints - 0.6158) < 1e-4, `drift: got ${view.driftPoints}, expected 0.6158 (seed ${SEED})`);
  const healthy = idleToEtch();
  assert.equal(healthy.room.driftShare, null);
  assert.equal(resultView(healthy, resolveStep(healthy)).driftText, null);
});
