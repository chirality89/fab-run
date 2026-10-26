# Lane C — content (tasks/todo-c.md)

Lane C's own tracker, so parallel lanes don't edit the same tasks/todo.md. Plan OK'd by David, 25 Oct 2026.

## Context

ROADMAP M5 has two data-only items for Lane C: grow the content from 24 items (10 practices, 5 equipment, 5 materials, 4 consumables) to about 40, and add NMOS as the second lot type. Both are data in `src/content/`, but three tests outside `src/content/` depend on today's exact content, so the batches are ordered to keep `npm test` green.

**What I found in the code**
- **Shop.** `shopStock` (`src/engine/shop.js`) shuffles all equipment and materials for rooms still ahead. Any new Cu-line equipment or material changes what seed 123456's shop sells. `tests/view.test.js:241` and `tests/screens/shop.spec.js` expect exactly the pad conditioner, DUV resist and thick resist. **You chose:** batches 1–2 add no equipment or materials. Batch 3 waits until the owner of those tests finds the seed by searching, as `shop.test.js` already does.
- **`fullPool()`.** `tests/run.test.js` checks `fullPool().length === 10`, and with the full pool it expects the etch hand to be exactly endpoint etch and timed over-etch. **You OK'd:** I fix these in `run.test.js`, with no yield, time or cash number changed.
- **`tests/view.test.js`** (not mine) needs endpoint etch to be dealt from the full pool. So the full pool keeps **at most 5 etch practices** (HAND_SIZE), and therefore every etch card is always dealt.
- **Starter deck.** New practices get an `unlockedBy` failure mode, not `null`. That keeps `starterDeck()` the same, and the seeded hands and hand-checked yields in other lanes' tests stay as they are.
- **Patterns.** **You chose:** at most 2 new patterns. Both are plain data in `PATTERNS` and show evenly on the wafer map (`lot.js` defaults them to even). They are told apart by SPC, metrology or cross-section. If one ever needs a map shape, that goes on NEEDS NEW LOGIC.
- **Consumables** are data only. No engine path sells or uses them yet, so adding them changes no test.

## Steps

**0. Setup**
- Branch `lane-c` from `origin/main` (done).
- Write `tasks/todo-c.md` from this plan.
- Commit.

**0b. `tests/run.test.js` (your exception)**
- `fullPool holds every practice`: the count check becomes "length equals `PRACTICES.length` and includes endpointEtch".
- Etch-hand tests (lines ~88, 124, 142, 148): use `deck: ['timedOveretch', 'endpointEtch', 'preclean']` instead of `fullPool()`. The test at ~124 needs preclean in the deck to check "not in hand". The asserted hands and legal-card lists stay exactly the same.
- Run `npm test`, commit on its own, and note it in todo-c.md for the other lanes.

**1–3. Content batches** (`src/content/content.js` only; about 5–6 items each)

Each batch goes through the same loop:
1. Brief `content-drafter` with the batch outline below, plus overrides to its own file: write NEEDS NEW LOGIC to `tasks/todo-c.md`, never `tasks/todo.md`; edit `content.js` only, never balance.js or events.js; respect the 5-etch-card cap; never `unlockedBy: null`.
2. `npm test`.
3. `physics-reviewer` on the batch. Fix its must-fixes, and list its "ASK DAVID" points for you.
4. **Stop and give you the batch:** a table with id, kind, room, effects, tradeoff, and the reviewer's notes.
5. On your OK, commit ("Content batch N: …").

The outlines are roles, not final entries. The drafter writes them and you rule on the physics.

| Batch | Kinds | Roles (room) |
|---|---|---|
| **1: Cu line depth** | 5 practices, 1–2 failure modes | Send-ahead wafer to set dose (litho, cd_error); megasonic clean (clean, particles, with a cost to fine features); ionized PVD seed for less overhang (dep step 6, void); low-pressure final polish (cmp, dishing vs time); chamber seasoning before the lot (etch, depth_variation). New failure mode(s) for patterns that need a second signature, e.g. overhang void vs keyhole void. |
| **2: NMOS front end** | ~4 practices + 1–2 consumables, 1–2 new patterns and their failure modes | Tilted implant against channeling (implant, junction_spread); screen-oxide implant (implant); high-selectivity gate etch landing on thin oxide (etch, underlayer_attack, `when: { lot: 'thinGateOxide' }`); pre-gate-oxidation clean (clean/diff, new `gate_oxide` pattern); consumables such as a monitor wafer. |
| **3: Equipment and materials** | about 6 | For NMOS rooms and the Cu line, e.g. a SiN-selective CMP slurry (cmp slot), an anti-reflective coating (litho), an implant-room dose monitor, a furnace or anneal upgrade. **Blocked** until the shop tests search for a seed (see Context). |

