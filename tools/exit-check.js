// exit-check.js — does the game pass the "winnable and readable" test?
//
// Usage:  npm run exit-check [-- --seeds 100]
//
// Plays the same seeds with each bot policy, with the starter deck (a new
// player) and with the full deck (a player with many unlocks), and prints how
// many lots shipped and the final yields. David chose "both" (28 Oct 2026):
// the first run is winnable but tight, and unlocks give a clear margin.
// The targets (numbers proposed by Claude; David to confirm), starter deck:
//   idle    ships 0%     (doing nothing must fail)
//   random  under 5%
//   casual  under 25%    (an average player usually misses on the first run)
//   smart   40% to 75%   (a very good player wins often, not always)
// and with every card unlocked:
//   smart   at least 90%
//   spread  smart (full deck) beats idle by over 15 points (choices matter)
// Exit code 0 if every target holds, 1 if not, so a script can check it.

import { pathToFileURL } from 'node:url';
import { playRun } from './bot.js';

export const POLICIES = ['idle', 'random', 'casual', 'smart'];

export const TARGETS = {
  idleMaxShipRate: 0,
  randomMaxShipRate: 0.05,
  casualMaxShipRate: 0.25,
  smartMinShipRate: 0.40,
  smartMaxShipRate: 0.75,
  smartFullMinShipRate: 0.90,
  minSpreadPoints: 15,
};

// Plays seeds 1..count with one policy and totals the results.
export function runPolicy(policy, count, deck) {
  const yields = [];
  const counts = { shipped: 0, rejected: 0, scrapped: 0 };
  for (let seed = 1; seed <= count; seed++) {
    const { summary } = playRun(seed, policy, { deck });
    yields.push(summary.yield * 100);
    counts[summary.status] += 1;
  }
  const mean = yields.reduce((sum, y) => sum + y, 0) / yields.length;
  return {
    policy, count, ...counts, shipRate: counts.shipped / count,
    mean, lowest: Math.min(...yields), highest: Math.max(...yields),
  };
}

// Each target as { ok, text }, given the starter-deck results keyed by
// policy, and `smartFull`, the smart policy with every card.
export function checkTargets(results) {
  const { idle, random, casual, smart, smartFull } = results;
  const spread = smartFull.mean - idle.mean;
  const pct = fraction => `${(fraction * 100).toFixed(0)}%`;
  return [
    { ok: idle.shipRate <= TARGETS.idleMaxShipRate, text: `idle ships ${pct(idle.shipRate)} (target 0%)` },
    { ok: random.shipRate <= TARGETS.randomMaxShipRate, text: `random ships ${pct(random.shipRate)} (target under ${pct(TARGETS.randomMaxShipRate)})` },
    { ok: casual.shipRate <= TARGETS.casualMaxShipRate, text: `casual ships ${pct(casual.shipRate)} (target under ${pct(TARGETS.casualMaxShipRate)})` },
    {
      ok: smart.shipRate >= TARGETS.smartMinShipRate && smart.shipRate <= TARGETS.smartMaxShipRate,
      text: `smart (starter deck) ships ${pct(smart.shipRate)} (target ${pct(TARGETS.smartMinShipRate)} to ${pct(TARGETS.smartMaxShipRate)})`,
    },
    { ok: smartFull.shipRate >= TARGETS.smartFullMinShipRate, text: `smart (full deck) ships ${pct(smartFull.shipRate)} (target at least ${pct(TARGETS.smartFullMinShipRate)})` },
    { ok: spread > TARGETS.minSpreadPoints, text: `smart (full deck) beats idle by ${spread.toFixed(1)} points (target over ${TARGETS.minSpreadPoints})` },
  ];
}

function readArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) args[argv[i].replace(/^--/, '')] = argv[i + 1];
  return args;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = readArgs(process.argv.slice(2));
  const count = Number(args.seeds ?? 100);
  console.log(`Seeds 1 to ${count}\n`);
  console.log('deck     policy   shipped rejected scrapped   mean  lowest highest');
  const results = {};
  const rows = [...POLICIES.map(policy => [policy, 'starter']), ['smart', 'full']];
  for (const [policy, deck] of rows) {
    const r = runPolicy(policy, count, deck);
    results[deck === 'full' ? 'smartFull' : policy] = r;
    console.log(`${deck.padEnd(8)} ${policy.padEnd(8)} ${String(r.shipped).padStart(7)} ${String(r.rejected).padStart(8)} ${String(r.scrapped).padStart(8)}   ${r.mean.toFixed(1).padStart(5)}  ${r.lowest.toFixed(1).padStart(6)}  ${r.highest.toFixed(1).padStart(6)}`);
  }
  console.log('\nTargets:');
  const checks = checkTargets(results);
  for (const check of checks) console.log(`  ${check.ok ? 'PASS' : 'FAIL'}  ${check.text}`);
  process.exit(checks.every(check => check.ok) ? 0 : 1);
}
