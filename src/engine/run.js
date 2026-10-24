// run.js — one run: one lot walking its route from the first room to ship.
//
// This is the first, minimal version (M1 item 6): walk the route, deal a
// hand in each room, play cards, resolve the room, ship. No map, side stops,
// procurement or saves yet (those come in M3).
//
// A run goes like this, one step of the route at a time:
//   enterStep   → the lot arrives in the step's room
//   playCard    → zero or more times, while time and cash allow
//   resolveStep → the room's risks bite; scrap, move on, or ship
//
// Order inside enterStep (lotTypes.js): add the step's risks, set the room's
// time budget, apply the equipment and materials for this room, then deal.
//
// Every function returns a NEW state. Nothing is changed in place. All
// randomness comes from rng.js, and the generator's number (rngState) is
// kept in the state, so the same seed and the same plays give the same run.

import { PRACTICES, EQUIPMENT, MATERIALS, ROOMS, STARTER_IDS } from '../content/content.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import {
  STARTING_CASH, HAND_SIZE, SCRAP_LINE, CUSTOMER_SPEC, SCATTER_STRENGTH, TIME_BUDGETS,
} from '../content/balance.js';
import { normalizeSeed, shuffle } from './rng.js';
import { createLot, addRisk, realizeRisks, rollScatter, lotYield } from './lot.js';
import { conditionMet, applyEffects } from './resolve.js';

// Looks up a content item by id, or throws naming it.
function findItem(list, id, kind) {
  const item = list.find(entry => entry.id === id);
  if (!item) throw new Error(`Unknown ${kind}: ${id}`);
  return item;
}
const findCard = id => findItem(PRACTICES, id, 'practice');

// The starter deck: the starter items (unlockedBy: null) that are practices.
export function starterDeck() {
  return PRACTICES.filter(card => STARTER_IDS.includes(card.id)).map(card => card.id);
}

// Every practice in the game, for tests and the bot ("--deck full").
export function fullPool() {
  return PRACTICES.map(card => card.id);
}

// A material as it sits in a slot (the shape resolve.js expects). The decay
// factor starts at 1 and only grows with decayPerUse.
export function slotEntry(materialId) {
  const material = findItem(MATERIALS, materialId, 'material');
  return { id: material.id, shelfLife: material.shelfLife ?? null, decay: 1 };
}

// The starting loadout David chose: the i-line resist in the litho resist
// slot, loaded free (no cash is taken for it).
export function defaultLoadout() {
  return { equipment: [], slots: { resist: slotEntry('resistIline') } };
}

// The one state object for a whole run. The lot starts with its latent
// risks; the first step has not been entered yet (room is null).
export function createRun({
  seed = 1,
  lotTypeId = 'cuLine',
  deck = starterDeck(),
  loadout = defaultLoadout(),
  scatterStrength = SCATTER_STRENGTH,
} = {}) {
  if (normalizeSeed(seed) === null) throw new Error(`createRun: bad seed ${seed}`);
  const lotType = LOT_TYPES[lotTypeId];
  if (!lotType) throw new Error(`createRun: unknown lot type ${lotTypeId}`);
  deck.forEach(findCard);   // a typo in the deck fails here, not mid-run

  let lot = createLot();
  for (const [pattern, amount] of Object.entries(lotType.startRisks)) {
    lot = addRisk(lot, pattern, amount);
  }
  const tools = {};
  for (const roomId of Object.keys(ROOMS)) tools[roomId] = { health: 100 };

  return {
    seed,
    rngState: seed,
    lotTypeId,
    scatterStrength,
    stepIndex: 0,
    lot,
    cash: STARTING_CASH,
    room: null,             // { id, timeLeft, budget, revealed } while in a room
    tools,                  // tool health stays 100 for now (NEEDS NEW LOGIC)
    equipment: [...loadout.equipment],
    slots: { ...loadout.slots },
    enabled: [],
    lotTraits: [...lotType.traits],
    deck: [...deck],
    hand: [],
    minutesUsed: 0,
    cycleTime: 0,
    status: 'running',      // 'running' | 'scrapped' | 'shipped' | 'rejected'
    log: [],
  };
}

// --- small helpers ---------------------------------------------------------

function currentStep(state) {
  return LOT_TYPES[state.lotTypeId].route[state.stepIndex];
}

function addLog(state, line) {
  return { ...state, log: [...state.log, line] };
}

// Every engine call on a finished run is a bug in the caller.
function checkRunning(state, caller) {
  if (state.status !== 'running') throw new Error(`${caller}: the run is over (${state.status})`);
}

function checkInRoom(state, caller, wanted) {
  const inRoom = state.room !== null;
  if (inRoom !== wanted) {
    throw new Error(`${caller}: ${wanted ? 'not in a room yet' : 'already in a room'}`);
  }
}

