# CLAUDE.md — Fab Run

This file holds the rules. `PROJECT.md` is the session routine: follow it from step 1 every session. `DESIGN.md` is the game itself. If anything here conflicts with a request, stop and ask David.

## 0. Where the project is

This repo is a **starter kit**. No game code exists yet. What exists:

- `DESIGN.md`: the agreed game design.
- `docs/decisions.md`: decisions still open, each with a proposed answer. **Settle the ones a roadmap item depends on during its planning step. Don't assume.**
- `src/content/content.js`: the first 23 content items and 9 failure modes, as data (all `draft: true`).
- `src/theme/tokens.css`: v0 colors and fonts.
- `index.html`: a placeholder page that proves the content and tokens load.
- `tests/content.test.js`: checks that every cross-reference in the content resolves.

## 1. The game in one paragraph

A Slay the Spire–style roguelite. **One run = one lot of 25 wafers** going from bare silicon to ship. **Wafer yield is the health bar.** Each process area (litho, etch, deposition, plating, CMP…) is a **room** on a cleanroom floor-plan map. In a room you play **practice cards** against a time budget, with **equipment and materials** (resists, plating baths) in the room's slots changing how cards resolve. Tools drift; drift is telegraphed. At the end the lot ships against a customer spec. Diagnosing failure modes fills an **engineering notebook** that persists between runs and unlocks new content. Full design: `DESIGN.md`.

## 2. Who you're working with

David is a semiconductor fab and packaging engineer (deep domain expert) and a **JavaScript beginner**.

- Explain every change in plain words. No unexplained code jargon.
- Prefer readable code over clever code. Short functions, descriptive names, comments on anything non-obvious.
- **Ask before** adding a framework, build tool, runtime library or npm package. The only pre-approved dev dependency is `@playwright/test`, for screenshots, and only from the milestone that needs it.
- **Defer to David on process physics and fab realism.** Push back (politely, with reasons) on code quality, structure and bugs.
- When unsure what David means, ask one clear question instead of guessing on a big change.

## 3. How we work (steps in `PROJECT.md`)

- **Plan first.** No code edits until David OKs a plan in `tasks/todo.md`.
- **One `ROADMAP.md` item per session.**
- After any bug or correction, add a rule to `tasks/lessons.md` (what happened → root cause → rule).
- Commit after each working step with a plain-English message. Never commit with failing tests unless David says so.
- Ask before refactoring more than ~100 lines or touching more than one folder of `src/` at once.
- Use the agents in `.claude/agents/` (§12) only when their job is needed. No agents for small edits.

## 4. Architecture (settled Oct 23, 2026, see `docs/decisions.md` D7)

Plain JavaScript ES modules. **No bundler, no framework, no build step.** GitHub Pages serves the repo as it is.

```
index.html            loads src/theme/tokens.css and src/ui/main.js (type="module")
src/engine/           the rules. Pure functions. No DOM, no window, no Math.random. Runs in Node.
  rng.js              the one seeded generator (port mulberry32 from FabSim2)
  lot.js              lot state, yield math, defect patterns
  resolve.js          applies a card's effects to the state
  run.js              the run: map position, deck, draws, rooms, shipping
src/content/          data only: cards, equipment, materials, consumables, failure modes, lot types
src/ui/               reads state and draws it; turns taps into engine actions
src/theme/tokens.css  colors, type, room colors
tests/                node --test files (engine, content); Playwright screenshots later
```

- **One state object** holds the whole run. Engine functions take `(state, action)` and return the new state. This is what lets a bot replay a run, and what makes a seed reproducible.
- **UI never changes state directly.** It calls an engine function and redraws.
- Modules need a web server, not `file://`. Local play: `python3 -m http.server 8000` in the repo, then open `http://localhost:8000`.
- Split a file when it passes ~400 lines. Tell David first.

## 5. Locked game rules (agreed in brainstorming; don't change without asking)

1. **One lot per run.** A run ends when the lot ships or is scrapped.
2. **Yield only goes down**, except through the specific rework practices that say otherwise. There is no generic "heal".
3. **Yield losses multiply.** Line yield is the product of step yields. Each room's losses apply to what is left.
4. **Laws are fixed; situations are random.** Randomness picks which lot, which modifiers, which cards are drawn and how much scatter there is. It never changes what a card or a physical rule does.
5. **Chaos is announced.** Lot modifiers show at the start of the run. Tool drift shows on SPC before it bites. Consequences may arrive later.
6. **Every failure is diagnosable** from evidence on screen: the wafer map, SPC, metrology, the cross-section.
7. **Every item has a tradeoff** with a physical reason (`tradeoff` and `physicsNote` fields). Nothing is strictly better.
8. **Cards only where there is a real decision.** Routine settings are menus.

## 6. Content is data

New cards, equipment, materials, consumables, failure modes, lot types and events are **entries in `src/content/`**, never new logic. The shape of every entry and the list of effect operations are documented at the top of `content.js`.

