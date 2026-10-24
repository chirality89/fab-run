// view.js — turns the run state into plain display data for the room screen.
//
// No DOM here and no game rules: it only READS the state and the content,
// and works out the numbers and words the screen shows. Because it has no
// DOM, Node can test it (tests/view.test.js). render.js draws what this
// returns.

import { PRACTICES, EQUIPMENT, MATERIALS, ROOMS } from '../content/content.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import { SCRAP_LINE, CUSTOMER_SPEC, SITE_GOOD_LINE } from '../content/balance.js';
import { normalizeSeed } from '../engine/rng.js';
import { lotYield, realizeRisks } from '../engine/lot.js';
import { whyIllegal } from '../engine/run.js';

// A fraction (0..1) as a percent with one decimal, e.g. 0.913931 → 91.4.
function toPercent(fraction) {
  return Math.round(fraction * 1000) / 10;
}

// Which band a site falls in, from its fraction of good wafers (0..1):
//   pass  at or above SITE_GOOD_LINE (90%)
//   warn  at or above CUSTOMER_SPEC (70%)
//   fail  below that
export function siteBand(value) {
  if (value >= SITE_GOOD_LINE) return 'pass';
  if (value >= CUSTOMER_SPEC) return 'warn';
  return 'fail';
}

// One wafer map tile. The percent is a whole number rounded DOWN, so a site
// at 89.7% reads 89, never 90: the number always agrees with its band.
// (The tiny 1e-9 stops 0.29 × 100 = 28.999… from reading as 28.)
function siteView(value) {
  return { value, percent: Math.floor(value * 100 + 1e-9), band: siteBand(value) };
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
  return {
    seed: state.seed,
    roomId,
    roomName: ROOMS[roomId].name,
    stepNumber: state.stepIndex + 1,
    stepCount: route.length,
    stepLabel: step.label,
    cash: state.cash,
    yieldPercent: toPercent(lotYield(state.lot)),
    scrapLine: toPercent(SCRAP_LINE),
    spec: toPercent(CUSTOMER_SPEC),
    sites: state.lot.sites.map(siteView),
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
