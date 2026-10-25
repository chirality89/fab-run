// shop.js — what a procurement side stop sells (M3 item 2a).
//
// A procurement stop offers SHOP_OFFER_COUNT items from the equipment and
// materials in content.js. Buying one is run.js buyItem; this file only
// works out the stock and whether an item can be bought.
//
// The stock is drawn with its own generator, like the map (map.js): the
// run's seed mixed with a fixed constant, plus the corridor's number. So
// opening a shop never uses up the lot's random numbers (rngState), and the
// same seed with the same purchases always gives the same stock.

import { EQUIPMENT, MATERIALS } from '../content/content.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import { SHOP_OFFER_COUNT, SHOP_SELLS_LOCKED_ITEMS } from '../content/balance.js';
import { normalizeSeed, shuffle } from './rng.js';

// Any fixed number works. It differs from the map's and the bot's, so the
// three never share a sequence.
const SHOP_SEED_MIX = 0xC2B2AE35;

// Everything a shop could ever sell, in content order: equipment, then materials.
const SHOP_ITEMS = [...EQUIPMENT, ...MATERIALS];

// Looks up an item a shop can sell, or undefined.
export function findShopItem(itemId) {
  return SHOP_ITEMS.find(item => item.id === itemId);
}

// The generator start for the shop in one corridor. `^` (XOR) mixes the
// constant into the seed (see map.js); adding the corridor number gives each
// corridor its own start. Neighbouring starts give unrelated numbers
// (rng.js). `>>> 0` keeps it a positive 32-bit whole number.
function shopSeed(seed, corridorIndex) {
  const mixed = (seed ^ SHOP_SEED_MIX) >>> 0;
  return normalizeSeed((mixed + corridorIndex) >>> 0);
}

// Could this item be on sale for this run right now? Not if it is already
// owned, not if it is the material already in its slot, and not if the lot
// never enters its room again on this route (it could never act).
function isForSale(state, item, roomsAhead) {
  if (!SHOP_SELLS_LOCKED_ITEMS && item.unlockedBy !== null) return false;
  if (!roomsAhead.has(item.room)) return false;
  if (item.kind === 'equipment') return !state.equipment.includes(item.id);
  return state.slots[item.slot]?.id !== item.id;
}

// The rooms the lot still has ahead of it after corridor `corridorIndex`.
// Corridor i sits after route step i, so the next room is step i + 1.
function roomsAheadOf(state, corridorIndex) {
  const stepsAhead = LOT_TYPES[state.lotTypeId].route.slice(corridorIndex + 1);
  return new Set(stepsAhead.map(step => step.room));
}

// The ids a procurement stop in corridor `corridorIndex` sells: up to
// SHOP_OFFER_COUNT items picked at random from those for sale, listed in
// content order. Late in the route fewer items can still act, so a shop
// there may offer fewer than SHOP_OFFER_COUNT.
export function shopStock(state, corridorIndex) {
  const roomsAhead = roomsAheadOf(state, corridorIndex);
  const forSale = SHOP_ITEMS.filter(item => isForSale(state, item, roomsAhead)).map(item => item.id);
  const mixed = shuffle(shopSeed(state.seed, corridorIndex), forSale);
  const chosen = mixed.value.slice(0, SHOP_OFFER_COUNT);
  return forSale.filter(id => chosen.includes(id));
}

// Why an item can't be bought right now, or null if it can. Exported so the
// screen can say why a Buy button is greyed out.
export function whyCannotBuy(state, itemId) {
  if (state.shop === null) return 'no shop open';
  if (!state.shop.stock.includes(itemId)) return 'not in stock';
  if (state.shop.bought.includes(itemId)) return 'already bought';
  if (findShopItem(itemId).cost.cash > state.cash) return 'not enough cash';
  return null;
}
