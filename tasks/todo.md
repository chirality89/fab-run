# Fab Run — Task Tracker

## Current: M1 item 5 — the inlaid Cu line route (`src/content/lotTypes.js`)

**Status: plan, waiting for David's OK. No code written yet.**

**David's answers (24 Oct 2026):** route and bite rooms as in the table; risk sizes OK as placeholders; traits: `narrowFeatures` only.

**Hand-computed do-nothing yield (scatter off):** even risks total 0.53; edge ring adds 0.078125 on the outer sites; depth variation adds 0.05 on the inner ring and 0.10 on the outer ring. Center e^(−0.53) = 0.588605, inner e^(−0.58) = 0.559898, outer e^(−0.708125) = 0.492567. Yield = (0.588605 + 8 × 0.559898 + 16 × 0.492567) / 25 = **0.517954**.

### What it is, in plain words
A lot type is data: the route (rooms in order), what risk each step adds, and which step makes each risk bite. It is the missing link between `lot.js` (risk → yield) and the cards (which scale risk). Data only, `draft: true`, with a `physicsNote`.

### Proposed shape
```js
export const LOT_TYPES = {
  cuLine: {
    id: 'cuLine', draft: true, name: 'Inlaid Cu line',
    traits: ['narrowFeatures'],                  // for when: { lot }
    startRisks: { depth_variation: 0.08, dishing: 0.08 },   // latent from the start
    route: [
      { room: 'clean', label: 'Clean', adds: { particles: 0.01 }, realizes: ['particles'] },
      ...
    ],
    physicsNote: '...',
  },
};
```
On entering a step: add its risks, then equipment and material effects, then cards. On resolving: realize its patterns.

### Proposed route (DESIGN.md §11): where each risk enters and where it bites
| # | Room | Adds on entry | Realizes (bites) | Why it bites here |
|---|---|---|---|---|
| start | | depth_variation 0.08, dishing 0.08 | | Latent: set by the stack and layout before any step. Etch stop (dep) and dummy fill (litho) scale them early |
| 1 | Wet clean | particles 0.01 | particles | |
| 2 | Deposition (SiN + oxide) | particles 0.01 | particles | Pre-clean scales the particles about to be buried |
| 3 | Litho (trench) | particles 0.01, cd_error 0.06 | particles, cd_error | Rework is the only fix, and only here |
| 4 | Etch (trench) | particles 0.01, residue 0.10, underlayer_attack 0.05, edge_ring 0.05 | particles, residue, underlayer_attack, edge_ring, depth_variation | The etch room's card choices |
| 5 | Wet clean (post-etch) | particles 0.01, qtime_oxide 0.04 | particles | N2 storage scales the oxide that grows while the lot waits |
| 6 | Deposition (barrier + seed) | particles 0.01 | particles, qtime_oxide | The oxide is trapped under the barrier |
| 7 | Plating | particles 0.01, void 0.08 | particles, void | |
| 8 | CMP | particles 0.01, rr_drift 0.04 | particles, dishing, rr_drift | |
| 9 | Metrology | none | none | Measure, then ship against the spec |

Total risk if you play nothing: 0.66, so yield is about e^(−0.66) ≈ **52%**. That's rejected (below the 70% spec) but not scrapped (above 40%). Good play should reach about 75–80%. These are placeholders for the M7 bot pass.

### Changes
- [ ] `src/content/lotTypes.js` with `cuLine` as above
- [ ] `tests/lotTypes.test.js`: every room is in `ROOMS`; every pattern is in `PATTERNS`; every risk that enters is realized at the same or a later step (nothing dangles), and nothing is realized before it enters; traits are among the static `when: { lot }` traits used in content; and a hand-computed do-nothing yield, run through `lot.js` with scatter off

### Acceptance criteria
- `npm test` passes; `physics-reviewer` checks the route and the risk placement.

---

## Done: M1 item 4 — balance numbers (`src/content/balance.js`)

**Status: done 24 Oct 2026.** `npm test` 55/55 (4 new balance tests). No behavior change: lot.js now reads the same 0.25 from balance.js.

**David's answers (24 Oct 2026):** cash 1500; scrap line 40%, spec 70%; time budgets as in the table.

### What it is, in plain words
One file that holds every tuning number, so balancing never means hunting through code (CLAUDE.md §7). Data only; no logic. All numbers are placeholders until the M7 bot balance pass.

