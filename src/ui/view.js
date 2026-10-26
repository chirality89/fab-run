// view.js — turns the run state into plain display data for the room screen.
//
// No DOM here and no game rules: it only READS the state and the content,
// and works out the numbers and words the screen shows. Because it has no
// DOM, Node can test it (tests/view.test.js). render.js draws what this
// returns.

import { EQUIPMENT, MATERIALS, ROOMS } from '../content/content.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import { SIDE_STOPS } from '../content/sideStops.js';
import {
  SCRAP_LINE, CUSTOMER_SPEC, SITE_GOOD_LINE, SIDE_STOP_MINUTES, QTIME_RISK_PER_MINUTE,
} from '../content/balance.js';
import { normalizeSeed } from '../engine/rng.js';
import { lotYield, realizeRisks } from '../engine/lot.js';
import { whyIllegal, playCard } from '../engine/run.js';
import { whyCannotBuy, findShopItem } from '../engine/shop.js';
import { cardInRun } from '../engine/doe.js';
import { spcView } from './spcView.js';
import { effectsLine, itemName } from './effectsText.js';

// A fraction (0..1) as a percent with one decimal, e.g. 0.913931 → 91.4.
export function toPercent(fraction) {
  return Math.round(fraction * 1000) / 10;
}

// The band lines as whole percents (90 and 70). Math.round because
// 0.9 × 100 is 90.00000000000001 in computer arithmetic.
const SITE_GOOD_PERCENT = Math.round(SITE_GOOD_LINE * 100);
const SPEC_PERCENT = Math.round(CUSTOMER_SPEC * 100);

// The whole percent printed on a site tile, rounded DOWN (89.7% reads 89).
// The tiny 1e-9 stops 0.29 × 100 = 28.999… from reading as 28.
function sitePercent(value) {
  return Math.floor(value * 100 + 1e-9);
}

// Which band a site falls in. It is worked out from the PRINTED whole
// percent, so the number on a tile and its band always agree:
//   pass  90 or more (SITE_GOOD_LINE)
//   warn  70 to 89   (CUSTOMER_SPEC)
//   fail  below 70
export function siteBand(value) {
  const percent = sitePercent(value);
  if (percent >= SITE_GOOD_PERCENT) return 'pass';
  if (percent >= SPEC_PERCENT) return 'warn';
  return 'fail';
}

// One wafer map tile.
export function siteView(value) {
  return { value, percent: sitePercent(value), band: siteBand(value) };
}

// The colour band of the yield bar, from the RAW yield fraction (0..1), not
// the rounded number: 0.6996 shows as 70.0% but is still below the spec.
//   ok    at or above CUSTOMER_SPEC (would ship)
//   warn  at or above SCRAP_LINE (still running, would be rejected)
//   bad   below SCRAP_LINE (scrapped)
export function yieldBand(fraction) {
  if (fraction >= CUSTOMER_SPEC) return 'ok';
  if (fraction >= SCRAP_LINE) return 'warn';
  return 'bad';
}

// The legend under the wafer map, built from the balance numbers.
export function mapKeyText() {
  return `Each site: % of the 25 wafers still good there. Pass ${SITE_GOOD_PERCENT}%+, `
    + `warning ${SPEC_PERCENT}–${SITE_GOOD_PERCENT - 1}%, fail under ${SPEC_PERCENT}%.`;
}

// The equipment and materials sitting in this room. An empty list means
// the room's slots are empty (render.js then shows "empty").
function slotsView(state, roomId) {
  const equipment = state.equipment
    .map(id => EQUIPMENT.find(item => item.id === id))
    .map(item => ({ id: item.id, name: item.name, kind: 'equipment', room: item.room }));
  const materials = Object.values(state.slots)
    .map(slot => MATERIALS.find(item => item.id === slot.id))
    .map(item => ({ id: item.id, name: item.name, kind: 'material', room: item.room }));
  return [...equipment, ...materials].filter(item => item.room === roomId);
}

// Turns the engine's short reason into words for the card. When the card
// waits on a piece of equipment, it names that equipment.
function friendlyReason(card, reason) {
  if (reason === 'its condition is not met' && card.when?.equipment) {
    const tool = EQUIPMENT.find(item => item.id === card.when.equipment);
    return `Needs the ${tool ? tool.name : card.when.equipment}`;
  }
  return reason.charAt(0).toUpperCase() + reason.slice(1);
}

// How playing a card would change this room's expected loss: play it on a
// copy of the state and compare the forecasts. Positive = less lost. Only
// for a playable card. (playCard returns a new state; the real one is
// untouched.)
function pointsChange(state, step, cardId) {
  const after = playCard(state, cardId);
  return expectedLossPoints(state.lot, step) - expectedLossPoints(after.lot, step);
}

