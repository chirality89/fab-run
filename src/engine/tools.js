// tools.js — tool drift, wear and SPC (M3 item 2b). Pure functions.
//
// Each room's tool has a health from 0 to 100 and one monitored parameter
// (src/content/toolMonitors.js). In fab terms:
//   - Health sets the mean shift: every HEALTH_PER_SIGMA health lost moves
//     the parameter's mean one sigma in the tool's drift direction.
//   - The shift costs yield by process capability: the fraction of the lot
//     outside the spec limits (±SPEC_LIMIT_SIGMA) grows with the shift.
//   - The SPC chart shows noisy measurements of the shift, lot by lot, and
//     flags three Western Electric rules: the telegraph (CLAUDE.md §5 rule 5).
//
// The yield uses the TRUE shift; only the chart is noisy. The chart's noise
// comes from the tools' own generator (toolRngState), started from the seed
// mixed with a fixed constant, so the lot's random numbers are untouched.
//
// SPC points are stored in sigma units from the target ("z"), signed: +2
// means two sigma above the target. The screen turns them into the
// parameter's own units (target + z × sigma).

import { ROOMS } from '../content/content.js';
import { TOOL_MONITORS } from '../content/toolMonitors.js';
import {
  HEALTH_PER_SIGMA, SPEC_LIMIT_SIGMA, CONTROL_LIMIT_SIGMA, WEAR_PER_RUN,
  STARTING_TOOL_HEALTH, STARTING_HEALTH_MIN, SPC_HISTORY,
} from '../content/balance.js';
import { normalizeSeed, randomInt, gauss } from './rng.js';

// Any fixed number works; it differs from the map's, the shop's and the bot's.
const TOOL_SEED_MIX = 0x27D4EB2F;

// --- the bell curve --------------------------------------------------------

// The error function, by the textbook approximation Abramowitz & Stegun
// 7.1.26 (error under 1.5e-7, far below anything the game shows).
function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  return sign * (1 - poly * Math.exp(-a * a));
}

// Φ(x): the fraction of a bell curve (mean 0, spread 1) below x.
export function normalBelow(x) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

// --- drift -----------------------------------------------------------------

// How many sigma a tool's mean has shifted at this health (0 when healthy).
export function driftShift(health) {
  return (STARTING_TOOL_HEALTH - health) / HEALTH_PER_SIGMA;
}

// The fraction of a lot outside the spec limits when the mean has moved
// `shift` sigma towards its drift side. Two-sided spec (a rate, a CD): the
// tail past the near limit plus the tail past the far one. One-sided spec
// (particles, seams: fewer is never out of spec): the near tail only.
export function outOfSpecFraction(shift, oneSided = false) {
  const nearTail = normalBelow(shift - SPEC_LIMIT_SIGMA);
  if (oneSided) return nearTail;
  return nearTail + normalBelow(-SPEC_LIMIT_SIGMA - shift);
}

// The extra risk a drifted tool adds to its pattern. Chosen so the yield
// factor e^(−risk) is exactly (in-spec fraction now) / (in-spec fraction on
// target): a healthy tool adds nothing. `oneSided` as in outOfSpecFraction.
export function driftRisk(health, oneSided = false) {
  const inSpecNow = 1 - outOfSpecFraction(driftShift(health), oneSided);
  const inSpecOnTarget = 1 - outOfSpecFraction(0, oneSided);
  return -Math.log(inSpecNow / inSpecOnTarget);
}

// --- tools at the start of a run -------------------------------------------

function toolSeed(seed) {
  return normalizeSeed((seed ^ TOOL_SEED_MIX) >>> 0);
}

// One SPC measurement of a tool at this health: its true shift, in its
// drift direction, plus noise. Returns the point and the generator number.
function measure(rngState, monitor, health) {
  const noise = gauss(rngState);
  return { value: monitor.direction * driftShift(health) + noise.value, rngState: noise.rngState };
}

