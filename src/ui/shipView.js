// shipView.js — display data for the ship report (M3 item 3), shown once a
// run is over: shipped, rejected or scrapped. No DOM and no game rules: it
// only reads the finished state and the content.

import { ROOMS, PRACTICES, EQUIPMENT, MATERIALS, CONSUMABLES } from '../content/content.js';
import { TOOL_MONITORS } from '../content/toolMonitors.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import { SCRAP_LINE, CUSTOMER_SPEC, LOT_BASE_COST, COST_TARGET_PER_GOOD_DIE, CYCLE_TIME_COST_PER_MINUTE } from '../content/balance.js';
import { DIE_PER_LOT, lotMoney } from '../engine/cost.js';
import { lotYield } from '../engine/lot.js';
import { diagnosisFor, findFailureMode, inNotebook, emptyNotebook, stepsThatLost } from '../engine/notebook.js';
import { spcView } from './spcView.js';
import { modeName } from './notebookView.js';   // failure-mode names, shared with the Notebook page
import { toPercent, siteView, mapKeyText } from './view.js';

// The money math lives in the engine (cost.js), since the cost now decides
// whether a shipped lot wins. Re-exported for the tests and the screens.
export { DIE_PER_LOT, lotMoney };

// The one line that says how the run ended, and why. A win needs both: the
// yield target and the cost target (David, 31 Oct 2026).
function verdictText(state, route, yieldPercent, money) {
  const spec = toPercent(CUSTOMER_SPEC);
  const target = COST_TARGET_PER_GOOD_DIE[state.lotTypeId].toFixed(2);
  if (state.status === 'shipped') {
    return `Shipped: yield ${yieldPercent}% meets the ${spec}% spec, at ${money.costPerGoodDie.toFixed(2)} per good die (target ${target} or less). A win.`;
  }
  if (state.status === 'shippedAtLoss') {
    return `Shipped at a loss: yield ${yieldPercent}% meets the ${spec}% spec, but each good die cost ${money.costPerGoodDie.toFixed(2)}, over the ${target} target. Not a win.`;
  }
  if (state.status === 'rejected') {
    return `Rejected: yield ${yieldPercent}% is below the ${spec}% customer spec. The customer sends the lot back.`;
  }
  const step = route[state.stepIndex];
  if (state.scrappedBy === 'player') {
    return `Scrapped by you before step ${state.stepIndex + 1}, ${step.label}, at ${yieldPercent}% yield.`;
  }
  return `Scrapped at step ${state.stepIndex + 1}, ${step.label}: yield ${yieldPercent}% fell below the ${toPercent(SCRAP_LINE)}% scrap line.`;
}

// Where the lot cost came from, in one line.
function costBreakdown(state, money) {
  const spent = money.cashSpent >= 0 ? `${money.cashSpent} cash spent` : `${-money.cashSpent} cash earned`;
  return `${LOT_BASE_COST} base + ${spent} + ${state.cycleTime} min × ${CYCLE_TIME_COST_PER_MINUTE}`;
}