// The line under a playable card, e.g. "About 1.0 point less lost in this
// room." Null when the change is under 0.05 points, e.g. a card that acts
// in a later room (its effects line still says what it does).
export function pointsChangeText(points) {
  const rounded = Math.abs(points).toFixed(1);
  if (rounded === '0.0') return null;
  const unit = rounded === '1.0' ? 'point' : 'points';
  return `About ${rounded} ${unit} ${points > 0 ? 'less' : 'more'} lost in this room.`;
}

// One card in the hand. The one-line summary is the card's own `tradeoff`
// text from content.js, so the screen never invents physics. An upgraded
// card shows its DOE version (doe.js cardInRun). Under it: what the card
// does (effectsText.js) and, if playable, what that does to this room's
// forecast (M4.5 item 5).
function cardView(state, step, cardId) {
  const card = cardInRun(state, cardId);
  const reason = whyIllegal(state, cardId);
  const points = reason === null ? pointsChange(state, step, cardId) : null;
  return {
    id: card.id,
    name: card.name,
    minutes: card.cost.time ?? 0,
    cash: card.cost.cash ?? 0,
    summary: card.tradeoff,
    effectsText: effectsLine(card.effects),
    pointsChange: points,
    pointsText: points === null ? null : pointsChangeText(points),
    doe: state.upgraded.includes(cardId),
    playable: reason === null,
    reason: reason === null ? null : friendlyReason(card, reason),
  };
}

// How many points of yield this room will take if nothing more is played:
// realize this step's patterns on a copy of the lot, with no scatter, and
// compare. (realizeRisks returns a new lot; the real one is untouched.)
function expectedLossPoints(lot, step) {
  const after = realizeRisks(lot, step.realizes);
  return (lotYield(lot) - lotYield(after)) * 100;
}

// What the room's equipment and materials did to cash as the lot came in,
// e.g. "On entering, In-situ pad conditioner took 20 cash." Null if
// nothing changed cash (Lane F issue 9: cash went with no message).
export function cashNoteText(itemCash = []) {
  if (itemCash.length === 0) return null;
  const parts = itemCash.map(({ id, delta }) =>
    (delta < 0 ? `${itemName(id)} took ${-delta} cash` : `${itemName(id)} gave ${delta} cash`));
  return `On entering, ${parts.join(' and ')}.`;
}

// Everything the room screen shows. Call it only while the lot is in a room.
export function roomView(state) {
  if (state.room === null) throw new Error('roomView: the lot is not in a room');
  const route = LOT_TYPES[state.lotTypeId].route;
  const step = route[state.stepIndex];
  const roomId = state.room.id;
  const lossPoints = expectedLossPoints(state.lot, step);
  const yieldFraction = lotYield(state.lot);
  return {
    seed: state.seed,
    roomId,
    roomName: ROOMS[roomId].name,
    cashNoteText: cashNoteText(state.room.itemCash),
    stepNumber: state.stepIndex + 1,
    stepCount: route.length,
    stepLabel: step.label,
    cash: state.cash,
    yieldFraction,
    yieldPercent: toPercent(yieldFraction),
    yieldBand: yieldBand(yieldFraction),
    scrapLine: toPercent(SCRAP_LINE),
    spec: toPercent(CUSTOMER_SPEC),
    sites: state.lot.sites.map(siteView),
    mapKeyText: mapKeyText(),
    timeLeft: state.room.timeLeft,
    budget: state.room.budget,
    slots: slotsView(state, roomId),
    toolHealth: state.tools[roomId].health,   // not shown: the screen shows SPC only (David)
    spc: spcView(state, roomId),
    hand: state.hand.map(cardId => cardView(state, step, cardId)),
    expectedLossPoints: lossPoints,
    expectedLossText: `This room will cost about ${lossPoints.toFixed(1)} points of yield if nothing changes.`,
  };
}

// Reads ?seed=123456 from the page address. Digits only, and the number must
// be a valid seed (rng.js normalizeSeed); anything else gives the fallback.
export function parseSeed(search, fallback) {
  const text = new URLSearchParams(search).get('seed');
  if (text === null || !/^\d+$/.test(text)) return fallback;
  const seed = normalizeSeed(Number(text));
  return seed === null ? fallback : seed;
}

// What happens to the lot after a room, in words.
function outcomeText(after, route) {
  if (after.status === 'scrapped') {
    return `Lot scrapped: yield fell below the scrap line (${toPercent(SCRAP_LINE)}%).`;
  }
  if (after.status === 'shipped') return 'Lot shipped: it meets the customer spec.';
  if (after.status === 'rejected') return 'Lot rejected: shipped below the customer spec.';
  const next = route[after.stepIndex];
  return `The lot moves on to step ${after.stepIndex + 1}: ${next.label}.`;
}