- Every new entry gets `draft: true`. David removes it after review.
- Every entry needs `tradeoff` and `physicsNote`.
- The engine supports a **fixed list of effect operations** (`defectMult`, `timeCost`, `cashCost`, `setFlag`, `reveal`, `toolHealth`, `enables`, `decayPerUse`). Adding an operation is an engine change: plan it and ask.
- Content that needs behavior that doesn't exist yet goes in a `NEEDS NEW LOGIC` list in `tasks/todo.md`, not into the engine quietly.
- `tests/content.test.js` must pass after every content change.

## 7. Balance

- Balance numbers live in one place (`src/content/balance.js` once it exists): starting cash, time budgets, scrap line, spec targets, draw size.
- **Tune with costs, time, specs, draw weights and modifier strength.** Never bend a physical rule to make a run easier or harder.
- Content numbers are placeholders until a bot balance pass (M7).

## 8. Seeded randomness

- Every random number comes from `rng.js` (mulberry32, as in FabSim2). **Never use `Math.random()`.**
- The seed lives in the run state and shows on screen. A link ending in `?seed=123456` starts that seed.
- Same seed + same actions → same run. Always include the seed in bug reports and test failures.

## 9. Realism and public information

- **Public information only.** Textbook and published concepts and numbers. No real company, tool-vendor or brand names. No fab-specific recipes, nothing resembling non-public process data. If unsure, flag it rather than use it. This applies to everything committed: code, content, comments, commit messages, screenshots.
- The repo is public.
- Simplify freely, but a simplification must not teach something false. If a mechanic needs a fake rule to be fun, raise it with David.
- `docs/process-primer.md` is the reference for the simplified process model.

## 10. Visuals

- Use the tokens in `src/theme/tokens.css`. No hard-coded colors in UI code.
- Cleanroom look: white and cool blue ground, each room has its color (litho is the yellow room). Highly stylized and bright, but flat: no gradients, no glow effects, no emoji.
- Yellow and other light room colors are **fills behind dark text**, never text on white.
- Text contrast 4.5:1 minimum. Colors that must be told apart also differ in lightness or pattern.
- Touch targets at least 44 px. Must work at 375 px phone width.
- Details: `docs/art-direction.md`.

## 11. Saves, testing and definition of done

**Saves.** `localStorage`, every access wrapped in try/catch; the game must run when storage is blocked. The run uses one key (`SAVE_KEY`, bumped when the state shape changes). **The notebook has its own key** so a state change never wipes it.

**Tests.**
1. `npm test` runs `node --test` on `tests/`. No dependencies needed.
2. Engine tests use hand-computed expected values. Never edit an expected value to make a test pass; ask.
3. Bot runs (from M1): seeded runs through the engine with no UI. Pass if no exception and no `NaN`/`Infinity` in state.
4. Screenshots (from M2, Playwright): desktop 1280×800 and phone with an explicit `viewport: {width: 375, height: 812}`. Look at them and report anything broken.
   `npm run screens` runs the screen tests in `tests/screens/` (sizes in `playwright.config.js`) and saves the shots to `screenshots/` (not committed). On a new computer, run `npm install` and `npx playwright install chromium` once first.

A change is **done** when tests pass, screenshots are checked (if UI changed), `tasks/todo.md` is updated, `tasks/lessons.md` has any new rule, the `ROADMAP.md` box is ticked, and David gets a **3-bullet summary**: what changed, why, how to see it in the game.

## 12. Agents (`.claude/agents/`)

| Agent | Use it for | Edits code? |
|---|---|---|
| `physics-reviewer` | Any change to content effects, failure modes or the yield model | No |
| `content-drafter` | Batches of cards, equipment, materials, consumables, failure modes | `src/content/` only |
| `playtester` | Tests, bot runs and screenshots before "done" | No |
| `code-explainer` | Review a diff for beginner readability and rule violations; write David's summary | No |

Parallel agents only for independent content. Never two agents editing the same file.

**Models.** The session default is `opusplan` (`.claude/settings.json`): Opus while planning, Sonnet while building. Each agent sets its own `model:` in its file (`physics-reviewer` on Opus, `code-explainer` on Haiku, the rest on Sonnet). Every new agent must set one; without it, an agent inherits the session model.

## 13. Hosting

Static site on **GitHub Pages** from the repo root. Every push to `main` updates the live site. No backend: saves and the notebook use localStorage; the daily seed comes from the date. Don't add a server, database or leaderboard without asking.

## 14. Glossary (use the game's own words)

- **Run** one lot from start to ship or scrap. **Lot** 25 wafers moving together. **Site** one of the 25 die positions on the wafer map.
- **Room** a process area on the map. **Practice** a card played in a room. **Slot** a place in a room for equipment or a material.
- **Equipment** a persistent tool upgrade (relic). **Material** a slot item such as a resist or bath, with a shelf life. **Consumable** a single-use item (qual wafer, spare part).
- **Time budget** the minutes a room gives you to play practices. **Tool health** how worn or drifted a room's tool is.
- **Modifier** a lot condition announced at the start of a run (tight spec, hot lot, incoming variation).
- **Failure mode** a diagnosable root cause. **Notebook** the persistent list of diagnosed failure modes. **Unlock** content added to the pool by a notebook entry.
- **Q-time** a limit on how long a lot can wait between two steps. **Scrap line** the yield below which the lot is scrapped.
- **SPC** control chart of measurements over time. **Drift** a tool slowly going out of control. **Telegraph** the early warning of a drift.
