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

export const LOT_TYPES = {
  cuLine: {
    id: 'cuLine', draft: true, name: 'Inlaid Cu line',
    traits: ['narrowFeatures'],

    // Latent from the start: etch depth and wide-line dishing are set by the
    // stack and the layout. Etch stop (dep) and dummy fill (litho) scale
    // them before the rooms where they bite (etch and CMP).
    startRisks: { depth_variation: 0.056, dishing: 0.056 },
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
        adds: { particles: 0.007, residue: 0.028, underlayer_attack: 0.021, edge_ring: 0.021 },
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
        qtime: 'qtime_oxide' },
      // Void risk enters here: the seed's coverage down the trench sets how
      // hard the fill will be (ionizedSeed scales it), and plating realizes it.
      { room: 'dep', label: 'Deposition (barrier + seed)',
        adds: { particles: 0.007, void: 0.056 },
        realizes: ['particles', 'qtime_oxide', 'flakes'] },
      { room: 'plate', label: 'Plating (Cu fill)',
        adds: { particles: 0.007 },
        realizes: ['particles', 'void'] },
      { room: 'cmp', label: 'CMP',
        adds: { particles: 0.007, rr_drift: 0.028 },
        realizes: ['particles', 'dishing', 'rr_drift'] },
      // Measure, then ship against the customer spec. Nothing added here.
      { room: 'metro', label: 'Metrology',
        adds: {},
        realizes: [] },
    ],

    tradeoff: 'Copper conducts better than aluminum, but it cannot be dry-etched, so the route etches trenches in oxide and polishes the copper back, which brings dishing and erosion.',
    physicsNote: 'Single inlaid (damascene) line: deposit oxide (optionally on a SiN etch stop), pattern and etch trenches, clean, line them with a barrier and seed, fill with electroplated copper, then CMP away the copper above the trenches. The barrier keeps copper out of the oxide; any native oxide left under it raises line resistance. Simplified: anneal, cap and post-CMP clean are not shown.',
  },
};