// Everything the result screen shows after a room is run. `before` is the
// state while the lot was still in the room; `after` is what resolveStep
// returned. Reads both; changes neither.
export function resultView(before, after) {
  if (before.room === null) throw new Error('resultView: `before` must be the state inside the room');
  const route = LOT_TYPES[before.lotTypeId].route;
  const step = route[before.stepIndex];
  const yieldBefore = lotYield(before.lot);
  const yieldAfter = lotYield(after.lot);
  const lossPoints = (yieldBefore - yieldAfter) * 100;
  return {
    seed: before.seed,
    roomId: before.room.id,
    roomName: ROOMS[before.room.id].name,
    stepNumber: before.stepIndex + 1,
    stepCount: route.length,
    stepLabel: step.label,
    cash: after.cash,
    yieldBeforePercent: toPercent(yieldBefore),
    yieldAfterFraction: yieldAfter,
    yieldAfterPercent: toPercent(yieldAfter),
    yieldBand: yieldBand(yieldAfter),
    scrapLine: toPercent(SCRAP_LINE),
    spec: toPercent(CUSTOMER_SPEC),
    lossPoints,
    lossText: `This room cost ${lossPoints.toFixed(1)} points of yield.`,
    sites: after.lot.sites.map(siteView),
    mapKeyText: mapKeyText(),
    status: after.status,
    outcomeText: outcomeText(after, route),
  };
}

// --- the floor-plan map (M3 item 1) ----------------------------------------

// The legend under the floor plan, built from the side stops' words
// (src/content/sideStops.js).
function stopKeyText() {
  return Object.values(SIDE_STOPS).map(info => `${info.short} ${info.name}`).join(' · ');
}

// Where the lot is on the map. Between rooms it stands in a corridor; at the
// very start it stands at the door, before step 1.
//   'start'    before the first room
//   'corridor' in state.corridor
function mapPosition(state) {
  if (state.room !== null) throw new Error('mapView: the lot is in a room, not on the map');
  if (state.status !== 'running') throw new Error(`mapView: the run is over (${state.status})`);
  return state.corridor === null ? 'start' : 'corridor';
}

// Each bay's state on the floor plan, from the index of the next room.
//   done   the lot has been through it
//   next   the room the lot goes to next
//   ahead  later on the route
function bayStatus(index, nextIndex) {
  if (index < nextIndex) return 'done';
  if (index === nextIndex) return 'next';
  return 'ahead';
}

// One offered side stop, as a button on the map.
function offerView(kind, qtimePattern) {
  const minutes = SIDE_STOP_MINUTES[kind];
  const info = SIDE_STOPS[kind];
  return {
    kind,
    name: info.name,
    what: info.what,
    placeholder: info.placeholder,
    minutes,
    // In a Q-time corridor, the stop's wait grows the pattern (run.js walkCorridor).
    qtimeRisk: qtimePattern ? QTIME_RISK_PER_MINUTE * minutes : 0,
  };
}

// The pattern a corridor's wait grows, or null if it isn't a Q-time
// corridor. The route step before the corridor says so with `qtime`.
function qtimeOfCorridor(route, corridor) {
  if (corridor === null) return null;
  return route[corridor.afterStep].qtime || null;
}

// Everything the map screen shows. Call it only between rooms.
export function mapView(state) {
  const position = mapPosition(state);
  const route = LOT_TYPES[state.lotTypeId].route;
  const nextIndex = position === 'start' ? 0 : state.map[state.corridor].afterStep + 1;
  const nextStep = route[nextIndex];
  const here = position === 'corridor' ? state.map[state.corridor] : null;
  const qtimePattern = qtimeOfCorridor(route, here);
  const yieldFraction = lotYield(state.lot);

  return {
    seed: state.seed,
    cash: state.cash,
    cycleTime: state.cycleTime,
    yieldFraction,
    yieldPercent: toPercent(yieldFraction),
    yieldBand: yieldBand(yieldFraction),
    position,
    bays: route.map((step, index) => ({
      number: index + 1,
      label: step.label,
      roomId: step.room,
      roomName: ROOMS[step.room].name,
      status: bayStatus(index, nextIndex),
      // The telegraph on the map: the tool of a room still ahead trips an SPC rule.
      spcAlarm: index >= nextIndex && spcView(state, step.room)?.inControl === false,
    })),
    corridors: state.map.map((corridor, index) => ({
      afterStep: corridor.afterStep,
      offers: corridor.offers.map(kind => ({ kind, short: SIDE_STOPS[kind].short })),
      walked: corridor.walked,
      taken: corridor.taken,
      here: index === state.corridor,
      qtime: Boolean(route[corridor.afterStep].qtime),   // a Q-time window (marked on the plan)
    })),
    stopKeyText: stopKeyText(),
    offers: here ? here.offers.map(kind => offerView(kind, qtimePattern)) : [],
    qtimeText: qtimePattern
      ? 'Q-time window: native oxide keeps growing until the barrier goes on. Every minute the lot waits at a side stop here adds oxide risk.'
      : null,
    whereText: position === 'start'
      ? 'The lot is at the door, ready for step 1.'
      : `The lot is in the corridor after step ${here.afterStep + 1}: ${route[here.afterStep].label}.`,
    goText: position === 'start'
      ? `Enter step 1: ${nextStep.label}`
      : `Go straight to step ${nextIndex + 1}: ${nextStep.label}`,
  };
}

