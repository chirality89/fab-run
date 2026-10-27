# Next stages and lanes (proposal, 26 Oct 2026)

**Status: all questions answered by David, 26 Oct 2026 (see "David's decisions" at the end). S1 is M4.5 in `ROADMAP.md`.**

## Where we are

- **M0–M4 are built.** PR #23 (Notebook page and the unlocked pool) finishes M4 and waits for review.
- **Not on `main` yet:** Lane F's playtest reports (`origin/claude/lane-f-playtesting-tsdjsm`, 7 commits, docs only) and one Lane D commit (`origin/claude/lane-d-look-feel-64k6zr`, the native-oxide label).
- **The game is not winnable yet.** Lane F's five simulated players, 15 runs, shipped **no lot**. Yields were 47.9–59.5% against a 70% spec, and every player quit at or just after etch. Three different strategies ended within half a point of each other. So the game has no real decisions on the first lot yet. Players also did not learn what hurt them.
- **NMOS is not built.** Lane C wrote the content, but `lotTypes.js` has only the Cu line.

## The main recommendation

**Put a stage before M5.** M5 adds modifiers, random lot types and NMOS. Each of those multiplies what the first lot already does. If the first lot is unwinnable and its choices don't move the result, M5 would stack variety on a base that isn't fun yet. So:

| Stage | What | Why now |
|---|---|---|
| **S0 Land the pending work** | Merge PR #23; bring Lane F's reports and Lane D's commit onto `main`; clear stale branches | Lanes start from one `main` |
| **S1 (new, "M4.5"): Winnable and readable** | Fix Lane F's top issues so the Cu line can be won and its failures can be read | Everything after depends on it |
| **S2 = M5** | Lot modifiers, random lot type, NMOS lot type | Needs the S1 balance and the S1 card rule |
| **S3 = rest of M6** | Room styling, item art, inspect view, card motion, phone pass | Item art wants content that has stopped changing |
| **S4 = M7** | 100-run bot report, 3 human playtests, share the link | Needs everything above |

## S1 in detail: what each lane takes

The numbers are Lane F's issue numbers from `docs/playtest/summary.md` and the reviewer's claim numbers from `docs/playtest/physics-review.md` (both on the Lane F branch).

**Lane A: run spine (engine, flow, screens, economy)**
1. **Lose the fixed etch and litho tax (issue 1, claim 8).** Etch always adds about 0.29 of fixed risk, about 25% of the lot, whatever the player does. Shrink the fixed amounts in `lotTypes.js` and let tool health and choices drive the loss. These are balance numbers, so this is allowed; the physics rules don't change (CLAUDE.md §7).
2. **Etch-stop logic (claim 11, needs new engine logic).** The route shows SiN but nothing sets the stop. Underlayer attack is always a "right" answer, and over-etch can't lower it. Plan it and ask first (CLAUDE.md §6).
3. **SPC flags that predict (issue 4).** Word the verdict by rule; a single spike is not a "shift". A flagged tool should cost more than an unflagged one.
4. **Show effects before you commit (issue 6).** Cards and shop items show their numbers.
5. **Placeholders that cost (issue 5).** The metrology stop charges 20 minutes and does nothing. Either build it or stop charging.
6. **Diagnosis explains itself (issue 2).** After a guess, say which step lost the lot and why. Offer only failure modes whose cause could have been there.
7. **Small fixes:** cash changes with a message (9), seeds that aren't numbers (15), wafer map rounding and its label (10, 13), a PM stop you can leave without a PM (8), shopping that makes the score worse (14).

**Lane C: content**
1. **A decision in every room (issue 3).** Today only etch and litho have a starter card, and "Strip and re-expose" never says why it can't be played. The starter pool needs real choices in more rooms. **This is a design call for David** (question 2).
2. **Signatures you can read on screen (issue 2, claims 2, 3, 11).** Rewrite the signatures that cite a cross-section or line widths that nothing shows, or ask Lane A for the evidence.
3. **Physics text fixes (claims 1, 4, 5, 6, 7).** Gauge, native-oxide mechanism, the DOE that only speeds sampling, the unqualified slurry, the audit. Several are ASK DAVID.
4. **Numbers with units, and a glossary (issues 10, 16).** Lot, PM, DOE, CMP, CD and SPC are never spelled out.

