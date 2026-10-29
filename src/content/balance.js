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
// Below: rejected (decision O4). 0.70 until 29 Oct 2026; 0.68 with the
// more worn starting tools below, so good play wins about half of first
// runs (David chose option A, M4.5; measured with npm run exit-check).
export const CUSTOMER_SPEC = 0.68;

// Wafer map bands for one site (the fraction of the 25 wafers still good at
// that die position). At or above this line the site shows as pass; below it
// as a warning. The warning/fail edge reuses CUSTOMER_SPEC. Agreed with David,
// 24 Oct 2026.
export const SITE_GOOD_LINE = 0.90;

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

// How many side stops one corridor on the map offers: from MIN to MAX,
// both included (decision O3: "a pick of 1 from 2–3").
export const MIN_SIDE_STOP_OFFERS = 2;
export const MAX_SIDE_STOP_OFFERS = 3;

// Cycle time (minutes) each kind of side stop costs on the map (decision O3).
// PM/DOE is the slowest because it takes the tool offline. Agreed with
// David, 25 Oct 2026.
export const SIDE_STOP_MINUTES = {
  metrology:   20,
  pm:          40,
  procurement: 10,
  event:       10,
};

// Extra risk per minute a side stop keeps the lot waiting in a Q-time
// corridor (a route step marked `qtime` in lotTypes.js). 0.001 means a
// 40-minute PM stop doubles the Cu line's Q-time oxide, 0.04 to 0.08.
// Agreed with David, 25 Oct 2026.
export const QTIME_RISK_PER_MINUTE = 0.001;

// How many items one procurement stop offers (decision, David 25 Oct 2026).
export const SHOP_OFFER_COUNT = 3;

// Off since M4 item 4: the shop sells starter items, plus the items with an
// `unlockedBy` failure mode only once it is in the notebook. True sells
// everything (handy for trying out content).
export const SHOP_SELLS_LOCKED_ITEMS = false;

// --- Tool drift and SPC (M3 item 2b). Agreed with David, 25 Oct 2026. ---

// Health lost per one sigma of mean shift: health 80 = 1σ, 60 = 2σ, 40 = 3σ.
export const HEALTH_PER_SIGMA = 20;

// Spec limits sit this many sigma from the target (4 = a Cp 1.33 process).
export const SPEC_LIMIT_SIGMA = 4;

// SPC control limits, in sigma from the centre line.
export const CONTROL_LIMIT_SIGMA = 3;

// Health a tool loses each time the lot runs its room.
export const WEAR_PER_RUN = 5;

// Each tool starts a run with health from this to STARTING_TOOL_HEALTH,
// drawn from the seed: some runs begin with a tool overdue for PM.
// 50 until 29 Oct 2026: lower means more drift to read on SPC and fix, so
// good play pulls further ahead of doing nothing (M4.5, David's option A).
export const STARTING_HEALTH_MIN = 38;

// Points on an SPC chart: earlier lots, then this lot once it has run.
export const SPC_HISTORY = 12;

// A PM restores a tool to a health from MIN to MAX, both included, drawn
// from the tools' generator: a PM is never perfect and never the same
// twice. Agreed with David, 25 Oct 2026.
export const PM_RESTORE_MIN = 75;
export const PM_RESTORE_MAX = 95;

// How many choices one PM/DOE stop gives: one PM OR one DOE (David,
// 25 Oct 2026).
export const PM_DOE_CHOICES_PER_STOP = 1;

// Cash a DOE costs: the extra tool time and test wafers it uses (David,
// 25 Oct 2026; this amends decision O2). Placeholder until M7.
export const DOE_CASH_COST = 100;

// How many practices one DOE stop offers to upgrade, drawn by the seed:
// from MIN to MAX, both included, or fewer if fewer are eligible.
export const DOE_OFFER_MIN = 2;
export const DOE_OFFER_MAX = 3;

// --- Ship report (M3 item 3). Proposed by Claude, 25 Oct 2026; David to
// confirm (tasks/todo.md Q1). ---

// What a lot costs before any choice you make: 25 wafers plus routine
// processing on every step. The ship report adds the cash spent during the
// run to this and divides by the good die. Placeholder until M7.
export const LOT_BASE_COST = 2000;

// --- Diagnosis (M4 item 1). Agreed with David, 25 Oct 2026. ---

// A failure mode counts as a right diagnosis when its pattern cost the lot
// at least this many yield points (0..100) this run.
export const DIAGNOSE_MIN_POINTS = 3;

// How many failure modes the diagnose panel offers to choose from.
export const DIAGNOSE_CANDIDATES = 4;
