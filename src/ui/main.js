// main.js — starts the page: builds a seeded run, draws it, and answers
// the buttons.
//
// The page plays the whole route. It starts on the floor plan, then goes
// room → Run → result → Continue → corridor (side stop or straight on) →
// next room …, until the lot ships, is rejected or is scrapped.
//
// The whole run lives in one variable, `state`. The screen never changes it
// directly: every button calls act() with an action such as ['play', cardId].
// act() runs the matching engine function (storage.js applyAction), keeps the
// new state, adds the action to the list and saves. Then the screen redraws.
//
// Saving (storage.js): the save is the seed plus the action list. On a reload
// the run is replayed and the page opens on the screen the last action
// showed. A ?seed= in the address that differs from the save starts that seed
// fresh instead. When the run ends, the save is removed. Two tabs share one
// save, so the last tab to act is the one a reload picks up.

import { normalizeSeed } from '../engine/rng.js';
import { createRun, runDeck, defaultLoadout } from '../engine/run.js';
import { applyAction, saveRun, loadRun, clearRun, replayRun, loadNotebook, saveNotebook } from './storage.js';
import { roomView, resultView, mapView, stopView, shopView, parseSeed, badSeedText } from './view.js';
import {
  renderRoom, renderResult, renderShip, renderError, renderResumedNote, renderSeedNote, focusNextAction, showFromTop,
} from './render.js';
import { renderMap, renderStop, renderShop, renderPm, renderEvent } from './floorPlan.js';
import { eventView } from './eventView.js';
import { pmView } from './pmView.js';
import { shipView } from './shipView.js';
import { notebookView } from './notebookView.js';
import { renderNotebook } from './notebookPage.js';
import { diagnoseLot, unlockedIds } from '../engine/notebook.js';

const LOT_TYPE_ID = 'cuLine';

// A fresh seed from the clock, for when the address has no valid ?seed=.
// Outside rng.js, seeds come into the game in only two places: here, and
// from the page address in parseSeed (view.js). Date.now() is milliseconds;
// % 2^32 keeps it inside the generator's 32-bit range.
function seedFromClock() {
  return normalizeSeed(Date.now() % 2 ** 32);
}

// Puts the seed in the page address (?seed=…) without reloading, so a
// reload or a shared link replays the run.
function writeSeedToAddress(seed) {
  const params = new URLSearchParams(window.location.search);
  params.set('seed', String(seed));
  window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
}

// The seed for this page: from the address, or a fresh one from the clock.
function chooseSeed() {
  const fromAddress = parseSeed(window.location.search, null);
  if (fromAddress !== null) return fromAddress;
  const seed = seedFromClock();
  writeSeedToAddress(seed);
  return seed;
}

const app = document.getElementById('app');
let state = null;   // the whole run; replaced, never edited
let actions = [];   // every action taken this run, in order: what the save holds
// Diagnosed failure modes, kept across runs under their own storage key
// (storage.js), so a new run or a run-save version bump never touches them.
let notebook = loadNotebook();
let diagnosis = null;   // this lot's diagnose result (notebook.js), or null before the guess

// Runs a screen-drawing step and shows any error in a visible box.
function safely(draw) {
  try {
    draw();
  } catch (error) {
    renderError(app, error);
    console.error(error);
  }
}

// --- taking an action ----------------------------------------------------

// Runs one action through the engine and keeps the new state. The action is
// added to the list only after the engine accepted it, so a refused tap never
// goes into the save. Returns the state from just before, for screens that
// show what changed.
function act(action) {
  const before = state;
  state = applyAction(state, action);
  actions = [...actions, action];
  keepSave();
  return before;
}

// Saves the run while it goes on; removes the save once it has ended, so a
// reload after the ship report starts fresh. A blocked storage just means
// no save (storage.js never throws).
function keepSave() {
  if (state.status === 'running') saveRun({ seed: state.seed, unlocked: state.unlocked, actions });
  else clearRun();
}

