# Fab Run — Task Tracker

Finished plans (M0 to M4.5 item 4) are in `docs/archive/todo-done.md`. The current plan is `tasks/plan-winnable.md`. Test comments that say "hand check in tasks/todo.md" point there.

## Current work

### Task: etch is too punishing on the first run (David's playtest, 29 Oct 2026) — DONE, David chose a quarter
**Finding (seeds 1–100, idle, points lost per room):** clean 4.7, dep 3.7, litho 6.1, **etch 13.5**, clean 4.6, dep 5.4, plate 4.9, cmp 5.8. Etch by pattern: residue 5.3, depth variation 4.4, underlayer attack 1.7, edge ring 1.6, particles 0.6. The smart bot with the starter deck still loses 11.7 points in etch (of 33.0 total); every etch remedy (etch stop, endpoint detector, e-chuck) is unlocked by the notebook, so a first run has almost nothing to spend on it.
**David's choice:** cut etch's base risks, balance only.
**Proposal (scratch-tested, 60 seeds, nothing edited in the repo):** in `lotTypes.js`, etch step adds residue 0.028 → 0.019, underlayer attack 0.021 → 0.014, edge ring 0.021 → 0.014; start risk depth variation 0.056 → 0.038 (about a third each; particles and dishing unchanged). Then the spec goes back from 68% to 70% (the original), because lots end about 3 points higher. Exit-check: idle 5%, random 5%, casual 33%, smart 53% ship, full-deck smart 98%, every target passes. (Spec 68% with the cut makes idle 8%, random 12%, casual 45%: too easy. Spec 72% drops smart to 37%.)
**David's answer: a quarter, not a third.** Applied: residue 0.021, underlayer attack 0.016, edge ring 0.016, depth variation 0.042 (the quarter version, tested the same way: no target fails at spec 70%); spec back to 70%. Result, `exit-check` seeds 1–100, all 7 targets PASS: starter idle 5% ship (mean 52.8), random 4% (54.7), casual 29% (65.0), smart 50% (68.5), smart beats idle by 15.7 points; full-deck smart 98% (81.6), 28.8 points over idle. 27 tests moved; every new value came from `etchmodel.py`-style independent python model that first reproduced every old value (idle 0.701678, forecast 11.8893, stop 7.7630 / 0.881240, over-etch on a stop 6.0471 / 0.898399, detector 0.854045, route-only 0.690471, drift 13.7950 / 2.0380 / 0.6158). New values: idle run 0.723578 (ships at 70%); etch forecast 9.2677, over-etch 9.3802, after etch 0.866193 / 0.865068; stop 6.0742 / 0.898128, stop + over-etch 4.7660 / 0.911209; detector 0.877082; route-only 0.754274 / 0.734732 / 0.698025 / 0.712021; health-60 etch 11.2329 / 2.0689 / 0.6252; DOE ratio 1.002403. One value (drift share 0.522179) sits between the exact 0.522180 and the engine's erf approximation 0.5221785.
**Tests that moved (was "Tests that move"):** the idle-run and etch values in `lot`, `lotTypes`, `run`, `events`, `tools`, `doe`, `resolve`, `view`; the 68% view tests go back to 70. Every new value would be computed by the independent python model first and listed here for David before any test is edited.

### Next stage plan (rev. 3, 29 Oct 2026): David OK'd ("go ahead")
**Goal:** a build David can hand to 2–3 real people. They should be able to ship a lot and say why they lost one. NMOS is now on `main` but can't be played on screen yet. Modifiers and choosing a lot type wait for M5.

