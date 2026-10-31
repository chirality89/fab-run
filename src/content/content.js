// content.js — first content batch for the fab roguelite (Slay the Spire style)
//
// Everything here is DATA. The game engine reads these tables; adding a card, tool,
// resist or consumable means adding an entry, never new logic.
//
// Rules for every entry (carried over from FabSim's CLAUDE.md):
//   • draft: true  → Claude wrote it; David removes the flag after review.
//   • Every item has a physical reason for its tradeoff. Nothing is strictly better.
//   • Numbers are PLACEHOLDERS for tuning, not process data. Textbook concepts only,
//     no vendor names, no non-public recipes.
//
// ---------------------------------------------------------------------------
// HOW EFFECTS WORK
// A lot carries a yield bar (starts at 100%) and a set of defect "patterns".
// Each pattern has a risk value; when a room resolves, risks turn into yield loss,
// and losses MULTIPLY (line yield = product of step yields).
//
// The small set of effect operations the engine needs:
//   { op: 'defectMult', pattern, mult }      scale the risk of one defect pattern
//   { op: 'timeCost',   delta }              add or remove minutes from this room's budget
//   { op: 'cashCost',   delta }              spend budget
//   { op: 'setFlag',    flag }               mark the lot (e.g. it now has an etch stop)
//   { op: 'reveal',     what }               show a hidden value (tool drift, all 25 sites…)
//   { op: 'toolHealth', delta, room? }       repair or wear the room's tool (`room` names
//                                            another room's tool, e.g. from an event)
//   { op: 'addRisk',    pattern, amount }    a risk enters the lot now (amount ≥ 0)
//   { op: 'enables',    id }                 makes another card playable
//   { op: 'decayPerUse', target, mult }      an item weakens each time it is used
// Any effect can carry  when: { flag | equipment | material | lot }  to make it conditional.
// ---------------------------------------------------------------------------

// Rooms (process areas). Colors follow the cleanroom key from the brainstorm.
export const ROOMS = {
  clean:   { name: 'Wet clean',   color: 'cyan'   },
  litho:   { name: 'Litho bay',   color: 'yellow' },
  etch:    { name: 'Etch',        color: 'blue'   },
  dep:     { name: 'Deposition',  color: 'white'  },
  diff:    { name: 'Diffusion',   color: 'orange' },  // furnaces: oxidation, anneal
  implant: { name: 'Implant',     color: 'violet' },
  plate:   { name: 'Plating',     color: 'copper' },
  cmp:     { name: 'CMP',         color: 'grey'   },
  metro:   { name: 'Metrology',   color: 'white'  },
};

// Defect patterns a lot can accumulate. Each one shows on the wafer map its own way.
export const PATTERNS = {
  particles:        'random dots across the wafer',
  flakes:           'film flakes from the deposition chamber walls',
  residue:          'unetched film left in the bottom of features',
  underlayer_attack:'etch punched into the film below',
  depth_variation:  'etch depth differs center to edge',
  edge_ring:        'failures in a ring of edge sites',
  cd_error:         'line width off target',
  dishing:          'wide features polished below the surface',
  rr_drift:         'polish rate wandering run to run',
  void:             'empty pocket inside the metal',
  qtime_oxide:      'native oxide grew while the lot waited',
  implant_damage:   'crystal damage not repaired',
  junction_spread:  'dopant diffused too far',
  gate_oxide:       'gate oxide that leaks or breaks down early',
  channeling_tail:  'implanted dopant ran deep along crystal channels',
};

// ---------------------------------------------------------------------------
// FAILURE MODES = the engineering notebook.
// Diagnosing one (from the evidence on screen) writes it into the notebook,
// which persists between runs, and unlocks its remedies for future runs.
// `name` is what the diagnose panel calls it; `sig` is its signature, the
// evidence that tells it apart.
// An optional `when` (same shape as a card's) limits it to lots where its
// cause was present: a pattern with several causes is only that failure
// mode when the condition holds.
// ---------------------------------------------------------------------------
export const FAILURE_MODES = [
  { id: 'fm_particles',      draft: true, name: 'Handling particles', pattern: 'particles',
    sig: 'Random killed dies that move from lot to lot; particle adders climb on the wet clean SPC chart.',
    unlocks: ['preclean', 'megasonicClean'] },
  { id: 'fm_chamber_flakes', draft: true, name: 'Chamber flaking', pattern: 'flakes',
    sig: 'Killed dies that appear at the deposition steps; particle adders on the deposition SPC chart climb between chamber cleans.',
    unlocks: ['shieldKit'] },
  // fm_residue, fm_underlayer, fm_dishing and fm_qtime are worded for the Cu
  // line, so they need its copperLine trait to be a right diagnosis.
  { id: 'fm_residue',        draft: true, name: 'Etch residue', when: { lot: 'copperLine' }, pattern: 'residue',
    sig: 'Opens spread evenly across the whole wafer after etch, while the etch rate falls on the etch SPC chart.',
    unlocks: [] },
  { id: 'fm_underlayer',     draft: true, name: 'Underlayer attack', when: { lot: 'copperLine' }, pattern: 'underlayer_attack',
    sig: 'Leakage on the dies with the most over-etch; the cross-section shows a notch in the film below.',
    unlocks: ['etchStopLayer', 'oesEndpoint', 'endpointEtch', 'chamberSeasoning'] },
  { id: 'fm_edge_ring',      draft: true, name: 'Edge ring', pattern: 'edge_ring',
    sig: 'Only the outer ring of sites fails; inner sites are clean.',
    unlocks: ['eChuckUpgrade'] },
  { id: 'fm_dishing',        draft: true, name: 'Dishing', when: { lot: 'copperLine' }, pattern: 'dishing',
    sig: 'Wide lines are thin and high-resistance; narrow lines are fine.',
    unlocks: ['dummyFill', 'lowPressurePolish'] },
  { id: 'fm_rr_drift',       draft: true, name: 'Removal-rate drift', pattern: 'rr_drift',
    sig: 'The CMP removal rate walks steadily lot to lot on the SPC chart.',
    unlocks: ['padConditioner'] },
  { id: 'fm_keyhole',        draft: true, name: 'Keyhole void', pattern: 'void',
    sig: 'Opens on narrow vias only; a seam or void sits in the middle of the fill.',
    unlocks: ['slowStartPlate', 'additiveBath', 'bathAnalysis'] },
  { id: 'fm_qtime',          draft: true, name: 'Q-time oxide', when: { lot: 'copperLine' }, pattern: 'qtime_oxide',
    sig: 'High line resistance only on lots that waited long after clean.',
    unlocks: ['n2Storage'] },
  { id: 'fm_implant_damage', draft: true, name: 'Unannealed implant damage', pattern: 'implant_damage',
    sig: 'Junction leakage after implant; a longer anneal fixes leakage but shifts the device.',
    unlocks: ['rta', 'spikeAnneal'] },
  { id: 'fm_ped_ttop',       draft: true, name: 'Post-exposure delay T-top', pattern: 'cd_error',
    when: { lot: 'delayBeforeBake' },   // only this cause: CD error also comes from dose, focus and litho drift
    sig: 'Lines come out with a T-shaped top when the lot waited between expose and bake.',
    unlocks: ['resistCAR', 'freshResist'] },
  { id: 'fm_overhang_void',  draft: true, name: 'Overhang void', pattern: 'void',
    sig: 'Opens on narrow, deep trenches; the cross-section shows either a void under a pinched mouth or voids at the lower sidewall where the seed is thin.',
    unlocks: ['ionizedSeed', 'pulseReversePlating'] },
  { id: 'fm_dose_offset',    draft: true, name: 'Dose offset', pattern: 'cd_error',
    sig: 'Line width is off target by the same amount on every site and every wafer; SPC shows a step from the previous lot, and the scatter within the lot is small.',
    unlocks: ['sendAheadWafer', 'barc'] },
  { id: 'fm_channeling',     draft: true, name: 'Implant channeling', when: { lot: 'siliconFrontEnd' }, pattern: 'channeling_tail',
    sig: 'Junctions are deeper than the dose and energy predict, on every site; the dopant depth profile has a long tail beyond the main peak.',
    unlocks: ['tiltedImplant', 'screenOxideImplant', 'implantMonitor', 'parallelBeamStation'] },
  { id: 'fm_gate_punch',     draft: true, name: 'Gate etch punch-through', when: { lot: 'siliconFrontEnd' }, pattern: 'underlayer_attack',
    sig: 'Source/drain junction leakage and higher series resistance on every site and wafer, not just the most over-etched dies; oxide measured after the poly etch is thin or gone beside the gate, and the cross-section shows the silicon recessed or pitted there.',
    unlocks: ['softLandGateEtch'] },
  { id: 'fm_gate_breakdown', draft: true, name: 'Gate oxide breakdown', when: { lot: 'siliconFrontEnd' }, pattern: 'gate_oxide',
    sig: 'On a ramped-voltage test the gate oxide breaks down at a low voltage, with a wide spread of breakdown voltage from site to site; the low-voltage breakdowns sit at random sites, oxide thickness (optical and C-V) is on target, and it is worse on lots with more particles or metal contamination, or after the furnace\'s mobile-ion monitor has climbed.',
    unlocks: ['hfLastClean'] },
  { id: 'fm_gate_native_oxide', draft: true, name: 'Native oxide under the gate', when: { lot: 'siliconFrontEnd' }, pattern: 'qtime_oxide',
    sig: 'Capacitance-voltage shows an electrical oxide thickness larger than the furnace recipe gives, and threshold voltage is shifted, but breakdown voltage is normal; the gap grows with the wait after the pre-gate clean.',
    unlocks: ['oxideMonitor', 'verticalFurnace'] },
  // Front-end versions of patterns whose Cu-line failure modes above are
  // metal-worded (dishing, residue), and the anneal's own failure mode.
  { id: 'fm_sti_dishing',    draft: true, name: 'Isolation oxide dishing', when: { lot: 'siliconFrontEnd' }, pattern: 'dishing',
    sig: 'A step-height scan or cross-section shows the field oxide recessed below the active surface in wide isolation trenches, while narrow trenches are level; leakage at the active-area edges where the oxide is thinnest.',
    unlocks: ['dummyFill', 'lowPressurePolish'] },
  { id: 'fm_fe_residue',     draft: true, name: 'Front-end etch residue', when: { lot: 'siliconFrontEnd' }, pattern: 'residue',
    sig: 'Shorts between neighbouring gates from poly stringers left along steps, or shallow isolation trenches, spread across the whole wafer, while the etch rate falls on the etch SPC chart.',
    unlocks: [] },
  { id: 'fm_thermal_budget', draft: true, name: 'Too much thermal budget', when: { lot: 'siliconFrontEnd' }, pattern: 'junction_spread',
    sig: 'Junctions deeper and channels shorter on every site; threshold voltage rolls off on the shortest gates while leakage is normal; the dopant depth profile has a broadened main peak, not a long tail.',
    unlocks: ['rta'] },
];