// Draws the screen that comes after `action`. `before` is the state from
// just before it. Used live after each tap, and once on a reload with the
// last saved action, so the page reopens where the player left it.
function showScreenAfter(action, before) {
  // `action ?? []` uses an empty list when there is no action yet; the
  // [name, value] = … line then takes the action's two parts.
  const [name, value] = action ?? [];
  if (name === 'enter' || name === 'play') showRoom();
  else if (name === 'run') showResult(before);
  // Going straight on ('walk' with null) is always followed by 'enter', so
  // a save never ends on it; it falls through to the map below.
  else if (name === 'walk' && value !== null) showStop(before, value);
  else if (name === 'buy') showShop(value);
  else if (name === 'pm' || name === 'doe') showPm(AFTER_CHOICE);
  else if (name === 'choose') showEvent();
  else if (name === 'scrap') showShipReport();
  else showMap();   // no action yet: the lot is at the door
}

// --- what the buttons do -------------------------------------------------

function onPlay(cardId) {
  safely(() => {
    const position = state.hand.indexOf(cardId);   // where the card sat in the hand
    act(['play', cardId]);
    showRoom();
    focusNextAction(app, position);
  });
}

// Into the next room. On the map, the lot is either at the door (before
// step 1) or in a corridor; going straight on walks the corridor first.
function onGoStraight() {
  safely(() => {
    if (state.corridor !== null) act(['walk', null]);
    enterRoom();
  });
}

function onTakeStop(stopKind) {
  safely(() => {
    const before = act(['walk', stopKind]);
    showStop(before, stopKind);
  });
}

// The buttons below take one action and draw the screen that follows it.
function takeAction(action) {
  safely(() => {
    const before = act(action);
    showScreenAfter(action, before);
  });
}

const onPm = roomId => takeAction(['pm', roomId]);
const onDoe = cardId => takeAction(['doe', cardId]);
const onChoose = optionIndex => takeAction(['choose', optionIndex]);
const onBuy = itemId => takeAction(['buy', itemId]);
const onRunRoom = () => takeAction(['run']);
const onScrap = () => takeAction(['scrap']);

function onReplay() {
  safely(() => startRun(state.seed));
}

function onNewSeed() {
  safely(() => {
    const seed = seedFromClock();
    writeSeedToAddress(seed);
    startRun(seed);
  });
}

// --- drawing -------------------------------------------------------------

function showRoom() {
  renderRoom(app, roomView(state), { onPlay, onRunRoom });
}

// The result of a room, right after Run. `before` is the state at Run.
function showResult(before) {
  const onShip = () => safely(showShipReport);
  renderResult(app, resultView(before, state), { onContinue: () => safely(showMap), onShip, onReplay, onNewSeed });
}

// The screen of the side stop just taken: the shop, PM/DOE or event, or
// the plain stop screen when the stop has nothing to choose.
function showStop(before, stopKind) {
  if (state.shop !== null) showShop(null);
  else if (state.pm !== null) showPm(JUST_OPENED);
  else if (state.event !== null) showEvent();
  else renderStop(app, stopView(before, state, stopKind), { onContinue: () => safely(enterRoom) });
}

function showMap() {
  renderMap(app, mapView(state), { onTakeStop, onGoStraight, onScrap, notebook: notebookOpener(showMap) });
}

// The ship report: the one screen every finished run ends on, whether the
// lot shipped, was rejected or was scrapped.
function showShipReport() {
  renderShip(app, shipView(state, notebook, diagnosis),
    { onDiagnose, onReplay, onNewSeed, notebook: notebookOpener(showShipReport) });
}

// The Notebook page (M4 item 3). Opening it is not a run action: nothing
// in the run changes and nothing is saved. Back calls `showBehind`, which
// redraws the screen the player came from (the floor plan or the ship
// report, with its diagnosis), exactly as it was.
function showNotebook(showBehind) {
  renderNotebook(app, notebookView(notebook), { onBack: () => safely(showBehind) });
}

