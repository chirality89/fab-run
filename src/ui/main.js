// main.js — starts the page: builds a seeded run, walks it to etch, draws it.
//
// For now (M2 item 1) the screen only shows the etch room. The lot walks the
// steps before etch with nothing played, then enters etch.

import { normalizeSeed } from '../engine/rng.js';
import { lotYield } from '../engine/lot.js';
import { createRun, enterStep, resolveStep, starterDeck, defaultLoadout } from '../engine/run.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import { roomView, parseSeed } from './view.js';
import { renderRoom, renderMessage, renderError } from './render.js';

const LOT_TYPE_ID = 'cuLine';
const SHOWN_ROOM = 'etch';   // the room this screen shows

// A fresh seed from the clock, for when the address has no valid ?seed=.
// Outside rng.js, seeds come into the game in only two places: here, and
// from the page address in parseSeed (view.js). Date.now() is milliseconds;
// % 2^32 keeps it inside the generator's 32-bit range.
function seedFromClock() {
  return normalizeSeed(Date.now() % 2 ** 32);
}

// The seed for this page. A clock seed is also written into the address
// (?seed=…) without reloading, so a reload or a shared link replays the run.
function chooseSeed() {
  const fromAddress = parseSeed(window.location.search, null);
  if (fromAddress !== null) return fromAddress;
  const seed = seedFromClock();
  const params = new URLSearchParams(window.location.search);
  params.set('seed', String(seed));
  window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
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

function start() {
  const app = document.getElementById('app');
  try {
    const state = runToRoom(chooseSeed(), SHOWN_ROOM);
    if (state.status === 'scrapped') {
      const percent = (lotYield(state.lot) * 100).toFixed(1);
      renderMessage(app, `Lot scrapped at step ${state.stepIndex + 1} (yield ${percent}%). Seed ${state.seed}.`);
      return;
    }
    renderRoom(app, roomView(state));
  } catch (error) {
    renderError(app, error);
    console.error(error);
  }
}

start();