**Already done (29 Oct 2026):**
- The radial gas-flow trim is on `main` (PR #30).
- PR #26 (NMOS) is merged. `main` was merged into it, keeping its `copperLine` trait and main's smaller Cu-line risks. Checks on the merged code:
  - `npm test`: 282 pass.
  - `npm run screens`: 78 pass.
  - `exit-check`, seeds 1–40: all 7 targets pass. Smart beats idle by 15.8 points on the starter deck.

**David's answers (29 Oct 2026):**
- Keep the trim.
- Reword `oesEndpoint`, and add a depth-variation failure mode.
- The Words page comes first.
- Defer the round wafer map to M6.
- Merge NMOS (done).
- Idea for later: a diffusion (furnace) step after the first wet clean.

**Order (one item per session, each planned in this file first):**
0. **Housekeeping (small).**
   - PR #27 (setup tidy: hooks, agent models): bring it up to date with `main`, run the tests, and ask David before merging. It changes how sessions run.
   - PR #21 (native-oxide label): check whether `main` already has it. If so, close it with a note. If not, merge it.
1. **Words page** (`src/content/glossary.js`, data only, plus a page opened like the Notebook).
   - About 15 terms: lot, wafer, site, yield, spec, scrap line, PM, SPC, drift, DOE, CD, CMP, Q-time, metrology, failure mode.
   - Each term gets one plain sentence and one "in the game" sentence.
   - Underlined game words in room text open the term. This is a small UI change. No engine change.
   - `content-drafter` drafts the entries, `physics-reviewer` checks them, then David.
   - Tests: every term has both sentences; the page opens and closes on a 375 px phone.
2. **Diagnosis you can read off the screen** (M4.5 issue 2, part 2).
   - Failure-mode signatures name only evidence the screen shows. Today keyhole void, dishing and underlayer attack cite line widths and cross-sections that nothing displays. Either reword them to the wafer map, SPC and metrology the game has, or add a simple cross-section card (I'll ask before any UI beyond text).
   - **New failure mode for depth variation**, for example "etch-rate center-to-edge nonuniformity". Its signature is a center-to-edge ring pattern on the map plus the etch SPC. It unlocks the gas-flow trim's stronger relatives or the endpoint detector.
   - **Reword `oesEndpoint`.** An endpoint signal stops the etch when the film clears. It fixes the mean depth from wafer to wafer and run to run, not the center-to-edge spread. Proposed: keep its number, re-aim it at the mean-depth part (residue and underlayer attack from over- or under-etch), and drop or shrink its depth_variation cut. Numbers are David's call. `physics-reviewer` checks it.
   - A right diagnosis unlocks something the player doesn't already own, with a short "what to do instead".
   - Test: the evidence each failure mode's signature names appears on a screen.
3. **Phone layout and run-ending buttons** (issues 8, 17), plus the small fixes still open (9, 10, 13, 14, 15, 16).
   - Move Scrap and Replay away from the main button.
   - Make the PM buttons look different from each other.
   - Keep the main button above the fold on a phone.
   - Screens only. Playwright at 375 px, checked by eye.
4. **Physics wording fixes** David decided on 26 Oct:
   - Q-time as moisture uptake.
   - T-top only with a CAR resist.
   - Slurry "signed engineering deviation".
   - Audit "wet bench past its bath-change interval".
   - The gauge text.

   Data and text only; `physics-reviewer` checks them.
5. **Gate** (P5 of `tasks/plan-winnable.md`).
   - Run `playtester`, then the five `persona-*` agents on seeds 123456, 42 and 777.
   - Then 2–3 real people play one run each.
   - Pass is the exit test in `tasks/next-stages.md`.
6. **Then M5:**
   - Modifiers.
   - A random lot type.
   - NMOS playable on screen: `main.js` hardcodes `cuLine` today.
   - The NMOS questions still open in `tasks/todo-c.md`:
     - Is channeling_tail right for an n+ arsenic implant?
     - Should ceriaSlurry be sold on the Cu line?
     - Should fm_dose_offset need a cause?
     - Should the tilted-implant card be about a larger tilt?

**Later (not planned yet):**
- **A diffusion / furnace room** (David, 29 Oct). On the Cu line the route goes wet clean → oxide deposition. A thermal step after the first clean (oxidation, or a diffusion/anneal) would add a furnace room.
  - It needs a room color, art, practices, failure modes (for example oxide thickness drift across the boat, or particles from the tube), and route changes. Every do-nothing yield test would move.
  - NMOS already has gate oxidation and an anneal, which a furnace room could take over.
  - Plan it with M5 or M6, not before the gate.
- Round 21-site wafer map: M6.
- Item art, the inspect view and card motion: after M5.

**David's answers, round 2 (29 Oct 2026):**
- Go ahead.
- Move the endpoint detector's effect to residue and underlayer attack (item 2).
- The diffusion room goes in M5.
- David wants an NMOS build soon. David is playtesting with friends now, and wants another bot test soon.

**Order, revised for these answers:**
0. Housekeeping:
   - PR #21: merged.
   - PR #27: brought up to date with `main`. Its duplicate `tasks/done.md` is dropped, since `main` already has `docs/archive/todo-done.md`. `npm test` 282 pass. Waiting on David's OK to merge, because it turns on hooks and changes agent models.
1. Words page (below).
2. **NMOS you can play.** Choose the lot type when a new run starts (Cu line or NMOS), and accept `?lot=nmos` in the address.
   - Check that every NMOS room has a starter practice or runs by itself (the `skip.test.js` rule).
   - Run `exit-check` on NMOS.
   - If NMOS can't be won, or is won by doing nothing, bring David options. No tuning without his OK.
   - This item gets its own plan here first.
3. **Bot test:** `playtester`, then the five personas, on both lot types (seeds 123456, 42, 777). They write only `docs/playtest/`. I compare the results with Lane F's earlier reports.
4. Diagnosis you can read off the screen. This includes the depth-variation failure mode and the endpoint move.
5. Phone layout and run-ending buttons.
6. Physics wording fixes.
7. M5: modifiers, a random lot type, the diffusion room, an **e-test module** (David, 30 Oct), and the open NMOS questions.
   - E-test: electrical test of the finished lot (parametric test structures: threshold voltage, leakage, sheet and contact resistance). Today the last room on each route is metrology or "Electrical test" and runs by itself.
   - A real e-test module would give the diagnosis its strongest evidence: each failure mode shows a parametric signature (for example gate oxide breakdown, junction leakage, or line resistance from a void). It would also make the last room a decision: which structures to measure for the minutes.
   - Plan it with the diffusion room.

### Task: Words page (item 1), 29 Oct 2026: DONE on the branch
- [x] `src/content/glossary.js`: about 18 terms the screens use.
  - Each term has a `plain` sentence (what it is in a fab) and an `inGame` sentence (where you meet it here), plus `draft: true`.
  - Terms are not items, so they get no `tradeoff`.
  - Listed A to Z.
- [x] `src/ui/wordsPage.js`: the page, drawn like the Notebook, with Back returning to where the player was.
  - A **Words** button sits next to the Notebook button on the floor plan and the ship report, and in the room header. The room redraws from the run state, so the cards already played stay played.
- [x] Tests:
  - Every term has both sentences, no brand names, and the list is in A–Z order.
  - Screen: Words opens from the map, the room and the ship report; Back returns; the button is 44 px; phone 375 px.
- [x] `physics-reviewer` checks the sentences. David reviews them (`draft: true` until then).
- **Result:**
  - 20 terms (the reviewer added Die and Excursion).
  - The Words button is on the floor plan, every room, the room result and the ship report.
  - `npm test` 285 pass; `npm run screens` 84 pass. Phone shots checked.
  - Reviewer fixes applied: tool health is hidden and wears every visit; control limits mean an excursion; the map stacks all 25 wafers; spec also means the SPC spec lines.
- **Answered (David, 30 Oct):** "call it fab yield": the Spec entry now says the yield bar's mark is the fab yield target. Reviewer's question was: real customers rarely put a lot-yield number in their spec. They specify parametrics and reliability, and yield is mostly the fab's cost. Is "the customer's requirement the lot must meet" acceptable shorthand?
- **Left out for now:** tapping an underlined word in room text to open its term. The Words button gives the same help from every screen. Linking words inside card text needs the text split into pieces, which is a bigger UI change. Do it if playtesters still get stuck.

### Task: diffusion and implant tools and starter cards (30 Oct 2026, David: "yes those cards"): built
- [x] **Tool monitors** (`toolMonitors.js`):
  - Diffusion: monitor oxide thickness (furnace temperature drift), feeding `gate_oxide`. The anneal step names its own drift pattern, `junction_spread` (`driftPattern` in `lotTypes.js`): the same furnace, but no oxide is grown there.
  - Implant: monitor sheet resistance (beam-angle drift), feeding `channeling_tail`, which bites at the anneal.
- [x] **Two small engine changes, to keep the Cu line exactly as it was:**
  1. `tools.js`: diffusion and implant draw their starting health and SPC history from a generator of their own. Every seed keeps the tools, PM rolls and SPC points it had for the other rooms. Without this, the PM roll in the CMP hand check moved from 84 to 93.
  2. `run.js`: a route step may name `driftPattern`. That's 2 lines, plus a test that the pattern is real and its step realizes it.
- [x] **Starter cards**, each with a DOE version and cross-section art:
  - `chlorinatedOxidation` (diffusion): gate_oxide ×0.7, particles ×1.2, 60 cash.
  - `preAmorphizingImplant` (implant): channeling ×0.4, implant damage ×1.6, 40 cash. Damage is ×1.6, not the ×1.4 in the research table, so it breaks even on a centred beam and pays only when the beam-angle chart drifts.
- [x] The rinse card's text names both Q-time windows. It no longer says "barrier" on NMOS (playtest round 2).
- **Measured (NMOS, smart bot, seeds 1–30):**
  - Chlorinated oxidation is played in 23 of 30 lots: a real choice.
  - The pre-amorphizing implant is played in none. On a fixed scatter-free run it gains more than its cash in about half the seeds (median 0.43 points, max 5.9). The bot PMs the implant tool instead, because a PM costs 40 minutes and no cash, and minutes count for nothing yet. That's the next task.
- Tests: `npm test` 289 pass. The expected starter deck now lists the two new ids; they are never dealt on the Cu line, which has no diffusion or implant room.
- **Physics review (30 Oct 2026):** the implant monitor, the pre-amorphizing implant, the anneal's junction-spread drift and the art all pass. Applied: chlorine's downside is corroded gas lines and exhaust (not the quartzware), a stale sentence was removed, and the end-of-range note and the implant leakage wording were sharpened.
  - **Must-fix, for David:** the furnace monitor contradicts the evidence. `fm_gate_breakdown` says thickness and C-V are on target, but a temperature drift makes the oxide off target (and thicker, not thinner). Chlorine also doesn't fix a temperature drift.
  - The reviewer's fix: monitor **contamination** instead (mobile ion charge on a monitor C-V, one-sided). The tube and boat collect sodium and metals with use, and chlorine cleans exactly that.
  - The anneal's junction-spread drift would then need its own temperature monitor, or be dropped.
- **NMOS exit-check with the two new tools and cards (100 seeds):**

  | Deck | Policy | Ships | Mean yield |
  |---|---|---|---|
  | Starter | idle | 1% | 44.1 |
  | Starter | random | 2% | 51.8 |
  | Starter | casual | 30% | 63.9 |
  | Starter | smart | 49% | 67.7 |
  | Full | smart | **87%** | 74.2 |

  - Smart beats idle by 23.6 points on the starter deck.
  - **Six of seven targets pass. Full-deck smart ships 87%, against a target of at least 90%:** two more drifting tools add loss.
  - Not tuned yet. The furnace monitor may change (David's answer above), and making cash count rebalances everything, so tune once after both. Cu-line numbers are unchanged; the new tools draw from their own generator.
- `npm run screens`: 90 pass.

### Task: cash and cycle time count toward winning: BUILT 31 Oct 2026
**David's answers (31 Oct 2026):** contamination monitor for the furnace; cost per good die with cycle time folded in; shipping over the cost target is a loss; a replay may still earn a notebook entry (no change).

**Done:**
- [x] Furnace monitor is now mobile ion charge on a monitor C-V (one-sided, target 2, sigma 0.5 ×1e10/cm²). The anneal's drift feeds gate oxide too (a dirty tube contaminates at the anneal), and the anneal realizes gate oxide. The `driftPattern` engine field stays, unused for now. Physics review: see below.
- [x] `src/engine/cost.js`: lot cost = 2000 base + cash spent + cycle time × 2 per minute (`CYCLE_TIME_COST_PER_MINUTE`). The ship report's money math moved here from `shipView.js`.
- [x] A lot that meets the yield spec ships as `shipped` (a win) only if cost per good die ≤ its lot type's target (`COST_TARGET_PER_GOOD_DIE`: Cu line 6.00, NMOS 7.00); otherwise `shippedAtLoss`, "Shipped at a loss … Not a win."
  - One target did not fit both: NMOS has 13 rooms, so its cycle time is about 200 minutes against 130, and at 6.00 smart NMOS lots reached the spec in only 11 of 40.
- [x] The ship report's cost tile shows the breakdown and the target; "for reference only" is gone. DESIGN.md §12 updated.
- [x] "Cost per good die X (target Y)" in the map, room and result headers.
- [x] Bots score the margin to winning: final yield minus the higher of the yield spec and the yield the cost target needs, plus the old small cash tie-break.
  - A first try scored cost per good die alone: the bot sold yield for event cash, and 0 of 40 starter lots reached the spec.
  - A make-believe scrap scored a flat −1, so every option tied and the bot stopped saving lots going under (12% of NMOS smart lots scrapped). Now it scores its yield − 2.
- [x] `exit-check` counts wins, shows "at loss" and the mean cost per good die.
- Tests: `tests/cost.test.js` (new, hand-computed: 2266 ÷ 452.236 = 5.0107 ships; 800 cash spent → 6.7796 at a loss). The ship test "for reference only" was replaced: new text hand-computed (2000 + 300 + 0 × 2). `npm test` 296 pass; `npm run screens` 90 pass; phone shots checked.

**exit-check, 100 seeds:**

| Lot | Deck | Policy | Won | At loss | Rejected | Scrapped | Mean | Cost/die |
|---|---|---|---|---|---|---|---|---|
| Cu | starter | idle | 5 | 0 | 81 | 14 | 52.8 | 5.10 |
| Cu | starter | random | 0 | 3 | 86 | 11 | 54.8 | 6.49 |
| Cu | starter | casual | 25 | 3 | 71 | 1 | 64.8 | 5.80 |
| Cu | starter | smart | 48 | 1 | 51 | 0 | 68.4 | 5.72 |
| Cu | full | smart | 97 | 0 | 3 | 0 | 77.8 | 5.40 |
| NMOS | starter | idle | 1 | 0 | 50 | 49 | 44.2 | 5.45 |
| NMOS | starter | random | 0 | 2 | 83 | 15 | 52.2 | 7.86 |
| NMOS | starter | casual | 21 | 5 | 70 | 4 | 63.2 | 6.81 |
| NMOS | starter | smart | 49 | 0 | 46 | 5 | 67.6 | 6.54 |
| NMOS | full | smart | **82** | 0 | 15 | 3 | 73.0 | 6.45 |

- Cu line: all 7 targets pass.
- NMOS: 6 of 7. Full-deck smart wins 82% (target 90%); its misses are on yield, not cost. Not tuned: options for David.
- Pre-amorphizing implant: still played in 0 of 30 NMOS smart lots. The implant tool is PM'd in 18 of 30 instead; a PM still pays even at 80 in lot cost.

### (Plan as written, 30 Oct 2026)
**Today:**
- A lot wins by shipping at or above the 70% fab yield target.
- Cash only limits buying, and every run ends with more than 1,200 unspent.
- Cycle time is shown but never used.
- The ship report shows cost per good die "for reference only".
- So PMs, side stops and shopping cost nothing that matters, and events that trade yield for cash are traps (playtest round 2, issue 5).

**Proposal: one number, cost per good die, with cycle time inside it.**
- **Lot cost** = base cost (2,000) + cash spent + **cycle time × a carrying cost per minute** (for example 2 per minute, for the tool time and the money tied up while the lot waits). This is the fab's own measure of a lot.
- **Win** = the lot ships at or above the yield target **and** its cost per good die is at or under a **cost target**. Shipped but over the target reads "Shipped at a loss": not a win. A rejected or scrapped lot is a loss as before.
- **The ship report** shows both checks, yield and cost, each with its target, and drops "for reference only".
- **The yield bar stays the health bar.** A cost line goes in the header ("Cost so far … / target …") so spending is visible during the run.
- **The numbers** (cost target, cost per minute) are balance numbers in `balance.js`, set by measuring:
  - doing nothing should fail on yield;
  - good, frugal play should win about half the time;
  - "buy everything, PM everything" should often fail on cost.
- **The bots** score cost per good die, not yield plus a fixed cash value, and `exit-check` counts wins instead of ships. The targets stay the same.
- **Game rule 1 is unchanged**: a run still ends when the lot ships or is scrapped. Only what counts as winning changes.

**Simpler alternative:** lower the starting cash (for example 1,500 → 600), so cash competes without a new rule. Cycle time still wouldn't count.

**Questions for David:**
1. Is cost per good die with cycle time folded in the right measure, or should cycle time be its own target (for example a hot-lot deadline)?
2. When a lot ships over the cost target, is that a loss, or a "shipped, poor margin" grade that still counts?
3. Notebook farming: I read your "yes" as "a replay of the same seed may still earn the entry", so nothing changes. Say if you meant the other way.

### Task: NMOS you can play (item 2): built 30 Oct 2026
**David's answers (30 Oct 2026):**
- Cut risks (A).
- Research a few starter card options (below).
- The lot-type choice as planned.
- The Spec word means fab yield.
- Add an e-test module (M5).

**Done:**
- [x] **NMOS risks cut to 52%** of the drafted sizes, rounded to 3 decimals. 100 seeds:

  | Scale | Result |
  |---|---|
  | 50% | Casual ships 37%: too easy |
  | 55% | Smart ships 36%: too hard |
  | **52%** | Idle 3%, random 3%, casual 31%, smart 53% (beats idle by 20.6 points), full-deck smart 96% (27.4 points). Every target passes. |

  - The do-nothing test moved to 0.743044 / 0.706805 / 0.719851, computed first by hand. It was 0.565525 / 0.514917 / 0.533136.
  - `exit-check --lot nmos` is new; every lot type is held to the same targets.
- [x] **Lot type choice:**
  - `?lot=nmos` in the address.
  - At the door, "Run NMOS transistor instead" on the same seed.
  - The ship report has "New Inlaid Cu line lot" (a new seed).
  - The save holds the lot type (`SAVE_VERSION` 7).
  - The map header shows the lot's name.
  - The Q-time warning is the lot type's own (`qtimeNote`).
  - The floor plan grows to 5 rows.
- [x] Tests:
  - `npm test` 288 pass, including the NMOS save round trip, `parseLotType` and the NMOS Q-time text.
  - `npm run screens` 90 pass: the switch at the door, an NMOS reload, and a full NMOS walk to the ship report and back to the Cu line.
- [ ] Diffusion and implant starter cards: options below, waiting for David.

**The plan as approved:**
**What I found (29 Oct 2026, nothing edited yet):**
- **NMOS can't be won today.** Bot on 20 seeds with `lotTypeId: 'nmos'`:

  | Deck | Policy | Shipped | Mean yield |
  |---|---|---|---|
  | Starter | idle | 0 | 39.8 |
  | Starter | random | 0 | 44.0 |
  | Starter | casual | 0 | 47.6 |
  | Starter | smart | 0 | 49.8 |
  | Full | smart | 0 | 57.5 |

  Thirteen rooms lose about 60 points doing nothing; the nine Cu rooms lose about 47.
- **Points lost per NMOS room** (idle, seeds 1–100):

  | Step | Room | Points |
  |---|---|---|
  | 1 | Clean | 5.0 |
  | 2 | Pad oxide + SiN | 4.0 |
  | 3 | Litho active | 7.1 |
  | 4 | Isolation etch | 9.4 |
  | 5 | Fill + CMP | 9.6 |
  | 6 | Pre-gate clean | 4.3 |
  | 7 | Gate oxidation | 4.6 |
  | 8 | Poly dep | 3.0 |
  | 9 | Litho gate | 4.6 |
  | 10 | Gate etch | 5.6 |
  | 11 | Implant | 0.2 |
  | 12 | Anneal | 2.7 |
  | 13 | Test | 0.0 |

  Each room has about 1 point of handling particles plus tool drift. NMOS's own risks were never put through the ×0.7 pass the Cu line had.
- **Diffusion and implant have no starter practices** (`spikeAnneal`, `tiltedImplant` and `screenOxideImplant` are all unlocked by the notebook). Those three rooms would run by themselves.
- **The screen assumes the Cu line:**
  - `main.js` has `LOT_TYPE_ID = 'cuLine'`.
  - The map header says "Inlaid Cu line".
  - The floor-plan grid has room for 3 rows of bays (9 rooms); NMOS needs 5.
  - The save doesn't store the lot type.

**Steps:**
1. **Balance first (David chooses).** Options, each tested on 100 seeds against the same exit-check targets:
   - **A. Scale NMOS's own risks**, as the Cu line had. Same 70% spec. Fab realism is unchanged; only the sizes move.
   - **B. A spec for each lot type** (for example 55% for NMOS). A different product can have a different customer spec. Risks stay as drafted.
   - **C. A mix:** a smaller cut plus a slightly lower spec.

   I'd go with **A**: one spec is easier to learn, and the per-room table points at the CMP and isolation-etch losses. The numbers come to David before any change, and every test value that moves is computed first.
2. **Choosing the lot type.**
   - `?lot=nmos` in the address.
   - On the first floor plan, before Go, a "Lot type" choice (Cu line / NMOS).
   - On the ship report, "New seed" keeps the lot type, and a second button switches it.
   - The save stores `lotTypeId` (`SAVE_VERSION` 7).
   - The map header shows the lot type's own name.
3. **Floor plan for 13 rooms.** The grid grows to as many rows as the route needs. Checked at 375 px and 1280 px.
4. **A starter practice in diffusion or implant?** The rule from M4.5 is that every room has a starter practice or runs by itself. If David wants a decision there, `content-drafter` drafts one (for example a slower furnace ramp, or a screen oxide that costs time). Otherwise they join `ROOMS_THAT_RUN_THEMSELVES` for NMOS.
5. **Tests and bots.**
   - `exit-check --lot nmos` gets the same targets.
   - `skip.test.js` runs for each lot type.
   - The screen tests walk an NMOS lot to its ship report.
   - Persona bot test right after (item 3).
6. `physics-reviewer` on any content change, then close as usual.

**Questions for David:**
1. Balance: A, B or C?
2. Diffusion and implant: add one starter practice each, or let them run by themselves?
3. Should the default lot stay the Cu line, with NMOS chosen on the first screen?

### Starter card options for the diffusion and implant rooms (research for David, 30 Oct 2026)
**What makes a card a decision here.** The diffusion and implant rooms have no tool monitor (`toolMonitors.js`), so no SPC chart and no drift. Their risks are the same size on every NMOS lot. A starter card there would then be worth the same on every lot: the bot either always plays it or never does. That's the 29 Oct lesson, "a card that costs only minutes is always played". A card becomes a decision when what it's worth changes from lot to lot, and the screen shows the change. Two data-only ways to get there:
- **Give each room a monitored tool** (data in `toolMonitors.js`, no engine change). Each gets an SPC chart and drift, like the Cu rooms.
  - Diffusion: a monitor oxide thickness from the furnace's temperature control, feeding `gate_oxide`.
  - Implant: a sheet-resistance monitor that tracks beam-angle drift, feeding `channeling_tail`. A tilted beam lines up with crystal channels.
  - A card that counters the drift but costs something else is then worth playing only when the chart says so.
  - This also adds drift loss to NMOS, so balance gets measured again.
- **Tie a card to something the player chose.** For example, a card that only pays off if the lot waited in the Q-time corridor before gate oxidation.

**Options (numbers are first guesses; nothing added yet):**

| # | Room | Card | Effect | Cost (the tradeoff) | When it's worth it |
|---|---|---|---|---|---|
| D1 | Diffusion (gate oxidation) | Chlorinated dry oxidation | gate_oxide ×0.7 | particles ×1.2 | When the furnace chart drifts (needs the monitor). Chlorine ties up mobile ions such as sodium in the oxide, but corrodes the tube and boat, which sheds particles. |
| D2 | Diffusion (gate oxidation) | Low-temperature load, nitrogen push | qtime_oxide ×0.5 | cash 30 (tube time) | Only after a long wait in the Q-time corridor. Loading cool in nitrogen stops uncontrolled native oxide growing during the push. |
| D3 | Diffusion (anneal) | Lower-temperature, longer anneal | junction_spread ×0.6 | implant_damage ×1.4 | A straight swap between the two anneal failure modes. It's a real choice only if one of them varies from lot to lot (an implant monitor, or M5 modifiers). |
| I1 | Implant | Pre-amorphizing implant | channeling_tail ×0.4 | implant_damage ×1.4 | When the beam-angle chart drifts (needs the monitor). An amorphous layer has no channels, but the extra implant leaves end-of-range defects the anneal must repair. |
| I2 | Implant | Chilled platen | implant_damage ×0.75 | cash 40 | A warm wafer anneals some damage during the implant but also spreads the dopant. Cooling keeps the damage simple to repair. It always helps a little, so it's routine unless damage varies. |

**My recommendation:**
- Add the two tool monitors.
- Starter cards **D1** (chlorinated oxidation) and **I1** (pre-amorphizing implant). Each counters its room's drift at a real cost, so the SPC chart decides when to play it, as on the Cu line.
- D2 is a good second card, since it rewards reading the Q-time warning. It can come later.
- Then measure NMOS again.
- `physics-reviewer` checks the wording before anything is added.

### Task: M4.5 "A real decision in every room" (issue 3), plan approved 28 Oct 2026
Most of it was already built on `claude/winnable-p0-p1` (P1 bots, P2 starter practices and skipped rooms); this session brings that in and closes the gaps.
- [x] 1. Fast-forward this branch to `claude/winnable-p0-p1`; plan copied here
- [x] 2. Check: `npm test` 278 pass, `npm run screens` 78 pass (plating and etch phone shots look right), `exit-check` 100 seeds all PASS, no `Math.random`
- [x] 3. Fair smart bot: side-stop kinds and PM choices are scored on 4 imagined runs with made-up dice (`tools/smartBot.js` `IMAGINED_SEEDS`), so it no longer sees a stop's contents or a PM's roll before choosing. (Correction to the plan: drift was not a leak; wear is a fixed amount per lot and scatter is off in the make-believe runs.)
- [x] 4. exit-check target added (`minStarterSpreadPoints: 10`). **It fails: 8.5 points** (seeds 1–100). Waiting for David's choice of lever; nothing tuned.
- [x] 5. Test in `tests/skip.test.js`: with the starter deck, every Cu-line room deals a playable practice except metrology (`ROOMS_THAT_RUN_THEMSELVES`). Checked it fails if CMP's card is taken out.
- [x] 6. David's calls: `doseTrimSpc` stays a placeholder; `chamberPurge` ×1.1 fair; over-etch ×2 with the physics review's fixes; pre-wet and pad conditioning become route steps; balance option A (spec 0.68, `STARTING_HEALTH_MIN` 38, loosened idle/random/casual targets)
- [x] 7. Checks done by hand (npm test 280 pass, npm run screens 78 pass, screenshots looked at, exit-check 100 seeds all PASS); lessons added; ROADMAP ticked. PR: ask David (check together with PR #26 first)

**Decisions settled:** none open for this item (Q2 "both", 26 Oct).
**David, 28 Oct 2026:** (1) first-run gap: try A first (starter cards with a visible downside). (2) `doseTrimSpc` stays as a placeholder. (3) `chamberPurge` particles ×1.1 is fair. (5) exit-check targets approved. (6) slow bots on fewer seeds (done: casual and smart 1–5 per deck, the beats-idle checks on 10 seeds; `npm test` about 40 s). (4) `waferPrewet` bubble-void cause: not answered, left for later.

**Acceptance criteria:**
- `npm test`, `npm run screens` pass; bots have no NaN/Infinity
- `exit-check --seeds 100` all PASS, or David has options
- Smart (no peeking, starter deck) beats idle by over 10 points, or David has decided what to change
- A test proves every process room has a decision or runs itself

**Progress notes:**
- 29 Oct 2026, David: apply over-etch ×2 with the physics review's fixes (stop-case tradeoff wording, physicsNote line, DOE version ×1.85/×0.568 plus a "pays only when drifted" line); pre-wet and pad conditioning become route steps (plating: void ×0.8, particles ×1.1; CMP: rr_drift ×0.8), not cards. Built, then kept as `tasks/m45-overetch-and-route-steps.patch` (not applied) because of the balance below. The skip test's rooms that run by themselves become plating, CMP and metrology.
- **Exit-check with that patch (100 seeds):** starter idle 62.0 (2 ship), random 60.6 (0), casual 66.9 (12), smart 68.9 (26); full smart 82.6 (100). Fails: idle ships 2%, smart starter 26%, gap 6.8 points. The idle run on seed 123456 (scatter off) rises 0.690471 → 0.701678, above the 70% spec; 13 tests move (the 7 over-etch ones plus idle-run values in `run.test.js`, `events.test.js`, `tools.test.js`, `doe.test.js` and the skip test).
- **Balance experiments on top of the patch (40 seeds, scratch copies, nothing committed):** stronger drift (`HEALTH_PER_SIGMA` 20 → 15 or 12, or `STARTING_HEALTH_MIN` 50 → 35) widens the gap to 16–20 points and stops idle shipping, but smart starter ships only 5–13%. With a spec cut too (`HEALTH_PER_SIGMA` 17 + spec 0.68): idle 5%, random 8%, casual 33%, smart 60%, gap about 13 points. Every mix leaves idle shipping on a few seeds: when the tools start healthy there is nothing to fix, so doing nothing is nearly as good as good play (best idle about 69%, best smart about 71.6%).
- 29 Oct 2026, option A (card numbers only, David's choice): rinse (second clean) and purge already lose on a quiet chart and win on a flagged one. Over-etch at underlayer ×2.0 (×0.525 on a stop, still ×1.05) does the same: quiet median −0.03 (loses in 24 of 41), flagged +0.67. Pre-wet and pad conditioning have no honest yield downside big enough (their side effect acts on a 0.007 particle risk), so they stay "always play". **Exit-check, 100 seeds, with over-etch ×2:** starter idle 61.1 (0 ship), random 60.9 (0), casual 67.2 (10), smart 68.9 (26); full smart 82.4 (100). Two targets now fail: smart starter ships 26% (target 40–75%) and beats idle by 7.8 (target over 10). Not applied: the change is in `tasks/a-overetch-x2.patch`, `content.js` restored. If applied, 7 tests move (old → new, checked by an independent Python model that first reproduced every old value): underlayer 0.15 → 0.2 and 0.105 unchanged (`resolve.test.js`); 0.0315 → 0.042 (`run.test.js`); etch forecast after over-etch 11.1214 → 12.0068 points (`view.test.js`; the test name "drops from 11.9 to 11.1" becomes "rises from 11.9 to 12.0"); yield after etch 0.847656 / 84.8% → 0.838802 / 83.9%, 11.1 → 12.0 points; card line 0.7679 → −0.1175, "About 0.8 points less lost" → "About 0.1 points more lost"; drift share 0.6189 → 0.6158; two effect texts ×1.5/×0.7 → ×2/×0.525. Physics review: ×2 PASS; fix the tradeoff for the stop case; the DOE version (×1.75) always pays, so try ×1.85/×0.568; ASK DAVID whether attack should grow faster than linearly with over-etch time.
- 28 Oct 2026, card values (seeds 1–60, starter deck, walking straight on, yield points gained by playing the card, by whether the room's SPC chart flags a rule): chamberPurge flagged median +0.47 / quiet −0.01; extraDiRinse +0.56 / +0.11; doseTrimSpc +0.65 / +0.28; padBreakIn +0.63 / +0.38; timedOveretch +1.30 / +0.63; waferPrewet +0.96 / +0.70. A flagged chart roughly doubles a card's worth, but only chamberPurge and extraDiRinse can lose. The others never do, because one card per room means their minutes are free.
- 28 Oct 2026, step 4 finding (seeds 1–30, starter deck): the smart bot plays `extraDiRinse`, `doseTrimSpc`, `timedOveretch`, `waferPrewet` and `padBreakIn` in **30 of 30** lots, and `chamberPurge` in 1 of 30. It never buys from the shop and takes a PM at almost every corridor. So with the starter deck, 5 of the 6 cards are "always play" (no real decision), and `chamberPurge` is almost never worth it. Points still lost with smart play: particles 6.0, depth variation 5.0, dishing 4.0, void 3.6, underlayer attack 2.9, Q-time 2.3, CD error 2.0.
- 28 Oct 2026, step 3: the old bot changed its stop choice in 17 of 240 corridors (seeds 1–30) when only the hidden dice changed; the fair bot in 0 of 240. The new test fails on the old bot and passes on the new one. Peeking was worth almost nothing: exit-check 100 seeds, smart/starter 69.6 → 69.5 (49 ship both), casual 68.2 → 67.7 (20 → 19), smart/full 82.4 (100). Cost: `npm test` went from about 15 s to about 78 s.
- 28 Oct 2026, step 2: exit-check 100 seeds (before step 3): starter idle 61.1 (0 ship), random 61.5 (3), casual 68.2 (20), smart 69.6 (49); full smart 82.4 (100).
- 28 Oct 2026: before this session, exit-check on seeds 1–40: starter idle 61.1, random 60.2, casual 67.9, smart 69.6 (22/40 ship); full smart 82.6 (40/40).

**Result:** 29 Oct 2026. `npm run exit-check -- --seeds 100`, all 7 targets PASS: starter idle 5% ship (mean 51.3), random 3% (53.0), casual 26% (63.3), smart 48% (66.4), smart beats idle by 15.2 points; full deck smart 99% (80.5), 29.2 points over idle. Moved test values were checked by an independent python model of the route and the etch room (each first reproduced the old values): idle run 0.690471 → 0.701678 (shipped at spec 0.68, drift off); over-etch values as in the progress note above; DOE ratio 1.005264 → 1.003155 (by hand, e^0.00315); spec 70 → 68 in the view tests.

P0 and P1 of `tasks/plan-winnable.md` (branch `claude/winnable-p0-p1`):

- [x] P0: check the lane work is on `main`, tick the roadmap box, archive the finished sections of this file
- [x] P1: `smart` and `casual` bot policies (`tools/smartBot.js`, wired into `tools/bot.js`), and `npm run exit-check` (`tools/exit-check.js`), with tests in `tests/bot.test.js`

### P4 diagnosis explains itself (28 Oct 2026)

- [x] Wrong choices now come only from causes that could have been there: the pattern is on the route and the mode's `when` holds (`notebook.js`). The old fallback to off-route modes is gone.
- [x] Each step now records `lostAfter` (yield lost per pattern so far). `stepsThatLost()` turns that into "which step cost how many points". Saves replay actions, so no save bump.
- [x] After a guess, right or wrong, the Diagnose panel adds a line: where the yield went, and how to spot that failure mode (its signature).
- [ ] Still open: signatures that can be read from the screen (keyhole void, dishing, underlayer attack) need `content-drafter` and `physics-reviewer`; the wafer map and cross-section may need hints. Not started.

### P1 result (28 Oct 2026, seeds 1 to 30)

| Deck | idle | random | casual | smart |
|---|---|---|---|---|
| starter (what a new player has) | 0 ship, mean 52.2 | 0 ship, 51.6 | 0 ship, 57.2 | 0 ship, 58.1 (best 60.5) |
| full (every card) | 0 ship, 52.3 | 5 ship, 62.8 | 16 ship, 70.5 | 30 ship, 75.9 |

- **The starter deck is the blocker.** With every card, good play ships every lot and a casual player about half. With the starter deck even perfect play tops out near 60%. This confirms P2 (starter practices in every room) is the next job, before any balance pass.
- The smart bot knows the whole route (see the top of `tools/smartBot.js`), so it is an upper bound, not a first-time player.
- Decision for David: `exit-check` targets (idle 0%, random under 15%, smart 60-80% ship, smart beats idle by over 10 points) are in `tools/exit-check.js` `TARGETS`. Change them there.
- `npm test` now takes about 10 seconds instead of 1, because the smart bots try every option on copies of the run.

### P2 status (28 Oct 2026)

- [x] 2b (committed): a room with nothing to play runs on its own; the greyed-out Strip and re-expose says what it needs. Tests in `tests/skip.test.js`.
- [x] 2a (committed 28 Oct 2026; David approved the 7 unit-test edits; `npm test` 273 pass. The `doe.test.js` checks now use a fixed 2-card deck so their hand-computed values are unchanged, plus one new test for the real starter deck's offers): five starter practices `extraDiRinse`, `chamberPurge` (now "Pump-purge cycles before the run"), `doseTrimSpc`, `waferPrewet`, `padBreakIn` (now "Condition the pad before the lot"), with art in `src/art/sections/`. The physics review's wording and art fixes are applied. Open items:
  1. **7 old tests** hold the old 2-card starter deck: `run.test.js` "createRun defaults" (deck becomes the 7 starter cards) and "strip and re-expose is never legal yet" (hand `['reworkLitho','doseTrimSpc']`, legal `['doseTrimSpc']`); `doe.test.js` offers become `['reworkLitho','chamberPurge']`, and the 4 DOE tests that upgrade `timedOveretch` need `upgraded: ['timedOveretch']` set in the test state. No hand-computed yield value changes.
  2. **`doseTrimSpc`**: its flat cd_error ×0.8 also cuts the base scatter, which teaches the opposite of its own note (physics review). Keep out of the starter deck until an effect that acts only on drift exists (NEEDS NEW LOGIC), or accept it as a placeholder? Also: ×0.8 stacks with `sendAheadWafer` ×0.5 to ×0.4.
  3. **`chamberPurge`**: is particles ×1.1 a fair side effect?
  4. **`waferPrewet`**: reworded to the mechanism the model has (late bottom-up fill). Add a separate bubble-void cause later?
  5. **Balance**: with the 5 starter cards the smart bot's best starter-deck run is 63.4% (spec 70%); mean 60.2% (was 58.1%). Options for P3: first run is a hard learning run; or move the balance levers; or both (recommended).

## NEEDS NEW LOGIC

Content in `src/content/content.js` that needs engine behavior beyond the eight effect operations:

- `when: { lot: 'tightCD' | 'deepEtch' | 'narrowFeatures' }`: lot-type properties, set in `lotTypes.js` (M1)
- `when: { lot: 'delayBeforeBake' }`: needs a timer between the litho expose and bake practices
- `when: { lot: 'lastStepWasLitho' }`: needs route history in the lot state. Until then the condition never holds, so `reworkLitho` can never be played (needs a greyed-out reason message)
- A drift-only `defectMult` (or `when: { toolShifted: room }`): so `doseTrimSpc` can act only on the part of cd_error that comes from a shifted tool, not on base scatter (physics review, 28 Oct 2026)
- `when: { lot: 'rightPartChosen' }` and `needsTarget: 'faultType'`: the spare part asks the player to pick a fault
- `resets: { slot, field, fraction }`: fresh resist and bath analysis reset a material's shelf life or decay
- `limit: { perLayer: 1 }`: strip and re-expose once per layer
- `shelfLife`: counts rooms visited; at 0 the material stops helping
- A card limited to one step of a room visited twice: `chlorinatedOxidation` is dealt at the NMOS anneal too, where it only adds particles (physics review, 30 Oct 2026). Needs `when: { step }`, or the screen saying "nothing to act on here".
- Dead cards: a practice whose target pattern was already realized earlier on the route (e.g. `etchStopLayer` at the second dep visit) should be greyed out or hidden
- Tool wear: tool health stays at 100 in run.js; no rule yet for how much a room wears its tool
- Consumables: no engine code plays them yet (the starter qual wafer and spare part, and the unlocked bath analysis, fresh resist, implant monitor and oxide monitor). They are left off the Notebook page's "Unlocks" until they can be used (David, 26 Oct 2026)

### Screen tests after P2 (28 Oct 2026): fixed, all pass

David approved the edits. The last room (metrology) now runs by itself, so specs no longer press Run there; `map.spec` checks the skipped note. The plating spec expects the starter practice `Wafer pre-wet`. The DOE spec uses seed 5, whose DOE stop offers the over-etch (seed 123456 now offers other cards). The skipped-room result screen was checked on a phone screenshot.

### P3 balance pass (David chose option 3, 28 Oct 2026: first run winnable but tight, unlocks give margin)

`tools/exit-check.js` now has these targets (numbers proposed by Claude, David to confirm): starter deck: idle 0%, random under 5%, casual under 25%, smart 40-75%; full deck: smart at least 90% and over 15 points above idle.

Measured on seeds 1 to 100 (mean yield %, share shipped at spec 70% / 62% / 60%):

| Policy / deck | mean | 70% | 62% | 60% |
|---|---|---|---|---|
| idle / starter | 52.1 | 0 | 0 | 0 |
| random / starter | 53.2 | 0 | 0 | 6 |
| casual / starter | 58.9 | 0 | 4 | 30 |
| smart / starter | 60.2 | 0 | 8 | 62 |
| casual / full | 72.3 | 71 | 97 | 100 |
| smart / full | 76.9 | 100 | 100 | 100 |

- Yield barely varies from seed to seed (about 2 points), so the ship rate flips from near 0 to near 100 across a 4-point change of spec: the outcome is decided by the build, not by luck.
- Where smart/starter still loses yield (points): particles 7.7, depth variation 6.8, dishing 5.1, void 4.6, underlayer attack 3.9. Starter cards act on one room each, so each can recover only about 1 point.
- Levers: (a) spec 70 down to about 61; (b) scale down the base risks in `lotTypes.js` by about 15% (particles 0.01, stack risks 0.08); (c) more scatter between seeds. (a) and (b) both move hand-computed tests in `view.test.js`, `run.test.js` and others; each would be recomputed by hand and shown to David first.

### P3 applied (28 Oct 2026)

David approved the recomputed test values. Applied: all base risks in `lotTypes.js` × 0.7 (`tasks/p3-test-changes.md`, `tasks/p3-risk70.patch`); 27 hand-computed tests recomputed from an independent Python model (it reproduced every old value first). Extra values checked the same way while editing: shop endpoint-detector yield 0.798418 → 0.854045 and 0.779789 → 0.839977 (the same 0.779789 → 0.839977 and 0.789992 → 0.847656 in the etch result test). The T-top test now adds 0.02 CD-error risk at the start so CD error still costs 3 points.

`npm run exit-check -- --seeds 100`: all six targets pass (idle 0%, random 3%, casual 20%, smart with starter deck 49%, smart with every card 100%, 21.4 points over idle).

Open for David: the exit-check targets are proposals (see `tools/exit-check.js`); P4 (diagnosis explains itself) and P5 (simulated and real playtests) are next.