### Numbers (confirmed by David)
| Name | Proposed | Why |
|---|---|---|
| `STARTING_CASH` | 1500 | One big tool (450–700) plus a material and a consumable or two; not everything |
| `HAND_SIZE` | 5 | O6 |
| `SCRAP_LINE` | 0.40 | Below 40% line yield the lot is scrapped mid-run |
| `CUSTOMER_SPEC` | 0.70 | Ship at or above 70% = shipped; below = rejected (O4) |
| `SCATTER_STRENGTH` | 0.5 | Site-to-site scatter for even patterns (lot.js) |
| `SHAPED_SCATTER_FRACTION` | 0.25 | Moved here from lot.js, where it was marked as a placeholder |

**Time budgets per room (minutes).** Set against the card costs so each room forces a choice:

| Room | Budget | Cards today (time) | The choice it forces |
|---|---|---|---|
| Wet clean | 10 | N2 storage (cash only) | (time matters once Q-time lands) |
| Deposition | 15 | pre-clean 10, SiN etch stop 12 | **one or the other, not both** |
| Litho | 30 | rework 30, dummy fill 0; i-line resist −5, thick resist +10 | rework fits only with a fast resist or nothing else |
| Etch | 8 | timed over-etch 4, endpoint etch 5 | two plays at most |
| Plating | 10 | low-current start 8 | |
| Diffusion | 20 | spike anneal 15 | (NMOS, later) |
| Implant | 15 | none yet | (NMOS, later) |
| CMP | 10 | none yet | |
| Metrology | 20 | measure all 25 sites 20 | spend the whole visit measuring, or don't |

### Changes
- [x] `src/content/balance.js` with the numbers above, each with a one-line comment
- [x] `lot.js` reads `SHAPED_SCATTER_FRACTION` from balance.js instead of its own constant (a 2-line change; no behavior change, since the value stays 0.25)
- [x] `tests/balance.test.js`: every number is finite and in range; `SCRAP_LINE < CUSTOMER_SPEC < 1`; every room in `ROOMS` has a time budget; every practice's time cost fits inside its room's budget (so no card can never be played)

### Acceptance criteria
- `npm test` passes; no other behavior changes.

---

## Done: M1 item 3 — card effects (`src/engine/resolve.js`)

**Status: done 24 Oct 2026.** `npm test` 51/51. physics-reviewer and code-explainer: no blocking issues. Fixed from their findings: number checks on every stored value (timeCost, cashCost, toolHealth, decay factor), decayPerUse refuses mult < 1 and a missing source, two dense lines split. Two new tests.

**David's answers (24 Oct 2026):** (1) `decayPerUse`: the slot keeps a decay factor starting at 1; each use multiplies the target pattern's risk by the factor, then the factor ×= mult (the bath gets worse each use). (2) Equipment and material effects apply once per visit to their room, on entering, before any cards (run.js will call `applyEffects`).

### What it is, in plain words
Every card, tool, material and consumable is a list of effects (`content.js`). This file is the one place that knows what each of the eight effect operations *does* to the game state, and when a `when` condition is true. It doesn't decide *when* a card is played or pay its base cost; that is the run's job (`run.js`, later). Keeping it that narrow means each operation has one small function and one test.

### The slice of state it touches
`run.js` doesn't exist yet, so this item fixes only the parts effects need. `run.js` will build the full state around them later.
```js
{
  lot,                        // from lot.js: sites, risks, flags
  cash,                       // may go below 0 (O4: that blocks buying, nothing else)
  room: { id, timeLeft, revealed: [] },
  tools: { etch: { health: 100 }, ... },   // 0..100
  equipment: ['oesEndpoint', ...],
  slots: { resist: { id, shelfLife, decay: 1 }, bath: { ... } },
  enabled: ['endpointEtch', ...],          // cards made playable by equipment
  lotTraits: ['narrowFeatures', ...],      // facts about this lot, for when: { lot }
}
```

### The eight operations
| Op | What it does | Edge rules |
|---|---|---|
| `defectMult` | `scaleRisk(lot, pattern, mult)` from lot.js | unknown pattern → error |
| `timeCost` | `room.timeLeft -= delta` (a negative delta gives time back, e.g. i-line resist −5) | may not go below 0; the run checks affordability before a card is played |
| `cashCost` | `cash -= delta` | may go below 0 (O4) |
| `setFlag` | adds the flag to `lot.flags` (once) | |
| `reveal` | adds `what` to `room.revealed`; the UI reads it in M2 | `'none'` does nothing |
| `toolHealth` | the room's tool health `+= delta` | kept within 0..100 |
| `enables` | adds the id to `enabled` (once) | |
| `decayPerUse` | `scaleRisk(target, slot.decay)`, then `slot.decay ×= mult`, on the slot holding `source` | source not in a slot → error |

