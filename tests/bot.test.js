// bot.test.js — plays many seeded runs through tools/bot.js with no screen.
// A run passes if nothing throws and every number in the final state is a
// real, finite number (CLAUDE.md §11). Failures name the seed.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { playRun } from '../tools/bot.js';
import { checkTargets, runPolicy } from '../tools/exit-check.js';
import { smartCorridor } from '../tools/smartBot.js';
import { createRun, enterStep, resolveStep, walkCorridor } from '../src/engine/run.js';

const SEEDS = Array.from({ length: 50 }, (_, i) => i + 1);
const POLICIES = ['idle', 'random', 'casual', 'smart'];
const SLOW_POLICIES = ['casual', 'smart'];
const DECKS = ['starter', 'full'];

// Every number anywhere inside a value, with the path to it (e.g. "lot.sites.3").
function numbersIn(value, path = 'state', found = []) {
  if (typeof value === 'number') found.push({ path, value });
  else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) numbersIn(child, `${path}.${key}`, found);
  }
  return found;
}

test('seeds 1–50 × {idle, random} and 1–15 × {casual, smart}, × × {starter, full}: no exception, all numbers finite, yield 0..1, buying never below 0 cash', () => {
  for (const seed of SEEDS) {
    for (const policy of POLICIES) {
      // The smart policies try every option on copies of the run, so they are slower: fewer seeds.
      if (SLOW_POLICIES.includes(policy) && seed > 15) continue;
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

test('the smart bot beats the idle bot on average (full deck, seeds 1–20)', () => {
  const idle = runPolicy('idle', 20, 'full');
  const smart = runPolicy('smart', 20, 'full');
  assert.ok(smart.mean > idle.mean + 5, `smart ${smart.mean.toFixed(1)} vs idle ${idle.mean.toFixed(1)}`);
});

test('the casual bot lands between idle and smart (full deck, seeds 1–20)', () => {
  const idle = runPolicy('idle', 20, 'full');
  const casual = runPolicy('casual', 20, 'full');
  const smart = runPolicy('smart', 20, 'full');
  assert.ok(casual.mean > idle.mean && casual.mean < smart.mean,
    `idle ${idle.mean.toFixed(1)}, casual ${casual.mean.toFixed(1)}, smart ${smart.mean.toFixed(1)}`);
});

// A player picks a side stop by its kind only: what is inside (shop stock,
// event, DOE offers) comes from the run's seed, and a PM's restore roll from
// the tools' generator. So two runs that differ only in those hidden dice
// must get the same choice of stop from the smart bot. On these seeds the
// old bot, which opened each stop to look inside, chose differently in at
// least one corridor (18, 19, 20 and 28; checked 28 Oct 2026).
test('the smart bot picks a side stop without seeing what is inside it (seeds 18, 19, 20, 28, every corridor)', () => {
  let compared = 0;
  for (const seed of [18, 19, 20, 28]) {
    let state = createRun({ seed });
    while (state.status === 'running') {
      if (state.room !== null) state = resolveStep(state);
      else if (state.corridor === null) state = enterStep(state);
      else {
        if (state.map[state.corridor].offers.length > 0) {
          const choice = smartCorridor(state, 0, 1).stopKind;
          for (const other of [5000, 7000, 9000]) {
            const otherDice = { ...state, seed: seed + other, toolRngState: seed + other + 1 };
            const choiceWithOtherDice = smartCorridor(otherDice, 0, 1).stopKind;
            assert.equal(choiceWithOtherDice, choice,
              `seed ${seed}, corridor ${state.corridor}: chose ${choice}, but ${choiceWithOtherDice} with other hidden dice`);
          }
          compared += 1;
        }
        state = walkCorridor(state, null);   // go straight on to the next room
      }
    }
  }
  assert.ok(compared > 0, 'no corridor offered a stop, so nothing was compared');
});

test('exit-check: targets pass on good numbers and fail on bad ones', () => {
  const result = (shipRate, mean) => ({ shipRate, mean });
  const good = checkTargets({
    idle: result(0, 52), random: result(0.02, 55), casual: result(0.1, 62), smart: result(0.5, 70), smartFull: result(0.95, 85),
  });
  assert.ok(good.every(check => check.ok), good.map(check => check.text).join('; '));
  const bad = checkTargets({
    idle: result(0, 52), random: result(0.02, 55), casual: result(0.1, 62), smart: result(0, 63), smartFull: result(0.95, 85),
  });
  assert.equal(bad.filter(check => !check.ok).length, 1);   // only the smart starter-deck ship rate
  const narrow = checkTargets({
    idle: result(0, 61), random: result(0.02, 61), casual: result(0.2, 68), smart: result(0.5, 69.5), smartFull: result(1, 82),
  });
  assert.deepEqual(narrow.filter(check => !check.ok).map(check => check.text),
    ['smart (starter deck) beats idle by 8.5 points (target over 10)']);   // only the first-run spread
});
