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
  dishing:          'wide metal polished below the surface',
  rr_drift:         'polish rate wandering run to run',
  void:             'empty pocket inside the metal',
  qtime_oxide:      'native oxide grew while the lot waited',
  implant_damage:   'crystal damage not repaired',
  junction_spread:  'dopant diffused too far',
  gate_oxide:       'thin gate oxide that leaks or breaks down early',
};

// ---------------------------------------------------------------------------
// FAILURE MODES = the engineering notebook.
// Diagnosing one (from the evidence on screen) writes it into the notebook,
// which persists between runs, and unlocks its remedies for future runs.
// ---------------------------------------------------------------------------
export const FAILURE_MODES = [
  { id: 'fm_particles',      draft: true, pattern: 'particles',
    sig: 'Random killed dies that move from lot to lot; particle adders climb on the wet clean SPC chart.',
    unlocks: ['preclean', 'megasonicClean'] },
  { id: 'fm_chamber_flakes', draft: true, pattern: 'flakes',
    sig: 'Killed dies that appear at the deposition steps; particle adders on the deposition SPC chart climb between chamber cleans.',
    unlocks: [] },
  { id: 'fm_residue',        draft: true, pattern: 'residue',
    sig: 'Opens spread evenly across the whole wafer after etch, while the etch rate falls on the etch SPC chart.',
    unlocks: [] },
  { id: 'fm_underlayer',     draft: true, pattern: 'underlayer_attack',
    sig: 'Leakage on the dies with the most over-etch; the cross-section shows a notch in the film below.',
    unlocks: ['etchStopLayer', 'oesEndpoint', 'endpointEtch', 'chamberSeasoning'] },
  { id: 'fm_edge_ring',      draft: true, pattern: 'edge_ring',
    sig: 'Only the outer ring of sites fails; inner sites are clean.',
    unlocks: ['eChuckUpgrade'] },
  { id: 'fm_dishing',        draft: true, pattern: 'dishing',
    sig: 'Wide lines are thin and high-resistance; narrow lines are fine.',
    unlocks: ['dummyFill', 'lowPressurePolish'] },
  { id: 'fm_rr_drift',       draft: true, pattern: 'rr_drift',
    sig: 'The CMP removal rate walks steadily lot to lot on the SPC chart.',
    unlocks: ['padConditioner'] },
  { id: 'fm_keyhole',        draft: true, pattern: 'void',
    sig: 'Opens on narrow vias only; a seam or void sits in the middle of the fill.',
    unlocks: ['slowStartPlate', 'additiveBath', 'bathAnalysis'] },
  { id: 'fm_qtime',          draft: true, pattern: 'qtime_oxide',
    sig: 'High line resistance only on lots that waited long after clean.',
    unlocks: ['n2Storage'] },
  { id: 'fm_implant_damage', draft: true, pattern: 'implant_damage',
    sig: 'Junction leakage after implant; a longer anneal fixes leakage but shifts the device.',
    unlocks: ['rta', 'spikeAnneal'] },
  { id: 'fm_ped_ttop',       draft: true, pattern: 'cd_error',
    sig: 'Lines come out with a T-shaped top when the lot waited between expose and bake.',
    unlocks: ['resistCAR', 'freshResist'] },
  { id: 'fm_overhang_void',  draft: true, pattern: 'void',
    sig: 'Opens on narrow, deep trenches; the cross-section shows either a void under a pinched mouth or voids at the lower sidewall where the seed is thin.',
    unlocks: ['ionizedSeed'] },
  { id: 'fm_dose_offset',    draft: true, pattern: 'cd_error',
    sig: 'Line width is off target by the same amount on every site and every wafer; SPC shows a step from the previous lot, and the scatter within the lot is small.',
    unlocks: ['sendAheadWafer'] },
  { id: 'fm_channeling',     draft: true, pattern: 'junction_spread',
    sig: 'Junctions are deeper than the dose and anneal predict, on every site; the dopant depth profile has a long tail beyond the main peak, and the tail shrinks on a wafer implanted at a tilt or through an oxide. Anneal time does not change the tail.',
    unlocks: ['tiltedImplant', 'screenOxideImplant', 'implantMonitor'] },
  { id: 'fm_gate_punch',     draft: true, pattern: 'underlayer_attack',
    sig: 'Gate-to-substrate leakage on every site and wafer, not just the most over-etched dies; oxide thickness measured after the poly etch is thin or gone beside the gate, and the cross-section shows pits in the silicon there.',
    unlocks: ['softLandGateEtch'] },
  { id: 'fm_gate_breakdown', draft: true, pattern: 'gate_oxide',
    sig: 'On a ramped-voltage test the gate oxide breaks down at a low voltage, with a wide spread of breakdown voltage from site to site; the oxide thickness itself is on target, and the early breakdowns are worse on lots that waited long after the pre-gate clean.',
    unlocks: ['hfLastClean'] },
  { id: 'fm_gate_native_oxide', draft: true, pattern: 'qtime_oxide',
    sig: 'Capacitance-voltage shows an electrical oxide thickness larger than the furnace recipe gives, and threshold voltage is shifted, but breakdown voltage is normal; the gap grows with the wait after the pre-gate clean.',
    unlocks: ['oxideMonitor'] },
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
      { op: 'defectMult', pattern: 'underlayer_attack', mult: 1.5 },
      { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.5, when: { flag: 'etch_stop' } },
    ],
    upgrade: {
      name: 'Timed over-etch, DOE-centred',
      effects: [
        { op: 'defectMult', pattern: 'residue', mult: 0.3 },
        { op: 'defectMult', pattern: 'underlayer_attack', mult: 1.25 },
        { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.5, when: { flag: 'etch_stop' } },
      ],
      tradeoff: 'Still attacks the film below, but less: the DOE found the shortest over-etch that still clears.',
      physicsNote: 'A designed experiment across over-etch times finds where residue is gone but punch-through has barely started, so less extra time is needed for the same clearing.',
    },
    tradeoff: 'Clears residue but attacks the film below, unless an etch stop is there.',
    physicsNote: 'Extra etch time removes what is left in slow spots and keeps etching wherever the film has already cleared. Selectivity to the underlayer sets how much damage that does.' },

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
    tradeoff: 'One more film and one more step, in exchange for etch depth set by the film and not by time.',
    physicsNote: 'An etch that is highly selective to nitride stops when it reaches it, so depth no longer depends on etch rate uniformity.' },

  { id: 'endpointEtch', draft: true, kind: 'practice', room: 'etch', rarity: 'advanced',
    name: 'Stop on endpoint', unlockedBy: 'fm_underlayer',
    cost: { time: 5 }, when: { equipment: 'oesEndpoint' },
    effects: [
      { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.3 },
      { op: 'defectMult', pattern: 'residue', mult: 1.3 },
    ],
    upgrade: { name: 'Stop on endpoint, DOE-centred',
      effects: [
        { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.35 },
        { op: 'defectMult', pattern: 'residue', mult: 1.15 },
      ],
      tradeoff: 'Less residue in slow spots, but the short extra etch after the signal attacks the film below a little more.',
      physicsNote: 'A small fixed over-etch after the endpoint signal clears the last film in slow spots, while the underlayer is exposed a bit longer.' },
    tradeoff: 'Stops right when the film clears, so slow spots can keep a little residue.',
    physicsNote: 'Plasma emission changes when the etched film runs out; the tool stops on that signal instead of a fixed time.' },

  { id: 'dummyFill', draft: true, kind: 'practice', room: 'litho', rarity: 'advanced',
    name: 'Add dummy fill to the mask', unlockedBy: 'fm_dishing',
    cost: { time: 0, cash: 100 },
    effects: [ { op: 'defectMult', pattern: 'dishing', mult: 0.4 } ],
    upgrade: { name: 'Dummy fill, DOE-tuned density', cost: { time: 0, cash: 130 },
      effects: [ { op: 'defectMult', pattern: 'dishing', mult: 0.3 } ],
      tradeoff: 'Flatter polish, but more fill shapes cost more mask data work and add still more metal capacitance.',
      physicsNote: 'A DOE on fill size, spacing and target density evens the pattern density further, so the pad dishes wide features less; more fill metal couples more capacitance.' },
    tradeoff: 'Costs a mask change and adds metal capacitance.',
    physicsNote: 'Evening out metal density lets the polish pad see a flatter surface, so wide features dish less.' },

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
    tradeoff: 'Sets the dose from a measured wafer, but the lot waits for the measurement, and the send-ahead wafer is stripped and recoated, which adds handling particles.',
    physicsNote: 'Line width changes with exposure dose. One wafer is exposed, developed and measured while the rest of the lot waits unexposed; the dose is then corrected for the rest of the lot.' },

  { id: 'megasonicClean', draft: true, kind: 'practice', room: 'clean', rarity: 'standard',
    name: 'Megasonic clean', unlockedBy: 'fm_particles',
    cost: { time: 6, cash: 60 },
    effects: [
      { op: 'defectMult', pattern: 'particles', mult: 0.5 },
    ],
    tradeoff: 'Strong particle removal, but slow and paid for. On patterned wafers, too much acoustic power can break fine features.',
    physicsNote: 'High-frequency sound in the cleaning liquid makes a thin flow layer that sweeps small particles off the surface. Too much acoustic power can damage delicate fine-line structures.' },

  { id: 'ionizedSeed', draft: true, kind: 'practice', room: 'dep', rarity: 'advanced',
    name: 'Ionized PVD seed', unlockedBy: 'fm_overhang_void',
    cost: { time: 9, cash: 90 },
    effects: [
      { op: 'defectMult', pattern: 'void', mult: 0.6 },
      { op: 'defectMult', pattern: 'particles', mult: 1.2 },
    ],
    tradeoff: 'Better sidewall coverage in narrow trenches, but slower and dearer, and the extra coil and shields in the plasma collect metal that can flake off as particles.',
    physicsNote: 'Ionizing the sputtered metal lets a substrate bias steer it down into the feature, so the sidewall gets more seed and the opening overhangs less. Less overhang means the plated copper is less likely to pinch off the mouth and trap a void.' },

  { id: 'lowPressurePolish', draft: true, kind: 'practice', room: 'cmp', rarity: 'standard',
    name: 'Low-pressure final polish', unlockedBy: 'fm_dishing',
    cost: { time: 6, cash: 30 },
    effects: [
      { op: 'defectMult', pattern: 'dishing', mult: 0.6 },
    ],
    tradeoff: 'Less dishing in wide lines, but the polish takes longer and uses more slurry and pad per wafer.',
    physicsNote: 'Preston: removal rate ≈ k × pressure × velocity, so a lighter down force removes less per second and the polish takes longer. Under pressure the pad bends down into wide features and keeps polishing the copper there; less pressure means less bending, so wide lines dish less.' },

  { id: 'chamberSeasoning', draft: true, kind: 'practice', room: 'etch', rarity: 'standard',
    name: 'Chamber seasoning', unlockedBy: 'fm_underlayer',
    cost: { time: 3, cash: 40 },
    effects: [
      { op: 'defectMult', pattern: 'depth_variation', mult: 0.7 },
      { op: 'defectMult', pattern: 'particles', mult: 1.2 },
    ],
    tradeoff: 'A steadier chamber, but it spends minutes and dummy wafers, and the film coated on the walls can flake.',
    physicsNote: 'Running conditioning wafers coats the chamber walls so they recombine and release radicals at a steady rate. Without it the first wafers see a different etch rate. Wall film can flake as particles.' },
  { id: 'tiltedImplant', draft: true, kind: 'practice', room: 'implant', rarity: 'standard',
    name: 'Tilted implant (about 7 degrees)', unlockedBy: 'fm_channeling',
    cost: { time: 6 },
    // Needs: S/D implant step (NMOS step 12) adds junction_spread on entering, before this card is played.
    effects: [
      { op: 'defectMult', pattern: 'junction_spread', mult: 0.6 },
    ],
    tradeoff: 'Cuts the channeling tail, but the tall gate shadows one side of each source or drain, so the wafer must be rotated through several implants, which takes extra minutes.',
    physicsNote: 'Ions fired along an open crystal direction travel far between atoms (channeling) and make a deep tail on the dopant profile. Tilting the wafer about 7 degrees off the axis makes the ions hit atoms sooner. A tall gate then shadows one side of the implant, so the implant is split into steps with the wafer rotated between them.' },

  { id: 'screenOxideImplant', draft: true, kind: 'practice', room: 'implant', rarity: 'standard',
    name: 'Implant through a screen oxide', unlockedBy: 'fm_channeling',
    cost: { time: 4, cash: 30 },
    // Needs: S/D implant step (NMOS step 12) adds junction_spread, particles and implant_damage on entering, before this card is played.
    effects: [
      { op: 'defectMult', pattern: 'junction_spread', mult: 0.7 },
      { op: 'defectMult', pattern: 'particles', mult: 0.8 },
      { op: 'defectMult', pattern: 'implant_damage', mult: 1.3 },
    ],
    tradeoff: 'Less channeling and fewer particles on the bare silicon, but ions knock oxygen out of the oxide into the silicon, which adds crystal damage the anneal must repair.',
    physicsNote: 'A thin amorphous oxide on the silicon scatters the incoming ions, so they enter the crystal at random angles and channel less. It also keeps particles and contamination off the silicon surface. Collisions push oxygen atoms into the silicon (knock-on) and the oxide shifts the dopant peak shallower, so the dose and energy must be set to suit.' },

  { id: 'softLandGateEtch', draft: true, kind: 'practice', room: 'etch', rarity: 'advanced',
    name: 'Soft-landing gate etch', unlockedBy: 'fm_gate_punch',
    cost: { time: 6 },
    // Needs: gate etch step (NMOS step 11) adds underlayer_attack and residue on entering, before this card is played.
    effects: [
      { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.7 },
      { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.5, when: { lot: 'thinGateOxide' } },
      { op: 'defectMult', pattern: 'residue', mult: 1.4 },
    ],
    tradeoff: 'Protects the thin gate oxide, but the slow, polymer-rich final step can leave poly stringers at the foot of the gate, and it takes most of the room\'s minutes.',
    physicsNote: 'Near the end the etch switches to a chemistry with high poly-to-oxide selectivity and low ion energy, so it removes the last poly without punching the thin oxide below. The same polymer that protects the oxide can mask poly at the gate foot and leave residue.' },

  { id: 'hfLastClean', draft: true, kind: 'practice', room: 'clean', rarity: 'standard',
    name: 'HF-last clean before gate oxidation', unlockedBy: 'fm_gate_breakdown',
    cost: { time: 6, cash: 40 },
    // Needs: SiN strip + pre-gate clean step (NMOS step 7) adds gate_oxide and qtime_oxide on entering. Play it in that step; the earlier clean (step 1) comes before the risk exists.
    effects: [
      { op: 'defectMult', pattern: 'gate_oxide', mult: 0.5 },
      { op: 'defectMult', pattern: 'qtime_oxide', mult: 1.5 },
    ],
    tradeoff: 'A final dip in dilute HF strips the old oxide and the contamination in it, but the bare silicon regrows native oxide as soon as the lot waits, so the Q-time window gets tighter.',
    physicsNote: 'Dilute HF removes silicon dioxide and the metals and particles trapped in it, leaving a hydrogen-terminated silicon surface that makes a cleaner, more uniform gate oxide. That surface is only stable for a short time; it regrows native oxide in air and moisture.' },
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