// Every room's tool for a new run, and the tools' generator number.
//   toolDrift      false: every tool starts at full health (hand checks)
//   startingHealth e.g. { cmp: 60 } fixes one tool's health (tests)
// A monitored tool also gets its SPC history: the lots that ran on it before
// this run, when it was healthier by WEAR_PER_RUN per lot.
export function startingTools(seed, { toolDrift = true, startingHealth = {} } = {}) {
  let rngState = toolSeed(seed);
  if (rngState === null) throw new Error(`startingTools: bad seed ${seed}`);
  const tools = {};
  for (const roomId of Object.keys(ROOMS)) {
    const monitor = TOOL_MONITORS[roomId];
    let health = STARTING_TOOL_HEALTH;
    if (monitor && toolDrift) {
      const roll = randomInt(rngState, STARTING_HEALTH_MIN, STARTING_TOOL_HEALTH);
      rngState = roll.rngState;
      health = roll.value;
    }
    if (startingHealth[roomId] !== undefined) health = startingHealth[roomId];

    const spc = [];
    if (monitor) {
      for (let lotsAgo = SPC_HISTORY - 1; lotsAgo >= 1; lotsAgo--) {
        const healthThen = Math.min(STARTING_TOOL_HEALTH, health + WEAR_PER_RUN * lotsAgo);
        const point = measure(rngState, monitor, healthThen);
        rngState = point.rngState;
        spc.push(point.value);
      }
    }
    tools[roomId] = { health, spc };
  }
  return { tools, toolRngState: rngState };
}

// --- while the run goes on (called from run.js) ----------------------------

// After the lot has run in a room: record its SPC point (at the health the
// lot saw), then wear the tool. Rooms with no monitor are unchanged. With
// drift off the point is still measured (noise only) but nothing wears.
export function useTool(state, roomId) {
  const monitor = TOOL_MONITORS[roomId];
  if (!monitor) return state;
  const tool = state.tools[roomId];
  const point = measure(state.toolRngState, monitor, tool.health);
  const wear = state.toolDrift ? WEAR_PER_RUN : 0;
  const health = Math.max(0, tool.health - wear);
  return {
    ...state,
    toolRngState: point.rngState,
    tools: { ...state.tools, [roomId]: { ...tool, health, spc: [...tool.spc, point.value] } },
  };
}

// --- SPC rules -------------------------------------------------------------

// The rules' numbers: 2 of 3 beyond 2σ, and a run of 8.
const RULE2_COUNT = 2;
const RULE2_WINDOW = 3;
const RULE2_SIGMA = 2;
const RULE3_RUN = 8;

// Which side of the centre line a point is on: 'above', 'below' or null.
function sideOf(z) {
  if (z > 0) return 'above';
  if (z < 0) return 'below';
  return null;
}

// The three Western Electric rules (David, 25 Oct 2026), checked over the
// points given (oldest first). Returns each rule tripped, once, with its side:
//   { rule: 1, side }  one point beyond the 3σ control limit
//   { rule: 2, side }  2 of 3 in a row beyond 2σ on the same side
//   { rule: 3, side }  8 in a row on the same side of the centre
// (Numbered 1–3 here for the three we use; in the full Western Electric
// list the 8-in-a-row rule is rule 4.)
export function spcRules(points) {
  const tripped = [];
  // Each rule is reported once per side, however often it trips.
  const add = (rule, side) => {
    if (!tripped.some(entry => entry.rule === rule && entry.side === side)) tripped.push({ rule, side });
  };

  for (const z of points) {
    if (Math.abs(z) > CONTROL_LIMIT_SIGMA) add(1, sideOf(z));
  }
  for (let i = 0; i + RULE2_WINDOW <= points.length; i++) {
    const group = points.slice(i, i + RULE2_WINDOW);
    if (group.filter(z => z > RULE2_SIGMA).length >= RULE2_COUNT) add(2, 'above');
    if (group.filter(z => z < -RULE2_SIGMA).length >= RULE2_COUNT) add(2, 'below');
  }
  for (let i = 0; i + RULE3_RUN <= points.length; i++) {
    const sides = points.slice(i, i + RULE3_RUN).map(sideOf);
    if (sides[0] !== null && sides.every(side => side === sides[0])) add(3, sides[0]);
  }
  return tripped.sort((a, b) => a.rule - b.rule);   // rule 1 first
}
