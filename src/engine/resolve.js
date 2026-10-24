// resolve.js — what each effect operation DOES to the run state.
//
// Every card, tool, material and consumable in content.js is a list of
// effects such as { op: 'defectMult', pattern: 'residue', mult: 0.3 }.
// This file is the one place that knows what the eight operations mean, and
// when a `when` condition is true. It does not decide WHEN a card is played or
// pay its base cost; that is the run's job (run.js, later).
//
// The slice of state used here (tasks/todo.md, M1 item 3):
//   lot, cash, room: { id, timeLeft, revealed }, tools: { [roomId]: { health } },
//   equipment: [ids], slots: { [slotName]: { id, shelfLife, decay } },
//   enabled: [card ids], lotTraits: [trait names]
//
// Every function returns a NEW state. Nothing is changed in place.

import { scaleRisk } from './lot.js';

const MIN_HEALTH = 0;
const MAX_HEALTH = 100;

// Adds a value to a list only if it is not there yet (a new list either way).
function addOnce(list, value) {
  return list.includes(value) ? [...list] : [...list, value];
}

// ---------------------------------------------------------------------------
// `when` conditions. Each key is one kind of check; with several keys, all
// of them must hold.
// ---------------------------------------------------------------------------
const CONDITIONS = {
  flag:      (state, flag) => state.lot.flags.includes(flag),
  equipment: (state, id) => state.equipment.includes(id),
  material:  (state, id) => Object.values(state.slots).some(slot => slot.id === id),
  lot:       (state, trait) => state.lotTraits.includes(trait),
};

// True if the effect's condition holds. No `when` at all means "always".
export function conditionMet(state, when) {
  if (!when) return true;
  return Object.entries(when).every(([key, value]) => {
    if (!(key in CONDITIONS)) throw new Error(`Unknown when condition: ${key}`);
    return CONDITIONS[key](state, value);
  });
}

// Refuses a number that is missing, NaN or infinite, so a typo in content.js
// fails loudly instead of quietly writing NaN into the state (lessons.md).
function checkFinite(value, label) {
  if (!Number.isFinite(value)) throw new Error(`${label} must be a number, got ${value}`);
  return value;
}

// ---------------------------------------------------------------------------
// One small function per operation. Each takes (state, effect, source).
// ---------------------------------------------------------------------------

// Scales one defect pattern's risk (lot.js refuses unknown patterns).
function defectMult(state, effect) {
  return { ...state, lot: scaleRisk(state.lot, effect.pattern, effect.mult) };
}

// Uses up (or, with a negative delta, gives back) room minutes. Never below 0.
function timeCost(state, effect) {
  const delta = checkFinite(effect.delta, 'timeCost delta');
  const timeLeft = Math.max(0, state.room.timeLeft - delta);
  return { ...state, room: { ...state.room, timeLeft } };
}

// Spends cash. Cash may go below 0 (that only blocks buying; decision O4).
function cashCost(state, effect) {
  const delta = checkFinite(effect.delta, 'cashCost delta');
  return { ...state, cash: state.cash - delta };
}

// Marks the lot, e.g. it now has an etch stop. A flag is only added once.
function setFlag(state, effect) {
  const flags = addOnce(state.lot.flags, effect.flag);
  return { ...state, lot: { ...state.lot, flags } };
}

// Shows a hidden value in this room; the UI reads room.revealed (M2).
// 'none' is a placeholder that does nothing.
function reveal(state, effect) {
  if (effect.what === 'none') return state;
  const revealed = addOnce(state.room.revealed, effect.what);
  return { ...state, room: { ...state.room, revealed } };
}

// Repairs or wears the tool of the room the lot is in, kept within 0..100.
function toolHealth(state, effect) {
  const roomId = state.room.id;
  const tool = state.tools[roomId];
  if (!tool) throw new Error(`toolHealth: no tool for room ${roomId}`);
  const delta = checkFinite(effect.delta, 'toolHealth delta');
  const health = Math.min(MAX_HEALTH, Math.max(MIN_HEALTH, tool.health + delta));
  return { ...state, tools: { ...state.tools, [roomId]: { ...tool, health } } };
}

// Makes another card playable. An id is only added once.
function enables(state, effect) {
  return { ...state, enabled: addOnce(state.enabled, effect.id) };
}

// The item gets worse each use: the slot's decay factor (starts at 1) scales
// the target risk, then the factor itself is multiplied by `mult`.
// mult below 1 would make the item improve with use, so it is refused.
function decayPerUse(state, effect, source) {
  const itemId = source?.id;
  if (!itemId) throw new Error('decayPerUse: no source item given');
  const mult = checkFinite(effect.mult, 'decayPerUse mult');
  if (mult < 1) throw new Error(`decayPerUse: mult must be 1 or more, got ${mult} for ${itemId}`);

  // Find the slot that holds this item.
  const slotName = Object.keys(state.slots).find(name => state.slots[name].id === itemId);
  if (!slotName) throw new Error(`decayPerUse: ${itemId} is not in any slot`);
  const slot = state.slots[slotName];
  const lot = scaleRisk(state.lot, effect.target, slot.decay);
  const newSlot = { ...slot, decay: checkFinite(slot.decay * mult, 'decay factor') };
  return { ...state, lot, slots: { ...state.slots, [slotName]: newSlot } };
}

const OPERATIONS = {
  defectMult, timeCost, cashCost, setFlag, reveal, toolHealth, enables, decayPerUse,
};

// Applies one effect, if its `when` holds. `source` is the item it came from.
export function applyEffect(state, effect, source) {
  const operation = OPERATIONS[effect.op];
  if (!operation) throw new Error(`Unknown effect op: ${effect.op}`);
  if (!conditionMet(state, effect.when)) return state;
  return operation(state, effect, source);
}

// Applies all of an item's effects in order. Each effect sees the state the
// previous one left, so a `when: { flag }` can react to an earlier setFlag.
// It does NOT check the item's own top-level `when` (e.g. endpoint etch needs
// the endpoint detector): whether a card may be played is run.js's job.
export function applyEffects(state, item) {
  return item.effects.reduce((current, effect) => applyEffect(current, effect, item), state);
}