// The equipment and materials that belong to a room, as content items.
function itemsForRoom(state, roomId) {
  const equipment = state.equipment.map(id => findItem(EQUIPMENT, id, 'equipment'));
  const materials = Object.values(state.slots).map(slot => findItem(MATERIALS, slot.id, 'material'));
  return [...equipment, ...materials].filter(item => item.room === roomId);
}

// --- the three steps of a room ---------------------------------------------

// The lot arrives in the current step's room.
export function enterStep(state) {
  checkRunning(state, 'enterStep');
  checkInRoom(state, 'enterStep', false);
  const step = currentStep(state);

  // 1. The step's own risks enter the lot.
  let lot = state.lot;
  for (const [pattern, amount] of Object.entries(step.adds)) lot = addRisk(lot, pattern, amount);
  let next = { ...state, lot, room: { id: step.room, timeLeft: TIME_BUDGETS[step.room], revealed: [] } };

  // 2. Equipment and materials for this room act once, before any card.
  // applyEffects skips effects whose own `when` fails, but not the item's
  // top-level `when`, so that is checked here.
  for (const item of itemsForRoom(next, step.room)) {
    if (conditionMet(next, item.when)) next = applyEffects(next, item);
  }

  // 3. The time the lot spends in this room counts whether you play or not.
  const budget = next.room.timeLeft;
  next = { ...next, room: { ...next.room, budget }, cycleTime: next.cycleTime + budget };

  // 4. Deal a hand from the deck's cards for this room (seeded shuffle).
  const roomCards = next.deck.filter(id => findCard(id).room === step.room);
  const dealt = shuffle(next.rngState, roomCards);
  next = { ...next, rngState: dealt.rngState, hand: dealt.value.slice(0, HAND_SIZE) };
  return addLog(next, `Step ${state.stepIndex + 1} ${step.label}: ${budget} min, hand ${next.hand.join(', ') || '(none)'}`);
}

// Why a card can't be played right now, or null if it can.
function whyIllegal(state, cardId) {
  if (!state.hand.includes(cardId)) return 'not in hand';
  const card = findCard(cardId);
  if (card.room !== state.room.id) return `belongs in ${card.room}, not ${state.room.id}`;
  if (!conditionMet(state, card.when)) return 'its condition is not met';
  if ((card.cost.time ?? 0) > state.room.timeLeft) return 'not enough time left';
  if ((card.cost.cash ?? 0) > state.cash) return 'not enough cash';
  return null;
}

// The cards in hand that can be played right now.
export function legalCards(state) {
  if (state.status !== 'running' || state.room === null) return [];
  return state.hand.filter(id => whyIllegal(state, id) === null);
}

// Plays one card: pays its base time and cash, applies its effects, and
// takes it out of the hand.
export function playCard(state, cardId) {
  checkRunning(state, 'playCard');
  checkInRoom(state, 'playCard', true);
  const reason = whyIllegal(state, cardId);
  if (reason) throw new Error(`Cannot play ${cardId}: ${reason}`);

  const card = findCard(cardId);
  const timeLeft = state.room.timeLeft - (card.cost.time ?? 0);
  let next = { ...state, room: { ...state.room, timeLeft }, cash: state.cash - (card.cost.cash ?? 0) };
  next = applyEffects(next, card);
  const handIndex = next.hand.indexOf(cardId);   // remove one copy only
  next = { ...next, hand: next.hand.filter((_, i) => i !== handIndex) };
  return addLog(next, `  played ${cardId}`);
}

// The room's patterns bite. Then the lot is scrapped, moves on, or ships.
// Time not spent is lost.
export function resolveStep(state) {
  checkRunning(state, 'resolveStep');
  checkInRoom(state, 'resolveStep', true);
  const step = currentStep(state);

  const scatter = rollScatter(state.rngState, step.realizes, state.scatterStrength);
  const lot = realizeRisks(state.lot, step.realizes, scatter.value);
  const minutesUsed = state.minutesUsed + (state.room.budget - state.room.timeLeft);
  let next = {
    ...state, lot, minutesUsed, rngState: scatter.rngState,
    room: null, hand: [], stepIndex: state.stepIndex + 1,
  };

  const yieldNow = lotYield(lot);
  const percent = `${(yieldNow * 100).toFixed(1)}%`;
  const isLastStep = next.stepIndex >= LOT_TYPES[state.lotTypeId].route.length;
  if (yieldNow < SCRAP_LINE) {
    // A scrapped lot stays at the step where it died.
    return addLog({ ...next, stepIndex: state.stepIndex, status: 'scrapped' }, `  yield ${percent}: scrapped`);
  }
  if (isLastStep) {
    const status = yieldNow >= CUSTOMER_SPEC ? 'shipped' : 'rejected';
    next = { ...next, stepIndex: state.stepIndex, status };
    return addLog(next, `  yield ${percent}: ${status}`);
  }
  return addLog(next, `  yield ${percent}`);
}
