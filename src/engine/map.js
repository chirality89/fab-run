// map.js — the run's map: a corridor after every route step but the last,
// each offering 2 or 3 side stops (decision O3).
//
// The process rooms are the lot type's route, fixed and in order. Between
// two rooms you may take ONE of the side stops offered, or go straight on.
// What a stop does comes in M3 item 2; for now it only costs cycle time
// (run.js walkCorridor).
//
// The map is made from the seed alone, with its own generator: the run's
// seed mixed with a fixed constant (MAP_SEED_MIX). So building the map never
// uses up the lot's random numbers (rngState), and the same seed always
// gives the same map.

import { normalizeSeed, randomInt, shuffle } from './rng.js';

// The four kinds of side stop, in the order they are listed on screen.
export const SIDE_STOP_KINDS = ['metrology', 'pm', 'procurement', 'event'];

// How many stops one corridor offers: from MIN to MAX, both included.
const MIN_OFFERS = 2;
const MAX_OFFERS = 3;

// Any fixed number works. It differs from the bot's (tools/bot.js) so the
// map and the bot never share a sequence.
const MAP_SEED_MIX = 0x85EBCA6B;

// The map's own generator start: (seed XOR constant), as a positive 32-bit number.
function mapSeed(seed) {
  return normalizeSeed((seed ^ MAP_SEED_MIX) >>> 0);
}

// One corridor's offers: MIN_OFFERS to MAX_OFFERS different kinds, listed
// in SIDE_STOP_KINDS order.
function rollOffers(rngState) {
  const count = randomInt(rngState, MIN_OFFERS, MAX_OFFERS);
  const mixed = shuffle(count.rngState, SIDE_STOP_KINDS);
  const chosen = mixed.value.slice(0, count.value);
  const offers = SIDE_STOP_KINDS.filter(kind => chosen.includes(kind));
  return { value: offers, rngState: mixed.rngState };
}

// The whole map for a run. Corridor i sits after route step i.
//   { afterStep, offers: ['metrology', …], walked: false, taken: null }
// `walked` turns true once the lot has passed through; `taken` is the side
// stop it took there, or null if it went straight on.
export function buildMap(seed, route) {
  let rngState = mapSeed(seed);
  if (rngState === null) throw new Error(`buildMap: bad seed ${seed}`);
  const corridors = [];
  for (let afterStep = 0; afterStep < route.length - 1; afterStep++) {
    const roll = rollOffers(rngState);
    rngState = roll.rngState;
    corridors.push({ afterStep, offers: roll.value, walked: false, taken: null });
  }
  return corridors;
}