// ---------------------------------------------------------------------------
// PRACTICES = cards. Played in a room; cost minutes from that room's time budget.
// ---------------------------------------------------------------------------
export const PRACTICES = [
  { id: 'timedOveretch', draft: true, kind: 'practice', room: 'etch', rarity: 'standard',
    name: 'Timed over-etch (+20%)', unlockedBy: null,   // starter card
    cost: { time: 4 },
    effects: [
      { op: 'defectMult', pattern: 'residue', mult: 0.3 },
      // ×2 (was ×1.5, 29 Oct 2026): on a tool whose etch-rate chart is quiet
      // the attack about cancels the residue cleared, so the card pays off
      // only when the chart shows the rate falling (M4.5, a real decision).
      { op: 'defectMult', pattern: 'underlayer_attack', mult: 2.0 },
      // On a stop the extra time barely reaches the film below: ×2.0 × 0.525 = ×1.05.
      { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.525, when: { flag: 'etch_stop' } },
    ],
    upgrade: {
      name: 'Timed over-etch, DOE-centred',
      effects: [
        { op: 'defectMult', pattern: 'residue', mult: 0.3 },
        // ×1.85, not lower: the DOE-centred card still needs a drifting tool
        // to pay off without a stop (physics review, 29 Oct 2026).
        { op: 'defectMult', pattern: 'underlayer_attack', mult: 1.85 },
        // ×1.85 × 0.568 ≈ ×1.05 on a stop, the same as the plain card.
        { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.568, when: { flag: 'etch_stop' } },
      ],
      tradeoff: 'Still attacks the film below, but less: the DOE found the shortest over-etch that still clears. Without a stop it still pays only when the etch rate has drifted down. On an etch stop, the same as the plain card.',
      physicsNote: 'A designed experiment across over-etch times finds where residue is gone but punch-through has barely started, so less extra time is needed for the same clearing.',
    },
    tradeoff: 'Clears residue but attacks the film below, much less if an etch stop is there. Without a stop, it pays when the etch-rate chart shows the rate falling; on a steady tool the attack costs about what it saves.',
    physicsNote: 'Extra etch time removes what is left in slow spots and keeps etching wherever the film has already cleared. Selectivity to the underlayer sets how much damage that does. A centred recipe already has its over-etch; extra time pays when the rate has drifted down and a timed etch leaves film behind.' },

  { id: 'measureAll', draft: true, kind: 'practice', room: 'metro', rarity: 'standard',
    name: 'Measure all 25 sites', unlockedBy: null,
    cost: { time: 20, cash: 150 },
    effects: [ { op: 'reveal', what: 'allSites' } ],
    upgrade: {
      name: 'Measure all 25 sites, tuned recipe',
      cost: { time: 12, cash: 150 },
      tradeoff: 'Full information, faster, but still paid for.',
      physicsNote: 'An optimized stage path and a tuned auto-focus and alignment recipe measure the same sites in less time.',
    },
    tradeoff: 'Full information, but slow and paid for.',
    physicsNote: 'The usual plan samples 3 of the 25 wafers and a few sites on each. This card measures all 25 sites on the sampled wafers, removing site-sampling risk at the cost of tool time.' },

  { id: 'reworkLitho', draft: true, kind: 'practice', room: 'litho', rarity: 'standard',
    name: 'Strip and re-expose', unlockedBy: null,
    cost: { time: 30, cash: 150 }, limit: { perLayer: 1 },
    when: { lot: 'lastStepWasLitho' },
    effects: [
      { op: 'defectMult', pattern: 'cd_error', mult: 0.2 },
      { op: 'defectMult', pattern: 'particles', mult: 1.2 },
    ],
    upgrade: {
      name: 'Strip and re-expose, gentle strip',
      effects: [
        { op: 'defectMult', pattern: 'cd_error', mult: 0.2 },
        { op: 'defectMult', pattern: 'particles', mult: 1.1 },
      ],
      tradeoff: 'Saves a bad exposure, only before etch, with fewer handling particles than before.',
      physicsNote: 'A tuned strip and gentler handling between strip and re-coat add fewer particles, but every extra pass still adds some.',
    },
    tradeoff: 'Saves a bad exposure, but only before etch, and each strip adds handling particles.',
    physicsNote: 'Litho is the one step you can fully redo: strip the resist and pattern again. After etch the pattern is permanent.' },

  { id: 'preclean', draft: true, kind: 'practice', room: 'dep', rarity: 'standard',
    name: 'Pre-deposition clean', unlockedBy: 'fm_particles',
    cost: { time: 10 },
    effects: [ { op: 'defectMult', pattern: 'particles', mult: 0.6 } ],
    upgrade: { name: 'Pre-deposition clean, DOE-tuned', cost: { time: 7 },
      effects: [ { op: 'defectMult', pattern: 'particles', mult: 0.65 } ],
      tradeoff: 'Faster, but the shorter rinse and dry removes a little less, and the Q-time clock still starts.',
      physicsNote: 'A DOE trades clean time against removal: shorter chemical and rinse steps save minutes but leave slightly more residual particles.' },
    tradeoff: 'Fewer particles, but it starts a Q-time clock.',
    physicsNote: 'Removing particles and native oxide before a film goes down; the clean surface starts re-oxidizing as soon as the lot waits.' },

  { id: 'etchStopLayer', draft: true, kind: 'practice', room: 'dep', rarity: 'advanced',
    name: 'Deposit SiN etch stop', unlockedBy: 'fm_underlayer',
    cost: { time: 12, cash: 80 },
    effects: [
      { op: 'setFlag', flag: 'etch_stop' },
      { op: 'defectMult', pattern: 'depth_variation', mult: 0.4 },
    ],
    upgrade: { name: 'Deposit SiN etch stop, DOE-thinned', cost: { time: 9, cash: 80 },
      effects: [
        { op: 'setFlag', flag: 'etch_stop' },
        { op: 'defectMult', pattern: 'depth_variation', mult: 0.45 },
      ],
      tradeoff: 'Shorter deposition, but a thinner stop layer gives less margin if the etch is not very selective.',
      physicsNote: 'Film thickness scales with deposition time. Etch selectivity is finite, so the etch eats the same amount of nitride either way; a thinner film just has less left before it breaks through, so it holds depth slightly less well.' },
    tradeoff: 'One more film and one more step, in exchange for etch depth set by the film and not by time, and less attack on the film below.',
    physicsNote: 'An etch that is highly selective to nitride stops when it reaches it, so depth no longer depends on etch rate uniformity, and over-etch spends its time on the nitride instead of the film beneath.' },

  { id: 'endpointEtch', draft: true, kind: 'practice', room: 'etch', rarity: 'advanced',
    name: 'Stop on endpoint', unlockedBy: 'fm_underlayer',
    cost: { time: 5 }, when: { equipment: 'oesEndpoint' },
    effects: [
      { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.3 },
      { op: 'defectMult', pattern: 'residue', mult: 1.3 },
      { op: 'defectMult', pattern: 'underlayer_attack', mult: 1.5, when: { lot: 'thinGateOxide' } },
    ],
    upgrade: { name: 'Stop on endpoint, DOE-centred',
      effects: [
        { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.35 },
        { op: 'defectMult', pattern: 'residue', mult: 1.15 },
        { op: 'defectMult', pattern: 'underlayer_attack', mult: 1.5, when: { lot: 'thinGateOxide' } },
      ],
      tradeoff: 'Less residue in slow spots, but the short extra etch after the signal attacks the film below a little more.',
      physicsNote: 'A small fixed over-etch after the endpoint signal clears the last film in slow spots, while the underlayer is exposed a bit longer.' },
    tradeoff: 'Stops right when the film clears, so slow spots can keep a little residue. On a thin gate oxide the over-etch after endpoint, still in the main chemistry, can punch through.',
    physicsNote: 'Plasma emission changes when the etched film runs out; the tool stops on that signal instead of a fixed time. A short over-etch in the same chemistry usually follows, to clear slow spots.' },

  { id: 'dummyFill', draft: true, kind: 'practice', room: 'litho', rarity: 'advanced',
    name: 'Add dummy fill to the mask', unlockedBy: 'fm_dishing',
    cost: { time: 0, cash: 100 },
    effects: [ { op: 'defectMult', pattern: 'dishing', mult: 0.4 } ],
    upgrade: { name: 'Dummy fill, DOE-tuned density', cost: { time: 0, cash: 130 },
      effects: [ { op: 'defectMult', pattern: 'dishing', mult: 0.3 } ],
      tradeoff: 'Flatter polish, but more fill shapes cost more mask data work and add still more capacitance.',
      physicsNote: 'A DOE on fill size, spacing and target density evens the pattern density further, so the pad dishes wide features less; more fill shapes (metal fill, or dummy active areas at isolation) couple more capacitance.' },
    tradeoff: 'Costs a mask change and adds capacitance from the fill shapes.',
    physicsNote: 'Evening out pattern density (metal fill on a metal layer, dummy active areas at isolation) lets the polish pad see a flatter surface, so wide features dish less.' },

  { id: 'slowStartPlate', draft: true, kind: 'practice', room: 'plate', rarity: 'standard',
    name: 'Low-current start step', unlockedBy: 'fm_keyhole',
    cost: { time: 8 },
    effects: [ { op: 'defectMult', pattern: 'void', mult: 0.5 } ],
    upgrade: { name: 'Low-current start step, DOE-ramped', cost: { time: 10 },
      effects: [ { op: 'defectMult', pattern: 'void', mult: 0.4 } ],
      tradeoff: 'Fewer voids, but the longer low-current stage costs more plating time.',
      physicsNote: 'A DOE on start current and ramp time finds a gentler start; the bottom gets more head start before the opening closes, at the price of a slower deposition rate.' },
    tradeoff: 'Slower plating for fewer voids in narrow features.',
    physicsNote: 'A gentle initial current density keeps the opening from pinching off before the bottom fills.' },

  { id: 'n2Storage', draft: true, kind: 'practice', room: 'clean', rarity: 'standard',
    name: 'Nitrogen-purged storage', unlockedBy: 'fm_qtime',
    cost: { cash: 30 },
    effects: [ { op: 'defectMult', pattern: 'qtime_oxide', mult: 0.3 } ],
    upgrade: { name: 'Nitrogen-purged storage, DOE-tuned flow', cost: { cash: 45 },
      effects: [ { op: 'defectMult', pattern: 'qtime_oxide', mult: 0.2 } ],
      tradeoff: 'More Q-time margin, but a higher purge flow uses more nitrogen per lot.',
      physicsNote: 'A higher purge flow lowers residual oxygen and moisture around the wafers, which slows native oxide regrowth further; the gas used scales with flow.' },
    tradeoff: 'Small cost per lot to buy back Q-time margin.',
    physicsNote: 'Oxygen and moisture drive native oxide regrowth on a clean surface; an inert purge slows it.' },

  { id: 'spikeAnneal', draft: true, kind: 'practice', room: 'diff', rarity: 'emerging',
    name: 'Spike anneal', unlockedBy: 'fm_implant_damage',
    cost: { time: 15 }, when: { equipment: 'rta' },
    effects: [
      { op: 'defectMult', pattern: 'implant_damage', mult: 0.4 },
      { op: 'defectMult', pattern: 'junction_spread', mult: 0.6 },
    ],
    upgrade: { name: 'Spike anneal, DOE-centred', cost: { time: 12 },
      effects: [
        { op: 'defectMult', pattern: 'implant_damage', mult: 0.5 },
        { op: 'defectMult', pattern: 'junction_spread', mult: 0.5 },
      ],
      tradeoff: 'Less diffusion and a shorter run, but less time at temperature repairs less of the implant damage.',
      physicsNote: 'A spike anneal has no soak; a faster ramp up and down (or a slightly lower peak) cuts the thermal budget further, so dopants move less, but less time near peak temperature leaves more lattice damage unrepaired.' },
    tradeoff: 'Repairs damage with less diffusion, but single-wafer processing is slow for a 25-wafer lot.',
    physicsNote: 'High temperature for seconds activates dopants and repairs the lattice before they move far (thermal budget).' },

  { id: 'sendAheadWafer', draft: true, kind: 'practice', room: 'litho', rarity: 'standard',
    name: 'Send-ahead wafer', unlockedBy: 'fm_dose_offset',
    cost: { time: 10, cash: 40 },
    effects: [
      { op: 'defectMult', pattern: 'cd_error', mult: 0.5 },
      { op: 'defectMult', pattern: 'particles', mult: 1.1 },
    ],
    upgrade: {
      name: 'Send-ahead wafer, DOE-tuned', cost: { time: 7, cash: 40 },
      effects: [
        { op: 'defectMult', pattern: 'cd_error', mult: 0.55 },
        { op: 'defectMult', pattern: 'particles', mult: 1.1 },
      ],
      tradeoff: 'Shorter wait for the measurement, but fewer sites are measured, so the dose correction is a little less exact.',
      physicsNote: 'A DOE on the measurement plan finds the fewest sites that still estimate the mean line width. The send-ahead wafer is still exposed, baked and developed exactly like the lot, or its line width would not predict theirs. Fewer sites give a noisier mean, so the corrected dose lands a little farther from target.' },
    tradeoff: 'Sets the dose from a measured wafer, but the lot waits for the measurement, and the send-ahead wafer is stripped and recoated, which adds handling particles.',
    physicsNote: 'Line width changes with exposure dose. One wafer is exposed, developed and measured while the rest of the lot waits unexposed; the dose is then corrected for the rest of the lot.' },

  { id: 'megasonicClean', draft: true, kind: 'practice', room: 'clean', rarity: 'standard',
    name: 'Megasonic clean', unlockedBy: 'fm_particles',
    cost: { time: 6, cash: 60 },
    effects: [
      { op: 'defectMult', pattern: 'particles', mult: 0.5 },
    ],
    upgrade: {
      name: 'Megasonic clean, DOE-tuned power', cost: { time: 4, cash: 60 },
      effects: [
        { op: 'defectMult', pattern: 'particles', mult: 0.55 },
      ],
      tradeoff: 'Faster, but the shorter run at lower acoustic power removes a little fewer particles.',
      physicsNote: 'A DOE on acoustic power and time finds a gentler point that stays below the damage threshold for fine features. Less energy and time in the liquid sweep off fewer of the smallest particles.' },
    tradeoff: 'Strong particle removal, but slow and paid for. On patterned wafers, too much acoustic power can break fine features.',
    physicsNote: 'High-frequency sound in the cleaning liquid makes a thin flow layer that sweeps small particles off the surface. Too much acoustic power can damage delicate fine-line structures.' },

  { id: 'ionizedSeed', draft: true, kind: 'practice', room: 'dep', rarity: 'advanced',
    name: 'Ionized PVD seed', unlockedBy: 'fm_overhang_void',
    cost: { time: 9, cash: 90 },
    effects: [
      { op: 'defectMult', pattern: 'void', mult: 0.6 },
      { op: 'defectMult', pattern: 'flakes', mult: 1.2 },
      { op: 'toolHealth', delta: -5 },   // coil and shield deposits build up faster
    ],
    upgrade: {
      name: 'Ionized PVD seed, DOE-biased', cost: { time: 9, cash: 90 },
      effects: [
        { op: 'defectMult', pattern: 'void', mult: 0.5 },
        { op: 'defectMult', pattern: 'flakes', mult: 1.3 },
        { op: 'toolHealth', delta: -5 },
      ],
      tradeoff: 'Better sidewall seed and fewer voids, but the higher coil power builds deposits on the coil and shields faster, and they crack and flake onto the wafers.',
      physicsNote: 'Higher wafer bias re-sputters the overhang onto the sidewalls; higher coil power ionizes more metal but builds and heats deposits on the coil and shields faster, and those deposits crack and flake onto the wafers.' },
    tradeoff: 'Better sidewall coverage in narrow trenches, but slower and dearer; the extra coil and shields in the plasma collect metal that flakes off, more so as the chamber drifts, and the deposits wear the chamber toward its next clean.',
    physicsNote: 'Ionizing the sputtered metal lets a substrate bias steer it down into the feature, so the sidewall gets more seed and the opening overhangs less. Less overhang means the plated copper is less likely to pinch off the mouth and trap a void.' },

  { id: 'lowPressurePolish', draft: true, kind: 'practice', room: 'cmp', rarity: 'standard',
    name: 'Low-pressure final polish', unlockedBy: 'fm_dishing',
    cost: { time: 6, cash: 30 },
    effects: [
      { op: 'defectMult', pattern: 'dishing', mult: 0.6 },
    ],
    upgrade: {
      name: 'Low-pressure final polish, DOE-tuned', cost: { time: 8, cash: 40 },
      effects: [
        { op: 'defectMult', pattern: 'dishing', mult: 0.5 },
      ],
      tradeoff: 'Even less dishing in wide features, but the polish is longer still and uses more slurry and pad.',
      physicsNote: 'Preston: removal rate ≈ k × pressure × velocity. A DOE on down force and platen speed finds a lighter setting, so the pad bends less into wide features, but each wafer needs more minutes on the pad.' },
    tradeoff: 'Less dishing in wide features, but the polish takes longer and uses more slurry and pad per wafer.',
    physicsNote: 'Preston: removal rate ≈ k × pressure × velocity, so a lighter down force removes less per second and the polish takes longer. Under pressure the pad bends down into wide features and keeps polishing the softer film there (copper, or oxide in a wide trench); less pressure means less bending, so wide features dish less.' },

  { id: 'chamberSeasoning', draft: true, kind: 'practice', room: 'etch', rarity: 'standard',
    name: 'Chamber seasoning', unlockedBy: 'fm_underlayer',
    cost: { time: 3, cash: 40 },
    effects: [
      { op: 'defectMult', pattern: 'depth_variation', mult: 0.7 },
      { op: 'defectMult', pattern: 'particles', mult: 1.2 },
    ],
    upgrade: {
      name: 'Chamber seasoning, DOE-tuned', cost: { time: 5, cash: 55 },
      effects: [
        { op: 'defectMult', pattern: 'depth_variation', mult: 0.7 },
        { op: 'defectMult', pattern: 'particles', mult: 1.1 },
      ],
      tradeoff: 'Fewer flaking particles from the wall film, but the plasma clean and recoat take more minutes and cost more.',
      physicsNote: 'A short plasma clean strips the old wall film, then the DOE-tuned seasoning lays down a thin, well-adhered, low-stress coat that sheds less than a thick, stressed one.' },
    tradeoff: 'A steadier chamber, but it spends minutes and dummy wafers, and the film coated on the walls can flake.',
    physicsNote: 'Running conditioning wafers coats the chamber walls so they recombine and release radicals at a steady rate. Without it the first wafers see a different etch rate. Wall film can flake as particles.' },
  { id: 'tiltedImplant', draft: true, kind: 'practice', room: 'implant', rarity: 'standard',
    name: 'Larger-tilt implant', unlockedBy: 'fm_channeling',
    cost: { time: 6 },
    // Needs: S/D implant step (NMOS step 11) adds channeling_tail on entering, before this card is played.
    effects: [
      { op: 'defectMult', pattern: 'channeling_tail', mult: 0.6 },
    ],
    upgrade: {
      name: 'Larger-tilt implant, DOE-tuned twist', cost: { time: 8 },
      effects: [
        { op: 'defectMult', pattern: 'channeling_tail', mult: 0.5 },
      ],
      tradeoff: 'A shorter tail, because the twist also avoids the crystal planes, but that twist no longer lines up with the gate edges, so the dose is split over four rotations instead of two, which takes longer.',
      physicsNote: 'Even off the main axis, ions can still run along crystal planes (planar channeling). A DOE on the twist (the rotation about the wafer normal) finds an angle that avoids those planes too. Gates then sit at an angle to the beam, so shadows fall on more sides, and the dose is split over four rotations instead of two; each rotation adds handling and settling time.' },
    tradeoff: 'A larger tilt than the standard one cuts the channeling tail further, but the tall gate casts a longer shadow on one side of each source or drain, so the implant is split in two with the wafer rotated between halves, which takes extra minutes.',
    physicsNote: 'Ions fired along an open crystal direction travel far down open channels between rows of atoms, losing energy slowly (channeling), and make a deep tail on the dopant profile. The standard implant already tilts the wafer about 7 degrees off the axis; tilting further makes the ions hit atoms sooner still. The gate shadow grows with tilt (about gate height × tan(tilt)), so the implant is split into halves with the wafer rotated 180 degrees between them.' },

  { id: 'screenOxideImplant', draft: true, kind: 'practice', room: 'implant', rarity: 'standard',
    name: 'Implant through a screen oxide', unlockedBy: 'fm_channeling',
    cost: { time: 4, cash: 30 },
    // Needs: S/D implant step (NMOS step 11) adds channeling_tail and implant_damage on entering, before this card is played.
    effects: [
      { op: 'defectMult', pattern: 'channeling_tail', mult: 0.7 },
      { op: 'defectMult', pattern: 'implant_damage', mult: 1.3 },
    ],
    upgrade: {
      name: 'Screen-oxide implant, DOE-tuned thickness', cost: { time: 4, cash: 30 },
      effects: [
        { op: 'defectMult', pattern: 'channeling_tail', mult: 0.75 },
        { op: 'defectMult', pattern: 'implant_damage', mult: 1.2 },
      ],
      tradeoff: 'Less knock-on damage for the anneal to repair, but a thinner oxide scatters the ions less, so channeling is cut by less.',
      physicsNote: 'A DOE on oxide thickness finds a thinner layer. Fewer oxygen atoms are driven into the silicon, but fewer scattering events randomize the ion direction before it enters the crystal.' },
    tradeoff: 'Less channeling, and the oxide catches beamline contamination, but ions knock oxygen out of the oxide into the silicon, which adds crystal damage the anneal must repair.',
    physicsNote: 'A thin amorphous oxide on the silicon scatters the incoming ions, so they enter the crystal at random angles and channel less. It also catches metal and carbon contamination from the beamline, which is stripped away with the oxide. Collisions push oxygen atoms into the silicon (knock-on) and the oxide shifts the dopant peak shallower, so the dose and energy must be set to suit.' },

  { id: 'softLandGateEtch', draft: true, kind: 'practice', room: 'etch', rarity: 'advanced',
    name: 'Soft-landing gate etch', unlockedBy: 'fm_gate_punch',
    cost: { time: 6 }, when: { lot: 'siliconFrontEnd' },
    // Needs: gate etch step (NMOS step 10) adds underlayer_attack and residue on entering, before this card is played.
    effects: [
      { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.7 },
      { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.5, when: { lot: 'thinGateOxide' } },
      { op: 'defectMult', pattern: 'residue', mult: 1.1 },
    ],
    upgrade: {
      name: 'Soft-landing gate etch, DOE-shortened', cost: { time: 5 },
      effects: [
        { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.75 },
        { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.5, when: { lot: 'thinGateOxide' } },
        { op: 'defectMult', pattern: 'residue', mult: 1.1 },
      ],
      tradeoff: 'Takes fewer minutes, but the later switch to the soft-landing chemistry protects the oxide a little less.',
      physicsNote: 'The DOE switches to the soft-landing chemistry later and shortens it. The main etch, which is less selective, then runs closer to the oxide, and where the poly is thinnest it reaches the oxide before the switch.' },
    tradeoff: 'Protects the thin gate oxide, but the slow final step takes most of the room\'s minutes, and polymer micromasking can leave small poly residues.',
    physicsNote: 'Near the end the etch switches to a chemistry with high poly-to-oxide selectivity and low ion energy, so it removes the last poly without punching the thin oxide below. The polymer that makes it selective can micromask a little poly and leave small residues.' },

  { id: 'hfLastClean', draft: true, kind: 'practice', room: 'clean', rarity: 'standard',
    name: 'HF-last clean before gate oxidation', unlockedBy: 'fm_gate_breakdown',
    cost: { time: 6, cash: 40 }, when: { lot: 'siliconFrontEnd' },
    // Needs: SiN strip + pre-gate clean step (NMOS step 6) adds gate_oxide and qtime_oxide on entering. Play it in that step; the earlier clean (step 1) comes before the risk exists.
    effects: [
      { op: 'defectMult', pattern: 'gate_oxide', mult: 0.5 },
      { op: 'defectMult', pattern: 'qtime_oxide', mult: 1.5 },
    ],
    upgrade: {
      name: 'HF-last clean, DOE-tuned dip', cost: { time: 4, cash: 40 },
      effects: [
        { op: 'defectMult', pattern: 'gate_oxide', mult: 0.55 },
        { op: 'defectMult', pattern: 'qtime_oxide', mult: 1.5 },
      ],
      tradeoff: 'Shorter dip, but it strips a little less of the thin oxide and its trapped metals; the Q-time window is as tight as before.',
      physicsNote: 'A DOE on dip time finds a shorter etch. At the same HF concentration, oxide is removed at a finite rate, so less time leaves a little more chemical oxide and contamination, while the hydrogen-terminated surface still regrows native oxide when the lot waits.' },
    tradeoff: 'A final dip in dilute HF strips the thin chemical oxide left by the earlier cleans and the contamination in it, but the bare silicon regrows native oxide as soon as the lot waits, so the Q-time window gets tighter.',
    physicsNote: 'Dilute HF removes silicon dioxide and the metals trapped in it, leaving a hydrogen-terminated silicon surface that makes a cleaner, more uniform gate oxide. That surface is only stable for a short time; it regrows native oxide in air and moisture.' },

  // --- Starter practices for the Cu line rooms (26 Oct 2026). Plainer and weaker than the unlockable remedies. ---
  // Starter cards for the NMOS diffusion and implant rooms (David, 30 Oct
  // 2026). Each counters its room's tool drift (toolMonitors.js) at a cost,
  // so the SPC chart says when it is worth playing.
  { id: 'chlorinatedOxidation', draft: true, kind: 'practice', room: 'diff', rarity: 'standard',
    name: 'Chlorinated dry oxidation', unlockedBy: null,
    cost: { time: 5, cash: 60 },
    // Needs: gate oxidation (NMOS step 7) realizes gate_oxide; the furnace's
    // contamination drift feeds gate_oxide there. At the anneal it has
    // nothing to act on (no drift counted there; NEEDS NEW LOGIC: step-limited cards).
    effects: [
      { op: 'defectMult', pattern: 'gate_oxide', mult: 0.7 },
      { op: 'defectMult', pattern: 'particles', mult: 1.2 },
    ],
    upgrade: {
      name: 'Chlorinated oxidation, DOE-tuned chlorine', cost: { time: 5, cash: 60 },
      effects: [
        { op: 'defectMult', pattern: 'gate_oxide', mult: 0.75 },
        { op: 'defectMult', pattern: 'particles', mult: 1.1 },
      ],
      tradeoff: 'Less chlorine sheds fewer particles, but cleans up a little less of the oxide.',
      physicsNote: 'A DOE on the chlorine fraction finds the point where most mobile ions are already tied up; past it, chlorine piles up at the silicon surface and can roughen or pit it, and corrodes the gas lines faster.' },
    tradeoff: 'A cleaner gate oxide, but the chlorine corrodes gas lines and the exhaust, which shed particles and metals, and the gas and scrubbing cost cash.',
    physicsNote: 'A little chlorine-bearing gas in a dry oxidation ties up mobile ions such as sodium and getters metal contamination at the silicon surface, so the oxide leaks and breaks down less. Chlorine also corrodes metal gas lines and the exhaust, raising particle counts and maintenance.' },

  { id: 'preAmorphizingImplant', draft: true, kind: 'practice', room: 'implant', rarity: 'standard',
    name: 'Pre-amorphizing implant', unlockedBy: null,
    cost: { time: 6, cash: 20 },
    // Needs: S/D implant (NMOS step 11) adds channeling_tail and
    // implant_damage on entering; both bite at the anneal.
    effects: [
      { op: 'defectMult', pattern: 'channeling_tail', mult: 0.4 },
      { op: 'defectMult', pattern: 'implant_damage', mult: 1.6 },
    ],
    upgrade: {
      name: 'Pre-amorphizing implant, DOE-tuned depth', cost: { time: 6, cash: 20 },
      effects: [
        { op: 'defectMult', pattern: 'channeling_tail', mult: 0.45 },
        { op: 'defectMult', pattern: 'implant_damage', mult: 1.4 },
      ],
      tradeoff: 'A shallower amorphous layer leaves fewer end-of-range defects, but a little more of the tail gets past it.',
      physicsNote: 'A DOE on the amorphizing energy places the amorphous edge just deep enough to hold the dopant; a deeper edge puts its end-of-range defects closer to the junction, where they cause leakage.' },
    tradeoff: 'Almost no channeling, whatever the beam angle, but the extra implant leaves end-of-range defects the anneal must repair. On a well-aligned beam it about breaks even.',
    physicsNote: 'A heavy, electrically inactive ion (such as germanium or silicon) implanted first turns the surface layer amorphous, so there are no crystal channels for the dopant to run down. The anneal regrows the crystal from below, but defects collect just under the old amorphous edge (end-of-range defects) and can cause junction leakage if they are not annealed out.' },

  { id: 'extraDiRinse', draft: true, kind: 'practice', room: 'clean', rarity: 'standard',
    name: 'Extra DI-water rinse', unlockedBy: null,
    cost: { time: 3, cash: 10 },
    effects: [
      { op: 'defectMult', pattern: 'particles', mult: 0.75 },
      { op: 'defectMult', pattern: 'qtime_oxide', mult: 1.1 },
    ],
    upgrade: { name: 'Extra DI-water rinse, DOE-tuned', cost: { time: 2, cash: 10 },
      effects: [
        { op: 'defectMult', pattern: 'particles', mult: 0.8 },
        { op: 'defectMult', pattern: 'qtime_oxide', mult: 1.05 },
      ],
      tradeoff: 'Shorter and less water time, so less oxide regrowth, but it also carries off fewer particles.',
      physicsNote: 'A DOE on rinse time and flow finds the point where most loose particles are gone; the rest are held by surface forces that more flow barely changes, while a shorter soak in water with dissolved oxygen grows less oxide.' },
    tradeoff: 'Fewer loose particles, but it costs minutes of a short budget, and wafers wet longer in oxygen-bearing water grow a little more oxide. That only matters in the clean just before a Q-time window (before the barrier on the Cu line, before the gate oxide on NMOS).',
    physicsNote: 'Rinsing with more DI water carries away loose particles, but it does not break the bond of small ones stuck by surface forces (that takes megasonic energy). Water holds dissolved oxygen, which grows native oxide on a bare surface.' },

  { id: 'chamberPurge', draft: true, kind: 'practice', room: 'dep', rarity: 'standard',
    name: 'Pump-purge cycles before the run', unlockedBy: null,
    cost: { time: 5, cash: 20 },
    effects: [
      { op: 'defectMult', pattern: 'flakes', mult: 0.75 },
      { op: 'defectMult', pattern: 'particles', mult: 1.1 },
    ],
    upgrade: { name: 'Pump-purge cycles before the run, DOE-tuned', cost: { time: 7, cash: 20 },
      effects: [
        { op: 'defectMult', pattern: 'flakes', mult: 0.7 },
        { op: 'defectMult', pattern: 'particles', mult: 1.15 },
      ],
      tradeoff: 'Carries away more loose flakes, but the longer, harder purge cycles shake more particles loose and take more minutes.',
      physicsNote: 'A DOE on the number of purge cycles and the pump-down rate finds that more cycles lift more loose wall film, but each pump and vent stirs up deposits and settling particles.' },
    tradeoff: 'Less loose film on the chamber walls to flake off, but it takes minutes and money, and the vent and pump cycle stirs up particles. With a healthy chamber it buys almost nothing.',
    physicsNote: 'Film on chamber walls cracks and flakes as stress grows. Repeated pump-down and gas purge cycles before the wafers go in carry away loose flakes, but the pressure swings also shake particles off the walls, and the stressed film still stuck on stays.' },

  { id: 'doseTrimSpc', draft: true, kind: 'practice', room: 'litho', rarity: 'standard',
    name: 'Trim dose from the SPC trend', unlockedBy: null,
    cost: { time: 5, cash: 30 },
    effects: [ { op: 'defectMult', pattern: 'cd_error', mult: 0.8 } ],
    upgrade: { name: 'Trim dose from the SPC trend, DOE-tuned', cost: { time: 8, cash: 30 },
      effects: [ { op: 'defectMult', pattern: 'cd_error', mult: 0.75 } ],
      tradeoff: 'Averages more past lots, so noise moves the dose less, but the correction lags a tool that is still drifting.',
      physicsNote: 'A DOE on how many past lots to average and how hard to correct finds a steadier correction. Averaging more lots separates a real shift from noise, but takes more time to gather and check.' },
    tradeoff: 'Moves the dose toward target using the line widths of recent lots, but it does not measure this lot, so it only fixes a steady shift, not scatter, and it costs minutes and money.',
    physicsNote: 'Printed size follows dose: in a positive resist, resist lines get narrower and exposed trenches get wider as dose rises. A steady shift seen on the SPC chart can be undone with a small dose change, but adjusting for random scatter makes the spread larger, not smaller. Measuring a send-ahead wafer is the better check.' },
];

