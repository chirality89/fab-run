// sideStops.js — what the player does at a side stop, between two rooms.
//
// walkCorridor (run.js) opens the stop; these functions act inside it:
//   buyItem           → zero or more times, while a procurement stop's shop is open
//   pmTool or doeCard → one of the two at most, while a PM/DOE stop is open
//   chooseEventOption → once, while an event stop is open
//
// Like run.js, every function returns a NEW state.

import { LOT_TYPES } from '../content/lotTypes.js';
import { PM_DOE_CHOICES_PER_STOP, DOE_CASH_COST, QTIME_RISK_PER_MINUTE } from '../content/balance.js';
import { addRisk } from './lot.js';
import { applyEffects } from './resolve.js';
import { whyCannotBuy, findShopItem } from './shop.js';
import { restoreTool } from './tools.js';
import { findEvent } from './events.js';
import { slotEntry, addLog, checkRunning } from './runState.js';

// Has this PM/DOE stop's one choice (a PM or a DOE) been used?
function stopUsed(pm) {
  return pm.done.length + pm.doeDone.length >= PM_DOE_CHOICES_PER_STOP;
}

// Why this room's tool can't be PM'd right now, or null if it can.
// Exported so the screen can say why a PM button is missing.
export function whyCannotPm(state, roomId) {
  if (state.pm === null) return 'no PM stop open';
  if (stopUsed(state.pm)) return 'already used this stop\'s one choice';
  if (!state.pm.choices.includes(roomId)) return 'not a tool on the route ahead';
  return null;
}

// PMs one tool at an open PM/DOE stop (M3 item 2c). Its health goes back
// to a seeded 75–95 (tools.js restoreTool), so drift and wear start again
// from there. One choice per stop: a PM or a DOE (PM_DOE_CHOICES_PER_STOP).
export function pmTool(state, roomId) {
  checkRunning(state, 'pmTool');
  const reason = whyCannotPm(state, roomId);
  if (reason) throw new Error(`Cannot PM ${roomId}: ${reason}`);
  const before = state.tools[roomId].health;
  let next = restoreTool(state, roomId);
  next = { ...next, pm: { ...next.pm, done: [...next.pm.done, roomId] } };
  return addLog(next, `  PM ${roomId}: health ${before} → ${next.tools[roomId].health}`);
}

// Why this practice can't be upgraded by a DOE right now, or null if it can.
// Exported so the screen can say why.
export function whyCannotDoe(state, cardId) {
  if (state.pm === null) return 'no PM/DOE stop open';
  if (stopUsed(state.pm)) return 'already used this stop\'s one choice';
  if (!state.pm.doeOffers.includes(cardId)) return 'not offered at this stop';
  if (DOE_CASH_COST > state.cash) return 'not enough cash';
  return null;
}

// Runs a DOE on one practice at an open PM/DOE stop (M3 item 2d): it plays
// as its DOE version (content.js `upgrade`) for the rest of the run, and
// the DOE costs DOE_CASH_COST.
export function doeCard(state, cardId) {
  checkRunning(state, 'doeCard');
  const reason = whyCannotDoe(state, cardId);
  if (reason) throw new Error(`Cannot DOE ${cardId}: ${reason}`);
  const next = {
    ...state,
    cash: state.cash - DOE_CASH_COST,
    upgraded: [...state.upgraded, cardId],
    pm: { ...state.pm, doeDone: [...state.pm.doeDone, cardId] },
  };
  return addLog(next, `  DOE ${cardId} (${DOE_CASH_COST})`);
}

// Chooses one option of the open event (M3 item 2e), once. Its minutes
// change cycle time (never below 0); in a Q-time corridor, positive minutes
// also grow the Q-time pattern, like a side stop's wait. Then its effects
// apply (events.js content: cash, addRisk, toolHealth with a room).
export function chooseEventOption(state, optionIndex) {
  checkRunning(state, 'chooseEventOption');
  if (state.event === null) throw new Error('chooseEventOption: no event open');
  if (state.event.chosen !== null) throw new Error('chooseEventOption: an option was already chosen');
  const event = findEvent(state.event.eventId);
  const option = event.options[optionIndex];
  if (!option) throw new Error(`chooseEventOption: ${event.id} has no option ${optionIndex}`);

  const qtimePattern = LOT_TYPES[state.lotTypeId].route[state.event.corridor].qtime;
  let lot = state.lot;
  if (qtimePattern && option.minutes > 0) lot = addRisk(lot, qtimePattern, QTIME_RISK_PER_MINUTE * option.minutes);
  let next = {
    ...state,
    lot,
    cycleTime: Math.max(0, state.cycleTime + option.minutes),
    event: { ...state.event, chosen: optionIndex },
  };
  next = applyEffects(next, option);
  return addLog(next, `  event ${event.id}: ${option.label}`);
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
