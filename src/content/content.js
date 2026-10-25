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
//   { op: 'toolHealth', delta }              repair or wear the room's tool
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
};

// ---------------------------------------------------------------------------
// FAILURE MODES = the engineering notebook.
// Diagnosing one (from the evidence on screen) writes it into the notebook,
// which persists between runs, and unlocks its remedies for future runs.
// ---------------------------------------------------------------------------
export const FAILURE_MODES = [
  { id: 'fm_particles',      draft: true, pattern: 'particles',
    sig: 'Random killed dies that move from lot to lot; particle adders climb on the wet clean SPC chart.',
    unlocks: ['preclean'] },
  { id: 'fm_chamber_flakes', draft: true, pattern: 'flakes',
    sig: 'Killed dies that appear at the deposition steps; particle adders on the deposition SPC chart climb between chamber cleans.',
    unlocks: [] },
  { id: 'fm_residue',        draft: true, pattern: 'residue',
    sig: 'Opens spread evenly across the whole wafer after etch, while the etch rate falls on the etch SPC chart.',
    unlocks: [] },
  { id: 'fm_underlayer',     draft: true, pattern: 'underlayer_attack',
    sig: 'Leakage on the dies with the most over-etch; the cross-section shows a notch in the film below.',
    unlocks: ['etchStopLayer', 'oesEndpoint', 'endpointEtch'] },
  { id: 'fm_edge_ring',      draft: true, pattern: 'edge_ring',
    sig: 'Only the outer ring of sites fails; inner sites are clean.',
    unlocks: ['eChuckUpgrade'] },
  { id: 'fm_dishing',        draft: true, pattern: 'dishing',
    sig: 'Wide lines are thin and high-resistance; narrow lines are fine.',
    unlocks: ['dummyFill'] },
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
    physicsNote: 'The default sample is 3 of 25 wafers (FabSim rule). Measuring everything removes sampling risk at the cost of tool time.' },

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
];

// Everything with unlockedBy: null is in the starter pool.
export const STARTER_IDS = [...PRACTICES, ...EQUIPMENT, ...MATERIALS, ...CONSUMABLES]
  .filter(item => item.unlockedBy === null)
  .map(item => item.id);