// The "Continue to step N" text after a side stop. `corridorIndex` is the
// corridor the stop was in; the next room is the step after it.
function continueText(route, corridorIndex) {
  const nextIndex = corridorIndex + 1;
  return `Continue to step ${nextIndex + 1}: ${route[nextIndex].label}`;
}

// The plain screen after a side stop with nothing to choose: today an event
// stop where no event matters any more (a quiet shift). A placeholder stop
// would show here too, but the map no longer offers one (M4.5 item 5). `before` is the state in
// the corridor, `after` what walkCorridor returned.
export function stopView(before, after, stopKind) {
  const info = SIDE_STOPS[stopKind];
  const route = LOT_TYPES[after.lotTypeId].route;
  return {
    seed: after.seed,
    name: info.name,
    what: info.what,
    minutes: after.cycleTime - before.cycleTime,
    text: info.placeholder
      ? `${info.name} cost ${after.cycleTime - before.cycleTime} min of cycle time. What this stop does comes in the next update.`
      : `${info.name} cost ${after.cycleTime - before.cycleTime} min of cycle time. A quiet shift: nothing that matters for this lot comes up.`,
    goText: continueText(route, before.corridor),
  };
}

// --- the procurement stop (M3 item 2a) -------------------------------------

// Where an item next acts: the first route step from `fromIndex` on that is
// in the item's room.
export function nextUseText(route, fromIndex, roomId) {
  const index = route.findIndex((step, i) => i >= fromIndex && step.room === roomId);
  return index === -1 ? 'Not used again on this route' : `Next used at step ${index + 1}: ${route[index].label}`;
}

// What kind of item it is, in words: "Equipment" or "Material, resist slot".
function itemKindText(item) {
  return item.kind === 'equipment' ? 'Equipment' : `Material, ${item.slot} slot`;
}

// For a material: what it would push out of its slot, or null if the slot
// is empty.
function replacesText(state, item) {
  if (item.kind !== 'material') return null;
  const current = state.slots[item.slot];
  if (!current) return null;
  return `Replaces the ${MATERIALS.find(entry => entry.id === current.id).name}`;
}

// The engine's short reason, as words under a greyed-out Buy button.
const BUY_REASON_TEXT = {
  'not enough cash': 'Not enough cash',
  'already bought': 'Bought',
};

// One item on sale.
function shopItemView(state, route, itemId) {
  const item = findShopItem(itemId);
  const reason = whyCannotBuy(state, itemId);
  const bought = state.shop.bought.includes(itemId);
  return {
    id: item.id,
    name: item.name,
    kindText: itemKindText(item),
    roomName: ROOMS[item.room].name,
    price: item.cost.cash,
    tradeoff: item.tradeoff,
    effectsText: effectsLine(item.effects),
    nextUseText: nextUseText(route, state.shop.corridor + 1, item.room),
    replacesText: bought ? null : replacesText(state, item),
    bought,
    buyable: reason === null,
    reason: reason === null ? null : (BUY_REASON_TEXT[reason] ?? reason),
  };
}

// Everything the procurement screen shows, while its shop is open.
export function shopView(state) {
  if (state.shop === null) throw new Error('shopView: no shop is open');
  const route = LOT_TYPES[state.lotTypeId].route;
  const minutes = SIDE_STOP_MINUTES.procurement;
  return {
    seed: state.seed,
    cash: state.cash,
    name: SIDE_STOPS.procurement.name,
    what: SIDE_STOPS.procurement.what,
    text: `${SIDE_STOPS.procurement.name} cost ${minutes} min of cycle time. Equipment acts every time the lot enters its room; a material replaces what is in its slot.`,
    items: state.shop.stock.map(itemId => shopItemView(state, route, itemId)),
    goText: continueText(route, state.shop.corridor),
  };
}
