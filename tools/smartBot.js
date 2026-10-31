// smartBot.js — the "smart" and "casual" bot policies (plan P1).
//
// How the smart bot decides: for every option it could take, it makes a COPY
// of the state, takes the option, then plays the rest of the run on that copy
// doing nothing more (no cards, straight through every corridor). The yield
// at the end of that make-believe run is the option's score. It takes the
// best option, if that beats doing nothing. The engine never changes the real
// state, so trying options on copies is safe.
//
// What it knows: it follows the engine's own rules, so it knows the route and
// every risk the lot will meet. A new player does not. So the smart bot shows
// how good play CAN be (an upper bound), not how good a first-time player is.
// The casual policy is the same bot, but 3 decisions in 10 it picks a random
// option instead: a rough stand-in for an average player.
//
// The make-believe runs turn scatter off (scatterStrength 0), so the bot does
// not peek at the lot's luck. Its own random choices come from its own
// generator, never the lot's (CLAUDE.md §8).
//
// No peeking at hidden dice. Two things a player cannot see before choosing:
// what is inside a side stop (shop stock, which event, which DOE offers; all
// picked from the run's seed) and the PM's 75-95 restore roll (picked from
// the tools' generator). For those choices the bot scores each option on a
// few IMAGINED runs that use made-up dice, and takes the average. Once inside
// a stop it sees the real contents, as a player does.

import { nextRandom, pick } from '../src/engine/rng.js';
import { lotYield } from '../src/engine/lot.js';
import { lotMoney, DIE_PER_LOT } from '../src/engine/cost.js';
import { CUSTOMER_SPEC, COST_TARGET_PER_GOOD_DIE } from '../src/content/balance.js';
import {
  legalCards, playCard, enterStep, resolveStep, walkCorridor,
  buyItem, pmTool, doeCard, whyCannotDoe, chooseEventOption,
} from '../src/engine/run.js';
import { whyCannotBuy } from '../src/engine/shop.js';
import { findEvent } from '../src/engine/events.js';

// Cash and cycle time count toward winning (David, 31 Oct 2026). A lot wins
// when its yield is at least the yield target AND at least the yield that
// meets the cost target (lot cost ÷ (cost target × die per lot)). The bot
// scores a state by how far its make-believe final yield clears the higher
// of the two: the margin to winning. A first try that scored only cost per
// good die sold yield for cash and never reached the yield target.
// Cash still in hand is a tie-break: 1000 cash = 5 points, as before.
const CASH_VALUE = 0.00005;
// An option must beat "do nothing" by at least this much (0.05 points).
const MIN_GAIN = 0.0005;
// How often the casual policy ignores the scores and picks at random.
const CASUAL_NOISE = 0.3;
// The made-up dice for imagined runs. Any whole numbers work; four is enough
// to average out one lucky stock or roll and keeps the bot quick.
const IMAGINED_SEEDS = [101, 202, 303, 404];

export const SMART_POLICIES = ['smart', 'casual'];

export function noiseFor(policy) {
  return policy === 'casual' ? CASUAL_NOISE : 0;
}

// The state the lot would finish in if, from this state on, nothing more
// were played or bought. Runs on a copy with scatter off.
function idleFinish(state) {
  let current = { ...state, scatterStrength: 0 };
  while (current.status === 'running') {
    if (current.room !== null) current = resolveStep(current);
    else if (current.corridor !== null) current = walkCorridor(current, null);
    else current = enterStep(current);
  }
  return current;
}

// The score of a state: the margin to winning at its make-believe finish
// (see above), plus the cash tie-break. A make-believe scrap scores its
// yield at scrap minus 2: below any lot that ships, but still higher the
// closer it came, so the bot keeps fighting for a lot that is going under
// (a flat score there made every option equal, and the bot gave up).
function score(state) {
  const end = idleFinish(state);
  if (end.status === 'scrapped') return lotYield(end.lot) - 2;
  const costYield = lotMoney(end).lotCost / (COST_TARGET_PER_GOOD_DIE[end.lotTypeId] * DIE_PER_LOT);
  return lotYield(end.lot) - Math.max(CUSTOMER_SPEC, costYield) + CASH_VALUE * end.cash;
}

// A copy of the state with made-up dice in place of the run's: a new seed
// (side-stop contents) and a new tools' generator number (PM restore rolls).
// Everything the player can already see (yield, tools, map, cash) is kept.
function imagined(state, imaginedSeed) {
  return { ...state, seed: imaginedSeed, toolRngState: imaginedSeed };
}