// ---------------------------------------------------------------------------
// EQUIPMENT = relics. Bought at procurement nodes; passive for the rest of the run.
// ---------------------------------------------------------------------------
export const EQUIPMENT = [
  { id: 'oesEndpoint', draft: true, kind: 'equipment', room: 'etch', rarity: 'advanced',
    name: 'Optical endpoint detector', unlockedBy: 'fm_underlayer',
    cost: { cash: 600 },
    effects: [
      { op: 'enables', id: 'endpointEtch' },
      { op: 'defectMult', pattern: 'depth_variation', mult: 0.7 },
    ],
    tradeoff: 'Expensive, and only helps when there is a clear film change to detect.',
    physicsNote: 'Endpoint works on a signal change; a small open area or no material change gives a weak signal.' },

  // A cheap first-tier etch fix for a first run (David, 29 Oct 2026: etch was
  // the wall, and every other etch remedy is unlocked by the notebook). Weaker
  // than the endpoint detector (depth variation ×0.7 for 600) and with a real cost.
  { id: 'gasFlowTrim', draft: true, kind: 'equipment', room: 'etch', rarity: 'standard',
    name: 'Radial gas-flow trim', unlockedBy: null,
    cost: { cash: 200 },
    effects: [
      { op: 'defectMult', pattern: 'depth_variation', mult: 0.75 },
      { op: 'defectMult', pattern: 'edge_ring', mult: 1.25 },
    ],
    tradeoff: 'Sends more gas to the center to even the etch depth, but the rim then gets a different gas mix, so edge profiles shift and the outer ring of sites fails a little more. Cheap, but weaker than an endpoint detector.',
    physicsNote: 'Etch rate often varies across the wafer: the reactive gas is used up on its way to the center, while the edge gets fresh gas from outside the wafer. Shifting more gas to the center evens the rate, and so the depth. Gas flow sets the chemistry, not the angle the ions arrive at, and at the rim the plasma and temperature already differ most, so matching the rate there shifts the sidewall profile at the edge.' },

  { id: 'inlineMetrology', draft: true, kind: 'equipment', room: 'metro', rarity: 'advanced',
    name: 'Inline metrology', unlockedBy: null,
    cost: { cash: 500 },
    effects: [ { op: 'reveal', what: 'driftTelegraphEarly' } ],
    tradeoff: 'Shows drift sooner; does not fix anything by itself.',
    physicsNote: 'Measuring every lot at the tool shortens the time between a shift and seeing it on SPC.' },

  { id: 'eChuckUpgrade', draft: true, kind: 'equipment', room: 'etch', rarity: 'advanced',
    name: 'Edge-tuned chuck', unlockedBy: 'fm_edge_ring',
    cost: { cash: 450 },
    effects: [
      { op: 'defectMult', pattern: 'edge_ring', mult: 0.5 },
      { op: 'toolHealth', delta: -5 },   // more parts to maintain
    ],
    tradeoff: 'Better edge uniformity, more maintenance.',
    physicsNote: 'Edge temperature and plasma differ from the center; tuning the chuck and edge ring evens them out.' },

  { id: 'rta', draft: true, kind: 'equipment', room: 'diff', rarity: 'emerging',
    name: 'Rapid thermal anneal tool', unlockedBy: 'fm_implant_damage',
    cost: { cash: 700 },
    effects: [ { op: 'enables', id: 'spikeAnneal' } ],
    tradeoff: 'Unlocks short anneals; batch furnaces stay faster per lot.',
    physicsNote: 'Single-wafer lamp heating reaches temperature in seconds; a furnace heats 100+ wafers slowly but at once.' },

  { id: 'padConditioner', draft: true, kind: 'equipment', room: 'cmp', rarity: 'standard',
    name: 'In-situ pad conditioner', unlockedBy: 'fm_rr_drift',
    cost: { cash: 350 },
    effects: [
      { op: 'defectMult', pattern: 'rr_drift', mult: 0.4 },
      { op: 'cashCost', delta: 20 },     // pads wear out faster
    ],
    tradeoff: 'Stable polish rate, but pads are consumed faster.',
    physicsNote: 'Pad glazing lowers the Preston coefficient over time; conditioning restores the surface by wearing it.' },

  { id: 'parallelBeamStation', draft: true, kind: 'equipment', room: 'implant', rarity: 'advanced',
    name: 'Parallel-beam scanned end station', unlockedBy: 'fm_channeling',
    cost: { cash: 550 },
    // Needs: S/D implant step (NMOS step 11) adds channeling_tail on entering. Implant is not on the Cu line.
    effects: [
      { op: 'defectMult', pattern: 'channeling_tail', mult: 0.8 },
      { op: 'timeCost', delta: 3 },
    ],
    tradeoff: 'Every ion arrives at the same tilt across the wafer, so the tilt works at the edge as well as the centre, but collimating and scanning the beam cut the usable beam current, so each implant takes longer.',
    physicsNote: 'Channeling depends on the angle between the ion and the crystal. If the beam fans out or the scan changes the angle across the wafer, some sites are tilted correctly and others sit near an open channel. A collimated (parallel) beam scanned over the wafer keeps the standard tilt (about 7 degrees) the same everywhere.' },

  { id: 'verticalFurnace', draft: true, kind: 'equipment', room: 'diff', rarity: 'advanced',
    name: 'Vertical furnace with load lock', unlockedBy: 'fm_gate_native_oxide',
    cost: { cash: 480 },
    // Needs: gate oxidation (NMOS step 7) realizes gate_oxide and qtime_oxide added at step 6.
    // Anneal (NMOS step 12): both are already realized, so only the time cost applies there.
    effects: [
      { op: 'defectMult', pattern: 'qtime_oxide', mult: 0.85 },
      { op: 'defectMult', pattern: 'gate_oxide', mult: 0.95 },
      { op: 'timeCost', delta: 5 },
    ],
    tradeoff: 'Less air gets in when the boat loads, so less native oxide and fewer defects under the gate oxide, but the load lock purge cycle adds minutes to every furnace step.',
    physicsNote: 'Loading a boat of wafers into a hot tube lets air in, and oxygen and moisture grow native oxide on the bare silicon before the film starts. A load lock purged with nitrogen keeps that air out; the purge cycle takes time. Oxide grown in air during loading is uncontrolled and can carry contamination, which harms gate oxide integrity. Simplified: in the game the load lock also trims oxide grown during the wait before the furnace.' },

  { id: 'pulseReversePlating', draft: true, kind: 'equipment', room: 'plate', rarity: 'advanced',
    name: 'Pulse-reverse plating supply', unlockedBy: 'fm_overhang_void',
    cost: { cash: 500 },
    // Needs: void (cuLine step 6) is on the lot when plating is entered. Plate is visited once on the Cu line.
    effects: [
      { op: 'defectMult', pattern: 'void', mult: 0.75 },
      { op: 'timeCost', delta: 2 },
      { op: 'cashCost', delta: 15 },
    ],
    tradeoff: 'Fewer pinched-mouth voids, but the reverse pulses undo some of the plating, so the net rate is lower, the bath breaks down its additives faster, and the anodic pulses can dissolve thin seed at the lower sidewall.',
    physicsNote: 'A short reverse pulse removes copper preferentially at the feature mouth, where current density is highest, which keeps the opening from pinching off before the bottom fills. Because part of each cycle removes copper, net deposition is slower, and the extra anodic pulses also consume additives.' },

  { id: 'shieldKit', draft: true, kind: 'equipment', room: 'dep', rarity: 'standard',
    name: 'Textured chamber shield kit', unlockedBy: 'fm_chamber_flakes',
    cost: { cash: 400 },
    // Acts at every deposition visit (Cu line steps 2 and 6; NMOS steps 2 and 8). Flakes come from tool drift, so with a healthy chamber it only costs cash.
    effects: [
      { op: 'defectMult', pattern: 'flakes', mult: 0.6 },
      { op: 'cashCost', delta: 20 },
    ],
    tradeoff: 'Fewer flakes as the chamber ages, but the roughened shields are consumables that are swapped and re-textured, so each deposition pays for them whether or not the chamber has drifted.',
    physicsNote: 'Film on chamber shields cracks and flakes when stress builds. A rough, textured shield surface grips the film mechanically, so it can grow thicker before it lifts off. The shields are replaced or re-textured at preventive maintenance, which costs money. Simplified: shields are a sputtering (PVD) measure, but in the game the kit acts at every deposition step.' },
];

