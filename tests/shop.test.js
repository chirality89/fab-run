// shop.test.js — checks the procurement stop: src/engine/shop.js and
// buyItem in src/engine/run.js (M3 item 2a).
// Expected values are hand-computed (tasks/todo.md, M3 item 2a). Never edit
// one to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lotYield } from '../src/engine/lot.js';
import { createRun, enterStep, resolveStep, walkCorridor, buyItem, legalCards } from '../src/engine/run.js';
import { shopStock, whyCannotBuy } from '../src/engine/shop.js';
import { EQUIPMENT, MATERIALS } from '../src/content/content.js';
import { FULL_NOTEBOOK_UNLOCKS } from './shopSeed.js';

const SEED = 123456;
const TOLERANCE = 1e-6;
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < TOLERANCE, `${label}: got ${actual}, expected ${expected}`);

const ETCH = 3;   // cuLine step 4 (0-based index)
const ROUTE_ROOMS = ['clean', 'dep', 'litho', 'etch', 'plate', 'cmp', 'metro'];
const ALL_ITEMS = [...EQUIPMENT, ...MATERIALS];

// Runs the room the lot is about to enter doing nothing. The lot is then
// standing in the corridor after it.
const idleRoomToCorridor = state => resolveStep(enterStep(state));

// Walks the route doing nothing, straight on everywhere, until the lot
// stands in corridor `corridorIndex`.
function walkToCorridor(state, corridorIndex) {
  let current = idleRoomToCorridor(state);
  while (current.corridor < corridorIndex) current = idleRoomToCorridor(walkCorridor(current, null));
  return current;
}

// The first seed from SEED up (and its corridor) with a procurement stop
// before etch that sells the optical endpoint detector.
function seedSellingEndpointBeforeEtch() {
  for (let seed = SEED; seed < SEED + 1000; seed++) {
    const start = createRun({ unlocked: FULL_NOTEBOOK_UNLOCKS, seed, scatterStrength: 0, toolDrift: false });
    for (let corridor = 0; corridor < ETCH; corridor++) {
      if (!start.map[corridor].offers.includes('procurement')) continue;
      const atShop = walkCorridor(walkToCorridor(start, corridor), 'procurement');
      if (atShop.shop.stock.includes('oesEndpoint')) return { seed, corridor };
    }
  }
  throw new Error(`no seed from ${SEED} sells the endpoint detector before etch`);
}

// The first seed from SEED up whose first corridor offers procurement.
function seedWithShopInFirstCorridor() {
  for (let seed = SEED; seed < SEED + 1000; seed++) {
    if (createRun({ unlocked: FULL_NOTEBOOK_UNLOCKS, seed }).map[0].offers.includes('procurement')) return seed;
  }
  throw new Error(`no seed from ${SEED} offers procurement in the first corridor`);
}

function openFirstShop(changes = {}) {
  const seed = seedWithShopInFirstCorridor();
  const start = createRun({ unlocked: FULL_NOTEBOOK_UNLOCKS, seed, scatterStrength: 0, toolDrift: false, ...changes });
  return { seed, atShop: walkCorridor(idleRoomToCorridor(start), 'procurement') };
}

test('a procurement stop opens a shop of 3 items, none owned or useless on this route', () => {
  const { seed, atShop } = openFirstShop();
  const stock = atShop.shop.stock;
  assert.equal(stock.length, 3, `seed ${seed}`);
  assert.equal(new Set(stock).size, 3, `three different items (seed ${seed})`);
  for (const id of stock) {
    const item = ALL_ITEMS.find(entry => entry.id === id);
    assert.ok(item, `${id} is equipment or a material (seed ${seed})`);
    assert.ok(ROUTE_ROOMS.includes(item.room), `${id}'s room is on the Cu line (seed ${seed})`);
  }
  assert.ok(!stock.includes('resistIline'), `the loaded resist is not sold again (seed ${seed})`);
  assert.ok(!stock.includes('rta'), `no diffusion tool on a route without diffusion (seed ${seed})`);
  assert.deepEqual(atShop.shop.bought, []);
});

