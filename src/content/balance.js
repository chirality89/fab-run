// balance.js — every tuning number in one place (CLAUDE.md §7).
//
// Data only, no logic. Tune the game here with costs, time, specs and draw
// sizes; never by bending a physical rule. All numbers are PLACEHOLDERS until
// the M7 bot balance pass. Agreed with David, 24 Oct 2026.

// Cash at the start of a run. Enough for one big tool (450–700) plus a
// material and a consumable or two, but not everything.
export const STARTING_CASH = 1500;

// Practices drawn into your hand on entering a room (decision O6).
export const HAND_SIZE = 5;

// Line yield (0..1) below which the lot is scrapped mid-run (decision O4).
export const SCRAP_LINE = 0.40;

// Line yield (0..1) the customer needs at ship. At or above: shipped.
// Below: rejected (decision O4).
export const CUSTOMER_SPEC = 0.70;

// Site-to-site scatter for evenly spread patterns (see lot.js rollScatter).
export const SCATTER_STRENGTH = 0.5;

// Shaped patterns (edge ring, center-to-edge) get this fraction of the
// scatter, so the ring or gradient stays recognizable on the map.
export const SHAPED_SCATTER_FRACTION = 0.25;

// Tool health (0..100) every room's tool starts a run with.
export const STARTING_TOOL_HEALTH = 100;

// Minutes each room gives you to play practices. Set against the card costs
// so a room forces a choice (deposition: pre-clean 10 OR etch stop 12).
export const TIME_BUDGETS = {
  clean:   10,
  dep:     15,
  litho:   30,
  etch:    8,
  plate:   10,
  diff:    20,
  implant: 15,
  cmp:     10,
  metro:   20,
};
