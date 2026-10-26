// shopSeed.js — finds the seed the shop view and screen tests use.
// Not a test file itself (node --test only runs *.test.js).
//
// The tests check one known stock: the pad conditioner, the DUV resist and
// the thick resist, on sale at a procurement stop in the corridor after
// step 2. Which seed gives that stock depends on how many items content.js
// has, so the tests search for it instead of fixing seed 123456. Adding
// equipment or materials then moves the seed, not the expected values.

import { createRun } from '../src/engine/run.js';
import { shopStock } from '../src/engine/shop.js';

export const SHOP_TEST_ITEMS = ['padConditioner', 'resistCAR', 'resistThick'];
const AFTER_STEP_2 = 1;   // corridor index: corridor i sits after step i + 1
const FIRST_SEED = 123456;
const SEARCH_LIMIT = 100000;

// The first seed from 123456 up whose corridor after step 2 offers
// procurement, with exactly SHOP_TEST_ITEMS in stock.
export function seedSellingTestItems() {
  for (let seed = FIRST_SEED; seed < FIRST_SEED + SEARCH_LIMIT; seed++) {
    const start = createRun({ seed });
    if (!start.map[AFTER_STEP_2].offers.includes('procurement')) continue;
    if (shopStock(start, AFTER_STEP_2).join(',') === SHOP_TEST_ITEMS.join(',')) return seed;
  }
  throw new Error(`no seed from ${FIRST_SEED} sells ${SHOP_TEST_ITEMS.join(', ')} after step 2`);
}