// What the Notebook button in a header needs: the count it shows, and what
// a tap does. `showBehind` is the screen the button is on.
function notebookOpener(showBehind) {
  return {
    count: notebookView(notebook).count,
    onOpen: () => safely(() => showNotebook(showBehind)),
  };
}

// The player names a failure mode on the ship report (M4 item 1). A right
// answer is saved to the notebook's own key at once (M4 item 2); if storage
// is blocked it still counts for this visit. Not an action for the run
// save: the run has ended, so its save is gone.
function onDiagnose(failureModeId) {
  safely(() => {
    const done = diagnoseLot(state, notebook, failureModeId);
    state = done.state;
    notebook = done.notebook;
    diagnosis = done.result;
    if (done.result.correct && !done.result.alreadyKnown) saveNotebook(notebook);
    showShipReport();
  });
}

// The procurement screen. `justBought` is the item bought a moment ago, or
// null when the shop has just opened.
function showShop(justBought) {
  renderShop(app, shopView(state), { onBuy, onContinue: () => safely(enterRoom) }, justBought);
}

// The PM/DOE screen, either just opened or right after a PM or a DOE (then
// keyboard focus goes to Continue).
const JUST_OPENED = false;
const AFTER_CHOICE = true;
function showPm(justChose) {
  renderPm(app, pmView(state), { onPm, onDoe, onContinue: () => safely(enterRoom) }, justChose);
}

// The event screen: the situation and its options, then the result.
function showEvent() {
  renderEvent(app, eventView(state), { onChoose, onContinue: () => safely(enterRoom) });
}

function enterRoom() {
  act(['enter']);
  showRoom();
  showFromTop(app);
}

// A fresh run for the seed: the starter deck plus every practice in
// `unlocked`, default loadout (i-line resist in litho), normal scatter.
// The one place a run is built, for a new run and for a resumed one alike,
// so a replay always starts from the same lot. `unlocked` is what the
// notebook has earned now (a new run) or what was saved with the run (a
// resumed one), never the notebook as it is later (M4 item 4).
function newRun(seed, unlocked) {
  return createRun({
    seed, lotTypeId: LOT_TYPE_ID, deck: runDeck(unlocked), loadout: defaultLoadout(), unlocked,
  });
}

// Starts the seed from the beginning, on the floor plan. Any old save goes.
function startRun(seed) {
  diagnosis = null;
  state = newRun(seed, unlockedIds(notebook));
  actions = [];
  clearRun();
  showMap();
}

// Picks up the saved run, if there is one for this page. Returns true if it
// did. Not when the address asks for another seed (the link wins), and not
// when the save no longer replays or its run has already ended.
function resumeSavedRun() {
  const save = loadRun();
  if (save === null) return false;
  const fromAddress = parseSeed(window.location.search, null);
  if (fromAddress !== null && fromAddress !== save.seed) return false;

  const resumed = replayRun(newRun(save.seed, save.unlocked), save.actions);
  if (resumed === null || resumed.status !== 'running') return false;

  // The state just before the last action, for screens that show what it
  // changed (the room result, a side stop). Replaying all but the last
  // action gives exactly that state.
  const before = replayRun(newRun(save.seed, save.unlocked), save.actions.slice(0, -1));
  state = resumed;
  actions = save.actions;
  writeSeedToAddress(save.seed);
  try {
    showScreenAfter(save.actions.at(-1), before);
  } catch (error) {
    console.warn(`resume: could not draw the saved screen, starting fresh: ${error.message}`);
    return false;
  }
  renderResumedNote(app, save.seed);
  return true;
}

safely(() => {
  if (resumeSavedRun()) return;
  const search = window.location.search;   // read before chooseSeed rewrites the address
  const seed = chooseSeed();
  startRun(seed);
  const note = badSeedText(search, seed);
  if (note !== null) renderSeedNote(app, note);
});