test('the shop leaves out equipment already owned', () => {
  const loadout = { equipment: ['oesEndpoint', 'eChuckUpgrade'], slots: {} };
  const { seed, atShop } = openFirstShop({ loadout });
  assert.ok(!atShop.shop.stock.includes('oesEndpoint'), `seed ${seed}`);
  assert.ok(!atShop.shop.stock.includes('eChuckUpgrade'), `seed ${seed}`);
});

test('same seed, same stock; the stock does not touch the lot\'s random numbers', () => {
  const first = openFirstShop().atShop;
  const second = openFirstShop().atShop;
  assert.deepEqual(first.shop.stock, second.shop.stock);
  const beforeShop = idleRoomToCorridor(createRun({ unlocked: FULL_NOTEBOOK_UNLOCKS, seed: first.seed, scatterStrength: 0, toolDrift: false }));
  assert.equal(first.rngState, beforeShop.rngState, `seed ${first.seed}`);
  assert.deepEqual(shopStock(beforeShop, 0), first.shop.stock, 'shopStock gives the stock walkCorridor opened');
});

test('different corridors and seeds give different stock (not always the same 3)', () => {
  const start = createRun({ unlocked: FULL_NOTEBOOK_UNLOCKS, seed: SEED });
  const stocks = new Set();
  for (let corridor = 0; corridor < 8; corridor++) stocks.add(shopStock(start, corridor).join(','));
  for (let seed = SEED; seed < SEED + 8; seed++) stocks.add(shopStock(createRun({ unlocked: FULL_NOTEBOOK_UNLOCKS, seed }), 0).join(','));
  assert.ok(stocks.size > 1, `${stocks.size} different stocks`);
});

test('buying pays the price; equipment joins the lot, a material replaces its slot', () => {
  const { seed, atShop } = openFirstShop();
  let state = atShop;
  for (const id of atShop.shop.stock) {
    const item = ALL_ITEMS.find(entry => entry.id === id);
    if (whyCannotBuy(state, id) !== null) continue;   // 3 items may cost more than 1500 together
    const before = state;
    state = buyItem(state, id);
    assert.equal(state.cash, before.cash - item.cost.cash, `${id} (seed ${seed})`);
    if (item.kind === 'equipment') assert.ok(state.equipment.includes(id), `${id} owned (seed ${seed})`);
    else assert.deepEqual(state.slots[item.slot], { id, shelfLife: item.shelfLife ?? null, decay: 1 });
    assert.ok(state.shop.bought.includes(id));
    assert.match(whyCannotBuy(state, id), /already bought/);
    assert.throws(() => buyItem(state, id), /already bought/);
  }
  assert.ok(state.shop.bought.length > 0, `bought something (seed ${seed})`);
});

test('buyItem refuses an item not in stock, one too dear, and when no shop is open', () => {
  const { seed, atShop } = openFirstShop();
  const notInStock = ALL_ITEMS.find(item => !atShop.shop.stock.includes(item.id)).id;
  assert.throws(() => buyItem(atShop, notInStock), /not in stock/, `seed ${seed}`);

  const poor = { ...atShop, cash: 10 };
  const id = atShop.shop.stock[0];
  assert.match(whyCannotBuy(poor, id), /not enough cash/);
  assert.throws(() => buyItem(poor, id), /not enough cash/);

  const straightOn = walkCorridor(idleRoomToCorridor(createRun({ unlocked: FULL_NOTEBOOK_UNLOCKS, seed })), null);
  assert.equal(straightOn.shop, null);
  assert.throws(() => buyItem(straightOn, id), /no shop open/);
});

test('the shop closes when the lot enters the next room', () => {
  const { atShop } = openFirstShop();
  assert.notEqual(atShop.shop, null);
  assert.equal(enterStep(atShop).shop, null);
});