That makes 24 + 5 + ~5 + ~6 = **about 40 items**, plus new failure modes. Every entry has `draft: true`, a `tradeoff`, a `physicsNote`, only the 8 effect operations, an `unlockedBy` that points both ways, and public textbook physics only.

**4. NMOS lot type** (`lotTypes.js`, `tests/lotTypes.test.js`, `docs/process-primer.md`)

- **Draft route**, about 14 steps from primer §Lot type 2:
  1. Clean
  2. Pad oxide + SiN (dep)
  3. Litho (active)
  4. Trench etch
  5. Trench fill (dep)
  6. CMP stop on SiN
  7. SiN strip + pre-gate clean (`qtime`)
  8. Gate oxidation (diff)
  9. Poly dep
  10. Litho (gate)
  11. Gate etch
  12. S/D implant
  13. Activation anneal (diff)
  14. Dielectric + litho/etch (contact)
  15. Liner + W fill (dep)
  16. Test (metro)
  
  Metal 1 is left out as a stated simplification. **I'll ask you to confirm or cut the route before writing it.** It is long next to the Cu line's 9 steps.
- **Patterns:** existing ones wherever the physics matches (dishing, underlayer_attack, void, implant_damage, junction_spread, qtime_oxide, cd_error, particles), plus the batch-2 pattern(s).
- **Traits:** static and used by content (e.g. `tightCD`, `thinGateOxide`).
- **Tests in `lotTypes.test.js`:**
  - Existing structure checks apply to NMOS automatically.
  - New: NMOS do-nothing ring values and yield. Computed first, then copied from the output (lessons.md). You confirm them.
  - New: a `createRun({ lotTypeId: 'nmos' })` idle walk to the end with the full pool, with no exception and every number finite.
- **Primer:** update the NMOS section to the route as played, with the simplifications named.
- `physics-reviewer`, then your review, then commit.

**5. Close each item**
- Rebase `lane-c` on `origin/main`, run `npm test`, push, and open a PR (one for item 1, one for item 2).
- Send you the 3-bullet summary.
- I don't edit ROADMAP.md, todo.md or lessons.md. Ticks and proposed lessons go in `tasks/todo-c.md` for whoever merges.

## Verification
- `npm test` after every batch and after 0b, with every test passing (content, lotTypes, run, view, shop, bot).
- `node tools/bot.js --seed 123456 --policy random --deck full` runs clean after each batch. After step 4 it also runs on NMOS through `createRun` in the lotTypes test.
- `physics-reviewer` must report PASS (or your ruling on each ASK DAVID) before each batch is committed.
- No `Math.random` and no brand names (grep before each commit).

## Decisions (David, 25 Oct 2026)
- Order batches: batches 1–2 add no equipment or materials; batch 3 waits for the shop tests to search for a seed.
- Up to 2 new patterns, even shape on the wafer map.
- Lane C may fix `tests/run.test.js`: fullPool count and etch-hand decks. No expected numbers change.

## For the other lanes
- (step 0b) `tests/run.test.js`: the fullPool count now follows PRACTICES.length, and the etch-hand tests name their deck. Same assertions.
- **Request, blocks batch 3:** `tests/view.test.js` (shop view, around line 230) and `tests/screens/shop.spec.js` expect seed 123456's first shop to sell exactly padConditioner, resistCAR and resistThick. Please find the seed by searching, as `shop.test.js` does (the first seed from 123456 up whose shop sells those items), so new equipment and materials don't break them.
- Constraint while view.test.js needs endpoint etch dealt from the full pool: at most 5 etch practices in content.

