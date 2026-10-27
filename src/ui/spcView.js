// spcView.js — turns a room tool's SPC points into display data for the
// SPC chart (M3 item 2b). No DOM and no game rules: it only reads the state
// and the content. spcChart.js draws what this returns.
//
// The engine keeps SPC points in sigma units from the target ("z", see
// src/engine/tools.js); this turns them into the parameter's own units.

import { TOOL_MONITORS } from '../content/toolMonitors.js';
import { CONTROL_LIMIT_SIGMA, SPEC_LIMIT_SIGMA, SPC_HISTORY } from '../content/balance.js';
import { spcRules, pointsSinceLastPm } from '../engine/tools.js';

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

// The one-line verdict under the chart, named by the worst finding (David,
// 26 Oct 2026; physics review claim 9): one point past a limit is an
// excursion, not a shift.
//   rules 2 or 3 (2 of 3 past 2σ, 8 on one side)  → Shift
//   rule 4 (6 steadily rising or falling)          → Trend (with a shift: both)
//   rule 1 alone (one point past the control limit) → Excursion
// The chart's own name ("the etch rate chart") keeps the sentence right for
// every parameter, singular or plural.
// On a one-sided chart (particle adders, seam rate) the low side can't fail
// spec, so a signal there is said as costing nothing (physics review,
// 27 Oct 2026). Rules on the costly side decide the verdict.
function verdictText(name, lotsSincePm, tripped, hadPm, monitor) {
  if (lotsSincePm === 0) return 'Just PM\'d or serviced: no lots measured since yet.';
  const harmless = entry => monitor.oneSided && onGoodSide(entry, monitor.direction);
  const costly = tripped.filter(entry => !harmless(entry));
  const has = rule => costly.some(entry => entry.rule === rule);
  const shift = has(2) || has(3);
  const PM_COST = 'A shifted tool costs yield in this room until it is PM\'d or serviced.';
  if (shift && has(4)) return `Shift and trend: the ${name} chart has moved off centre and is still moving lot by lot. ${PM_COST}`;
  if (shift) return `Shift: the ${name} chart has moved off centre. ${PM_COST}`;
  if (has(4)) return `Trend: the ${name} chart is moving lot by lot. The further it goes, the more yield it costs.`;
  if (has(1)) return 'Excursion: one lot measured past the control limit. Standard practice is to re-measure and check the tool. If it was a bad measurement or a one-off, the next lots come back inside the limits.';
  if (costly.length < tripped.length) {
    return `Shift (low side): the ${name} chart reads below its centre line. Fewer is never out of spec, so no yield cost, but an engineer still checks the gauge and the centre line.`;
  }
  const since = hadPm ? ' since the last PM or service' : '';
  return `In control: no rule tripped in the last ${lotsText(lotsSincePm)}${since}.`;
}

// True for a tripped rule on the side a tool doesn't drift towards: below
// the centre or falling, for a chart whose drift goes up (direction +1).
function onGoodSide(entry, direction) {
  const low = entry.side === 'below' || entry.side === 'falling';
  return direction > 0 ? low : !low;
}

// One tripped rule, in words.
function ruleText(tripped) {
  const side = tripped.side;
  if (tripped.rule === 1) return `A point beyond the ${side === 'above' ? 'upper' : 'lower'} control limit`;
  if (tripped.rule === 2) return `2 of 3 points in a row beyond 2σ ${side} the centre`;
  if (tripped.rule === 3) return `8 points in a row ${side} the centre line`;
  return `6 points in a row steadily ${side}`;
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
  // The rules only look at the lots since the last PM (tools.js).
  const sincePm = pointsSinceLastPm(tool);
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
    // Numbers at the left edge of the chart, one per line (Lane F issue 4:
    // the chart had no axis numbers). Shorter than the text below: whole
    // units, or one decimal for a small sigma.
    axisLabels: [
      ...(monitor.oneSided ? [1] : [1, -1]).map(side => side * SPEC_LIMIT_SIGMA),
      CONTROL_LIMIT_SIGMA, -CONTROL_LIMIT_SIGMA, 0,
    ].map(z => ({ z, text: toUnits(z).toFixed(decimals - 1) })),
    rules: tripped.map(ruleText),
    inControl: tripped.length === 0,
    verdictText: verdictText(name, sincePm.length, tripped, pmMarks.length > 0, monitor),
  };
}