// ---------------------------------------------------------------------------
// MATERIALS = slot items. Each room has slots (litho: scanner, resist, mask;
// plating: bath). What is in the slot changes how that room's cards resolve.
// shelfLife counts rooms visited; at 0 the material is expired and stops helping.
// ---------------------------------------------------------------------------
export const MATERIALS = [
  { id: 'resistIline', draft: true, kind: 'material', slot: 'resist', room: 'litho', rarity: 'standard',
    name: 'i-line positive resist', unlockedBy: null,
    cost: { cash: 60 }, shelfLife: 8,
    effects: [
      { op: 'timeCost', delta: -5 },
      { op: 'defectMult', pattern: 'cd_error', mult: 1.5, when: { lot: 'tightCD' } },
    ],
    tradeoff: 'Cheap, fast and forgiving; cannot print the tightest lines.',
    physicsNote: 'Longer exposure wavelength limits resolution; the chemistry is mature and tolerant of delays.' },

  { id: 'resistCAR', draft: true, kind: 'material', slot: 'resist', room: 'litho', rarity: 'advanced',
    name: 'Chemically amplified DUV resist', unlockedBy: 'fm_ped_ttop',
    cost: { cash: 140 }, shelfLife: 5,
    effects: [
      { op: 'defectMult', pattern: 'cd_error', mult: 0.6 },
      { op: 'defectMult', pattern: 'cd_error', mult: 1.4, when: { lot: 'delayBeforeBake' } },
    ],
    tradeoff: 'Prints fine lines, but punishes any wait between expose and bake.',
    physicsNote: 'Acid made by exposure is amplified in the bake; airborne bases neutralize it during a delay, giving T-topped lines.' },

  { id: 'resistThick', draft: true, kind: 'material', slot: 'resist', room: 'litho', rarity: 'advanced',
    name: 'Thick resist for deep etch', unlockedBy: null,
    cost: { cash: 90 }, shelfLife: 6,
    effects: [
      { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.5, when: { lot: 'deepEtch' } },
      { op: 'defectMult', pattern: 'cd_error', mult: 1.3 },
      { op: 'timeCost', delta: 10 },
    ],
    tradeoff: 'Survives long etches (TSVs) at the cost of resolution and bake time.',
    physicsNote: 'More resist budget lasts through a deep etch; thicker film blurs the image and takes longer to bake.' },

  { id: 'additiveBath', draft: true, kind: 'material', slot: 'bath', room: 'plate', rarity: 'advanced',
    name: 'Three-additive copper bath', unlockedBy: 'fm_keyhole',
    cost: { cash: 200 },
    effects: [
      { op: 'defectMult', pattern: 'void', mult: 0.25, when: { lot: 'narrowFeatures' } },
      { op: 'decayPerUse', target: 'void', mult: 1.15 },   // additives break down with use
    ],
    tradeoff: 'Bottom-up fill of narrow features, but it ages every lot and needs watching.',
    physicsNote: 'Suppressor, accelerator and leveler together make plating faster at the bottom of a feature than at its mouth (superfill). The additives are consumed in use.' },


  { id: 'barc', draft: true, kind: 'material', slot: 'arc', room: 'litho', rarity: 'standard',
    name: 'Bottom anti-reflective coating', unlockedBy: 'fm_dose_offset',
    cost: { cash: 90 }, shelfLife: 6,
    // Acts at each litho step: Cu trench, NMOS active and gate (cd_error is added on entering).
    effects: [
      { op: 'defectMult', pattern: 'cd_error', mult: 0.85 },
      { op: 'defectMult', pattern: 'particles', mult: 1.1 },
      { op: 'timeCost', delta: 4 },
    ],
    tradeoff: 'Steadier line width over reflective films, but it is one more coat and bake before the resist, which takes minutes and adds handling particles.',
    physicsNote: 'Light that passes through the resist reflects off the film below and interferes with the incoming light (standing waves), so the dose in the resist changes with film thickness and topography and the line width varies. An absorbing coating under the resist cuts the reflection. It does nothing for dose or focus errors, which also drive line width. It must be opened later in the etch.' },
];