**`when` conditions**, checked by one exported function `conditionMet(state, when)`:
- `{ flag }`: the lot has that flag. `{ equipment }`: it's installed. `{ material }`: some slot holds it.
- `{ lot }`: the trait is in `state.lotTraits`. Static traits (`tightCD`, `deepEtch`, `narrowFeatures`) will come from `lotTypes.js`. Dynamic ones (`delayBeforeBake`, `lastStepWasLitho`, `rightPartChosen`) stay in NEEDS NEW LOGIC: something has to set them later. Until then they are simply false.
- An unknown op or condition key → an error naming it, so a typo in content fails loudly.

### Functions (each returns a new state; nothing is changed in place)
- [x] `conditionMet(state, when)`
- [x] `applyEffect(state, effect, source)`: one effect. `source` is the item, needed by `decayPerUse`.
- [x] `applyEffects(state, item)`: all of an item's effects in order, skipping those whose `when` is false
- [x] One small private function per operation

### Tests (`tests/resolve.test.js`, hand-computed)
- [x] One test per operation, eight in all, including its edge rule.
- [x] `when`: each of the four kinds, true and false. Timed over-etch with and without `etch_stop`: underlayer_attack ×1.5 vs ×1.5×0.5 = ×0.75.
- [x] Unknown op and unknown condition key throw.
- [x] Nothing is changed in place. No NaN in the state after applying every item in `content.js`.

### Acceptance criteria
- `npm test` passes. `resolve.js` is pure and under ~150 lines.
- `physics-reviewer` checks the decayPerUse semantics; `code-explainer` checks readability.

### Carried to run.js (from physics-reviewer)
- `applyEffects` does not check an item's own top-level `when`. Before a card is played, run.js must check `conditionMet(state, card.when)`, plus `enabled` for cards that need equipment. Today that is `reworkLitho` (lastStepWasLitho), `endpointEtch` (oesEndpoint) and `spikeAnneal` (rta). Add a test for it there.
- The dynamic traits (`delayBeforeBake`, `lastStepWasLitho`, `rightPartChosen`) are always false until something sets them, so the CAR resist's delay penalty and the spare part's repair never fire yet. Matters for balance and playtests (already in NEEDS NEW LOGIC).

---

## Done: M1 item 2 — lot state and yield math (`src/engine/lot.js`)

**Status: done 24 Oct 2026.** `npm test` 35/35. physics-reviewer: no blocking issues; its overflow finding (risk → Infinity → NaN) fixed with a check on the stored result, plus tests. Its two map-shape suggestions are below for David.

**David's answers (24 Oct 2026):** risk is carried by the lot and realized in a named room; Poisson loss e^(−r × weight); 5×5 map and shape table as proposed; seeded scatter from the start.

