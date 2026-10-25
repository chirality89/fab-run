// spcView.js — turns a room tool's SPC points into display data for the
// SPC chart (M3 item 2b). No DOM and no game rules: it only reads the state
// and the content. spcChart.js draws what this returns.
//
// The engine keeps SPC points in sigma units from the target ("z", see
// src/engine/tools.js); this turns them into the parameter's own units.

import { TOOL_MONITORS } from '../content/toolMonitors.js';
import { CONTROL_LIMIT_SIGMA, SPEC_LIMIT_SIGMA, SPC_HISTORY } from '../content/balance.js';
import { spcRules } from '../engine/tools.js';

// Decimals to print: a parameter with a small sigma needs more.
function decimalsFor(monitor) {
  return monitor.sigma < 1 ? 2 : 1;
}

// One tripped rule, in words.
function ruleText(tripped) {
  const side = tripped.side;
  if (tripped.rule === 1) return `A point beyond the ${side === 'above' ? 'upper' : 'lower'} control limit`;
  if (tripped.rule === 2) return `2 of 3 points in a row beyond 2σ ${side} the centre`;
  return `8 points in a row ${side} the centre line`;
}

// The SPC chart for a room's tool, or null if the room has no monitored
// tool (metrology: its gauge is the reference).
export function spcView(state, roomId) {
  const monitor = TOOL_MONITORS[roomId];
  if (!monitor) return null;
  const zs = state.tools[roomId].spc.slice(-SPC_HISTORY);   // the latest points
  const toUnits = z => monitor.target + z * monitor.sigma;
  const decimals = decimalsFor(monitor);
  const format = value => value.toFixed(decimals);
  const tripped = spcRules(zs);
  const name = monitor.parameter.toLowerCase();

  return {
    parameter: monitor.parameter,
    unit: monitor.unit,
    zs,
    controlSigma: CONTROL_LIMIT_SIGMA,
    specSigma: SPEC_LIMIT_SIGMA,
    // Points beyond the control limits are drawn differently (shape, not only color).
    outOfControl: zs.map(z => Math.abs(z) > CONTROL_LIMIT_SIGMA),
    latestText: zs.length > 0 ? `Latest lot: ${format(toUnits(zs[zs.length - 1]))} ${monitor.unit}` : '',
    limitsText: `Centre ${format(monitor.target)} · control ${format(toUnits(-CONTROL_LIMIT_SIGMA))}–${format(toUnits(CONTROL_LIMIT_SIGMA))}`
      + ` · spec ${format(toUnits(-SPEC_LIMIT_SIGMA))}–${format(toUnits(SPEC_LIMIT_SIGMA))} ${monitor.unit}`,
    rules: tripped.map(ruleText),
    inControl: tripped.length === 0,
    verdictText: tripped.length === 0
      ? `In control: no rule tripped in the last ${zs.length} lots.`
      : `Out of control: the ${name} may be shifting. A shifted tool costs yield in this room.`,
  };
}
