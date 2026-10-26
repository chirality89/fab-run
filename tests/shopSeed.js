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
import { unlockedIds } from '../src/engine/notebook.js';
import { FAILURE_MODES } from '../src/content/content.js';

// What a notebook holding every failure mode unlocks. Since M4 item 4 the
// shop sells only starter items and unlocked ones, so the shop tests play
// as this fully unlocked player: every item can be on sale, as before.
export const FULL_NOTEBOOK_UNLOCKS = unlockedIds({
  version: 1, entries: FAILURE_MODES.map(mode => ({ id: mode.id, seed: 1 })),
});

export const SHOP_TEST_ITEMS = ['padConditioner', 'resistCAR', 'resistThick'];

// The notebook that unlocks the two test items that aren't starter items:
// removal-rate drift (pad conditioner) and T-top (DUV resist). It unlocks no
// practice, so the deck stays the starter deck. The screen tests store this
// notebook in the page, so the page's shop has the same stock.
export const SHOP_TEST_NOTEBOOK = {
  version: 1, entries: [{ id: 'fm_rr_drift', seed: 1 }, { id: 'fm_ped_ttop', seed: 1 }],
};
export const SHOP_TEST_UNLOCKS = unlockedIds(SHOP_TEST_NOTEBOOK);
const AFTER_STEP_2 = 1;   // corridor index: corridor i sits after step i + 1
const FIRST_SEED = 123456;
const SEARCH_LIMIT = 100000;

// The first seed from 123456 up whose corridor after step 2 offers
// procurement, with exactly SHOP_TEST_ITEMS in stock for a player whose
// notebook is SHOP_TEST_NOTEBOOK.
export function seedSellingTestItems() {
  for (let seed = FIRST_SEED; seed < FIRST_SEED + SEARCH_LIMIT; seed++) {
    const start = createRun({ seed, unlocked: SHOP_TEST_UNLOCKS });
    if (!start.map[AFTER_STEP_2].offers.includes('procurement')) continue;
    if (shopStock(start, AFTER_STEP_2).join(',') === SHOP_TEST_ITEMS.join(',')) return seed;
  }
  throw new Error(`no seed from ${FIRST_SEED} sells ${SHOP_TEST_ITEMS.join(', ')} after step 2`);
}