// The cost tile: cost per good die against its target, or why there is none.
function costTile(state, money) {
  const target = COST_TARGET_PER_GOOD_DIE[state.lotTypeId].toFixed(2);
  if (money.costPerGoodDie === null) {
    return { label: 'Cost per good die', value: 'none', detail: `No good die shipped. Lot cost ${money.lotCost} (${costBreakdown(state, money)}), all lost.` };
  }
  const detail = `Lot cost ${money.lotCost} (${costBreakdown(state, money)}) ÷ ${money.goodDie.toFixed(1)} good die. Target ${target} or less`
    + (state.status === 'rejected' ? '. Not paid: the lot was rejected.' : '.');
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

// --- diagnosis (M4 item 1) ---

// The names of what a failure mode unlocks: practices, equipment, materials
// or consumables.
function unlockNames(mode) {
  const everything = [...PRACTICES, ...EQUIPMENT, ...MATERIALS, ...CONSUMABLES];
  return mode.unlocks.map(id => everything.find(item => item.id === id)?.name ?? id);
}

// One choice on the diagnose panel.
function candidateView(notebook, failureModeId) {
  const mode = findFailureMode(failureModeId);
  return { id: mode.id, name: modeName(mode), sig: mode.sig, known: inNotebook(notebook, mode.id) };
}

// The words after a guess. `result` comes from notebook.js diagnoseLot.
function resultText(result) {
  const mode = findFailureMode(result.failureModeId);
  if (result.correct && result.alreadyKnown) return `Right: ${modeName(mode)}. It is already in your notebook.`;
  if (result.correct) return `Diagnosed: ${modeName(mode)}. Written in your notebook.`;
  const revealed = findFailureMode(result.revealedId);
  return `Not this one. What did hurt this lot: ${modeName(revealed)}. `
    + 'It is not written in your notebook: diagnose it on a later run to earn it.';
}

// After a guess: where the right answer cost yield, and how to spot it.
// `mode` is the failure mode that did hurt the lot (the one named if right,
// the revealed one if wrong).
function evidenceText(state, mode) {
  const steps = stepsThatLost(state, mode.pattern);
  const lost = steps.reduce((sum, step) => sum + step.points, 0);
  const where = steps.map(step => `${ROOMS[step.roomId].name}, step ${step.stepIndex + 1} (${step.points.toFixed(1)} points)`).join('; ');
  const cost = steps.length > 0 ? `It cost ${lost.toFixed(1)} yield points: ${where}. ` : '';
  return `${cost}How to spot it: ${mode.sig}`;
}

// The Diagnose panel. Before a guess: the choices. After: what happened.
// `result` is null until the player names a failure mode; after that the
// panel only shows what happened, so the notebook is not read again.
function diagnoseView(state, notebook, result) {
  if (result !== null) {
    const mode = findFailureMode(result.failureModeId);
    const earned = result.correct && !result.alreadyKnown;
    return {
      state: 'done',
      text: resultText(result),
      evidence: evidenceText(state, result.correct ? mode : findFailureMode(result.revealedId)),
      correct: result.correct,
      earned,
      unlocks: earned ? unlockNames(mode) : [],
    };
  }
  const { candidates } = diagnosisFor(state, notebook);
  if (candidates.length === 0) return { state: 'nothing', text: 'This lot lost too little to tell what hurt it.' };
  return {
    state: 'choose',
    text: 'Which failure mode hurt this lot? Read the evidence: yield by step, the wafer map and the tool charts. One guess.',
    candidates: candidates.map(id => candidateView(notebook, id)),
  };
}

// The SPC chart of every monitored tool on the route, in route order.
function routeSpc(state, route) {
  const rooms = [...new Set(route.map(step => step.room))].filter(roomId => TOOL_MONITORS[roomId]);
  return rooms.map(roomId => ({ roomId, roomName: ROOMS[roomId].name, spc: spcView(state, roomId) }));
}

// Everything the ship report shows. `notebook` is the player's notebook;
// `diagnosis` is diagnoseLot's result for this lot, or null before the guess.
export function shipView(state, notebook = emptyNotebook(), diagnosis = null) {
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
    verdictText: verdictText(state, lotType.route, yieldPercent, money),
    // The three numbers, side by side (DESIGN.md §12). A win needs the yield
    // and the cost tile on target; cycle time is inside the cost.
    tiles: [
      {
        // A scrapped lot never shipped, so its yield is the yield when it was scrapped.
        label: state.status === 'scrapped' ? 'Yield at scrap' : 'Shipped yield',
        value: `${yieldPercent}%`,
        detail: `Customer spec ${toPercent(CUSTOMER_SPEC)}%`,
      },
      costTile(state, money),
      { label: 'Cycle time', value: `${state.cycleTime} min`, detail: `Room time, side stops and events: ${CYCLE_TIME_COST_PER_MINUTE} per minute in the lot cost` },
    ],
    steps: stepRows(state, lotType.route),
    stepsNotRun: lotType.route.length - state.stepYields.length,
    sites: state.lot.sites.map(siteView),
    mapKeyText: mapKeyText(),
    tools: routeSpc(state, lotType.route),
    diagnose: diagnoseView(state, notebook, diagnosis),
  };
}
