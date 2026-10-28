# Fab Run — Task Tracker

Open work only. Finished tasks (their plans, numbers and David's answers) are in `tasks/done.md`, newest first.

## M4.5 items 1 and 2 — land the pending lane work (item 1, waits for PR #23 to merge); remove the fixed etch and litho yield tax (item 2, DONE 26 Oct 2026)

**Status: David OK'd the plan and the test-value changes. Item 2 is built and verified: `npm test` 233/233, `npm run screens` 74/74, bot clean on 200 runs, `physics-reviewer` passed all four numbers. Item 1 is still to do.**

**Item 2 done:** the five numbers are in `lotTypes.js`, the 15 test values were updated to the hand-computed ones in the table below, and `SAVE_VERSION` is 3 (`fabrun.run.v3`). One value not in the table: `view.test.js` run-etch yield band went from `warn` to `ok`, because the lot is now at 78.0% after etch, above the 70% spec. The reviewer's comment fix is in.

**Open from the physics review (for David):** etch still shows about 0.19 landing (0.11 of its own + the latent depth variation 0.08 from the stack), against 0.04 at litho. That can teach "etch is the dirty step" when the cause is upstream. Either the etch screen labels it as carried in from the stack, or 0.08 gets a smaller size. Goes with the etch-stop item.

### M4.5 item 1 — bring Lane F's reports and Lane D's commit onto `main`

**What it is today**
- `main` has neither. Lane F's playtest work is on `claude/lane-f-playtesting-tsdjsm` (7 commits, 223 files, docs only plus five persona agent files). Lane D's one commit (the "about 1 nm" native-oxide label on the pre-clean art plus its tracker) is on `claude/lane-d-look-feel-64k6zr`.
- I test-merged both onto `main`: **no conflicts**. Neither touches `src/engine/` or the tests.
- `origin/lane-f` is an older, smaller copy of Lane F (3 commits, an earlier `drive.mjs`). The newer branch contains the same work, so it is stale.
- `lane-b`, `lane-c` and `model-routing` and `trim-project-md` have nothing that `main` lacks.

**What you'll see after this item**
- `docs/playtest/` on `main`: the five persona reports, the 15 run logs, `summary.md` (the ranked issues) and `physics-review.md`.
- The five `persona-*` agents in `.claude/agents/`, so Lane F can rerun them after M4.5.
- The native-oxide label in the pre-clean art.

**Steps**
- [ ] Wait for PR #23 to merge. Then restart my branch from the new `main` (the same branch name, as the session rules say for a merged PR).
- [ ] Merge the two lane branches into it as two merge commits, so each lane's history stays visible. No file edits.
- [ ] Run `npm test` and `npm run screens` on the result (Lane D's change is an SVG, so the screen tests prove the art still loads).
- [ ] Open one PR for David: "Land Lane F reports and Lane D label".
- [ ] Do **not** delete any branch. I list the stale ones (`lane-f`, `lane-b`, `lane-c`, `model-routing`, `trim-project-md`, `ccr-*`) and David decides.

**Why this order:** the lane branches only add files, so they cannot break PR #23 either way. But merging them into PR #23 would put 223 files in a PR meant to be read in ten minutes.

**Q1 (size).** `docs/playtest/` is about 13 MB, mostly 70 screenshots. The repo is public and GitHub Pages serves the whole repo. Options: A) keep them all (the evidence stays with the repo; Pages gets heavier); B) keep the reports and logs and leave the screenshots out of `main` (the reports still link them by name, so the links would break). I recommend **A**: 13 MB is small, and the summary's evidence lines point at those files.

### M4.5 item 2 — remove the fixed etch and litho yield tax

