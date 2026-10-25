// bot.js — plays a whole run with no screen, to test the engine.
//
// Usage:  npm run bot -- --seed 123456 --policy random [--deck full]
//
// Policies (how the bot picks cards):
//   idle    plays nothing: the baseline you can check by hand
//   random  plays random legal cards until none fits, then resolves the room
//
// The random policy has its OWN seeded generator, started from the run's
// seed mixed with a fixed constant (BOT_SEED_MIX). So the bot's choices never
// use up the lot's random numbers (rngState): the same seed gives the same
// lot draws whatever the bot plays, and the same seed + policy gives the
// same run every time.

import { pathToFileURL } from 'node:url';
import { normalizeSeed, pick } from '../src/engine/rng.js';
import { lotYield } from '../src/engine/lot.js';
import {
  createRun, enterStep, legalCards, playCard, resolveStep, starterDeck, fullPool,
} from '../src/engine/run.js';

const BOT_SEED_MIX = 0x9E3779B9;   // any fixed number works; this one is a common "mixing" constant
const POLICIES = ['idle', 'random'];

// The bot's own generator start: (seed XOR constant), made a positive 32-bit number.
function botSeed(seed) {
  return normalizeSeed((seed ^ BOT_SEED_MIX) >>> 0);
}

// Plays one room's cards for the chosen policy. Returns the state and the
// bot's generator number, plus the cards it played.
function playRoom(state, policy, botRng) {
  let current = state;
  let rng = botRng;
  const played = [];
  if (policy === 'idle') return { state: current, botRng: rng, played };
  let choices = legalCards(current);
  while (choices.length > 0) {
    const choice = pick(rng, choices);
    rng = choice.rngState;
    current = playCard(current, choice.value);
    played.push(choice.value);
    choices = legalCards(current);
  }
  return { state: current, botRng: rng, played };
}

// Plays a run to the end. options.deck is 'starter' (default), 'full' or a
// list of card ids; other options go straight to createRun.
export function playRun(seed, policy = 'idle', options = {}) {
  if (!POLICIES.includes(policy)) throw new Error(`Unknown bot policy: ${policy}`);
  const { deck = 'starter', ...runOptions } = options;
  const deckIds = deck === 'full' ? fullPool() : deck === 'starter' ? starterDeck() : deck;

  let state = createRun({ ...runOptions, seed, deck: deckIds });
  let botRng = botSeed(seed);
  const cardsPlayed = [];
  while (state.status === 'running') {
    state = enterStep(state);
    const room = playRoom(state, policy, botRng);
    botRng = room.botRng;
    cardsPlayed.push(...room.played);
    state = resolveStep(room.state);
  }

  const summary = {
    seed, policy, status: state.status, yield: lotYield(state.lot), cash: state.cash,
    minutesUsed: state.minutesUsed, cycleTime: state.cycleTime, cardsPlayed,
  };
  return { state, summary };
}

// Reads "--name value" pairs from the command line.
function readArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) args[argv[i].replace(/^--/, '')] = argv[i + 1];
  return args;
}

function printSummary(summary) {
  console.log(`Seed:          ${summary.seed}`);
  console.log(`Policy:        ${summary.policy}`);
  console.log(`Status:        ${summary.status}`);
  console.log(`Final yield:   ${(summary.yield * 100).toFixed(2)}%`);
  console.log(`Cash left:     ${summary.cash}`);
  console.log(`Minutes played: ${summary.minutesUsed}`);
  console.log(`Cycle time:    ${summary.cycleTime} min`);
  console.log(`Cards played:  ${summary.cardsPlayed.length} (${summary.cardsPlayed.join(', ') || 'none'})`);
}

// Only runs when started from the command line, not when a test imports it.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = readArgs(process.argv.slice(2));
  const seed = Number(args.seed ?? 123456);
  if (normalizeSeed(seed) === null) {
    console.error(`Bad seed: ${args.seed} (a whole number from 0 to 4294967295)`);
    process.exit(1);
  }
  const { state, summary } = playRun(seed, args.policy ?? 'idle', { deck: args.deck ?? 'starter' });
  printSummary(summary);
  console.log('\nLog:');
  for (const line of state.log) console.log(line);
}
