// storage.js — saves the run in the browser and picks it up again on reload.
//
// What is saved is NOT the whole state. It is the seed plus the list of
// actions the player took, for example:
//
//   { version: 2, seed: 123456, unlocked: ['slowStartPlate', 'additiveBath'],
//     actions: [['enter'], ['play', 'timedOverEtch'], ['run'], ['walk', null], ['enter'], …] }
//
// `unlocked` is the list of items the notebook had earned when the run
// began (M4 item 4). It is saved with the run, so a diagnosis made since, in
// another tab, can't change the deck or the shop of a resumed run.
//
// To resume, the page builds a fresh run for the seed and its unlocked list
// and plays the actions again through the engine (replayRun). Same seed + same actions → same run
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

import {
  enterStep, playCard, resolveStep, walkCorridor, buyItem, pmTool, doeCard, chooseEventOption, scrapLot,
} from '../engine/run.js';
import { normalizeSeed } from '../engine/rng.js';

// Goes up whenever a change ships that could replay an old save
// differently: the actions, the engine rules, or any number or effect in
// balance.js or content.js (David, 25 Oct 2026). An old save is then
// ignored instead of replayed wrongly.
// The notebook (M4) has its own key, so bumping this never touches it.
// 2 (26 Oct 2026): the save also holds the run's unlocked list (M4 item 4).
export const SAVE_VERSION = 2;
export const SAVE_KEY = 'fabrun.run.v2';   // bump the v2 together with SAVE_VERSION

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

// Saves the run as { seed, unlocked, actions }: its seed, the unlocked list
// it began with, and its action list. True if saved.
export function saveRun({ seed, unlocked, actions }, storage = browserStorage()) {
  return writeJson(SAVE_KEY, { version: SAVE_VERSION, seed, unlocked, actions }, storage);
}

// True for a list of item ids (text). An id no longer in the content is
// harmless: the deck and the shop only ever look up ids that exist.
const isIdList = value => Array.isArray(value) && value.every(id => typeof id === 'string');

// The saved { seed, unlocked, actions }, or null if there is no usable save:
// nothing stored, another version, a bad seed, an unlocked list that isn't
// a list of ids, or actions that aren't a list.
export function loadRun(storage = browserStorage()) {
  const save = readJson(SAVE_KEY, storage);
  if (save === null || typeof save !== 'object') return null;
  if (save.version !== SAVE_VERSION) return null;
  if (normalizeSeed(save.seed) === null) return null;
  if (!isIdList(save.unlocked)) return null;
  if (!Array.isArray(save.actions)) return null;
  return { seed: save.seed, unlocked: save.unlocked, actions: save.actions };
}

// Removes the run save (when the run ends, or a new run starts).
export function clearRun(storage = browserStorage()) {
  return removeKey(SAVE_KEY, storage);
}

// --- the notebook (M4 item 2) --------------------------------------------
//
// The notebook is the player's long-term progress, so it is never thrown
// away the way an old run save is. Its key has no version in its name; the
// version lives inside the object, so a later change can upgrade an old
// notebook instead of discarding it (CLAUDE.md §11).

export const NOTEBOOK_KEY = 'fabrun.notebook';
export const NOTEBOOK_VERSION = 1;   // the shape notebook.js writes: { version, entries: [{ id, seed }] }

// True for an entry this code can use: a failure-mode id (text) and the
// seed it was found on (a number). Ids no longer in content.js still count:
// they are kept, so they come back if the content does, and the game simply
// never offers them (David, 26 Oct 2026, Q3).
function isGoodEntry(entry) {
  return entry !== null && typeof entry === 'object'
    && typeof entry.id === 'string' && entry.id !== ''
    && typeof entry.seed === 'number' && Number.isFinite(entry.seed);
}

// The usable entries of a stored value, without duplicates (first one wins),
// as fresh { id, seed } objects. Anything else in the value is dropped.
function goodEntries(stored) {
  if (stored === null || typeof stored !== 'object' || !Array.isArray(stored.entries)) return [];
  const seen = new Set();
  const entries = [];
  for (const entry of stored.entries) {
    if (!isGoodEntry(entry) || seen.has(entry.id)) continue;
    seen.add(entry.id);
    entries.push({ id: entry.id, seed: entry.seed });
  }
  return entries;
}

// True when the stored notebook was written by a NEWER version of the game
// (a newer page was opened, then an older cached one). This code must not
// read or overwrite it (David, 26 Oct 2026, Q2).
function isNewerNotebook(stored) {
  return stored !== null && typeof stored === 'object'
    && typeof stored.version === 'number' && stored.version > NOTEBOOK_VERSION;
}

// The saved notebook, or an empty one when there is none, it is junk, it is
// from a newer version, or storage is blocked. Never throws.
export function loadNotebook(storage = browserStorage()) {
  const stored = readJson(NOTEBOOK_KEY, storage);
  if (isNewerNotebook(stored)) return { version: NOTEBOOK_VERSION, entries: [] };
  return { version: NOTEBOOK_VERSION, entries: goodEntries(stored) };
}

// Saves the notebook. It first reads what is stored and keeps every entry
// from both (by id), so two open tabs can't erase each other's entries
// (Q4). True if saved; false if storage is blocked or the stored notebook
// is from a newer version (then it is left exactly as it was).
export function saveNotebook(notebook, storage = browserStorage()) {
  const stored = readJson(NOTEBOOK_KEY, storage);
  if (isNewerNotebook(stored)) return false;
  const merged = goodEntries({ entries: [...goodEntries(stored), ...goodEntries(notebook)] });
  return writeJson(NOTEBOOK_KEY, { version: NOTEBOOK_VERSION, entries: merged }, storage);
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
  pm: (state, roomId) => pmTool(state, roomId),
  doe: (state, cardId) => doeCard(state, cardId),
  choose: (state, optionIndex) => chooseEventOption(state, optionIndex),   // an event's option
  scrap: (state) => scrapLot(state),
};
// Diagnosing on the ship report is not an action here: it comes after the
// run has ended, and an ended run's save is cleared.

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
