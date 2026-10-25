// main.js — starts the page: builds a seeded run, draws it, and answers
// the buttons.
//
// The page plays the whole route. It starts on the floor plan, then goes
// room → Run → result → Continue → corridor (side stop or straight on) →
// next room …, until the lot ships, is rejected or is scrapped.
//
// The whole run lives in one variable, `state`. The screen never changes it
// directly: every button calls an engine function (enterStep, playCard,
// resolveStep, walkCorridor, buyItem, pmTool, doeCard, chooseEventOption),
// stores the new state that comes back, and redraws.

import { normalizeSeed } from '../engine/rng.js';
import {
  createRun, enterStep, resolveStep, playCard, walkCorridor, buyItem, pmTool, doeCard, chooseEventOption,
  starterDeck, defaultLoadout, scrapLot,
} from '../engine/run.js';
import { roomView, resultView, mapView, stopView, shopView, parseSeed } from './view.js';
import { renderRoom, renderResult, renderShip, renderError, focusNextAction, showFromTop } from './render.js';
import { renderMap, renderStop, renderShop, renderPm, renderEvent } from './floorPlan.js';
import { eventView } from './eventView.js';
import { pmView } from './pmView.js';
import { shipView } from './shipView.js';
import { emptyNotebook, diagnoseLot } from '../engine/notebook.js';

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
let notebook = emptyNotebook();   // diagnosed failure modes; kept across runs (in memory until M4 item 2)
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

// --- what the buttons do -------------------------------------------------

function onPlay(cardId) {
  safely(() => {
    const position = state.hand.indexOf(cardId);   // where the card sat in the hand
    state = playCard(state, cardId);
    showRoom();
    focusNextAction(app, position);
  });
}

// Into the next room. On the map, the lot is either at the door (before
// step 1) or in a corridor; going straight on walks the corridor first.
function onGoStraight() {
  safely(() => {
    if (state.corridor !== null) state = walkCorridor(state, null);
    enterRoom();
  });
}

function onTakeStop(stopKind) {
  safely(() => {
    const before = state;
    state = walkCorridor(state, stopKind);
    if (state.shop !== null) showShop(null);
    else if (state.pm !== null) showPm(JUST_OPENED);
    else if (state.event !== null) showEvent();
    else renderStop(app, stopView(before, state, stopKind), { onContinue: () => safely(enterRoom) });
  });
}

function onPm(roomId) {
  safely(() => {
    state = pmTool(state, roomId);
    showPm(AFTER_CHOICE);
  });
}

function onDoe(cardId) {
  safely(() => {
    state = doeCard(state, cardId);
    showPm(AFTER_CHOICE);
  });
}

function onChoose(optionIndex) {
  safely(() => {
    state = chooseEventOption(state, optionIndex);
    showEvent();
  });
}

function onBuy(itemId) {
  safely(() => {
    state = buyItem(state, itemId);
    showShop(itemId);
  });
}

function onRunRoom() {
  safely(() => {
    const before = state;
    state = resolveStep(state);
    const onShip = () => safely(showShipReport);
    renderResult(app, resultView(before, state), { onContinue: () => safely(showMap), onShip, onReplay, onNewSeed });
  });
}

function onScrap() {
  safely(() => {
    state = scrapLot(state);
    showShipReport();
  });
}

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

function showMap() {
  renderMap(app, mapView(state), { onTakeStop, onGoStraight, onScrap });
}

// The ship report: the one screen every finished run ends on, whether the
// lot shipped, was rejected or was scrapped.
function showShipReport() {
  renderShip(app, shipView(state, notebook, diagnosis), { onDiagnose, onReplay, onNewSeed });
}

// The player names a failure mode on the ship report (M4 item 1). The
// notebook lives in memory for now; M4 item 2 saves it under its own key.
function onDiagnose(failureModeId) {
  safely(() => {
    const done = diagnoseLot(state, notebook, failureModeId);
    state = done.state;
    notebook = done.notebook;
    diagnosis = done.result;
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
  state = enterStep(state);
  showRoom();
  showFromTop(app);
}

// A fresh run for the seed: starter deck, default loadout (i-line resist in
// litho), normal scatter. It starts on the floor plan.
function startRun(seed) {
  diagnosis = null;
  state = createRun({ seed, lotTypeId: LOT_TYPE_ID, deck: starterDeck(), loadout: defaultLoadout() });
  showMap();
}

safely(() => startRun(chooseSeed()));
