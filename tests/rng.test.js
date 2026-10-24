// rng.test.js — checks the seeded generator in src/engine/rng.js.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { normalizeSeed, nextRandom, randomInt, pick, shuffle, gauss } from '../src/engine/rng.js';

// Draws `count` numbers in a row from one seed.
function sequence(seed, count) {
  const values = [];
  let state = seed;
  for (let i = 0; i < count; i++) {
    const step = nextRandom(state);
    values.push(step.value);
    state = step.rngState;
  }
  return values;
}

test('faithful port: same numbers as FabSim2 rand()', () => {
  // Expected values come from running FabSim2's own rand() unchanged.
  assert.deepEqual(sequence(123456, 3),
    [0.38233304349705577, 0.7972629074938595, 0.9965302373748273]);
  assert.equal(sequence(0, 1)[0], 0.26642920868471265);
});

test('same seed gives the same sequence; a different seed does not', () => {
  assert.deepEqual(sequence(42, 1000), sequence(42, 1000));
  assert.notDeepEqual(sequence(42, 1000), sequence(43, 1000));
});

test('every value is from 0 up to (not including) 1', () => {
  for (const v of sequence(7, 10000)) {
    assert.ok(v >= 0 && v < 1, `seed 7: value ${v} out of range`);
  }
});

test('functions change nothing: same input, same answer', () => {
  assert.deepEqual(nextRandom(99), nextRandom(99));
  const list = ['a', 'b', 'c', 'd', 'e'];
  const first = shuffle(99, list);
  assert.deepEqual(shuffle(99, list), first);
  assert.deepEqual(list, ['a', 'b', 'c', 'd', 'e'], 'shuffle changed the list it was given');
});

test('randomInt stays within min..max and reaches both ends', () => {
  const seen = new Set();
  let state = 2024;
  for (let i = 0; i < 1000; i++) {
    const step = randomInt(state, 1, 6);
    assert.ok(Number.isInteger(step.value) && step.value >= 1 && step.value <= 6,
      `seed 2024: got ${step.value}`);
    seen.add(step.value);
    state = step.rngState;
  }
  assert.deepEqual([...seen].sort(), [1, 2, 3, 4, 5, 6]);
});

test('pick always returns an item from the list', () => {
  const list = ['etch', 'litho', 'cmp'];
  let state = 5;
  for (let i = 0; i < 100; i++) {
    const step = pick(state, list);
    assert.ok(list.includes(step.value), `seed 5: got ${step.value}`);
    state = step.rngState;
  }
});

test('shuffle keeps the same items and changes the order', () => {
  const list = Array.from({ length: 20 }, (_, i) => i);
  const { value } = shuffle(123456, list);
  assert.deepEqual([...value].sort((a, b) => a - b), list);
  assert.notDeepEqual(value, list, 'seed 123456: shuffle left the order unchanged');
});

test('normalizeSeed accepts 0..4294967295 and rejects anything else', () => {
  assert.equal(normalizeSeed(0), 0);
  assert.equal(normalizeSeed(4294967295), 4294967295);
  for (const bad of [-1, 1.5, 2 ** 32, 'abc', NaN]) {
    assert.equal(normalizeSeed(bad), null, `accepted ${bad}`);
  }
});

// Draws `count` bell-curve numbers in a row from one seed.
function gaussSequence(seed, count) {
  const values = [];
  let state = seed;
  for (let i = 0; i < count; i++) {
    const step = gauss(state);
    values.push(step.value);
    state = step.rngState;
  }
  return values;
}

test('gauss: same seed gives the same numbers', () => {
  assert.deepEqual(gaussSequence(123456, 100), gaussSequence(123456, 100));
  assert.notDeepEqual(gaussSequence(123456, 100), gaussSequence(123457, 100));
});

test('gauss: 10,000 draws, none NaN or infinite', () => {
  for (const v of gaussSequence(7, 10000)) {
    assert.ok(Number.isFinite(v), `seed 7: gauss gave ${v}`);
  }
});

test('gauss: mean near 0 and spread near 1', () => {
  const values = gaussSequence(2024, 10000);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
  assert.ok(Math.abs(mean) < 0.05, `seed 2024: mean ${mean}`);
  assert.ok(Math.abs(sd - 1) < 0.05, `seed 2024: sd ${sd}`);
});

// Comment lines are skipped, so a warning like "never use Math.random()" is allowed.
const codeOnly = text => text.split('\n').filter(line => !line.trim().startsWith('//')).join('\n');

test('no Math.random anywhere in src/', () => {
  const offenders = [];
  const walk = dir => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (path.endsWith('.js') && /Math\.random\s*\(/.test(codeOnly(readFileSync(path, 'utf8')))) {
        offenders.push(path);
      }
    }
  };
  walk(new URL('../src', import.meta.url).pathname);
  assert.deepEqual(offenders, []);
});
