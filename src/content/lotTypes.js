// lotTypes.js — the kinds of lot a run can start with (data only, no logic).
//
// A lot type says three things:
//   • route       the rooms the lot visits, in order. Each step lists the
//                 risk it ADDS on entering (pattern → amount) and the
//                 patterns it REALIZES when it resolves (turns that risk
//                 into yield loss, see lot.js realizeRisks).
//   • startRisks  risk the lot carries before the first step. It is set by
//                 the film stack and the layout, and waits for the room
//                 where it shows up.
//   • traits      facts about this lot that cards check with when: { lot }
//                 (content.js). Only static traits belong here.
//
// Order inside a step (run.js will follow it): add the step's risks, then
// apply equipment and material effects, then the cards played; on resolving,
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

export const LOT_TYPES = {
  cuLine: {
    id: 'cuLine', draft: true, name: 'Inlaid Cu line',
    traits: ['narrowFeatures'],

    // Latent from the start: etch depth and wide-line dishing are set by the
    // stack and the layout. Etch stop (dep) and dummy fill (litho) scale
    // them before the rooms where they bite (etch and CMP).
    startRisks: { depth_variation: 0.08, dishing: 0.08 },

    // Every processing step adds a little handling particles and realizes
    // them at once (metrology adds none).
    route: [
      { room: 'clean', label: 'Wet clean',
        adds: { particles: 0.01 },
        realizes: ['particles'] },
      { room: 'dep', label: 'Deposition (SiN + oxide)',
        adds: { particles: 0.01 },
        realizes: ['particles', 'flakes'] },
      { room: 'litho', label: 'Litho (trench)',
        adds: { particles: 0.01, cd_error: 0.03 },
        realizes: ['particles', 'cd_error'] },
      { room: 'etch', label: 'Etch (trench)',
        adds: { particles: 0.01, residue: 0.04, underlayer_attack: 0.03, edge_ring: 0.03 },
        realizes: ['particles', 'residue', 'underlayer_attack', 'edge_ring', 'depth_variation'] },
      // The oxide grows while the lot waits here, but only bites in the
      // next step, once the barrier traps it. `qtime` marks the corridor
      // after this step as a Q-time window: a side stop there grows the
      // oxide further (QTIME_RISK_PER_MINUTE in balance.js, run.js).
      { room: 'clean', label: 'Resist strip + wet clean',
        adds: { particles: 0.01, qtime_oxide: 0.04 },
        realizes: ['particles'],
        qtime: 'qtime_oxide' },
      // Void risk enters here: the seed's coverage down the trench sets how
      // hard the fill will be (ionizedSeed scales it), and plating realizes it.
      { room: 'dep', label: 'Deposition (barrier + seed)',
        adds: { particles: 0.01, void: 0.08 },
        realizes: ['particles', 'qtime_oxide', 'flakes'] },
      { room: 'plate', label: 'Plating (Cu fill)',
        adds: { particles: 0.01 },
        realizes: ['particles', 'void'] },
      { room: 'cmp', label: 'CMP',
        adds: { particles: 0.01, rr_drift: 0.04 },
        realizes: ['particles', 'dishing', 'rr_drift'] },
      // Measure, then ship against the customer spec. Nothing added here.
      { room: 'metro', label: 'Metrology',
        adds: {},
        realizes: [] },
    ],

    tradeoff: 'Copper conducts better than aluminum, but it cannot be dry-etched, so the route etches trenches in oxide and polishes the copper back, which brings dishing and erosion.',
    physicsNote: 'Single inlaid (damascene) line: deposit an etch stop and oxide, pattern and etch trenches, clean, line them with a barrier and seed, fill with electroplated copper, then CMP away the copper above the trenches. The barrier keeps copper out of the oxide; any native oxide left under it raises line resistance. Simplified: anneal, cap and post-CMP clean are not shown.',
  },
};
