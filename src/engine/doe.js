// doe.js — the DOE half of the PM/DOE stop (M3 item 2d). Pure functions.
//
// A DOE (design of experiments) tunes one practice's recipe for the rest of
// the run. Each practice may carry an `upgrade` in content.js: only the
// fields that change (name, cost, effects, tradeoff, physicsNote). The
// upgraded card is the base card with those fields replaced.
//
// Which practices a stop offers is drawn with its own generator, like the
// shop (shop.js): the seed mixed with a fixed constant, plus the corridor
// number. So the lot's random numbers are untouched.

import { PRACTICES } from '../content/content.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import { DOE_OFFER_MIN, DOE_OFFER_MAX } from '../content/balance.js';
import { normalizeSeed, randomInt, shuffle } from './rng.js';

// Any fixed number works; it differs from the map's, shop's, tools' and bot's.
const DOE_SEED_MIX = 0x165667B1;

function doeSeed(seed, corridorIndex) {
  const mixed = (seed ^ DOE_SEED_MIX) >>> 0;
  return normalizeSeed((mixed + corridorIndex) >>> 0);
}

// A practice as it plays in this run: its DOE version if it has been
// upgraded, else the card as written. Throws on an unknown id.
export function cardInRun(state, cardId) {
  const card = PRACTICES.find(entry => entry.id === cardId);
  if (!card) throw new Error(`Unknown practice: ${cardId}`);
  if (!state.upgraded.includes(cardId)) return card;
  return { ...card, ...card.upgrade };
}

// The practices a DOE stop in corridor `corridorIndex` could upgrade: in the
// deck, with a DOE version, not upgraded yet, and used in a room still ahead.
function eligible(state, corridorIndex) {
  const roomsAhead = new Set(LOT_TYPES[state.lotTypeId].route.slice(corridorIndex + 1).map(step => step.room));
  const inDeck = [...new Set(state.deck)];
  return inDeck.filter(cardId => {
    const card = PRACTICES.find(entry => entry.id === cardId);
    return card.upgrade && !state.upgraded.includes(cardId) && roomsAhead.has(card.room);
  });
}

// The practices offered at a DOE stop: DOE_OFFER_MIN to DOE_OFFER_MAX of the
// eligible ones, picked by the seed and listed in deck order.
export function doeOffers(state, corridorIndex) {
  const candidates = eligible(state, corridorIndex);
  const count = randomInt(doeSeed(state.seed, corridorIndex), DOE_OFFER_MIN, DOE_OFFER_MAX);
  const mixed = shuffle(count.rngState, candidates);
  const chosen = mixed.value.slice(0, count.value);
  return candidates.filter(cardId => chosen.includes(cardId));
}
