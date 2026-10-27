// pmView.js — display data for the PM screen (M3 item 2c). No DOM and no
// game rules: it only reads the state and the content.

import { ROOMS, PRACTICES } from '../content/content.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import { SIDE_STOPS } from '../content/sideStops.js';
import { SIDE_STOP_MINUTES, PM_RESTORE_MIN, PM_RESTORE_MAX, DOE_CASH_COST } from '../content/balance.js';
import { TOOL_MONITORS } from '../content/toolMonitors.js';
import { whyCannotPm, whyCannotDoe } from '../engine/run.js';
import { cardInRun } from '../engine/doe.js';
import { spcView } from './spcView.js';
import { nextUseText } from './view.js';
import { effectText } from './effectsText.js';

// A card's cost and effects in one line, e.g.
// "4 min · residue ×0.3 · underlayer attack ×1.5 · underlayer attack ×0.5 with etch stop".
// Only the yield effects: flags and reveals read the same before and after a DOE.
function recipeText(card) {
  const parts = [`${card.cost.time ?? 0} min`];
  if (card.cost.cash) parts.push(`${card.cost.cash} cash`);
  parts.push(...card.effects.filter(effect => effect.op === 'defectMult').map(effectText));
  return parts.join(' · ');
}

// The engine's short reason, in words for the screen.
const DOE_REASON_TEXT = {
  'not enough cash': 'Not enough cash',
  "already used this stop's one choice": 'This stop\'s one choice is used',
};

// One practice a DOE could upgrade: the card now and its DOE version.
function doeOfferView(state, cardId) {
  const now = cardInRun(state, cardId);
  const card = PRACTICES.find(entry => entry.id === cardId);
  const after = { ...card, ...card.upgrade };
  const reason = whyCannotDoe(state, cardId);
  return {
    cardId,
    name: card.name,   // the card as written, so it keeps its title after the DOE
    roomName: ROOMS[card.room].name,
    nowText: recipeText(now),
    afterName: after.name,
    afterText: recipeText(after),
    afterTradeoff: after.tradeoff,
    done: state.pm.doeDone.includes(cardId),
    canDoe: reason === null,
    // Once the stop's one choice is used, the screen shows no reason at all.
    choiceUsed: reason === "already used this stop's one choice",
    reason: reason === null ? null : (DOE_REASON_TEXT[reason] ?? reason),
  };
}

// Everything the PM screen shows, while a PM/DOE stop is open.
export function pmView(state) {
  if (state.pm === null) throw new Error('pmView: no PM stop is open');
  const route = LOT_TYPES[state.lotTypeId].route;
  const nextIndex = state.pm.corridor + 1;
  const stop = SIDE_STOPS.pm;
  const choices = state.pm.choices.map(roomId => ({
    roomId,
    roomName: ROOMS[roomId].name,
    parameter: TOOL_MONITORS[roomId].parameter,
    nextUseText: nextUseText(route, nextIndex, roomId),
    spc: spcView(state, roomId),
    done: state.pm.done.includes(roomId),
    canPm: whyCannotPm(state, roomId) === null,
  }));
  return {
    seed: state.seed,
    cash: state.cash,
    name: stop.name,
    what: stop.what,
    text: choices.length === 0
      ? `${stop.name} cost ${SIDE_STOP_MINUTES.pm} min of cycle time. No tool on the route ahead can be PM'd here.`
      : `${stop.name} cost ${SIDE_STOP_MINUTES.pm} min of cycle time. PM one tool: it comes back to between ${PM_RESTORE_MIN} and ${PM_RESTORE_MAX} percent health, never perfect (a tool already healthier stays as it is). Read the SPC charts to choose.`,
    choices,
    doeText: `A DOE tunes one practice's recipe for the rest of the run. It costs ${DOE_CASH_COST} cash. You can do a PM or a DOE here, not both.`,
    doeOffers: state.pm.doeOffers.map(cardId => doeOfferView(state, cardId)),
    // Before any choice the exit says plainly that you leave with nothing
    // done; the stop's minutes are spent either way (Lane F issue 8).
    goText: chosenNothing(state)
      ? `Leave without a PM or DOE: on to step ${nextIndex + 1}, ${route[nextIndex].label}`
      : `Continue to step ${nextIndex + 1}: ${route[nextIndex].label}`,
  };
}

// True while nothing has been PM'd or DOE'd at this stop.
const chosenNothing = state => state.pm.done.length === 0 && state.pm.doeDone.length === 0;
