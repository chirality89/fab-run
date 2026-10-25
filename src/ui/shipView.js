// shipView.js — display data for the ship report (M3 item 3), shown once a
// run is over: shipped, rejected or scrapped. No DOM and no game rules: it
// only reads the finished state and the content.

import { ROOMS } from '../content/content.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import { STARTING_CASH, SCRAP_LINE, CUSTOMER_SPEC, LOT_BASE_COST } from '../content/balance.js';
import { lotYield } from '../engine/lot.js';
import { toPercent, siteView, mapKeyText } from './view.js';

// Every die on the lot: 25 wafers × 25 sites. Lot yield is the average of
// the sites, so good die = yield × DIE_PER_LOT.
export const DIE_PER_LOT = 25 * 25;

// The money side of the lot. The lot cost is the base cost plus the cash
// spent during the run (event income lowers it). A scrapped lot ships no
// good die, so it has a lot cost but no cost per good die.
export function lotMoney(state) {
  const lotCost = LOT_BASE_COST + (STARTING_CASH - state.cash);
  const goodDie = state.status === 'scrapped' ? 0 : lotYield(state.lot) * DIE_PER_LOT;
  const costPerGoodDie = goodDie > 0 ? lotCost / goodDie : null;
  return { lotCost, goodDie, costPerGoodDie };
}

// The one line that says how the run ended, and why.
function verdictText(state, route, yieldPercent) {
  const spec = toPercent(CUSTOMER_SPEC);
  if (state.status === 'shipped') return `Shipped: yield ${yieldPercent}% meets the ${spec}% customer spec.`;
  if (state.status === 'rejected') {
    return `Rejected: yield ${yieldPercent}% is below the ${spec}% customer spec. The customer sends the lot back.`;
  }
  const step = route[state.stepIndex];
  if (state.scrappedBy === 'player') {
    return `Scrapped by you before step ${state.stepIndex + 1}, ${step.label}, at ${yieldPercent}% yield.`;
  }
  return `Scrapped at step ${state.stepIndex + 1}, ${step.label}: yield ${yieldPercent}% fell below the ${toPercent(SCRAP_LINE)}% scrap line.`;
}

// The cost tile: cost per good die, or why there is none.
function costTile(state, money) {
  if (money.costPerGoodDie === null) {
    return { label: 'Cost per good die', value: 'none', detail: `No good die shipped. Lot cost ${money.lotCost}, all lost.` };
  }
  const detail = `Lot cost ${money.lotCost} ÷ ${money.goodDie.toFixed(1)} good die`
    + (state.status === 'rejected' ? '. Not paid: the lot was rejected.' : '');
  return { label: 'Cost per good die', value: money.costPerGoodDie.toFixed(2), detail };
}

// One row per room the lot ran through: its yield after the room and the
// points that room cost. The lot starts at 100%.
function stepRows(state, route) {
  let before = 1;
  return state.stepYields.map(entry => {
    const row = {
      stepNumber: entry.stepIndex + 1,
      roomId: entry.roomId,
      roomName: ROOMS[entry.roomId].name,
      // The step's own words, unless they only repeat the room's name ("CMP").
      stepLabel: route[entry.stepIndex].label === ROOMS[entry.roomId].name ? '' : route[entry.stepIndex].label,
      yieldPercent: toPercent(entry.yieldAfter),
      lossPoints: ((before - entry.yieldAfter) * 100).toFixed(1),
    };
    before = entry.yieldAfter;
    return row;
  });
}

// Everything the ship report shows.
export function shipView(state) {
  if (state.status === 'running') throw new Error('shipView: the run is not over yet');
  const lotType = LOT_TYPES[state.lotTypeId];
  const yieldNow = lotYield(state.lot);
  const yieldPercent = toPercent(yieldNow);
  const money = lotMoney(state);
  return {
    seed: state.seed,
    cash: state.cash,
    lotName: lotType.name,
    status: state.status,
    verdictText: verdictText(state, lotType.route, yieldPercent),
    // The three numbers, side by side, never combined (DESIGN.md §12).
    tiles: [
      {
        // A scrapped lot never shipped, so its yield is the yield when it was scrapped.
        label: state.status === 'scrapped' ? 'Yield at scrap' : 'Shipped yield',
        value: `${yieldPercent}%`,
        detail: `Customer spec ${toPercent(CUSTOMER_SPEC)}%`,
      },
      costTile(state, money),
      { label: 'Cycle time', value: `${state.cycleTime} min`, detail: 'Room time, side stops and events' },
    ],
    steps: stepRows(state, lotType.route),
    stepsNotRun: lotType.route.length - state.stepYields.length,
    sites: state.lot.sites.map(siteView),
    mapKeyText: mapKeyText(),
  };
}