## NEEDS NEW LOGIC
- **Feature damage from cleans** (batch 1, megasonicClean): too much acoustic power breaks fine features, but only on patterned wafers. Needs a "patterned" condition or a damage pattern. Today the card's cost is time and cash only.
- **CD per site on the metrology screen** (batch 1, fm_dose_offset): the sig ("same offset on every site, SPC step from the previous lot") needs mean CD and spread shown on screen. A yield-only map with scatter will not look uniform. Confirm before this failure mode goes live (CLAUDE.md §5 rule 6).
- **Deal only cards that can matter for this lot** (batch 2): siliconFrontEnd cards are dealt on the Cu line but are never playable there. Same idea as the shop lesson in lessons.md.
- **Step-level condition** (batch 2): soft-landing gate etch should act only at the gate etch, not at the STI trench (step 4) or the contact etch (step 14), where a poly-over-oxide landing is meaningless. Needs `when: { step: ... }` on route-step tags. This is an engine change.
- **Gate-foot profile cost** (batch 2): soft landing's real cost includes footing or notching (a CD cost), but cd_error is not on the lot during etch.
- **Evidence views for NMOS diagnosis** (batch 2): electrical test (Vt, junction leakage, ramped-voltage breakdown, C-V thickness), a dopant depth profile, and post-etch oxide thickness. Diagnosis must use the route step or lot type to tell apart failure modes that share a pattern: underlayer_attack, qtime_oxide, void and cd_error.
- **Monitor wafers reveal values nothing models** (batch 2): oxideThickness and implantDose. These need a consumable engine and a dose or thickness risk. implantMonitor is unlocked by fm_channeling, which it cannot see; move it to a future dose failure mode.
- **Shop sells only items that can act on this lot** (batch 3): the shop ignores an item's top-level `when`, so the NMOS-only ceria slurry is sold on the Cu line.
- **Parallel beam should strengthen tilt** (batch 3): it would act only when tiltedImplant was played, but cards are played after equipment acts.
- **Pulse reverse with the additive bath** (batch 3): reverse pulses strip the adsorbed accelerator that drives superfill, so the two together should be weaker than their product.
- **Swing-curve pattern** (batch 3): reflection-driven CD swing as its own pattern and failure mode, so the BARC acts on that and not on dose or focus drift.
- **BARC etch cost** (batch 3): opening the BARC in etch (time, residue) needs an effect that carries over to a later room.
- **Low-pressure polish copper residue** (batch 1, optional): a slower polish can leave copper residue (shorts). No pattern fits today.

## Proposed lessons (for whoever merges into tasks/lessons.md)
- (none yet)

## Progress notes
- 2026-10-25: plan written and OK'd. Branch lane-c from main 0b19ca8.
- 2026-10-25: step 0b done (run.test.js names its etch deck), 132/132.
- 2026-10-25: batch 1 drafted (5 practices, 2 failure modes). physics-reviewer: not ready as drafted. Fixed without needing David:
  - send-ahead: the CAR penalty is gone (the lot waits before expose, not between expose and bake); cost is now time 10 + cash 40, and the particles are explained (the send-ahead wafer is stripped and recoated);
  - megasonic: the cd_error penalty could never act and is gone; cost is time 6 + cash 60;
  - ionized seed: the unused flag is dropped; the particle cost is reworded (coil and shields flake);
  - low-pressure polish: no particle cost (lower force scratches less); cash 30 instead; Preston note rewritten;
  - seasoning: no edge_ring effect;
  - fm_overhang_void sig names both void locations.
  132/132; the bot (seed 123456, random, full deck) is clean.
- **Waiting on David (batch 1):**
  1. Ionized seed's void ×0.6 never acts, because void enters at plating. Proposed: move `void: 0.08` from the plating step's adds to step 6 (barrier + seed) adds in cuLine. The do-nothing yield is unchanged. startRisks was rejected: the card would then work at step 2, before any trench exists.
  2. Seasoning: unlock from fm_underlayer, or a new first-wafer-effect failure mode (needs per-wafer evidence)?
  3. Is coil/shield flaking a fair particle cost for ionized PVD?
  4. Agree that low-pressure finishing should not add scratches?
- 2026-10-25: David's rulings on batch 1:
  1. Void enters at step 6 (barrier + seed) in cuLine, not at plating. Checked: ionizedSeed takes void 0.08 → 0.048; the do-nothing yield is still 0.517954.
  2. Seasoning is now unlocked by fm_underlayer.
  3. The ionized PVD particle cost stays.
  4. Low-pressure polish: agreed, no scratch cost.
  Batch 1 done: 29 items. 132/132.
