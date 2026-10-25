// run.js — one run: one lot walking its route from the first room to ship.
//
// Walk the route, deal a hand in each room, play cards, resolve the room,
// walk the corridor to the next room, ship. A procurement side stop opens a
// shop (buyItem); the other side stops and saves come later in M3.
//
// A run goes like this, one step of the route at a time:
//   enterStep    → the lot arrives in the step's room
//   playCard     → zero or more times, while time and cash allow
//   resolveStep  → the room's risks bite; scrap, move on, or ship
//   walkCorridor → between two rooms: take one side stop, or go straight on
//   buyItem      → zero or more times, while a procurement stop's shop is open
//   pmTool       → once at most, while a PM/DOE stop is open
//
// Order inside enterStep (lotTypes.js): add the step's risks and the room
// tool's drift risk (tools.js), set the room's time budget, apply the
// equipment and materials for this room, then deal. resolveStep then records
// the tool's SPC point for this lot and wears the tool.
//
// Every function returns a NEW state. Nothing is changed in place. All
// randomness comes from rng.js, and the generator's number (rngState) is
// kept in the state, so the same seed and the same plays give the same run.

import { PRACTICES, EQUIPMENT, MATERIALS, STARTER_IDS } from '../content/content.js';
import { TOOL_MONITORS } from '../content/toolMonitors.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import {
  STARTING_CASH, HAND_SIZE, SCRAP_LINE, CUSTOMER_SPEC, SCATTER_STRENGTH, TIME_BUDGETS,
  SIDE_STOP_MINUTES, PM_TOOLS_PER_STOP, QTIME_RISK_PER_MINUTE,
} from '../content/balance.js';
import { normalizeSeed, shuffle } from './rng.js';
import { createLot, addRisk, realizeRisks, rollScatter, lotYield } from './lot.js';
import { conditionMet, applyEffects } from './resolve.js';
import { buildMap } from './map.js';
import { shopStock, whyCannotBuy, findShopItem } from './shop.js';
import { startingTools, driftRisk, useTool, pmChoices, restoreTool } from './tools.js';

// Looks up a content item by id, or throws naming it.
function findItem(list, id, kind) {
  const item = list.find(entry => entry.id === id);
  if (!item) throw new Error(`Unknown ${kind}: ${id}`);
  return item;
}
const findCard = id => findItem(PRACTICES, id, 'practice');

