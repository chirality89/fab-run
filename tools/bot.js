// bot.js — plays a whole run with no screen, to test the engine.
//
// Usage:  npm run bot -- --seed 123456 --policy random [--deck full]
//
// Policies (how the bot picks cards and side stops):
//   smart   tries every option on a copy of the state and takes the best
//           (tools/smartBot.js); it knows the whole route, so it shows how
//           good play can be
//   casual  the smart bot, but 3 decisions in 10 it picks at random
//   idle    plays nothing and always goes straight on: the baseline you can
//           check by hand
//   random  plays random legal cards until none fits, then resolves the
//           room; in each corridor picks a random side stop or straight on;
//           at a procurement stop, buys each item it can afford on a coin flip;
//           at a PM/DOE stop, on a coin flip either PMs the tool whose SPC
//           chart trips the most rules (a random one ahead if none trip),
//           or runs a DOE on a random offered practice it can afford;
//           at an event, picks one of its options at random
//
// The random policy has its OWN seeded generator, started from the run's
// seed mixed with a fixed constant (BOT_SEED_MIX). So the bot's choices never
// use up the lot's random numbers (rngState): the same seed gives the same
// lot draws whatever the bot plays, and the same seed + policy gives the
// same run every time.

import { pathToFileURL } from 'node:url';
import { normalizeSeed, pick } from '../src/engine/rng.js';
import { lotYield } from '../src/engine/lot.js';
import { lotMoney } from '../src/engine/cost.js';
import {
  createRun, enterStep, legalCards, playCard, resolveStep, walkCorridor, buyItem, pmTool, doeCard, whyCannotDoe,
  chooseEventOption,
  starterDeck, fullPool,
} from '../src/engine/run.js';
import { spcRules, pointsSinceLastPm } from '../src/engine/tools.js';
import { findEvent } from '../src/engine/events.js';
import { whyCannotBuy } from '../src/engine/shop.js';

const BOT_SEED_MIX = 0x9E3779B9;   // any fixed number works; this one is a common "mixing" constant
import { SMART_POLICIES, noiseFor, smartRoom, smartCorridor } from './smartBot.js';

const POLICIES = ['idle', 'random', ...SMART_POLICIES];

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
  if (SMART_POLICIES.includes(policy)) return smartRoom(current, noiseFor(policy), rng);
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

// Picks what to do in the corridor the lot stands in: a side stop, or null
// for straight on. Returns the choice and the bot's generator number.
function chooseSideStop(state, policy, botRng) {
  if (policy === 'idle') return { stopKind: null, botRng };
  const offers = state.map[state.corridor].offers;
  const choice = pick(botRng, [null, ...offers]);
  return { stopKind: choice.value, botRng: choice.rngState };
}

// At an open shop, goes through the stock in order and buys each item it can
// afford on a coin flip. Returns the state, the bot's generator number, the
// ids bought, and the least cash left right after any purchase (Infinity
// if it bought nothing).
function shop(state, policy, botRng) {
  let current = state;
  let rng = botRng;
  const bought = [];
  let lowestCash = Infinity;   // the least cash left right after a purchase (none yet)
  if (policy === 'idle' || current.shop === null) return { state: current, botRng: rng, bought, lowestCash };
  for (const itemId of current.shop.stock) {
    const coin = pick(rng, [true, false]);
    rng = coin.rngState;
    if (coin.value && whyCannotBuy(current, itemId) === null) {
      current = buyItem(current, itemId);
      bought.push(itemId);
      lowestCash = Math.min(lowestCash, current.cash);
    }
  }
  return { state: current, botRng: rng, bought, lowestCash };
}

// At an open PM/DOE stop, a coin flip picks a DOE or a PM. The DOE takes a
// random offered practice it can afford. The PM takes the tool ahead whose
// recent SPC points trip the most rules (if none trips any, a random one).
// Returns the state, the bot's generator number, the room PM'd and the card
// upgraded (each null if not done).
function doPmOrDoe(state, policy, botRng) {
  const nothing = { state, botRng, pmRoom: null, doeCardId: null };
  if (policy === 'idle' || state.pm === null) return nothing;
  const coin = pick(botRng, ['pm', 'doe']);
  const affordable = state.pm.doeOffers.filter(cardId => whyCannotDoe(state, cardId) === null);
  if (coin.value === 'doe' && affordable.length > 0) {
    const choice = pick(coin.rngState, affordable);
    return { state: doeCard(state, choice.value), botRng: choice.rngState, pmRoom: null, doeCardId: choice.value };
  }
  return { ...doPm(state, coin.rngState), doeCardId: null };
}

// The PM half of doPmOrDoe.
function doPm(state, botRng) {
  if (state.pm.choices.length === 0) return { state, botRng, pmRoom: null };
  // The same points the screen's rules look at: the latest, since the last PM.
  const alarms = roomId => spcRules(pointsSinceLastPm(state.tools[roomId])).length;
  const most = Math.max(...state.pm.choices.map(alarms));
  const candidates = most > 0 ? state.pm.choices.filter(roomId => alarms(roomId) === most) : state.pm.choices;
  const choice = pick(botRng, candidates);
  return { state: pmTool(state, choice.value), botRng: choice.rngState, pmRoom: choice.value };
}

