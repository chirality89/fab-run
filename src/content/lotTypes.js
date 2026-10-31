// lotTypes.js — the kinds of lot a run can start with (data only, no logic).
//
// A lot type says three things:
//   • route       the rooms the lot visits, in order. Each step lists the
//                 risk it ADDS on entering (pattern → amount) and the
//                 patterns it REALIZES when it resolves (turns that risk
//                 into yield loss, see lot.js realizeRisks).
//                 A step may also carry `effects`: ordinary content effects
//                 (content.js operations) applied right after its risks
//                 enter, e.g. scaling a risk when an earlier room set a flag.
//   • startRisks  risk the lot carries before the first step. It is set by
//                 the film stack and the layout, and waits for the room
//                 where it shows up.
//   • startRiskNotes  one sentence per startRisks pattern: what set its size
//                 before the room where it bites. The room forecast shows it
//                 (view.js carriedInText).
//   • traits      facts about this lot that cards check with when: { lot }
//                 (content.js). Only static traits belong here.
// A step marked `qtime` opens a Q-time window in the corridor after it; its
// `qtimeNote` says in words what grows while the lot waits (the map shows it).
// A step may name a `driftPattern`: what its room's drifted tool feeds in
// this step, when it is not the monitor's own pattern (toolMonitors.js),
// or null when the drift costs nothing in this step (the NMOS anneal).
//
// Order inside a step (run.js follows it): add the step's risks, apply the
// step's own effects, then apply equipment and material effects, then the cards played; on resolving,
// realize the step's patterns.
//
// Every room must be a key of ROOMS and every pattern a key of PATTERNS
// (content.js); tests/lotTypes.test.js checks this. Risk sizes are
// PLACEHOLDERS until the M7 bot balance pass. Agreed with David, 24 Oct 2026.
// Etch and litho sizes were cut on 26 Oct 2026 (M4.5 item 2, David's OK): a
// centred etch recipe already includes its over-etch, and a centred litho
// recipe prints on target CD. What is left is small: residue in slow-etching
// spots, rare punch-through, a faint edge ring, and dose/focus scatter. Tool
// wear (drift) and the cards decide the rest.
// All base risks were cut to 70% on 28 Oct 2026 (P3 of tasks/plan-winnable.md, David chose
// "cut base risks"): with the old sizes even a perfect starter-deck run could not
// reach the 70% spec. Measured with tools/exit-check.js, see tasks/todo.md.
// Etch's own risks and the depth variation carried in were cut by about a quarter
// on 29 Oct 2026 (David, after a playtest: etch was ending most first runs).

// The lot a new run starts with unless the player picks another.
export const DEFAULT_LOT_TYPE = 'cuLine';

