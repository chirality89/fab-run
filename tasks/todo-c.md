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

## Result
- (open)
