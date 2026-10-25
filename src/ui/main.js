// main.js — starts the page: builds a seeded run, walks it to etch, draws it,
// and answers the buttons.
//
// For now (M2) the screen only shows the etch room. The lot walks the steps
// before etch with nothing played, then enters etch. Tapping a card plays it;
// "Run etch" ends the room and shows the result.
//
// The whole run lives in one variable, `state`. The screen never changes it
// directly: every button calls an engine function (playCard, resolveStep),
// stores the new state that comes back, and redraws.

import { normalizeSeed } from '../engine/rng.js';
import { lotYield } from '../engine/lot.js';
import { createRun, enterStep, resolveStep, playCard, starterDeck, defaultLoadout } from '../engine/run.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import { roomView, resultView, parseSeed } from './view.js';
import { renderRoom, renderResult, renderMessage, renderError, focusNextAction } from './render.js';

const LOT_TYPE_ID = 'cuLine';
const SHOWN_ROOM = 'etch';   // the room this screen shows

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

// The 0-based index of the first route step in the given room.
function stepIndexOfRoom(roomId) {
  const index = LOT_TYPES[LOT_TYPE_ID].route.findIndex(step => step.room === roomId);
  if (index === -1) throw new Error(`The ${LOT_TYPE_ID} route has no ${roomId} step`);
  return index;
}

// Starter deck, default loadout (i-line resist in litho), normal scatter.
// Walks the steps before the shown room doing nothing, then enters it.
// If the lot is scrapped on the way, returns the scrapped state instead.
function runToRoom(seed, roomId) {
  const target = stepIndexOfRoom(roomId);
  let state = createRun({ seed, lotTypeId: LOT_TYPE_ID, deck: starterDeck(), loadout: defaultLoadout() });
  while (state.status === 'running' && state.stepIndex < target) state = resolveStep(enterStep(state));
  return state.status === 'running' ? enterStep(state) : state;
}

const app = document.getElementById('app');
let state = null;   // the whole run; replaced, never edited

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
    state = playCard(state, cardId);
    showRoom();
    focusNextAction(app);
  });
}

function onRunRoom() {
  safely(() => {
    const before = state;
    state = resolveStep(state);
    renderResult(app, resultView(before, state), { onReplay, onNewSeed });
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

// Builds a fresh run for the seed and shows the room (or the scrap message).
function startRun(seed) {
  state = runToRoom(seed, SHOWN_ROOM);
  if (state.status === 'scrapped') {
    const percent = (lotYield(state.lot) * 100).toFixed(1);
    renderMessage(app, `Lot scrapped at step ${state.stepIndex + 1} (yield ${percent}%). Seed ${state.seed}.`);
    return;
  }
  showRoom();
}

safely(() => startRun(chooseSeed()));
