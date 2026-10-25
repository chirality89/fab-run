// storage.js — saves the run in the browser and picks it up again on reload.
//
// What is saved is NOT the whole state. It is the seed plus the list of
// actions the player took, for example:
//
//   { version: 1, seed: 123456,
//     actions: [['enter'], ['play', 'timedOverEtch'], ['run'], ['walk', null], ['enter'], …] }
//
// To resume, the page builds a fresh run for the seed and plays the actions
// again through the engine (replayRun). Same seed + same actions → same run
// (CLAUDE.md §8), so the lot ends up exactly where it was.
//
// The browser's storage can be blocked (private windows, strict settings),
// full, or hold junk. So every storage access here is inside try/catch, and
// the save and load functions never throw: a failed save just means "not
// saved", and a failed load means "no save". The game runs either way
// (CLAUDE.md §11). Only applyAction throws, on purpose, when the engine
// refuses an action; replayRun catches that.
//
// The functions that touch storage take it as their last argument, with the
// browser's localStorage as the default. Tests pass in a pretend storage.
//
// Small JavaScript notes for this file:
//   globalThis   the page's global object (window in a browser)
//   a ?? b       a, unless a is null or undefined, then b
//   catch { }    catches any error without naming it

import { enterStep, playCard, resolveStep, walkCorridor, buyItem } from '../engine/run.js';
import { normalizeSeed } from '../engine/rng.js';

// Goes up whenever a change ships that could replay an old save
// differently: the actions, the engine rules, or any number or effect in
// balance.js or content.js (David, 25 Oct 2026). An old save is then
// ignored instead of replayed wrongly.
// The notebook (M4) has its own key, so bumping this never touches it.
export const SAVE_VERSION = 1;
export const SAVE_KEY = 'fabrun.run.v1';   // bump the v1 together with SAVE_VERSION

// The browser's localStorage, or null. Even LOOKING it up throws in some
// browsers when storage is blocked, hence the try. Node has none.
function browserStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

// --- helpers any key can use (the notebook will reuse these) -------------

// The value stored under `key`, or null if there is none, it isn't valid
// JSON, or storage is blocked.
export function readJson(key, storage = browserStorage()) {
  try {
    const text = storage.getItem(key);
    return text === null ? null : JSON.parse(text);
  } catch {
    return null;
  }
}

// Stores `value` under `key`. True if it was saved, false if not.
export function writeJson(key, value, storage = browserStorage()) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// Removes `key`. True if that worked, false if storage is blocked.
export function removeKey(key, storage = browserStorage()) {
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// --- the run save --------------------------------------------------------

// Saves the run as its seed and its action list. True if saved.
export function saveRun(seed, actions, storage = browserStorage()) {
  return writeJson(SAVE_KEY, { version: SAVE_VERSION, seed, actions }, storage);
}

// The saved { seed, actions }, or null if there is no usable save: nothing
// stored, another version, a bad seed, or actions that aren't a list.
export function loadRun(storage = browserStorage()) {
  const save = readJson(SAVE_KEY, storage);
  if (save === null || typeof save !== 'object') return null;
  if (save.version !== SAVE_VERSION) return null;
  if (normalizeSeed(save.seed) === null) return null;
  if (!Array.isArray(save.actions)) return null;
  return { seed: save.seed, actions: save.actions };
}

// Removes the run save (when the run ends, or a new run starts).
export function clearRun(storage = browserStorage()) {
  return removeKey(SAVE_KEY, storage);
}

// --- replaying the actions -----------------------------------------------

// What each action name does: the engine function it calls. Each action is
// a list: its name first, then the one value it needs, if any.
// main.js adds an action to the list only AFTER the engine accepted it, so a
// refused tap never ends up in the save.
const ACTIONS = {
  enter: (state) => enterStep(state),
  play: (state, cardId) => playCard(state, cardId),
  run: (state) => resolveStep(state),
  walk: (state, stopKind) => walkCorridor(state, stopKind),   // null = straight on
  buy: (state, itemId) => buyItem(state, itemId),
};

// Applies one action to the state and returns the new state. Throws if the
// action is unknown or the engine refuses it.
export function applyAction(state, action) {
  if (!Array.isArray(action)) throw new Error(`applyAction: not an action: ${JSON.stringify(action)}`);
  const [name, value] = action;
  // Object.hasOwn looks only at the names written in ACTIONS, so a name that
  // every JavaScript object has built in (like 'toString') is not an action.
  if (!Object.hasOwn(ACTIONS, name)) throw new Error(`applyAction: unknown action ${name}`);
  return ACTIONS[name](state, value);
}

// Plays the saved actions again, starting from `startState` (a fresh run for
// the saved seed, built by the caller with its usual deck and loadout).
// Returns the final state, or null if any action fails. A save from older
// rules can do that; the page then starts the seed fresh, never half-played.
export function replayRun(startState, actions) {
  try {
    let state = startState;
    for (const action of actions) state = applyAction(state, action);
    return state;
  } catch (error) {
    // Printed so a real engine bug is not mistaken for an old save.
    console.warn(`replayRun: save not replayed, starting fresh: ${error.message}`);
    return null;
  }
}
