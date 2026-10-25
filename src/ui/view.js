// view.js — turns the run state into plain display data for the room screen.
//
// No DOM here and no game rules: it only READS the state and the content,
// and works out the numbers and words the screen shows. Because it has no
// DOM, Node can test it (tests/view.test.js). render.js draws what this
// returns.

import { PRACTICES, EQUIPMENT, MATERIALS, ROOMS } from '../content/content.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import {
  SCRAP_LINE, CUSTOMER_SPEC, SITE_GOOD_LINE, SIDE_STOP_MINUTES, QTIME_RISK_PER_MINUTE,
} from '../content/balance.js';
import { normalizeSeed } from '../engine/rng.js';
import { lotYield, realizeRisks } from '../engine/lot.js';
import { whyIllegal } from '../engine/run.js';

// A fraction (0..1) as a percent with one decimal, e.g. 0.913931 → 91.4.
function toPercent(fraction) {
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
function siteView(value) {
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
function mapKeyText() {
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

// One card in the hand. The one-line summary is the card's own `tradeoff`
// text from content.js, so the screen never invents physics.
function cardView(state, cardId) {
  const card = PRACTICES.find(item => item.id === cardId);
  const reason = whyIllegal(state, cardId);
  return {
    id: card.id,
    name: card.name,
    minutes: card.cost.time ?? 0,
    cash: card.cost.cash ?? 0,
    summary: card.tradeoff,
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
    toolHealth: state.tools[roomId].health,
    hand: state.hand.map(cardId => cardView(state, cardId)),
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

// What each kind of side stop is called and does (DESIGN.md §4). `short` is
// the label in the corridor on the floor plan. The stops' contents come in
// M3 item 2; until then a stop only costs its minutes.
export const SIDE_STOP_INFO = {
  metrology:   { name: 'Metrology',   short: 'MET', what: 'Measure: reveals hidden values' },
  pm:          { name: 'PM / DOE',    short: 'PM',  what: 'Restore a tool, or upgrade one practice' },
  procurement: { name: 'Procurement', short: 'BUY', what: 'Spend cash on equipment and materials' },
  event:       { name: 'Event',       short: 'EVT', what: 'A choice with a tradeoff' },
};

// The legend under the floor plan, built from SIDE_STOP_INFO.
function stopKeyText() {
  return Object.values(SIDE_STOP_INFO).map(info => `${info.short} ${info.name}`).join(' · ');
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
  const info = SIDE_STOP_INFO[kind];
  return {
    kind,
    name: info.name,
    what: info.what,
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
    })),
    corridors: state.map.map((corridor, index) => ({
      afterStep: corridor.afterStep,
      offers: corridor.offers.map(kind => ({ kind, short: SIDE_STOP_INFO[kind].short })),
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

// The placeholder screen after taking a side stop (its contents come in M3
// item 2). `before` is the state in the corridor, `after` what walkCorridor
// returned.
export function stopView(before, after, stopKind) {
  const info = SIDE_STOP_INFO[stopKind];
  const route = LOT_TYPES[after.lotTypeId].route;
  const nextIndex = before.map[before.corridor].afterStep + 1;
  return {
    seed: after.seed,
    name: info.name,
    what: info.what,
    minutes: after.cycleTime - before.cycleTime,
    text: `${info.name} cost ${after.cycleTime - before.cycleTime} min of cycle time. What this stop does comes in the next update.`,
    goText: `Continue to step ${nextIndex + 1}: ${route[nextIndex].label}`,
  };
}
