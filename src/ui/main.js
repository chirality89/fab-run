// main.js — starts the page: builds a seeded run, walks it to etch, draws it.
//
// For now (M2 item 1) the screen only shows the etch room. The lot walks the
// three steps before etch with nothing played, then enters etch.

import { normalizeSeed } from '../engine/rng.js';
import { createRun, enterStep, resolveStep, starterDeck, defaultLoadout } from '../engine/run.js';
import { roomView, parseSeed } from './view.js';
import { renderRoom, renderError } from './render.js';

const ETCH_STEP = 3;   // 0-based step index of etch on the cuLine route

// A fresh seed from the clock, for when the address has no ?seed=.
// This is the ONLY place outside rng.js where a seed is born. Date.now() is
// milliseconds; % 2^32 keeps it inside the generator's 32-bit range.
function seedFromClock() {
  return normalizeSeed(Date.now() % 2 ** 32);
}

// Starter deck, default loadout (i-line resist in litho), normal scatter.
// Walks the steps before etch doing nothing, then enters etch.
function runToEtch(seed) {
  let state = createRun({ seed, deck: starterDeck(), loadout: defaultLoadout() });
  while (state.stepIndex < ETCH_STEP) state = resolveStep(enterStep(state));
  return enterStep(state);
}

function start() {
  const app = document.getElementById('app');
  try {
    const seed = parseSeed(window.location.search, seedFromClock());
    renderRoom(app, roomView(runToEtch(seed)));
  } catch (error) {
    renderError(app, error);
    console.error(error);
  }
}

start();