// The average score of doing `action` (a function from state to state) on
// each imagined run: what the bot can expect, not what the dice will give.
function expectedScore(state, action) {
  const scores = IMAGINED_SEEDS.map(imaginedSeed => score(action(imagined(state, imaginedSeed))));
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

// Rolls the casual bot's dice: true with probability `noise` (always false
// for the smart bot, which then uses no random numbers at all).
function ignoresScores(noise, botRng) {
  if (noise === 0) return { random: false, rngState: botRng };
  const roll = nextRandom(botRng);
  return { random: roll.value < noise, rngState: roll.rngState };
}

// Picks among options, each { value, score } where `score` is how good the
// state after taking it is. `doNothing` is the state if none is taken. Returns the chosen
// option's value (null for "none") and the bot's next generator number.
// The best option must beat doing nothing by MIN_GAIN. A noisy bot
// sometimes picks at random instead.
function choose(options, doNothing, noise, botRng) {
  const dice = ignoresScores(noise, botRng);
  if (dice.random) {
    const random = pick(dice.rngState, [{ value: null }, ...options]);
    return { value: random.value.value, rngState: random.rngState };
  }
  let best = { value: null };
  let bestScore = score(doNothing) + MIN_GAIN;
  for (const option of options) {
    if (option.score > bestScore) { best = option; bestScore = option.score; }
  }
  return { value: best.value, rngState: dice.rngState };
}

// Plays cards in the current room, one at a time, while a card helps.
export function smartRoom(state, noise, botRng) {
  let current = state;
  let rng = botRng;
  const played = [];
  while (legalCards(current).length > 0) {
    const options = [...new Set(legalCards(current))].map(id => ({ value: id, score: score(playCard(current, id)) }));
    const choice = choose(options, current, noise, rng);
    rng = choice.rngState;
    if (choice.value === null) break;
    current = playCard(current, choice.value);
    played.push(choice.value);
  }
  return { state: current, botRng: rng, played };
}

// Buys items at an open shop, one at a time, while an item is worth its cash.
function smartShop(state, noise, botRng) {
  let current = state;
  let rng = botRng;
  const bought = [];
  let lowestCash = Infinity;
  while (current.shop !== null) {
    const affordable = current.shop.stock.filter(id => whyCannotBuy(current, id) === null);
    const options = affordable.map(id => ({ value: id, score: score(buyItem(current, id)) }));
    const choice = choose(options, current, noise, rng);
    rng = choice.rngState;
    if (choice.value === null) break;
    current = buyItem(current, choice.value);
    bought.push(choice.value);
    lowestCash = Math.min(lowestCash, current.cash);
  }
  return { state: current, botRng: rng, bought, lowestCash };
}

// At an open PM/DOE stop: one PM or one DOE, or nothing.
function smartPmOrDoe(state, noise, botRng) {
  const nothing = { state, botRng, pmRoom: null, doeCardId: null };
  if (state.pm === null) return nothing;
  const options = [
    // A PM's restore roll is hidden until it is done, so it is scored on imagined rolls.
    ...state.pm.choices.map(room => ({ value: { pm: room }, score: expectedScore(state, s => pmTool(s, room)) })),
    ...state.pm.doeOffers.filter(id => whyCannotDoe(state, id) === null)
      .map(id => ({ value: { doe: id }, score: score(doeCard(state, id)) })),
  ];
  const choice = choose(options, state, noise, botRng);
  if (choice.value === null) return { ...nothing, botRng: choice.rngState };
  if (choice.value.pm) return { state: pmTool(state, choice.value.pm), botRng: choice.rngState, pmRoom: choice.value.pm, doeCardId: null };
  return { state: doeCard(state, choice.value.doe), botRng: choice.rngState, pmRoom: null, doeCardId: choice.value.doe };
}

// At an open event: an event must be answered, so there is no "nothing"
// option. Takes the best-scoring option (a noisy bot sometimes a random one).
function smartEvent(state, noise, botRng) {
  if (state.event === null) return { state, botRng, label: null };
  const event = findEvent(state.event.eventId);
  const options = event.options.map((_, index) => ({ index, state: chooseEventOption(state, index) }));
  const dice = ignoresScores(noise, botRng);
  let chosen = options.reduce((a, b) => (score(b.state) > score(a.state) ? b : a));
  let rng = dice.rngState;
  if (dice.random) {
    const random = pick(rng, options);
    chosen = random.value;
    rng = random.rngState;
  }
  return { state: chosen.state, botRng: rng, label: `${event.id}: ${event.options[chosen.index].label}` };
}

// A whole corridor. The player sees only the KIND of each stop on offer, not
// what is inside, so each way through (straight on, or each stop) is scored
// on imagined runs: go in, use the stop as well as possible, average. Then
// the bot walks the real corridor into the best kind and uses the real stop.
// Returns what playRun needs to log.
export function smartCorridor(state, noise, botRng) {
  const stopKinds = [null, ...state.map[state.corridor].offers];
  let bestKind = null;
  let bestScore = -Infinity;
  for (const stopKind of stopKinds) {
    // noise 0: the imagined visits never roll the casual bot's dice.
    const kindScore = expectedScore(state, s => useStop(walkCorridor(s, stopKind), 0, botRng).state);
    if (kindScore > bestScore + MIN_GAIN) { bestKind = stopKind; bestScore = kindScore; }
  }
  const dice = ignoresScores(noise, botRng);
  let rng = dice.rngState;
  if (dice.random) {
    const random = pick(rng, stopKinds);
    bestKind = random.value;
    rng = random.rngState;
  }
  return { stopKind: bestKind, ...useStop(walkCorridor(state, bestKind), noise, rng) };
}

// Whatever the stop just opened (shop, PM/DOE, event): use it well.
function useStop(state, noise, botRng) {
  const shopping = smartShop(state, noise, botRng);
  const pm = smartPmOrDoe(shopping.state, noise, shopping.botRng);
  const event = smartEvent(pm.state, noise, pm.botRng);
  return {
    state: event.state, botRng: event.botRng,
    bought: shopping.bought, lowestCash: shopping.lowestCash,
    pmRoom: pm.pmRoom, doeCardId: pm.doeCardId, eventLabel: event.label,
  };
}