// At an open event, picks one of its options at random. Returns the state,
// the bot's generator number and "eventId: option label" (or null).
function doEvent(state, policy, botRng) {
  if (policy === 'idle' || state.event === null) return { state, botRng, choice: null };
  const event = findEvent(state.event.eventId);
  const roll = pick(botRng, event.options.map((_, index) => index));
  const label = `${event.id}: ${event.options[roll.value].label}`;
  return { state: chooseEventOption(state, roll.value), botRng: roll.rngState, choice: label };
}

// The idle and random policies' way through one corridor (the smart ones are
// in smartBot.js). Adds what it did to the lists in `record`.
function oneCorridorRandomly(start, policy, startRng, record) {
  let state = start;
  let botRng = startRng;
  const corridor = chooseSideStop(state, policy, botRng);
  botRng = corridor.botRng;
  if (corridor.stopKind !== null) record.sideStops.push(corridor.stopKind);
  state = walkCorridor(state, corridor.stopKind);
  const shopping = shop(state, policy, botRng);
  botRng = shopping.botRng;
  record.itemsBought.push(...shopping.bought);
  record.noteCash(shopping.lowestCash);
  state = shopping.state;
  const pm = doPmOrDoe(state, policy, botRng);
  botRng = pm.botRng;
  if (pm.pmRoom !== null) record.toolsPmd.push(pm.pmRoom);
  if (pm.doeCardId !== null) record.cardsUpgraded.push(pm.doeCardId);
  state = pm.state;
  const event = doEvent(state, policy, botRng);
  botRng = event.botRng;
  if (event.choice !== null) record.eventChoices.push(event.choice);
  state = event.state;
  return { state, botRng };
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
  const sideStops = [];
  const itemsBought = [];
  const toolsPmd = [];
  const cardsUpgraded = [];
  const eventChoices = [];
  let lowestCashAfterBuying = state.cash;   // starting cash, until something is bought
  while (state.status === 'running') {
    state = enterStep(state);
    const room = playRoom(state, policy, botRng);
    botRng = room.botRng;
    cardsPlayed.push(...room.played);
    state = resolveStep(room.state);
    if (state.corridor !== null) {
      if (SMART_POLICIES.includes(policy)) {
        const smart = smartCorridor(state, noiseFor(policy), botRng);
        botRng = smart.botRng;
        if (smart.stopKind !== null) sideStops.push(smart.stopKind);
        itemsBought.push(...smart.bought);
        lowestCashAfterBuying = Math.min(lowestCashAfterBuying, smart.lowestCash);
        if (smart.pmRoom !== null) toolsPmd.push(smart.pmRoom);
        if (smart.doeCardId !== null) cardsUpgraded.push(smart.doeCardId);
        if (smart.eventLabel !== null) eventChoices.push(smart.eventLabel);
        state = smart.state;
      } else {
        ({ state, botRng } = oneCorridorRandomly(state, policy, botRng, {
          sideStops, itemsBought, toolsPmd, cardsUpgraded, eventChoices,
          noteCash: cash => { lowestCashAfterBuying = Math.min(lowestCashAfterBuying, cash); },
        }));
      }
    }
  }

  const summary = {
    seed, policy, status: state.status, yield: lotYield(state.lot), cash: state.cash,
    costPerGoodDie: lotMoney(state).costPerGoodDie,
    minutesUsed: state.minutesUsed, cycleTime: state.cycleTime, cardsPlayed, sideStops, itemsBought, toolsPmd, cardsUpgraded, eventChoices, lowestCashAfterBuying,
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
  console.log(`Cost per good die: ${summary.costPerGoodDie === null ? 'none' : summary.costPerGoodDie.toFixed(2)}`);
  console.log(`Minutes played: ${summary.minutesUsed}`);
  console.log(`Cycle time:    ${summary.cycleTime} min`);
  console.log(`Cards played:  ${summary.cardsPlayed.length} (${summary.cardsPlayed.join(', ') || 'none'})`);
  console.log(`Side stops:    ${summary.sideStops.length} (${summary.sideStops.join(', ') || 'none'})`);
  console.log(`Items bought:  ${summary.itemsBought.length} (${summary.itemsBought.join(', ') || 'none'})`);
  console.log(`Tools PM'd:    ${summary.toolsPmd.length} (${summary.toolsPmd.join(', ') || 'none'})`);
  console.log(`DOEs run:      ${summary.cardsUpgraded.length} (${summary.cardsUpgraded.join(', ') || 'none'})`);
  console.log(`Events:        ${summary.eventChoices.length} (${summary.eventChoices.join('; ') || 'none'})`);
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