**Lane D: look and feel**
1. **Run-ending buttons away from the main button (issue 8).**
2. **Phone layout (issue 17).** The only button is often below the fold, and the PM screen is about four screens tall.
3. **Round wafer map (issue 13).** Waits on David's call on a 21-site round mask.

**Lane B: saves.** Done: it fixed Lane F's reload issue (7) and the notebook has its own key. It retires; small save changes go to Lane A.

**Lane F: playtesting.** After S1, **rerun the five personas** on the same seeds (123456, 42, 777) and compare. The exit test for S1 is below.

**Physics review (agent, not a lane)** reviews every Lane C batch and the etch-stop change.

## S2 (M5) in detail

- **Lane A:** lot modifiers announced at run start; a lot type drawn from the unlocked pool; a fixed first run (DESIGN.md §8). Lot types become data picked by id (`LOT_TYPE_ID` is a constant in `main.js` today).
- **Lane C:** the NMOS lot type and route (`lotTypes.js`, `docs/process-primer.md`), and the lot conditions its cards need (`thinGateOxide` and others on NEEDS NEW LOGIC).
- **Lane D:** a lot-type screen and the modifier banner.
- **Lane F:** NMOS personas.
- **Open decision:** where a new player's unlocks come from when only the Cu line exists. Which failure modes can a Cu-line lot never teach? (Today the DUV resist and fresh resist can never be unlocked.)

## S3 and S4

- **S3 (Lane D mostly):** room styling and animation, item art, inspect view, card motion, phone pass. Start item art after S2, so content isn't still moving.
- **S4:** the 100-run bot report. It needs a bot that plays with decisions, not only "idle" (it exists in `tools/bot.js`; check how smart it is). Then 3 human playtests and the link.

## Exit test for S1 (what "winnable and readable" means)

- At least **one of the five personas ships a lot** at or above 70%, on a seed it chose, by a path it can explain.
- The best and worst **strategies differ by more than 10 points**, not half a point.
- A do-nothing run **fails**, and a player can tell from the report why.
- Lane F's second pass finds **no player who guessed the diagnosis by elimination or by the red flag**.
- `npm test`, `npm run screens` and the bot pass on the merged result.

## How the lanes stay out of each other's way

