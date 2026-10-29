# Plan: make the Cu line winnable, then prove it (proposal, 28 Oct 2026)

Status: **waiting for David's OK.** No code has been edited. Replaces the order of the open M4.5 items in `ROADMAP.md` if approved.

## Goal and exit test
Same exit test as `tasks/next-stages.md`, made measurable by a script (P1):
- A **smart bot** ships at or above spec on most seeds (target 60-80%; David confirms).
- **Idle** (do nothing) always fails. **Random** ships rarely (under 15%).
- Best and worst strategies differ by **more than 10 points** (today: about 57 idle vs 57 random vs 67 best seen).
- At least one simulated persona, then at least 2 real people, ship a lot and can say why.

Baseline measured 28 Oct: 40 random seeds, 0 shipped (max 59.7%); idle 54.8-58.5%; spec 70%.

## Phases (sequential unless marked parallel)

### P0. Housekeeping (small, main session)
- Check PR #25 content is on `main`; tick the first M4.5 box.
- Move the "Done" sections of `tasks/todo.md` (about 1,200 lines) to `docs/archive/todo-done.md`.
- Files: `ROADMAP.md`, `tasks/todo.md`. No `src/`.

### P1. Smart bot and the exit-check script (main session)
- Add policy `smart` to `tools/bot.js`: at each decision, try every legal option on a copy of the state (the engine is pure, so this is cheap) and take the best yield after resolve. Covers cards, PM, DOE, shop buys, event options. It uses only what a player can see.
- Add `tools/exit-check.js` (`npm run exit-check`): runs N seeds for idle, random, smart and prints ship rate, mean/min/max yield and the spread.
- Test: bot run has no NaN/Infinity and is reproducible by seed (CLAUDE.md §11).
- Why first: every later phase is judged by this number.

### P2. Decisions in every room (two parts, **parallel**)
- **2a Content (subagent `content-drafter`, then `physics-reviewer`):** one simple starter practice with a real tradeoff for each room that has none (wet clean, deposition, plating, CMP and others). Fixes "Strip and re-expose" being unplayable. All `draft: true`, with `tradeoff` and `physicsNote`. Files: `src/content/content.js` only. Needs-new-logic ideas go to the NEEDS NEW LOGIC list.
- **2b Engine/UI (main session):** skip the hand screen when nothing is playable; say *why* a card is greyed out. Files: `src/engine/run.js`, `src/ui/`.
- Collision rule: 2a changes seeded hands, so hand-checked tests in 2b may move. 2a lands first on its own branch; 2b rebases and recomputes by hand, shown to David.

### P3. Balance pass (main session only, not parallel)
- Use `npm run exit-check`. Levers allowed: costs, time budgets, spec, draw weights, risk sizes in `balance.js` / `lotTypes.js`. Never bend physics (CLAUDE.md §7).
- Any hand-computed expected value that moves is **shown to David before editing** (CLAUDE.md §11.2).
- Stop when the exit-test targets hold on 100 seeds. Record final numbers in `tasks/todo.md`.
- Subagent: `physics-reviewer` once at the end if any risk sizes changed.

### P4. Diagnosis explains itself (**can run parallel to P3**: different files)
- Engine/UI (`src/engine/notebook.js`, `src/ui/`): after a guess, say which step lost yield and why; offer only failure modes whose cause could have been present (T-top only with a CAR resist).
- Content (subagent `content-drafter`): signatures readable from on-screen evidence (keyhole void, dishing, underlayer attack).
- Subagent `physics-reviewer` on the batch.

### P5. Gate: does it work for people? (subagents, then humans)
- `playtester` agent: `npm test`, `npm run screens`, bot report.
- The five `persona-*` agents rerun seeds 123456, 42, 777 (they only write `docs/playtest/`).
- **2-3 real people** (a colleague, a friend, one on a phone) play one run each; David watches without helping. Moved up from M7.
- Pass: exit test above. Fail: back to P3.

### Small items, any time after P1 (low risk)
- Words page (`glossary.js`): `content-drafter` + `physics-reviewer`, then David.
- Phone layout and run-ending button spacing: after P3, when screens have stopped moving.

## Deferred (out of M4.5)
- Round 21-site wafer map: cosmetic, and it moves every yield test. Do it in M6, or as a view-only change.
- Item art, inspect view, card motion: after M5.
- M5 (modifiers, NMOS) starts only after P5 passes.

## Lanes and subagents: recommendation
**Retire the permanent lanes (A/C/D) for now.** One main builder session does P0, P1, P2b, P3 and P4 engine work, because they share files and run in order. Use **subagents for bounded jobs**, not lanes:

| Job | Agent | Parallel? |
|---|---|---|
| Starter practices, signatures, glossary | `content-drafter` | Yes, different content kinds only; never two on `content.js` |
| Check every content or yield-model change | `physics-reviewer` | After each batch |
| Tests, bot, screenshots before "done" | `playtester` | After each phase |
| Plain-English summary for David | `code-explainer` | After each phase |
| Rerun simulated players | `persona-*` (5) | Yes, all five at once, at P5 |

No agents for P0, P1 or P3: small, tightly coupled, and subagents re-derive context at a cost.
Worth keeping from the lane scheme: the merge rule (merge locally, run `npm test` and `npm run screens` before a second PR) and one tracker file. Use this file as the tracker until done, then fold it into `todo.md`.

## Decisions needed from David
1. Targets: smart bot wins 60-80%? random under 15%? Keep spec at 70%, or move it?
2. OK to defer the round map to M6?
3. OK to retire the lanes as described, and use this file as the single tracker?
4. Who are the 2-3 real playtesters, and when?

## Risks
- A smart bot that is too smart (or too dumb) misleads balance. Mitigation: it sees only on-screen information; also report an "average player" policy (smart with noise).
- Starter cards could make one build dominant. Mitigation: `persona-minmaxer` and `persona-spire-veteran` in P5, and every item keeps a tradeoff (rule 7).
- David's review is the bottleneck. Mitigation: one phase per session, a 3-bullet summary each, no parallel phases unless the table above says so.