- 2026-10-25: batch 2 drafted (4 practices, 2 consumables, the gate_oxide pattern, 4 failure modes). physics-reviewer fixes:
  - screen oxide: no particle benefit (it catches beamline metals and carbon, not particles);
  - HF-last note: no particle claim;
  - fm_gate_punch sig: S/D leakage and silicon recess, not gate leakage;
  - fm_gate_breakdown sig: no Q-time clue (that clue belongs to fm_gate_native_oxide);
  - fm_channeling sig: circular clue dropped;
  - tilt wording.
- David's rulings on batch 2:
  1. HF-last and soft-landing gate etch need `when: { lot: 'siliconFrontEnd' }`, a static NMOS trait, so they're never playable on the Cu line.
  2. Soft landing: residue ×1.1 (micromasking) and time as the main cost.
  3. endpointEtch gets underlayer_attack ×1.5 when thinGateOxide (the over-etch after endpoint is in the main chemistry).
  4. New pattern channeling_tail (the 2nd new pattern): tilt and screen oxide scale it, and spike anneal keeps junction_spread.
  Batch 2 done: 35 items. 132/132; the bot is clean.
- **For the NMOS route (item 2):**
  - traits `siliconFrontEnd` and `thinGateOxide`;
  - step 7 (SiN strip + pre-gate clean) adds gate_oxide and qtime_oxide and is the qtime step;
  - step 8 realizes both;
  - step 11 adds underlayer_attack and residue;
  - step 12 adds channeling_tail, junction_spread and implant_damage;
  - step 13 realizes those.
  - Reviewer, for David: should step 7's qtime_oxide be small (an SC1/SC2 chemical oxide end)?
- 2026-10-25: rebased on main (PM, DOE, tool drift). Conflicts resolved:
  - fm_particles keeps main's new sig plus the megasonicClean unlock;
  - cuLine step 6 keeps main's `flakes` realize plus void entering there;
  - endpointEtch keeps main's DOE upgrade, which also gets the thinGateOxide line.
- Main now needs a DOE `upgrade` on every practice, so Lane C's 9 new practices got one. physics-reviewer fixes applied:
  - send-ahead: the DOE is the measurement plan only;
  - ionized seed: wording (coil power builds deposits);
  - seasoning: plasma clean + thin coat, time 5;
  - tilt: larger tilt, so four rotations;
  - soft land: a later switch;
  - HF-last: same concentration;
  - low-pressure polish: cash 40.
  168/168.
- David's rulings:
  - ionized seed flaking costs flakes ×1.2 (×1.3 on the DOE version) plus dep toolHealth −5. Checked in a run: flakes 0.041 → 0.049, dep health 55 → 50, void 0.08 → 0.048.
  - Lane C may fix the 2 shop tests. Done: tests/shopSeed.js searches for the seed whose step-2 shop sells pad conditioner, DUV resist and thick resist. view.test.js and shop.spec.js use it. Still 123456; no expected value changed.
- 2026-10-25: batch 3 drafted (ceriaSlurry, barc, parallelBeamStation, verticalFurnace, pulseReversePlating, shieldKit): 41 items. 168/168; screens 28/28; bot clean.
  **Waiting on physics-reviewer** (the review run hit the session limit; rerun after the reset).
  Open for David:
  1. ceriaSlurry is NMOS-only (when siliconFrontEnd) but the shop sells it on the Cu line, where it does nothing (seed 123456 corridor 0). This breaks the shop lesson. Hold it back, or have the shop check an item's `when` (engine, NEEDS NEW LOGIC)?
  2. Unlocks: ceriaSlurry from fm_dishing (a Cu sig); barc from fm_dose_offset (a reflection CD swing may need its own failure mode).
  3. NMOS step 6 (CMP) must add dishing and particles for the slurry to act.
- 2026-10-25: physics-reviewer on batch 3. Fixed:
  - parallel beam: the cost is +3 min of beam current (implant tool health feeds nothing);
  - ceria: clumped particles scratch (ceria is not harder) and an additive mechanism for dishing;
  - furnace: the purge is the reason for the time, plus a gate-oxide reason and a simplification note;
  - shield kit: a PVD-only simplification note;
  - pulse reverse: seed dissolution risk in the tradeoff.
  168/168.
  Waiting on David:
  - A: default S/D tilt (parallel beam alone vs. strengthening tilt);
  - B: BARC as a new swing-curve pattern (a 3rd new pattern) or ×0.85;
  - C: an STI dishing failure mode for the slurry;
  - D: the furnace's gate_oxide/qtime cut;
  - E: the shield kit at CVD visits;
  - F: pulse reverse with the additive bath;
  - plus the ceria shop question.
