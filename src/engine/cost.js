// cost.js — what a lot costs, and its cost per good die (David, 31 Oct 2026:
// cash and cycle time count toward winning). Pure functions, no DOM.
//
//   lot cost = base cost + cash spent + cycle time × carrying cost per minute
//
// Cycle time is in the cost because a lot waiting in the line ties up tools
// and money. Event income lowers the cash spent, so it lowers the cost too.

import { STARTING_CASH, LOT_BASE_COST, CYCLE_TIME_COST_PER_MINUTE } from '../content/balance.js';
import { lotYield } from './lot.js';

// Every die on the lot: 25 wafers × 25 sites. Lot yield is the average of
// the sites, so good die = yield × DIE_PER_LOT.
export const DIE_PER_LOT = 25 * 25;

// The money side of a lot. `goodDie` is 0 for a scrapped lot (it ships
// nothing), and then there is no cost per good die (null).
export function lotMoney(state) {
  const cashSpent = STARTING_CASH - state.cash;
  const timeCost = state.cycleTime * CYCLE_TIME_COST_PER_MINUTE;
  const lotCost = LOT_BASE_COST + cashSpent + timeCost;
  const goodDie = state.status === 'scrapped' ? 0 : lotYield(state.lot) * DIE_PER_LOT;
  const costPerGoodDie = goodDie > 0 ? lotCost / goodDie : null;
  return { cashSpent, timeCost, lotCost, goodDie, costPerGoodDie };
}
