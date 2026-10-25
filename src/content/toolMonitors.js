// toolMonitors.js — the one SPC parameter each room's tool is watched by
// (M3 item 2b). Data only. Agreed with David, 25 Oct 2026; numbers are
// placeholders (typical textbook orders of magnitude, no real tool's data).
//
//   parameter  what the SPC chart plots
//   unit       its unit, shown on the chart
//   target     the centre line
//   sigma      the parameter's normal spread (one sigma)
//   direction  which way a wearing tool drifts: +1 up, -1 down
//   pattern    the defect pattern the drift feeds (one the room realizes)
//   oneSided   true when only too HIGH is out of spec (particles, seams):
//              there is no lower spec limit
//
// A tool's health sets how far its mean has shifted (balance.js
// HEALTH_PER_SIGMA). The metrology room has no entry: its gauge is the
// reference, so it does not drift here.

export const TOOL_MONITORS = {
  clean: {
    draft: true,
    parameter: 'Particle adders', unit: 'per wafer', target: 20, sigma: 4, direction: +1,
    pattern: 'particles', oneSided: true,
    tradeoff: 'A bath used longer is cheaper per lot but sheds more particles.',
    physicsNote: 'Contamination loads up in a wet bench bath with every lot until it is changed.',
  },
  dep: {
    draft: true,
    parameter: 'Particle adders', unit: 'per wafer', target: 15, sigma: 4, direction: +1,
    pattern: 'flakes', oneSided: true,
    tradeoff: 'Longer between chamber cleans means more uptime and more flakes.',
    physicsNote: 'Film builds up on the chamber walls too; as it thickens it cracks and flakes onto wafers.',
  },
  litho: {
    draft: true,
    parameter: 'Monitor CD', unit: 'nm', target: 250, sigma: 4, direction: +1,
    pattern: 'cd_error',
    tradeoff: 'Checking dose and focus less often saves time but lets CD walk.',
    physicsNote: 'Focus and dose calibration drift between checks, and the printed line width follows them.',
  },
  etch: {
    draft: true,
    parameter: 'Etch rate', unit: 'nm/min', target: 300, sigma: 8, direction: -1,
    pattern: 'residue',
    tradeoff: 'Fewer chamber cleans mean more uptime and a slower etch.',
    physicsNote: 'Polymer deposits on the chamber walls change the plasma chemistry, so the rate falls between cleans (seasoning drift). Under a timed etch, a lower rate leaves film in the bottom of features across the whole wafer.',
  },
  plate: {
    draft: true,
    parameter: 'Seam rate on fill monitor', unit: '%', target: 2, sigma: 0.5, direction: +1,
    pattern: 'void', oneSided: true,
    tradeoff: 'Topping up the bath less often is cheaper, but fill gets worse.',
    physicsNote: 'Plating additives break down with use, and their by-products weaken bottom-up fill.',
  },
  cmp: {
    draft: true,
    parameter: 'Removal rate', unit: 'nm/min', target: 250, sigma: 10, direction: -1,
    pattern: 'rr_drift',
    tradeoff: 'Conditioning the pad less wears it less, but the rate falls.',
    physicsNote: 'The pad surface glazes with use, which lowers the Preston coefficient and the removal rate.',
  },
};
