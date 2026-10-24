// lot.test.js — checks the lot and yield math in src/engine/lot.js.
// Expected values are hand-computed (tasks/todo.md, M1 item 2). Never edit
// one to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PATTERNS } from '../src/content/content.js';
import {
  createLot, addRisk, scaleRisk, siteWeights, shapeOf,
  realizeRisks, rollScatter, lotYield,
} from '../src/engine/lot.js';

const TOLERANCE = 1e-6;
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < TOLERANCE, `${label}: got ${actual}, expected ${expected}`);

// Adds `amount` of one pattern's risk to a lot and realizes it straight away.
const hit = (lot, pattern, amount) => realizeRisks(addRisk(lot, pattern, amount), [pattern]);

// Ring of a site (0 center, 1 inner, 2 outer), worked out independently here.
const ring = i => Math.max(Math.abs(Math.floor(i / 5) - 2), Math.abs((i % 5) - 2));

test('new lot: 25 sites, yield 1', () => {
  const lot = createLot();
  assert.equal(lot.sites.length, 25);
  close(lotYield(lot), 1, 'new lot');
});

test('particles 0.1 (even): every site and the yield are e^-0.1', () => {
  const lot = hit(createLot(), 'particles', 0.1);
  lot.sites.forEach((s, i) => close(s, 0.904837, `site ${i}`));
  close(lotYield(lot), 0.904837, 'yield');
});

test('then edge_ring 0.16: outer sites x e^-0.25, yield 0.776742', () => {
  const lot = hit(hit(createLot(), 'particles', 0.1), 'edge_ring', 0.16);
  lot.sites.forEach((s, i) => close(s, ring(i) === 2 ? 0.904837 * 0.778801 : 0.904837, `site ${i}`));
  close(lotYield(lot), 0.776742, 'yield');
});

test('losses multiply: particles 0.1 in two rooms = 0.2 in one', () => {
  close(lotYield(hit(hit(createLot(), 'particles', 0.1), 'particles', 0.1)), 0.818731, 'two rooms');
  close(lotYield(hit(createLot(), 'particles', 0.2)), 0.818731, 'one room');
});

test('depth_variation 0.08: center 1, inner 0.951229, outer 0.904837, yield 0.923489', () => {
  const lot = hit(createLot(), 'depth_variation', 0.08);
  const byRing = [1, 0.951229, 0.904837];
  lot.sites.forEach((s, i) => close(s, byRing[ring(i)], `site ${i}`));
  close(lotYield(lot), 0.923489, 'yield');
});

test('scale by 0.4 then realize 0.1 = realizing 0.04', () => {
  const scaled = realizeRisks(scaleRisk(addRisk(createLot(), 'particles', 0.1), 'particles', 0.4), ['particles']);
  close(lotYield(scaled), lotYield(hit(createLot(), 'particles', 0.04)), 'scaled');
  close(lotYield(scaled), Math.exp(-0.04), 'scaled vs e^-0.04');
});

test('realizing twice: the second time changes nothing', () => {
  const once = hit(createLot(), 'particles', 0.1);
  assert.equal(once.risks.particles, 0);
  assert.deepEqual(realizeRisks(once, ['particles']).sites, once.sites);
});

test('no healing: negative risk or negative multiplier is refused', () => {
  assert.throws(() => addRisk(createLot(), 'particles', -0.1));
  assert.throws(() => scaleRisk(createLot(), 'particles', -1));
  assert.throws(() => scaleRisk(createLot(), 'particles', NaN));
});

test('risk that overflows to Infinity is refused (it would make NaN on the map)', () => {
  const lot = addRisk(createLot(), 'edge_ring', 1e300);
  assert.throws(() => scaleRisk(lot, 'edge_ring', 1e300));
  const maxed = addRisk(createLot(), 'edge_ring', Number.MAX_VALUE);
  assert.throws(() => addRisk(maxed, 'edge_ring', Number.MAX_VALUE));
});

test('scatter strength must be a number 0 or more', () => {
  assert.throws(() => rollScatter(1, ['particles'], NaN));
  assert.throws(() => rollScatter(1, ['particles'], -0.5));
});

test('unknown pattern names throw an error naming the pattern', () => {
  assert.throws(() => addRisk(createLot(), 'gremlins', 0.1), /gremlins/);
  assert.throws(() => siteWeights('gremlins'), /gremlins/);
});

test('every PATTERNS key has a shape, and every shape averages 1', () => {
  for (const pattern of Object.keys(PATTERNS)) {
    assert.ok(['even', 'edgeRing', 'centerToEdge'].includes(shapeOf(pattern)), pattern);
    const weights = siteWeights(pattern);
    close(weights.reduce((a, b) => a + b, 0) / 25, 1, `${pattern} mean weight`);
  }
});

test('nothing is changed in place', () => {
  const lot = addRisk(createLot(), 'particles', 0.1);
  const before = JSON.stringify(lot);
  realizeRisks(lot, ['particles']);
  scaleRisk(lot, 'particles', 0.5);
  addRisk(lot, 'particles', 0.2);
  assert.equal(JSON.stringify(lot), before);
});

// A lot with particles and edge_ring realized under seeded scatter.
function scatteredLot(seed) {
  const patterns = ['particles', 'edge_ring'];
  const { value: scatter } = rollScatter(seed, patterns, 0.5);
  let lot = addRisk(addRisk(createLot(), 'particles', 0.3), 'edge_ring', 0.2);
  return realizeRisks(lot, patterns, scatter);
}

test('scatter: same seed gives the same map; a different seed does not', () => {
  assert.deepEqual(scatteredLot(123456).sites, scatteredLot(123456).sites, 'seed 123456');
  assert.notDeepEqual(scatteredLot(123456).sites, scatteredLot(654321).sites, 'seeds 123456 vs 654321');
});

test('scatter: sites differ, all in 0..1, no NaN', () => {
  for (const seed of [1, 42, 123456]) {
    const sites = scatteredLot(seed).sites;
    assert.ok(new Set(sites).size > 1, `seed ${seed}: all sites equal`);
    for (const s of sites) assert.ok(Number.isFinite(s) && s >= 0 && s <= 1, `seed ${seed}: site ${s}`);
  }
});

test('scatter: nudges are never below 0', () => {
  const { value } = rollScatter(7, ['particles'], 3);
  for (const n of value.particles) assert.ok(n >= 0, `seed 7: nudge ${n}`);
});
