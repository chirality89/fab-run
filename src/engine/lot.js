// lot.js — the lot (25 wafers) and the one rule that turns risk into lost yield.
//
// The wafer map is a 5×5 grid of sites. Site index = row * 5 + col.
// Each site's value is the fraction of the lot's wafers whose die at that
// position is still good (1 = all good). Lot yield = the average of the sites.
//
// The lot carries a RISK number per defect pattern (expected killer defects
// per die). Cards scale risk in any room; the room where a pattern shows up
// REALIZES it: each site's survival is multiplied by e^(−risk × weight), the
// textbook Poisson defect-limited yield model (Y = e^(−D·A)). Then that risk
// goes back to 0. Survival can only go down (CLAUDE.md §5 rule 2: no healing).
//
// Every function returns a NEW lot. Nothing is changed in place.

import { PATTERNS } from '../content/content.js';
import { gauss } from './rng.js';

const GRID = 5;                    // 5 × 5 sites
const SITE_COUNT = GRID * GRID;    // 25
const CENTER = 2;                  // row and column of the middle site

// How far a site is from the center: 0 = center (1 site), 1 = inner ring
// (8 sites), 2 = outer ring (16 sites).
function ringOf(index) {
  const row = Math.floor(index / GRID);
  const col = index % GRID;
  return Math.max(Math.abs(row - CENTER), Math.abs(col - CENTER));
}

// Weights per ring [center, inner, outer]. Each shape averages 1 over the
// 25 sites, so a given risk means the same total trouble whatever the shape;
// only WHERE it lands differs. Edge ring: 16 × 1.5625 = 25.
// Center-to-edge: 8 × 0.625 + 16 × 1.25 = 25.
const SHAPES = {
  even:         [1, 1, 1],
  edgeRing:     [0, 0, 1.5625],
  centerToEdge: [0, 0.625, 1.25],
};

// Which shape each pattern has. Anything not listed here is even.
const SHAPED_PATTERNS = {
  edge_ring: 'edgeRing',
  depth_variation: 'centerToEdge',
};

// Throws if the pattern is not one of the PATTERNS in content.js.
function checkPattern(pattern) {
  if (!(pattern in PATTERNS)) throw new Error(`Unknown defect pattern: ${pattern}`);
}

// The shape name for a pattern ('even', 'edgeRing' or 'centerToEdge').
export function shapeOf(pattern) {
  checkPattern(pattern);
  return SHAPED_PATTERNS[pattern] ?? 'even';
}

// A fresh lot: every site fully good, no risks, no flags.
export function createLot() {
  return { sites: Array(SITE_COUNT).fill(1), risks: {}, flags: [] };
}

// Adds risk to a pattern. Negative amounts are refused (no healing).
export function addRisk(lot, pattern, amount) {
  checkPattern(pattern);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`addRisk: amount must be 0 or more, got ${amount} for ${pattern}`);
  }
  const current = lot.risks[pattern] ?? 0;
  return { ...lot, risks: { ...lot.risks, [pattern]: current + amount } };
}

// Multiplies a pattern's risk (what the defectMult effect will call).
// Negative multipliers are refused: risk can shrink to 0, never below.
export function scaleRisk(lot, pattern, mult) {
  checkPattern(pattern);
  if (!Number.isFinite(mult) || mult < 0) {
    throw new Error(`scaleRisk: mult must be 0 or more, got ${mult} for ${pattern}`);
  }
  const current = lot.risks[pattern] ?? 0;
  return { ...lot, risks: { ...lot.risks, [pattern]: current * mult } };
}

// The 25 site weights for a pattern, from the shape table.
export function siteWeights(pattern) {
  const ringWeights = SHAPES[shapeOf(pattern)];
  return Array.from({ length: SITE_COUNT }, (_, i) => ringWeights[ringOf(i)]);
}

// Turns the named patterns' risks into yield loss, then clears those risks.
// `scatter` (optional, from rollScatter) nudges each site's weight; without
// it every nudge is 1, which is what the hand-computed tests use.
export function realizeRisks(lot, patterns, scatter = null) {
  const sites = lot.sites.map((survival, site) => {
    let exponent = 0;
    for (const pattern of patterns) {
      const risk = lot.risks[pattern] ?? 0;
      const weight = siteWeights(pattern)[site];
      const nudge = scatter?.[pattern]?.[site] ?? 1;
      exponent += risk * weight * nudge;
    }
    return survival * Math.exp(-exponent);   // exponent ≥ 0, so never goes up
  });
  const risks = { ...lot.risks };
  for (const pattern of patterns) risks[pattern] = 0;
  return { ...lot, sites, risks };
}

// Rolls the per-site nudges for each pattern: max(0, 1 + s × bell-curve).
// Even patterns get the full strength s, so particles look like random dots;
// shaped patterns get a quarter, so the ring or gradient stays recognizable.
// The 0.25 is a placeholder until balance.js exists (M1 item 4).
const SHAPED_SCATTER_FRACTION = 0.25;

export function rollScatter(rngState, patterns, strength) {
  let state = rngState;
  const value = {};
  for (const pattern of patterns) {
    const s = shapeOf(pattern) === 'even' ? strength : strength * SHAPED_SCATTER_FRACTION;
    const nudges = [];
    for (let site = 0; site < SITE_COUNT; site++) {
      const step = gauss(state);
      state = step.rngState;
      nudges.push(Math.max(0, 1 + s * step.value));
    }
    value[pattern] = nudges;
  }
  return { value, rngState: state };
}

// Lot yield, 0..1: the average of the 25 sites.
export function lotYield(lot) {
  return lot.sites.reduce((sum, site) => sum + site, 0) / lot.sites.length;
}