// Cards that some item unlocks with an `enables` effect (e.g. the endpoint
// detector unlocks endpointEtch). These are playable only once enabled.
const GATED_CARDS = new Set(
  [...EQUIPMENT, ...MATERIALS, ...PRACTICES]
    .flatMap(item => item.effects ?? [])
    .filter(effect => effect.op === 'enables')
    .map(effect => effect.id),
);

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
// `toolDrift: false` keeps every tool at full health and stops wear, so
// drift adds nothing (for hand checks, like scatterStrength: 0).
// `startingHealth`, e.g. { cmp: 60 }, fixes a tool's starting health.
export function createRun({
  seed = 1,
  lotTypeId = 'cuLine',
  deck = starterDeck(),
  loadout = defaultLoadout(),
  scatterStrength = SCATTER_STRENGTH,
  toolDrift = true,
  startingHealth = {},
} = {}) {
  if (normalizeSeed(seed) === null) throw new Error(`createRun: bad seed ${seed}`);
  const lotType = LOT_TYPES[lotTypeId];
  if (!lotType) throw new Error(`createRun: unknown lot type ${lotTypeId}`);
  deck.forEach(findCard);   // a typo in the deck fails here, not mid-run

  let lot = createLot();
  for (const [pattern, amount] of Object.entries(lotType.startRisks)) {
    lot = addRisk(lot, pattern, amount);
  }
  const { tools, toolRngState } = startingTools(seed, { toolDrift, startingHealth });

  return {
    seed,
    rngState: seed,
    lotTypeId,
    scatterStrength,
    stepIndex: 0,
    lot,
    cash: STARTING_CASH,
    room: null,             // { id, timeLeft, budget, revealed } while in a room
    map: buildMap(seed, lotType.route),   // the corridors (map.js), known from the start
    corridor: null,         // index of the corridor the lot stands in, or null
    shop: null,             // { corridor, stock, bought } while a procurement stop is open
    pm: null,               // { corridor, choices, done } while a PM/DOE stop is open
    tools,                  // per room: { health, spc: [points in sigma] } (tools.js)
    toolDrift,
    toolRngState,           // the tools' own generator, for SPC noise
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
  if (state.corridor !== null) throw new Error('enterStep: the lot is still in a corridor (call walkCorridor first)');
  const step = currentStep(state);

  // 1. The step's own risks enter the lot.
  let lot = state.lot;
  for (const [pattern, amount] of Object.entries(step.adds)) lot = addRisk(lot, pattern, amount);
  // A drifted tool adds risk to the pattern it feeds (0 for a healthy tool).
  const monitor = TOOL_MONITORS[step.room];
  const drift = monitor ? driftRisk(state.tools[step.room].health, monitor.oneSided) : 0;
  if (drift > 0) lot = addRisk(lot, monitor.pattern, drift);
  // Entering a room also closes any shop or PM stop the lot was standing in.
  let next = { ...state, lot, shop: null, pm: null, room: { id: step.room, timeLeft: TIME_BUDGETS[step.room], revealed: [] } };

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

// Why a card can't be played right now, or null if it can. Exported so the
// screen can say why a card is greyed out (src/ui/view.js).
export function whyIllegal(state, cardId) {
  if (!state.hand.includes(cardId)) return 'not in hand';
  const card = findCard(cardId);
  if (card.room !== state.room.id) return `belongs in ${card.room}, not ${state.room.id}`;
  if (!conditionMet(state, card.when)) return 'its condition is not met';
  if (GATED_CARDS.has(cardId) && !state.enabled.includes(cardId)) return 'not enabled yet';
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
  next = useTool(next, step.room);   // this lot's SPC point, then wear

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
  // Still running: the lot steps out into the corridor after this room.
  return addLog({ ...next, corridor: state.stepIndex }, `  yield ${percent}`);
}

// Between two rooms: take one of the corridor's side stops (`stopKind`, one
// of its offers) or go straight on (`stopKind` = null). A stop costs cycle
// time (SIDE_STOP_MINUTES). In a Q-time corridor, the wait also grows the
// Q-time pattern: QTIME_RISK_PER_MINUTE × the minutes. A procurement stop
// opens a shop (shop.js) and a PM/DOE stop opens a PM (pmTool); the other
// stops only cost their time for now.
export function walkCorridor(state, stopKind) {
  checkRunning(state, 'walkCorridor');
  if (state.corridor === null) throw new Error('walkCorridor: the lot is not in a corridor');
  const corridor = state.map[state.corridor];
  if (stopKind !== null && !corridor.offers.includes(stopKind)) {
    throw new Error(`walkCorridor: ${stopKind} is not offered here (offers: ${corridor.offers.join(', ')})`);
  }

  const minutes = stopKind === null ? 0 : SIDE_STOP_MINUTES[stopKind];
  const qtimePattern = LOT_TYPES[state.lotTypeId].route[corridor.afterStep].qtime;
  let lot = state.lot;
  if (qtimePattern && minutes > 0) lot = addRisk(lot, qtimePattern, QTIME_RISK_PER_MINUTE * minutes);

  const map = state.map.map((entry, index) =>
    index === state.corridor ? { ...entry, walked: true, taken: stopKind } : entry);
  const shop = stopKind === 'procurement'
    ? { corridor: state.corridor, stock: shopStock(state, state.corridor), bought: [] }
    : null;
  const pm = stopKind === 'pm'
    ? { corridor: state.corridor, choices: pmChoices(state, state.corridor), done: [] }
    : null;
  const next = { ...state, lot, map, shop, pm, corridor: null, cycleTime: state.cycleTime + minutes };
  if (stopKind === null) return addLog(next, '  corridor: straight on');
  const stockText = shop ? `, stock ${shop.stock.join(', ')}` : '';
  return addLog(next, `  corridor: ${stopKind} (${minutes} min${stockText})`);
}

// Why this room's tool can't be PM'd right now, or null if it can.
// Exported so the screen can say why a PM button is missing.
export function whyCannotPm(state, roomId) {
  if (state.pm === null) return 'no PM stop open';
  if (state.pm.done.length >= PM_TOOLS_PER_STOP) return 'already used this stop\'s PM';
  if (!state.pm.choices.includes(roomId)) return 'not a tool on the route ahead';
  return null;
}

// PMs one tool at an open PM/DOE stop (M3 item 2c). Its health goes back
// to a seeded 75–95 (tools.js restoreTool), so drift and wear start again
// from there. One PM per stop (PM_TOOLS_PER_STOP).
export function pmTool(state, roomId) {
  checkRunning(state, 'pmTool');
  const reason = whyCannotPm(state, roomId);
  if (reason) throw new Error(`Cannot PM ${roomId}: ${reason}`);
  const before = state.tools[roomId].health;
  let next = restoreTool(state, roomId);
  next = { ...next, pm: { ...next.pm, done: [...next.pm.done, roomId] } };
  return addLog(next, `  PM ${roomId}: health ${before} → ${next.tools[roomId].health}`);
}

// Buys one item from the open shop and pays its cash price. Equipment joins
// the lot's equipment and acts every time the lot enters its room, from the
// next room on. A material replaces whatever is in its slot. Buying never
// takes cash below 0 (decision O4): an item you can't afford is refused.
export function buyItem(state, itemId) {
  checkRunning(state, 'buyItem');
  const reason = whyCannotBuy(state, itemId);
  if (reason) throw new Error(`Cannot buy ${itemId}: ${reason}`);

  const item = findShopItem(itemId);
  let next = {
    ...state,
    cash: state.cash - item.cost.cash,
    shop: { ...state.shop, bought: [...state.shop.bought, itemId] },
  };
  if (item.kind === 'equipment') {
    next = { ...next, equipment: [...next.equipment, itemId] };
  } else {
    next = { ...next, slots: { ...next.slots, [item.slot]: slotEntry(itemId) } };
  }
  return addLog(next, `  bought ${itemId} (${item.cost.cash})`);
}