export const LOT_TYPES = {
  cuLine: {
    id: 'cuLine', draft: true, name: 'Inlaid Cu line',
    traits: ['narrowFeatures', 'copperLine'],

    // Latent from the start: etch depth and wide-line dishing are set by the
    // stack and the layout. Etch stop (dep) and dummy fill (litho) scale
    // them before the rooms where they bite (etch and CMP).
    startRisks: { depth_variation: 0.042, dishing: 0.056 },
    startRiskNotes: {
      depth_variation: 'The film stack set how big this is before the lot got here: without an etch stop, trench depth follows the etch rate across the wafer.',
      dishing: 'The layout set how big this is: wide lines dish in any polish. Dummy fill at litho or a gentler polish here reduces it.',
    },

    // Every processing step adds a little handling particles and realizes
    // them at once (metrology adds none).
    route: [
      { room: 'clean', label: 'Wet clean',
        adds: { particles: 0.007 },
        realizes: ['particles'] },
      { room: 'dep', label: 'Deposition (oxide)',
        adds: { particles: 0.007 },
        realizes: ['particles', 'flakes'] },
      { room: 'litho', label: 'Litho (trench)',
        adds: { particles: 0.007, cd_error: 0.021 },
        realizes: ['particles', 'cd_error'] },
      { room: 'etch', label: 'Etch (trench)',
        adds: { particles: 0.007, residue: 0.021, underlayer_attack: 0.016, edge_ring: 0.016 },
        // An etch stop under the oxide (the "Deposit SiN etch stop" card):
        // the etch reaches the nitride and almost stops, so it attacks far
        // less of the film below (David, 26 Oct 2026: ×0.3).
        effects: [
          { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.3, when: { flag: 'etch_stop' } },
        ],
        realizes: ['particles', 'residue', 'underlayer_attack', 'edge_ring', 'depth_variation'] },
      // The oxide grows while the lot waits here, but only bites in the
      // next step, once the barrier traps it. `qtime` marks the corridor
      // after this step as a Q-time window: a side stop there grows the
      // oxide further (QTIME_RISK_PER_MINUTE in balance.js, run.js).
      { room: 'clean', label: 'Resist strip + wet clean',
        adds: { particles: 0.007, qtime_oxide: 0.028 },
        realizes: ['particles'],
        qtime: 'qtime_oxide', qtimeNote: 'native oxide keeps growing until the barrier goes on.' },
      // Void risk enters here: the seed's coverage down the trench sets how
      // hard the fill will be (ionizedSeed scales it), and plating realizes it.
      { room: 'dep', label: 'Deposition (barrier + seed)',
        adds: { particles: 0.007, void: 0.056 },
        realizes: ['particles', 'qtime_oxide', 'flakes'] },
      // Every lot is pre-wet before plating: routine, not a card (game rule 8;
      // David, 29 Oct 2026). A dry seed surface and gas in narrow features keep
      // the solution and its additives from the bottom, so bottom-up fill
      // starts late and the mouth can close first; wetting under vacuum lets
      // the liquid reach the bottom (void ×0.8). The extra wet transfer adds
      // a few handling particles (×1.1).
      { room: 'plate', label: 'Plating (Cu fill)',
        adds: { particles: 0.007 },
        effects: [
          { op: 'defectMult', pattern: 'void', mult: 0.8 },
          { op: 'defectMult', pattern: 'particles', mult: 1.1 },
        ],
        realizes: ['particles', 'void'] },
      // The pad is conditioned before every lot: routine, not a card (game
      // rule 8; David, 29 Oct 2026). A fresh or glazed pad polishes at a
      // different rate than a conditioned one (its Preston coefficient
      // differs); a conditioning sweep and a few dummy wafers bring it to a
      // steady state first (rr_drift ×0.8).
      { room: 'cmp', label: 'CMP',
        adds: { particles: 0.007, rr_drift: 0.028 },
        effects: [
          { op: 'defectMult', pattern: 'rr_drift', mult: 0.8 },
        ],
        realizes: ['particles', 'dishing', 'rr_drift'] },
      // Measure, then ship against the customer spec. Nothing added here.
      { room: 'metro', label: 'Metrology',
        adds: {},
        realizes: [] },
    ],

    tradeoff: 'Copper conducts better than aluminum, but it cannot be dry-etched, so the route etches trenches in oxide and polishes the copper back, which brings dishing and erosion.',
    physicsNote: 'Single inlaid (damascene) line: deposit oxide (optionally on a SiN etch stop), pattern and etch trenches, clean, line them with a barrier and seed, fill with electroplated copper, then CMP away the copper above the trenches. The barrier keeps copper out of the oxide; any native oxide left under it raises line resistance. Simplified: anneal, cap and post-CMP clean are not shown.',
  },

  // NMOS transistor front end, 13 steps (David, 25 Oct 2026). Contacts and
  // metal 1 are left out: the lot is tested at the transistor level.
  nmos: {
    id: 'nmos', draft: true, name: 'NMOS transistor',
    traits: ['siliconFrontEnd', 'thinGateOxide'],

    // Every risk below was cut to 52% on 30 Oct 2026 (David: "cut risks"), and
    // to 50% on 31 Oct 2026 once cost counted toward winning (David: "A"). The
    // drafted sizes are in git history. Thirteen rooms wear twelve tools, so
    // tool drift alone costs NMOS about 32 points, against about 20 on the
    // Cu line, and 52% puts the bots in the same exit-check bands (50% let casual
    // play ship 37%, 55% held smart play to 36%).
    // Latent from the start: dishing in wide isolation trenches is set by the
    // layout. Dummy active fill (litho) scales it before CMP, where it bites.
    startRisks: { dishing: 0.03 },
    startRiskNotes: {
      dishing: 'The layout set how big this is: oxide in wide isolation trenches dishes in any polish. Dummy fill at the active litho or a gentler polish here reduces it.',
    },

    // Every processing step adds a little handling particles and realizes
    // them at once (the test step adds none).
    route: [
      { room: 'clean', label: 'Wet clean',
        adds: { particles: 0.005 },
        realizes: ['particles'] },
      { room: 'dep', label: 'Pad oxide + SiN',
        adds: { particles: 0.005 },
        realizes: ['particles', 'flakes'] },
      { room: 'litho', label: 'Litho (active)',
        adds: { particles: 0.005, cd_error: 0.015 },
        realizes: ['particles', 'cd_error'] },
      // The isolation trench is etched into silicon on purpose, so there is
      // no film below to attack: residue and the edge ring are what is left.
      { room: 'etch', label: 'Etch (isolation trench)',
        adds: { particles: 0.005, residue: 0.02, edge_ring: 0.015 },
        realizes: ['particles', 'residue', 'edge_ring'] },
      { room: 'cmp', label: 'Oxide fill + CMP (stop on SiN)',
        adds: { particles: 0.005, rr_drift: 0.02 },
        realizes: ['particles', 'dishing', 'rr_drift'] },
      // The clean leaves the risk the gate oxide grows on: contamination and
      // roughness (gate_oxide) and, while the lot waits, native oxide. Both
      // bite at gate oxidation. `qtime` marks the corridor after this step
      // as a Q-time window, as on the Cu line.
      { room: 'clean', label: 'SiN strip + pre-gate clean',
        adds: { particles: 0.005, gate_oxide: 0.02, qtime_oxide: 0.015 },
        realizes: ['particles'],
        qtime: 'qtime_oxide', qtimeNote: 'native oxide keeps growing on the bare silicon until the gate oxide is grown.' },
      { room: 'diff', label: 'Gate oxidation',
        adds: { particles: 0.005 },
        realizes: ['particles', 'gate_oxide', 'qtime_oxide'] },
      { room: 'dep', label: 'Poly-Si deposition',
        adds: { particles: 0.005 },
        realizes: ['particles', 'flakes'] },
      { room: 'litho', label: 'Litho (gate)',
        adds: { particles: 0.005, cd_error: 0.015 },
        realizes: ['particles', 'cd_error'] },
      // The poly etch must stop on the thin gate oxide: punch-through
      // (underlayer_attack) kills the transistor.
      { room: 'etch', label: 'Gate etch (stop on gate oxide)',
        adds: { particles: 0.005, residue: 0.02, underlayer_attack: 0.015, edge_ring: 0.015 },
        realizes: ['particles', 'residue', 'underlayer_attack', 'edge_ring'] },
      // Channeling and crystal damage are set here and bite after the
      // anneal, which repairs damage and activates the dopant.
      { room: 'implant', label: 'S/D implant',
        adds: { particles: 0.005, channeling_tail: 0.02, implant_damage: 0.02 },
        realizes: ['particles'] },
      // Diffusion happens in the anneal itself, so junction spread enters
      // here (spike anneal scales it).
      // The same furnace as gate oxidation, but its contamination drift is
      // not counted here (driftPattern null; physics review, 31 Oct 2026):
      // the gate oxide is capped by hundreds of nm of doped poly, which
      // holds back sodium, and chlorinated oxidation must not seem to help
      // an anneal, where no oxide grows. The tool still wears.
      { room: 'diff', label: 'Activation anneal', driftPattern: null,
        adds: { particles: 0.005, junction_spread: 0.015 },
        realizes: ['particles', 'channeling_tail', 'implant_damage', 'junction_spread'] },
      // Electrical test, then ship against the customer spec. Nothing added here.
      { room: 'metro', label: 'Electrical test',
        adds: {},
        realizes: [] },
    ],

    tradeoff: 'A transistor needs a gate oxide only a few nanometres thick, so every step after it must protect it: the gate etch has to stop on it, and the cleans and waits before it decide how good it is.',
    physicsNote: 'NMOS front end: isolate the active areas with oxide-filled trenches (pad oxide and SiN, pattern, etch, fill, CMP stopping on the SiN, strip it), clean, grow the gate oxide, deposit and pattern poly-Si, etch it stopping on the gate oxide, implant the source and drain (the gate blocks the implant, so they self-align), and anneal to activate. Simplified: contacts, metal 1, wells, threshold adjust and spacers are not shown, the trench fill is folded into the CMP step, and the pad oxide strip into the pre-gate clean.',
  },
};
