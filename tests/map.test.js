// map.test.js — checks the run map in src/engine/map.js.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMap, SIDE_STOP_KINDS } from '../src/engine/map.js';
import { createRun } from '../src/engine/run.js';
import { LOT_TYPES } from '../src/content/lotTypes.js';
import { SIDE_STOPS } from '../src/content/sideStops.js';

const SEED = 123456;
const ROUTE = LOT_TYPES.cuLine.route;

test('the Cu line map has 8 corridors, one after each step but the last', () => {
  const map = buildMap(SEED, ROUTE);
  assert.equal(map.length, ROUTE.length - 1, `seed ${SEED}`);
  map.forEach((corridor, index) => {
    assert.equal(corridor.afterStep, index);
    assert.equal(corridor.walked, false);
    assert.equal(corridor.taken, null);
  });
});

test('every corridor offers 2 or 3 different known side stops, in list order', () => {
  for (let seed = 1; seed <= 200; seed++) {
    for (const corridor of buildMap(seed, ROUTE)) {
      const { offers } = corridor;
      assert.ok(offers.length === 2 || offers.length === 3, `seed ${seed}: ${offers.length} offers`);
      assert.equal(new Set(offers).size, offers.length, `seed ${seed}: repeated offer ${offers}`);
      for (const kind of offers) assert.ok(SIDE_STOP_KINDS.includes(kind), `seed ${seed}: unknown ${kind}`);
      const inListOrder = SIDE_STOP_KINDS.filter(kind => offers.includes(kind));
      assert.deepEqual(offers, inListOrder, `seed ${seed}`);
    }
  }
});

test('over many seeds, both 2 and 3 offers and every kind turn up', () => {
  const counts = new Set();
  const kinds = new Set();
  for (let seed = 1; seed <= 200; seed++) {
    for (const corridor of buildMap(seed, ROUTE)) {
      counts.add(corridor.offers.length);
      corridor.offers.forEach(kind => kinds.add(kind));
    }
  }
  assert.deepEqual([...counts].sort(), [2, 3]);
  assert.deepEqual([...kinds].sort(), [...SIDE_STOP_KINDS].sort());
});

test('same seed gives the same map; a different seed a different one', () => {
  assert.deepEqual(buildMap(SEED, ROUTE), buildMap(SEED, ROUTE));
  assert.notDeepEqual(buildMap(SEED, ROUTE), buildMap(SEED + 1, ROUTE));
});

test('building the map does not use the lot\'s random numbers', () => {
  // createRun builds the map; the lot's generator still starts at the seed.
  const state = createRun({ seed: SEED });
  assert.equal(state.rngState, SEED, `seed ${SEED}`);
  assert.deepEqual(state.map, buildMap(SEED, ROUTE));
});

test('every side-stop kind has its words in sideStops.js; the map offers only the ones that are built', () => {
  const built = Object.keys(SIDE_STOPS).filter(kind => !SIDE_STOPS[kind].placeholder);
  assert.deepEqual([...SIDE_STOP_KINDS].sort(), built.sort());
  for (const [kind, stop] of Object.entries(SIDE_STOPS)) {
    for (const field of ['name', 'short', 'what']) assert.ok(stop[field], `${kind}.${field}`);
    assert.equal(typeof stop.placeholder, 'boolean', `${kind}.placeholder`);
  }
});

// M4.5 item 5 (David, 26 Oct 2026): a stop that only costs time is never
// offered. Today that is metrology.
test('no corridor offers a placeholder stop (metrology), over 100 seeds', () => {
  assert.equal(SIDE_STOPS.metrology.placeholder, true);
  for (let seed = SEED; seed < SEED + 100; seed++) {
    for (const corridor of buildMap(seed, ROUTE)) {
      assert.ok(!corridor.offers.includes('metrology'), `seed ${seed}, corridor ${corridor.afterStep}`);
      assert.ok(corridor.offers.length >= 2 && corridor.offers.length <= 3, `seed ${seed}`);
    }
  }
});