Taken from what went wrong before (`tasks/lessons.md`):
- **One tracker per lane:** `tasks/todo-a.md` (the current `tasks/todo.md` becomes Lane A's), `todo-c.md`, `todo-d.md`, and so on. Only Lane A edits `ROADMAP.md` and `tasks/lessons.md`; other lanes put ticks and lessons at the bottom of their own tracker.
- **Files by lane:** A owns `src/engine/`, `src/ui/` (except `cards.css`), `balance.js`, `lotTypes.js`; C owns `src/content/content.js` and `events.js`; D owns `tokens.css`, `cards.css`, `src/art/`.
- **Merge rule:** before merging a second lane PR, merge both locally and run `npm test` and `npm run screens` on the result.
- **A rule for all content:** a new rule that covers all content (like "every practice has art") is announced to Lane C before it merges.
- **Parallel agents** only on independent content. Never two agents on one file.

## Questions for David

1. **Add S1 before M5?** I recommend yes. The alternative is to build M5 as written and fix balance in M7. That risks building NMOS, modifiers and item art on a lot nobody can win.
2. **The starter deck.** Only etch and litho have a starter practice, so most rooms deal nothing. Options:
   - A: give each room one or two simple starter practices (a real choice with a tradeoff in each room);
   - B: keep rooms without a decision, and make them quick (skip the hand screen when there is nothing to play);
   - C: both.
   Proposed: **C**, since rule 8 says cards only where there is a real decision.
3. **Lane E.** I found no record of what Lane E was. I propose **E = balance and the bot** (the M7 report, and re-tuning after S1), unless it meant something else.
4. **How many lanes at once?** Proposed for S1: **A, C and D in parallel, F after them, B retired**.
5. **Your calls from the physics review** that block Lane C: the circular CAR unlock (claim 2), the Q-time mechanism (4), the slurry and audit wording (6, 7), a trend rule for SPC (9), and a round 21-site mask (10).

## David's decisions (26 Oct 2026)

**Structure**
- Q1: S1 goes before M5 (now M4.5).
- Q2 starter deck: **both**. Most rooms get one simple starter practice with a real tradeoff, and a room with nothing to play skips the hand screen.
- Q3 Lane E: **dropped**. Balance and the bot stay in Lane A (M7 report).
- Q4 lanes: **A, C and D in parallel, then F**. B is retired; small save changes go to A. Before merging a second lane PR, merge both locally and run `npm test` and `npm run screens`.

**Physics calls (Lane F physics review)**
- Etch stop (claim 11): **the stop is a choice.** The route label becomes "Deposition (oxide)", and the Etch-stop card adds the SiN stop. With the stop, etch adds much less underlayer attack. Over-etch on a stop is about ×1.05, not ×0.75. Needs a small engine rule (a flag set earlier scales a risk added later); Lane A plans it, then asks.
- Depth variation at etch: **label it.** Keep 0.08. The etch room's forecast says how much is from this etch and how much is carried in from the film stack.
- Q-time (claim 4): **moisture uptake.** The dielectric takes up moisture while the lot waits and outgasses under the barrier, so the barrier adheres poorly. Same pattern slot, new name and text.
- SPC (claim 9): **add the trend rule**, 6 points in a row steadily rising or falling. Verdicts named by rule; one point past a limit is an excursion, not a shift.
- Wafer map (claim 10): **round 21-site mask** (1 centre, 8 inner, 12 outer). Every hand-computed yield test changes: Lane A recomputes each by hand and shows David before editing. Lane D draws it.
- T-top (claim 2): **offered only when a chemically amplified resist was in the slot.** It unlocks a CAR remedy, not the CAR resist; the CAR resist becomes a starter shop item.
- Slurry event (claim 6): **"under a signed engineering deviation"**, same effects.
- Audit event (claim 7): **wet bench past its bath-change interval.** Change the bath now (lot waits 30 min, marks a PM on the wet-clean chart) or run on a logged deviation (corrective-action cost).
- Gauge text (claim 1): **"No tool chart here: the gauge is checked against reference standards (not modelled yet)."**
- Earlier today: wafer map rounds to the nearest percent (done), cost tile for reference only with the score left for M7 (done), the Words page as its own item.

## Who does what for the rest of M4.5

**Lane A (engine, screens; this branch)**
1. Land Lane F's reports and Lane D's commit on `main` (after PR #23 merges).
2. ~~Etch-stop rule and the route label; the etch forecast split (stack vs this etch).~~ Done 26 Oct 2026.
3. ~~SPC: trend rule, verdicts by rule, excursion wording; a flagged tool should cost more (issue 4).~~ Done 27 Oct 2026.
4. Diagnosis explains itself; offer only failure modes whose cause could have been there, including T-top only with CAR (issue 2).
5. Skip the hand screen in a room with nothing to play (starter deck, part 2).
6. Round 21-site wafer map, engine side (`lot.js` site weights and the tests), after Lane D's drawing is agreed.

**Lane C (content: `content.js`, `events.js`; `physics-reviewer` on every batch)**
1. A starter practice with a real tradeoff in most rooms (starter deck, part 1). Also fixes "Strip and re-expose" (nothing makes it playable today).
2. Signatures readable from on-screen evidence (keyhole void, dishing, underlayer attack: claims 2, 3, 11).
3. Q-time moisture text, slurry and audit rewording, gauge text, T-top's unlock.
4. The Words page's terms (`glossary.js`), once Lane A has the page.

*Note for Lane C (from Lane A, item 3, 26 Oct 2026):* `content.js` lines changed: `timedOveretch` (the etch-stop lines are now ×0.7 and, in the DOE version, ×0.84; its tradeoff says "much less if an etch stop is there") and `etchStopLayer` (tradeoff and physicsNote now mention protecting the film below). `etchStopLayer` stays unlocked by the notebook, not a starter card (David). The etch stop's protection itself lives in `lotTypes.js` (the etch step's `effects`), not on the card.

**Lane D (look and feel: `tokens.css`, `cards.css`, `src/art/`)**
1. Phone layout (issue 17) and run-ending button spacing (issue 8).
2. The round 21-site wafer map drawing.

**Lane F (after A, C and D merge)**: rerun the five personas on seeds 123456, 42 and 777 and check the exit test.

**Order that avoids collisions:** Lane C's starter cards change seeded hands, so Lane A's hand-checked tests may move. Lane C announces the batch before merging; Lane A updates its own tests. The round map changes every yield test, so it goes **last** in Lane A, after the other items have settled.