**What it is today** (from `src/content/lotTypes.js` and Lane F's `physics-review.md` claim 8)
- Every lot pays a fixed risk at etch, whatever the player does: residue 0.10 + underlayer attack 0.05 + edge ring 0.05 + particles 0.01 = **0.21 now, plus the latent depth variation 0.08 = 0.29**. Yield is `e^−risk`, so that is about **25% of the lot** lost on a healthy etch.
- Litho adds a fixed `cd_error` 0.06 (about 6%), though the CD is centred.
- A do-nothing run on seed 123456: litho −7 points, **etch −22 points**. The best cards bring etch's exponent only to about 0.15, so every strategy lands within half a point of each other (Lane F issue 1).
- It also teaches something false: a well-centred timed etch already includes its over-etch, so large residue on a healthy tool is not physical (claim 8).
- The whole route's fixed risk adds to 0.67, i.e. **51% with no choices at all**. The spec is 70%, which is an exponent of 0.357 or less. So shrinking etch and litho alone is not enough to make the spec reachable, but it is the part that is unphysical, and it is the biggest single piece.

**The rule I will keep (CLAUDE.md §5 and §7):** only the placeholder risk sizes in `lotTypes.js` change. No physics rule, no effect operation and no content text changes. Tool health still adds drift risk exactly as today, so a worn etch tool costs more than a fresh one, which is what should decide the loss.

**Proposed new sizes (placeholders; I measure before settling)**

| Pattern at etch/litho | Now | Proposed | Reason |
|---|---|---|---|
| etch `residue` | 0.10 | 0.04 | A centred timed recipe clears the film; some residue remains in slow spots |
| etch `underlayer_attack` | 0.05 | 0.03 | Real, but small without over-etch (the etch-stop logic is item 3 of M4.5, not this item) |
| etch `edge_ring` | 0.05 | 0.03 | The starter set has no counter for it, so it should stay small |
| etch `particles`, latent `depth_variation` | 0.01, 0.08 | unchanged | Not part of claim 8's list; depth variation is shared with the etch-stop item |
| litho `cd_error` | 0.06 | 0.03 | The CD is centred; scatter, not a tax |

- Etch's fixed risk goes from 0.21 to 0.11, and litho's from 0.06 to 0.03. A do-nothing run's total fixed exponent goes from 0.67 to about 0.54, i.e. about **58%** instead of 51%, before drift.
- That is still below the 70% spec on purpose: after this item **do-nothing must fail** (exit test), and the cards must be what gets a lot over the line.

**Steps**
- [ ] First, measure, with a scratch script outside the repo: the per-step loss for the idle bot and for a "good play" script (the cards that already exist, a PM on a worn etch tool) on seeds 123456, 42 and 777, **before** the change. Write the numbers into this file.
- [ ] Change the five numbers in `lotTypes.js`. Update the comment above them.
- [ ] Measure again. If the best play ships below about 65% or above about 80%, or the best and worst strategies are less than 10 points apart, I adjust and tell you the numbers before settling. A strategy that is only 10 points apart because of the *other* rooms' fixed risks is reported, not hidden, and goes to the next items.
- [ ] Tests: `tests/run.test.js` lines 95–96 (residue 0.10, underlayer 0.05) and the `timedOveretch` test (line 115, residue 0.03) hold hand-computed values for these exact numbers. **CLAUDE.md §11 says never edit an expected value to make a test pass, so I will ask you before editing any of them.** I recompute each by hand from the new numbers and show you the old and new value side by side.
- [ ] `SAVE_VERSION` goes 2 → 3 (and the key to `fabrun.run.v3`), because an old save would replay to a different yield. The notebook is untouched (own key).
- [ ] The shop test seed (`tests/shopSeed.js`) and the screen tests that look at yield may move; their expected *items* stay the same, as before.
- [ ] `npm test`, `npm run screens` (phone tests with `--repeat-each=5`), and the bot on all three seeds.
- [ ] Update this tracker, the `ROADMAP.md` box, and a rule in `tasks/lessons.md` if anything surprises me.
- [ ] `physics-reviewer` checks the new sizes (a read-only pass), because the sizes are physical claims.

**What you'll see:** in the same run on seed 123456, etch costs about 10 points instead of 22, and litho about 3 instead of 7. The ship report's step breakdown shows it. A worn etch tool (red SPC flag) now visibly costs more than a fresh one.

**Answers (David, 26 Oct 2026):** Q1 keep all the screenshots; Q2 the numbers are fine (0.04 / 0.03 / 0.03 / 0.03); Q3 other rooms stay for now.

**Measured (scratch script, 200 seeds 1000–1199 plus seeds 123456 / 42 / 777). "Greedy" plays every legal card in every room, no side stops.**

| Play | Before | After |
|---|---|---|
| Do nothing (200 seeds, mean / best) | 46.4% / 54.1% | 52.7% / 61.0% |
| Do nothing, seeds 123456 / 42 / 777 | 51.8 / 47.9 / 50.6 | 58.5 / 54.8 / 57.3 |
| Greedy, starter deck (mean) | 48.9% | 53.8% |
| Greedy, full pool (mean, lots at or over 70%) | 62.0%, 2 of 200 | 67.0%, 53 of 200 |
| Random play, full pool (mean, lots at or over 70%) | 58.9%, 1 of 200 | 63.7%, 27 of 200 |

- Do-nothing still fails (best of 200 is 61%). The best and worst strategies are now about 14 points apart (52.7 vs 67.0), up from 0.7 to 3 points on the starter deck. **With the starter deck alone nothing reaches 70%** (best 62%), because the starter pool has almost no cards outside etch and litho. That is the "decision in every room" item, not this one.
- **Correction to the plan:** I wrote that etch would cost "about 10 points instead of 22". By hand it is **16.2 points** (from 22.9). Depth variation (0.08, latent, shared with the etch-stop item) and handling particles are still there. Litho goes from 7 to 3 points.

**Test values that change (hand-computed first, then checked against the engine).** I rebuilt the model by hand in a separate script. It gives the *old* numbers exactly (0.517954, 0.685321, 0.716865, 0.701607, 22.8610, 19.7066), so I trust it for the new ones.

| Test | Old expected | New expected | Hand working |
|---|---|---|---|
| lotTypes: idle route, centre / inner / outer sites | 0.588605 / 0.559898 / 0.492567 | 0.657047 / 0.625002 / 0.567295 | even exponent 0.42 (was 0.53); inner adds depth 0.08 × 0.625; outer adds depth 0.08 × 1.25 + edge ring 0.03 × 1.5625 |
| lotTypes, run, events, tools, run Q-time: whole idle yield | 0.517954 | 0.589352 | (1 × centre + 8 × inner + 16 × outer) / 25 |
| run: residue / underlayer attack on entering etch | 0.10 / 0.05 | 0.04 / 0.03 | the new sizes |
| run: after timed over-etch | residue 0.03, underlayer 0.075 | residue 0.012, underlayer 0.045 | ×0.3 and ×1.5 of the new sizes |
| doe: underlayer attack before playing | 0.05 | 0.03 | the new size |
| doe: DOE-centred over-etch yield ratio | × 1.012578 | × 1.007528 | e^(0.03 × (1.5 − 1.25)) |
| shop: yield after etch, with / without the detector | 0.701607 / 0.685321 | 0.798418 / 0.779789 | detector: depth 0.056 instead of 0.08 |
| view: yield on entering etch | 0.913931, shown 91.4 | 0.941765, shown 94.2 | e^(−0.06) |
| view: loss at etch, idle / after over-etch | 22.8610 / 19.7066 points (22.9 / 19.7) | 16.1976 / 15.1772 (16.2 / 15.2) | before minus after |
| view: yield after etch, idle / over-etch | 68.5% / 71.7% | 78.0% / 79.0% | 0.779789 / 0.789992 |
| events, tools: slurry / worn-CMP ratio | × 0.977312 | unchanged | only the idle yield beside it changes |
| run Q-time: ratio e^(−0.04) | 0.960789 | unchanged | unchanged |

**Q2 (the numbers).** Are 0.04 / 0.03 / 0.03 / 0.03 right, or do you want smaller (0.02 each) so that the tool state decides almost everything? This is your fab call.

**Q3 (other rooms).** Plating, CMP, barrier and strip also carry fixed risk (about 0.28 together). Lane F measured +11–15 points after etch with no decision. Do they stay for now (my proposal; the cards for those rooms come with the "decision in every room" item), or shrink in this same change?

---

## NEEDS NEW LOGIC

Content in `src/content/content.js` that needs engine behavior beyond the eight effect operations:

- `when: { lot: 'tightCD' | 'deepEtch' | 'narrowFeatures' }`: lot-type properties, set in `lotTypes.js` (M1)
- `when: { lot: 'delayBeforeBake' }`: needs a timer between the litho expose and bake practices
- `when: { lot: 'lastStepWasLitho' }`: needs route history in the lot state
- `when: { lot: 'rightPartChosen' }` and `needsTarget: 'faultType'`: the spare part asks the player to pick a fault
- `resets: { slot, field, fraction }`: fresh resist and bath analysis reset a material's shelf life or decay
- `limit: { perLayer: 1 }`: strip and re-expose once per layer
- `shelfLife`: counts rooms visited; at 0 the material stops helping
- Dead cards: a practice whose target pattern was already realized earlier on the route (e.g. `etchStopLayer` at the second dep visit) should be greyed out or hidden
- Tool wear: tool health stays at 100 in run.js; no rule yet for how much a room wears its tool
- Consumables: no engine code plays them yet (the starter qual wafer and spare part, and the unlocked bath analysis, fresh resist, implant monitor and oxide monitor). They are left off the Notebook page's "Unlocks" until they can be used (David, 26 Oct 2026)