// Hand check (tasks/todo.md, M3 item 2a), scatter off, nothing played. Buy
// the optical endpoint detector (600) before etch:
//   cash 1500 − 600 = 900;
//   at etch, depth_variation 0.08 × 0.7 = 0.056;
//   yield after etch 0.798418, against 0.779789 without it;
//   endpoint etch becomes legal.
test('hand check: the endpoint detector bought before etch', () => {
  const { seed, corridor } = seedSellingEndpointBeforeEtch();
  const start = createRun({ unlocked: FULL_NOTEBOOK_UNLOCKS, seed, scatterStrength: 0, toolDrift: false });

  let withTool = buyItem(walkCorridor(walkToCorridor(start, corridor), 'procurement'), 'oesEndpoint');
  assert.equal(withTool.cash, 900, `seed ${seed}`);
  let without = walkCorridor(walkToCorridor(start, corridor), null);
  while (withTool.stepIndex < ETCH) {
    withTool = walkCorridor(idleRoomToCorridor(withTool), null);
    without = walkCorridor(idleRoomToCorridor(without), null);
  }

  const etchWithTool = enterStep({ ...withTool, deck: ['endpointEtch'] });
  close(etchWithTool.lot.risks.depth_variation, 0.056, `depth variation at etch (seed ${seed})`);
  assert.deepEqual(legalCards(etchWithTool), ['endpointEtch'], `endpoint etch is playable (seed ${seed})`);

  close(lotYield(resolveStep(etchWithTool).lot), 0.798418, `yield after etch with the detector (seed ${seed})`);
  close(lotYield(resolveStep(enterStep(without)).lot), 0.779789, `yield after etch without it (seed ${seed})`);
});

// The rooms each route step is in, for the test below.
const ROUTE = ['clean', 'dep', 'litho', 'etch', 'clean', 'dep', 'plate', 'cmp', 'metro'];

test('a shop only sells items whose room is still ahead on the route', () => {
  for (let seed = SEED; seed < SEED + 20; seed++) {
    const state = createRun({ unlocked: FULL_NOTEBOOK_UNLOCKS, seed });
    for (let corridor = 0; corridor < ROUTE.length - 1; corridor++) {
      const roomsAhead = ROUTE.slice(corridor + 1);
      for (const id of shopStock(state, corridor)) {
        const item = ALL_ITEMS.find(entry => entry.id === id);
        assert.ok(roomsAhead.includes(item.room), `${id} after step ${corridor + 1} (seed ${seed})`);
      }
    }
  }
  // After CMP only metrology is left, so only the inline metrology tool is sold.
  assert.deepEqual(shopStock(createRun({ unlocked: FULL_NOTEBOOK_UNLOCKS, seed: SEED }), 7), ['inlineMetrology']);
});

// --- the unlocked pool (M4 item 4) -----------------------------------------

test('with nothing unlocked, a shop only ever sells starter items', () => {
  const starter = new Set([...EQUIPMENT, ...MATERIALS].filter(item => item.unlockedBy === null).map(item => item.id));
  for (let seed = SEED; seed < SEED + 100; seed++) {
    const state = createRun({ seed });
    for (let corridor = 0; corridor < state.map.length; corridor++) {
      for (const id of shopStock(state, corridor)) {
        assert.ok(starter.has(id), `${id} is locked but on sale (seed ${seed}, corridor ${corridor})`);
      }
    }
  }
});

test('an unlocked item can be on sale; the same item locked never is', () => {
  let found = null;
  for (let seed = SEED; seed < SEED + 1000 && found === null; seed++) {
    const state = createRun({ seed, unlocked: ['padConditioner'] });
    if (shopStock(state, 0).includes('padConditioner')) found = seed;
  }
  assert.ok(found !== null, `no seed from ${SEED} sells the unlocked pad conditioner in corridor 0`);
  assert.ok(!shopStock(createRun({ seed: found }), 0).includes('padConditioner'), `locked (seed ${found})`);
});
