// pmView.js — display data for the PM screen (M3 item 2c). No DOM and no
// game rules: it only reads the state and the content.

import { ROOMS } from '../content/content.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import { SIDE_STOPS } from '../content/sideStops.js';
import { SIDE_STOP_MINUTES } from '../content/balance.js';
import { TOOL_MONITORS } from '../content/toolMonitors.js';
import { whyCannotPm } from '../engine/run.js';
import { spcView } from './spcView.js';
import { nextUseText } from './view.js';

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
    name: stop.name,
    what: stop.what,
    text: choices.length === 0
      ? `${stop.name} cost ${SIDE_STOP_MINUTES.pm} min of cycle time. No tool on the route ahead can be PM'd here.`
      : `${stop.name} cost ${SIDE_STOP_MINUTES.pm} min of cycle time. PM one tool: it comes back to between 75 and 95 percent health, never perfect. Read the SPC charts to choose.`,
    choices,
    goText: `Continue to step ${nextIndex + 1}: ${route[nextIndex].label}`,
  };
}
