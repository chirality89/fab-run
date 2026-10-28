// exit-check.js — does the game pass the "winnable and readable" test?
//
// Usage:  npm run exit-check [-- --seeds 100 --deck starter]
//
// Plays the same seeds with each bot policy and prints, per policy: how many
// lots shipped, the mean/lowest/highest final yield, and how the policies
// compare. The targets (plan P1; David confirms the numbers):
//   idle    ships 0%    (doing nothing must fail)
//   random  under 15%
//   smart   60% to 80%  (good play wins most of the time, not always)
//   spread  smart mean minus idle mean over 10 points
// Exit code 0 if every target holds, 1 if not, so a script can check it.

import { pathToFileURL } from 'node:url';
import { playRun } from './bot.js';

export const POLICIES = ['idle', 'random', 'casual', 'smart'];

export const TARGETS = {
  idleMaxShipRate: 0,
  randomMaxShipRate: 0.15,
  smartMinShipRate: 0.60,
  smartMaxShipRate: 0.80,
  minSpreadPoints: 10,
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

// Each target as { ok, text }, given the results keyed by policy.
export function checkTargets(results) {
  const { idle, random, smart } = results;
  const spread = smart.mean - idle.mean;
  const pct = fraction => `${(fraction * 100).toFixed(0)}%`;
  return [
    { ok: idle.shipRate <= TARGETS.idleMaxShipRate, text: `idle ships ${pct(idle.shipRate)} (target 0%)` },
    { ok: random.shipRate <= TARGETS.randomMaxShipRate, text: `random ships ${pct(random.shipRate)} (target under ${pct(TARGETS.randomMaxShipRate)})` },
    {
      ok: smart.shipRate >= TARGETS.smartMinShipRate && smart.shipRate <= TARGETS.smartMaxShipRate,
      text: `smart ships ${pct(smart.shipRate)} (target ${pct(TARGETS.smartMinShipRate)} to ${pct(TARGETS.smartMaxShipRate)})`,
    },
    { ok: spread > TARGETS.minSpreadPoints, text: `smart beats idle by ${spread.toFixed(1)} points (target over ${TARGETS.minSpreadPoints})` },
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
  const deck = args.deck ?? 'starter';
  console.log(`Seeds 1 to ${count}, ${deck} deck\n`);
  console.log('policy   shipped rejected scrapped   mean  lowest highest');
  const results = {};
  for (const policy of POLICIES) {
    const r = runPolicy(policy, count, deck);
    results[policy] = r;
    console.log(`${policy.padEnd(8)} ${String(r.shipped).padStart(7)} ${String(r.rejected).padStart(8)} ${String(r.scrapped).padStart(8)}   ${r.mean.toFixed(1).padStart(5)}  ${r.lowest.toFixed(1).padStart(6)}  ${r.highest.toFixed(1).padStart(6)}`);
  }
  console.log('\nTargets:');
  const checks = checkTargets(results);
  for (const check of checks) console.log(`  ${check.ok ? 'PASS' : 'FAIL'}  ${check.text}`);
  process.exit(checks.every(check => check.ok) ? 0 : 1);
}