- David's rulings on batch 3:
  - BARC ×0.85, with a note that it doesn't fix dose or focus errors (a swing-curve pattern is for later);
  - ceria slurry held back (entry saved below);
  - default S/D tilt is about 7°, so the parallel beam stands alone;
  - furnace qtime ×0.85, gate_oxide ×0.95;
  - shield kit at CVD visits is OK;
  - pulse + additive bath on NEEDS NEW LOGIC.
  **Item 1 content total: 39 items** (started at 23, not 24: 4 materials). 168/168.
  - Open for David: with a 7° default, the tiltedImplant card's name and note ("tilting about 7 degrees") describe the default. It should become a larger-tilt or quad-rotation card (its DOE version already says "larger tilt").
  - Ruled: the card becomes 'Larger-tilt implant' (two rotations); its DOE version tunes the twist against planar channeling (four rotations). Effects unchanged.
- 2026-10-25: item 1 rebased on main (events), 178/178, screens 32/32, bot seeds 1/17/123456 clean. PR #16 opened.
- David, item 2: NMOS is 13 steps (clean, pad oxide + SiN, litho active, trench etch, fill + CMP stop on SiN, SiN strip + pre-gate clean (Q-time), gate oxidation, poly dep, litho gate, gate etch, S/D implant, anneal, test). Contacts and metal 1 are left out. Start after #16 merges. Then update the 'NMOS step N' comments in content.js to the 13-step numbers.
- 2026-10-25 23:50: main moved (#17 ship report, #18 diagnose). I merged main into lane-c (a merge, not a rebase: main's new failure-mode names conflicted in many commits).
  - Lane C's 6 new failure modes got names.
  - The 4 NMOS failure modes got `when: { lot: 'siliconFrontEnd' }`, because the diagnose screen counts every failure mode on a big-loss pattern as right. Without it, fm_gate_punch and fm_gate_native_oxide would be right answers on Cu runs and unlock NMOS cards.
  - Checked over 400 finished Cu runs: 0 NMOS right answers.
  - 197/197; screens 40/40; bot clean.
  - For David: fm_dose_offset has no `when`, so it is right in 314/400 Cu runs (cd_error is on every lot). Main gave fm_ped_ttop a cause `when` for the same reason. Should dose offset need a cause too (e.g. litho drift)?

### Held back: ceriaSlurry (add back when the shop checks an item's `when`)
Also needs: an `fm_sti_dishing` failure mode (field-oxide step height, thinning in wide isolation areas, edge leakage at the active areas) to unlock it; the `dishing` pattern text made not metal-only; and NMOS step 6 adding dishing and particles.
```js
  { id: 'ceriaSlurry', draft: true, kind: 'material', slot: 'slurry', room: 'cmp', rarity: 'advanced',
    name: 'SiN-selective ceria-type slurry', unlockedBy: 'fm_dishing',
    cost: { cash: 120 }, shelfLife: 5,
    // Only meaningful on the NMOS oxide polish that stops on SiN (step 6). On copper it does nothing, so the whole item is NMOS-only.
    when: { lot: 'siliconFrontEnd' },
    effects: [
      { op: 'defectMult', pattern: 'dishing', mult: 0.6 },
      { op: 'defectMult', pattern: 'particles', mult: 1.4 },
      { op: 'timeCost', delta: 2 },
    ],
    tradeoff: 'The polish stops cleanly on the nitride, so wide oxide areas dish less, but clumped ceria particles scratch, and ceria sticks to the oxide and needs a longer post-polish clean.',
    physicsNote: 'Ceria-based slurry removes silicon dioxide much faster than silicon nitride (high selectivity), so once the nitride is exposed the removal rate drops and the polish self-stops, cutting the over-polish needed. Its additives also make the rate fall where local pressure is low, so recessed oxide in wide trenches polishes slowly and dishes less. Clumped (agglomerated) particles scratch, and ceria bonds to oxide, so the clean afterwards takes longer.' },
```

## Result
- (open)