// ---------------------------------------------------------------------------
// CONSUMABLES = potions. Single use; carried between rooms.
// ---------------------------------------------------------------------------
export const CONSUMABLES = [
  { id: 'qualWafer', draft: true, kind: 'consumable', rarity: 'standard',
    name: 'Qual wafer', unlockedBy: null,
    cost: { cash: 100 },
    effects: [ { op: 'reveal', what: 'toolFault' } ],
    tradeoff: 'Tells you what is wrong with a tool; fixes nothing.',
    physicsNote: 'A test wafer through a suspect tool isolates its signature from the rest of the route (FabSim QUAL_COST).' },

  { id: 'sparePart', draft: true, kind: 'consumable', rarity: 'standard',
    name: 'Spare part', unlockedBy: null,
    cost: { cash: 300 }, needsTarget: 'faultType',
    effects: [ { op: 'toolHealth', delta: 100, when: { lot: 'rightPartChosen' } } ],
    tradeoff: 'Fully repairs a tool if you picked the right part; the wrong part is money gone.',
    physicsNote: 'FabSim rule: right part is cheap, wrong part costs money and leaves the fault in place.' },

  { id: 'freshResist', draft: true, kind: 'consumable', rarity: 'standard',
    name: 'Fresh resist lot', unlockedBy: 'fm_ped_ttop',
    cost: { cash: 150 },
    effects: [ { op: 'reveal', what: 'none' } ],   // engine: resets the resist slot's shelfLife
    resets: { slot: 'resist', field: 'shelfLife' },
    tradeoff: 'Restores an expired resist, at full price again.',
    physicsNote: 'Resist ages on the shelf; old resist drifts in sensitivity.' },

  { id: 'bathAnalysis', draft: true, kind: 'consumable', rarity: 'standard',
    name: 'Bath analysis and dose', unlockedBy: 'fm_keyhole',
    cost: { cash: 80 },
    effects: [ { op: 'reveal', what: 'bathAge' } ],
    resets: { slot: 'bath', field: 'decay', fraction: 0.5 },
    tradeoff: 'Recovers half the bath\'s lost performance; a full dump costs a new bath.',
    physicsNote: 'Measuring additive levels lets you top them up; breakdown products build up and eventually force a dump.' },

  { id: 'oxideMonitor', draft: true, kind: 'consumable', rarity: 'standard',
    name: 'Oxide monitor wafer', unlockedBy: 'fm_gate_native_oxide',
    cost: { cash: 60 },
    effects: [ { op: 'reveal', what: 'oxideThickness' } ],
    tradeoff: 'Shows whether the furnace grows the right thickness, but it is a bare, freshly cleaned wafer: it says nothing about native oxide or contamination on your product wafers.',
    physicsNote: 'A bare wafer runs through the oxidation and its oxide thickness is measured optically (ellipsometry). It separates the furnace from earlier steps: if the monitor is on target and product is not, the cause is upstream, such as a wait after clean.' },

  { id: 'implantMonitor', draft: true, kind: 'consumable', rarity: 'standard',
    name: 'Implant monitor wafer', unlockedBy: 'fm_channeling',
    cost: { cash: 70 },
    effects: [ { op: 'reveal', what: 'implantDose' } ],
    tradeoff: 'Shows the dose and its uniformity from sheet resistance, but sheet resistance adds up all the dopant and cannot see how deep it went, so a channeling tail can hide.',
    physicsNote: 'A bare wafer is implanted and annealed, then its sheet resistance is read with a four-point probe. Sheet resistance falls as active dose rises, so it checks dose and uniformity. A depth profile is needed to see the shape of the dopant.' },
];

// Everything with unlockedBy: null is in the starter pool.
export const STARTER_IDS = [...PRACTICES, ...EQUIPMENT, ...MATERIALS, ...CONSUMABLES]
  .filter(item => item.unlockedBy === null)
  .map(item => item.id);
