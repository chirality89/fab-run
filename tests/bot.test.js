// bot.test.js — plays many seeded runs through tools/bot.js with no screen.
// A run passes if nothing throws and every number in the final state is a
// real, finite number (CLAUDE.md §11). Failures name the seed.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { playRun } from '../tools/bot.js';

const SEEDS = Array.from({ length: 50 }, (_, i) => i + 1);
const POLICIES = ['idle', 'random'];
const DECKS = ['starter', 'full'];

// Every number anywhere inside a value, with the path to it (e.g. "lot.sites.3").
function numbersIn(value, path = 'state', found = []) {
  if (typeof value === 'number') found.push({ path, value });
  else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) numbersIn(child, `${path}.${key}`, found);
  }
  return found;
}

test('seeds 1–50 × {idle, random} × {starter, full}: no exception, all numbers finite, yield 0..1, buying never below 0 cash', () => {
  for (const seed of SEEDS) {
    for (const policy of POLICIES) {
      for (const deck of DECKS) {
        const label = `seed ${seed}, ${policy}, ${deck} deck`;
        const { state, summary } = playRun(seed, policy, { deck });
        for (const { path, value } of numbersIn(state)) {
          assert.ok(Number.isFinite(value), `${label}: ${path} is ${value}`);
        }
        assert.ok(summary.yield >= 0 && summary.yield <= 1, `${label}: yield ${summary.yield}`);
        // Buying may never take cash below 0. Running costs (the pad
        // conditioner's 20 per CMP) still may, as decision O4 allows.
        assert.ok(summary.lowestCashAfterBuying >= 0, `${label}: cash ${summary.lowestCashAfterBuying} after buying`);
        assert.notEqual(state.status, 'running', `${label}: run did not finish`);
      }
    }
  }
});

test('same seed + same policy gives the identical final state', () => {
  for (const policy of POLICIES) {
    const first = playRun(777, policy, { deck: 'full' });
    const second = playRun(777, policy, { deck: 'full' });
    assert.deepEqual(first.state, second.state, `seed 777, ${policy}`);
    assert.deepEqual(first.summary, second.summary, `seed 777, ${policy}`);
  }
});

test('a different seed gives a different wafer map', () => {
  const one = playRun(1, 'idle');
  const two = playRun(2, 'idle');
  assert.notDeepEqual(one.state.lot.sites, two.state.lot.sites);
});

test('the random bot actually plays cards, and the idle bot plays none', () => {
  const random = playRun(123456, 'random', { deck: 'full' });
  assert.ok(random.summary.cardsPlayed.length > 0, 'seed 123456: random played nothing');
  assert.ok(random.summary.minutesUsed > 0);
  assert.deepEqual(playRun(123456, 'idle').summary.cardsPlayed, []);
});

test('an unknown policy throws', () => {
  assert.throws(() => playRun(1, 'greedy'), /greedy/);
});
