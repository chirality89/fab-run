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

// The spec limits in words: a range, or "up to" for a one-sided spec.
function specText(monitor, toUnits, format) {
  if (monitor.oneSided) return `up to ${format(toUnits(SPEC_LIMIT_SIGMA))}`;
  return `${format(toUnits(-SPEC_LIMIT_SIGMA))}–${format(toUnits(SPEC_LIMIT_SIGMA))}`;
}

// "1 lot" or "12 lots".
function lotsText(count) {
  return count === 1 ? '1 lot' : `${count} lots`;
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
  const tool = state.tools[roomId];
  const zs = tool.spc.slice(-SPC_HISTORY);   // the latest points
  // A PM mark sits just before point `index` (index = zs.length: after the
  // last point, i.e. the PM came after the latest lot).
  const firstShown = tool.spc.length - zs.length;
  const pmMarks = tool.pmAt.map(at => at - firstShown).filter(index => index >= 0 && index <= zs.length);
  const toUnits = z => monitor.target + z * monitor.sigma;
  const decimals = decimalsFor(monitor);
  const format = value => value.toFixed(decimals);
  // After a PM the tool is a new process: the rules only look at the lots
  // measured since the last PM, as an engineer restarts the chart.
  const lastPm = pmMarks.length > 0 ? pmMarks[pmMarks.length - 1] : 0;
  const sincePm = zs.slice(lastPm);
  const tripped = spcRules(sincePm);
  const name = monitor.parameter.toLowerCase();

  return {
    parameter: monitor.parameter,
    unit: monitor.unit,
    zs,
    pmMarks,
    controlSigma: CONTROL_LIMIT_SIGMA,
    specSigma: SPEC_LIMIT_SIGMA,
    // One-sided spec (particles, seams): only the upper spec line is drawn.
    specSides: monitor.oneSided ? [1] : [1, -1],
    // Points beyond the control limits are drawn differently (shape, not only color).
    outOfControl: zs.map(z => Math.abs(z) > CONTROL_LIMIT_SIGMA),
    latestText: zs.length > 0 ? `Last lot measured: ${format(toUnits(zs[zs.length - 1]))} ${monitor.unit}` : '',
    limitsText: `Centre ${format(monitor.target)} · control ${format(toUnits(-CONTROL_LIMIT_SIGMA))}–${format(toUnits(CONTROL_LIMIT_SIGMA))}`
      + ` · spec ${specText(monitor, toUnits, format)} ${monitor.unit}`,
    rules: tripped.map(ruleText),
    inControl: tripped.length === 0,
    verdictText: sincePm.length === 0
      ? 'Just PM\'d: no lots measured since the PM yet.'
      : tripped.length === 0
      ? `In control: no rule tripped in the last ${lotsText(sincePm.length)}${pmMarks.length > 0 ? ' since the PM' : ''}.`
      : `Out of control: the ${name} may be shifting. A shifted tool costs yield in this room.`,
  };
}