### What it is, in plain words
The lot is the health bar. This file holds what the lot looks like (25 sites, the risks it carries) and the one rule that turns risk into lost yield. It doesn't play cards (that's `resolve.js`, item 3) or know the route (that's `lotTypes.js`, item 5); it gives them the tools.

### Model (confirmed by David)
1. **Risk is carried by the lot and bites in a named room.** The lot has a risk number per defect pattern. Cards scale it (via `resolve.js`) in any room; the room where that pattern shows up *realizes* it: turns it into yield loss, then sets it back to 0. Example: dummy fill in litho scales `dishing`; CMP realizes `dishing`. Which room realizes which pattern, and the starting risks, come from `lotTypes.js` (item 5).
2. **Risk = expected killer defects per die (Poisson, Y = e^(−D·A)).** Realizing risk *r* at a site multiplies that site's survival by e^(−r × weight). This is the textbook defect-limited yield model. It can never go below 0 and losses multiply by construction: e^(−a)·e^(−b) = e^(−(a+b)).
3. **The wafer map is a 5×5 grid in three rings:** center (1 site), inner ring (8), outer ring (16). Each site's value is the fraction of the lot's 25 wafers whose die at that position is still good. **Lot yield = the average of the 25 sites.**
4. **Each pattern has a shape**: a weight per site that averages 1, so a risk of 0.1 means the same amount of trouble whatever the shape, and only *where* it lands differs.

   | Shape | Weights (center / inner / outer) | Patterns |
   |---|---|---|
   | Even | 1 / 1 / 1 | particles, residue, cd_error, dishing, rr_drift, void, qtime_oxide, implant_damage, junction_spread, underlayer_attack |
   | Edge ring | 0 / 0 / 1.5625 | edge_ring |
   | Center-to-edge | 0 / 0.625 / 1.25 (grows with distance from center) | depth_variation |

5. **Scatter** (rule 4: randomness sets scatter, never the law). Optional: each site's weight is nudged by a seeded bell-curve number, never below 0. Even patterns get the most scatter, so particles look like random dots rather than flat shading. Spatial shapes get a little. Strength is passed in as a number (it moves to `balance.js` in item 4). Tests with hand-computed values use scatter 0.
6. **No healing.** Adding a negative risk or scaling by a negative number is refused with an error. Site survival can only go down. Rework (strip and re-expose) works by scaling a risk *before* it is realized, so it fits without breaking this.

### Functions (all return a new lot; nothing is changed in place)
- [x] `createLot()` → `{ sites: [25 × 1.0], risks: {}, flags: [] }`
- [x] `addRisk(lot, pattern, amount)`: amount ≥ 0
- [x] `scaleRisk(lot, pattern, mult)`: mult ≥ 0 (what `defectMult` will call)
- [x] `siteWeights(pattern)` → 25 weights from the shape table
- [x] `realizeRisks(lot, patterns, scatter)` → applies the losses and clears those risks
- [x] `rollScatter(rngState, patterns, strength)` → `{ value, rngState }`, the per-site nudges
- [x] `lotYield(lot)` → 0..1
- [x] Add `gauss()` to `rng.js` (ported from FabSim2, returning `{ value, rngState }` like the rest)
- Unknown pattern names throw an error that names the pattern.

### Hand-computed test values (David: please check these)
| Case | Expected |
|---|---|
| New lot | yield 1.000000 |
| Realize particles 0.1 (even) | every site e^(−0.1) = 0.904837; yield 0.904837 |
| …then edge_ring 0.16 | outer sites ×e^(−0.25) = 0.778801; yield 0.904837 × (9 + 16 × 0.778801)/25 = **0.776742** |
| particles 0.1 in two rooms | 0.818731, same as 0.2 in one room (losses multiply) |
| depth_variation 0.08 | center 1, inner 0.951229, outer 0.904837; yield 0.923489 |
| Scale by 0.4 then realize 0.1 | same as realizing 0.04 |
| Realize twice in a row | second time changes nothing (risk was cleared) |
| addRisk −0.1, scaleRisk −1 | error |
| Seeded scatter | same seed → same map; sites differ from each other; no NaN; all sites 0..1 |

Note: with a shaped pattern, the lot loses a bit *less* than e^(−r) (0.858 vs 0.852 for edge ring 0.16), because the already-dead edge sites can't die twice. That's the real behavior of clustered defects, not a bug.

### Acceptance criteria
- `npm test` passes, with a new `tests/lot.test.js` containing the values above once David confirms them.
- `lot.js` is pure (no DOM, no `Math.random`), under ~150 lines, and readable.
- A `physics-reviewer` pass on the yield model before calling it done.

### For David (from physics-reviewer, not blocking)
- Ten of twelve patterns are "even". Dishing is really a pattern-density effect, and CMP non-uniformity is often center-to-edge. Those failures will be diagnosed from SPC, metrology and the cross-section rather than the map. Fine for now.
- On a 5×5 map with high scatter, center-to-edge (0 / 0.625 / 1.25) can look like a mild edge ring. A small nonzero center weight would make them easier to tell apart.

---

## Done: M1 item 1 — the seeded generator (`src/engine/rng.js`)

**Status: done 24 Oct 2026.** David OK'd the plan. `npm test`: 16/16 pass (7 content + 9 rng).

### What it is, in plain words
Every random thing in the game (which cards you draw, scatter, which tool drifts) comes from one generator. It starts from a number (the **seed**) and produces the same sequence of numbers every time. Same seed + same choices = same run, which is what lets us replay bugs and let a bot test runs.

### Source
FabSim2 `index.html`, section "1b. RNG" (`rand()`, mulberry32). The arithmetic is copied exactly; only the packaging changes.

### The one change from FabSim2 (and why)
In FabSim2, `rand()` quietly changes a global game object `s`. Fab Run's engine must not do that (CLAUDE.md §4: functions take a state and return a new one). So each function here takes the generator's current number and **returns** the random result plus the next number, changing nothing:

```js
const { value, rngState } = nextRandom(state.rngState);   // value is 0 ≤ value < 1
```

### What goes in `src/engine/rng.js` (about 60 lines, comments included)
- [x] `normalizeSeed(n)`: checks a seed is a whole number from 0 to 4,294,967,295; returns it or `null`. (Reading `?seed=` from the address bar and picking a clock seed are browser jobs, so they wait for `src/ui/` in M2.)
- [x] `nextRandom(rngState)` → `{ value, rngState }`: the mulberry32 step, copied from FabSim2.
- [x] `randomInt(rngState, min, max)` → `{ value, rngState }`: a whole number from min to max, both included.
- [x] `pick(rngState, list)` → `{ value, rngState }`: one item from a list.
- [x] `shuffle(rngState, list)` → `{ value, rngState }`: a shuffled **copy** of a list (Fisher–Yates). This is what deals the 5-card hand (O6). The original list is left alone.
- Not yet: `gauss()` (bell-curve scatter). FabSim2 has one; we'll port it with `lot.js` (M1 item 2), when scatter is first needed.

The seed and `rngState` will live in the run state (`state.seed`, `state.rngState`) once `run.js` exists. This step only builds the generator.

### Tests: `tests/rng.test.js` (run by `npm test`)
- [x] **Faithful port:** seed 123456 gives 0.38233304349705577, 0.7972629074938595, 0.9965302373748273, and seed 0 gives 0.26642920868471265 first. These are FabSim2's own outputs, computed by running FabSim2's `rand()` as it is.
- [x] **Same seed, same sequence:** two runs of 1,000 numbers from one seed match; a different seed gives a different sequence.
- [x] **Range:** 10,000 values all satisfy 0 ≤ value < 1, none are `NaN`.
- [x] **Nothing changes behind your back:** calling a function twice with the same `rngState` gives the same answer; `shuffle` doesn't change the list it was given.
- [x] `randomInt` stays within min..max and hits both ends; `pick` always returns an item from the list; `shuffle` returns the same items in a different order.
- [x] `normalizeSeed` accepts 0 and 4294967295, rejects -1, 1.5, 2**32 and `'abc'`.
- [x] Repo check: no `Math.random` anywhere in `src/`.

### Acceptance criteria
- `npm test` passes (old content tests + new rng tests). No new dependencies.
- `rng.js` has no DOM, no `window`, no `Math.random`, and runs in Node.
- ROADMAP M1 item 1 ticked; David gets a 3-bullet summary.

### Open question for David
- None that blocks this. One heads-up: FabSim2's clock seed (`Date.now() % 1000000`) comes back in M2 with the UI.

---

## Done: M0 — Move in

### Task: confirm the kit works and settle the M1 decisions
- [x] GitHub Pages on; placeholder loads on desktop and phone
- [x] `npm test` passes
- [x] Decide D7, O2, O4, O5, O6 with David; move them to Settled in `docs/decisions.md` (O8 settled too)

**Progress notes:**
- 23 Oct 2026: `npm test` 7/7 pass. Served locally (`python3 -m http.server 8000`) and loaded in headless Chromium at 1280×800 and 375×812: 9 room tiles, counts 10/5/4/4/9, no console errors or warnings, no horizontal scroll at 375 px.
- 23 Oct 2026: David settled D7 = B (plain ES modules), O2 = A (time per room; cash for procurement only), O4 as proposed, O5 = A (inlaid Cu line), O6 = A (hand of 5), O8 = keep "Fab Run". CLAUDE.md §4 already matches D7, so no change there.
- 23 Oct 2026: David confirmed the live page at https://chirality89.github.io/fab-run/ looks right. M0 complete.

**Acceptance criteria:**
- The live page shows the title, the room key and the content counts, with no console errors
- `docs/decisions.md` has no open decision that blocks M1

## NEEDS NEW LOGIC

Content in `src/content/content.js` that needs engine behavior beyond the eight effect operations:

- `when: { lot: 'tightCD' | 'deepEtch' | 'narrowFeatures' }`: lot-type properties, set in `lotTypes.js` (M1)
- `when: { lot: 'delayBeforeBake' }`: needs a timer between the litho expose and bake practices
- `when: { lot: 'lastStepWasLitho' }`: needs route history in the lot state
- `when: { lot: 'rightPartChosen' }` and `needsTarget: 'faultType'`: the spare part asks the player to pick a fault
- `resets: { slot, field, fraction }`: fresh resist and bath analysis reset a material's shelf life or decay
- `limit: { perLayer: 1 }`: strip and re-expose once per layer
- `shelfLife`: counts rooms visited; at 0 the material stops helping
