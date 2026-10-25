# Lane F — simulated playtesting

Branch: `lane-f` (from `main` at 39fd824). Lane F writes only to `.claude/agents/persona-*.md`, `docs/playtest/` and this file. It never edits `src/`, `tools/`, `tests/`, `ROADMAP.md`, the other `tasks/` files or `package.json`.

### Task: five persona agents play the served game and report; one ranked summary

**Decisions settled:** none needed from `docs/decisions.md`. Three small questions for David at the bottom.

## How a persona plays (the driver)

A persona can't keep a browser open between its own steps. So there is one small script, `docs/playtest/drive.mjs` (plain Node, uses the Playwright that is already installed, no new package):

- It gets a seed, a screen size (`desktop` 1280×800 or `phone` 375×812, `isMobile`, `hasTouch`) and the list of actions so far, for example `click:Enter step 1: Wet clean`, `click:Go straight on`, `reload`, `back`, `goto:?seed=777`.
- It opens `http://localhost:8000/?seed=N`, **replays every action from the start**, then saves one screenshot and prints only what a player sees: the page text, the labels of the buttons you can tap, and any console errors.
- Replaying works because same seed + same actions = same run (CLAUDE.md §8). It also means every problem in a report can be reproduced from its seed and action list.
- It taps buttons by their visible label, not by code names, and waits 600 ms between taps (the double-click lesson in `tasks/lessons.md`).
- Screenshots go to `screenshots/playtest/<persona>/<seed>-<step>.png` (gitignored).

So the persona loop is: run the driver → look at the screenshot → think out loud → pick the next tap → run the driver again with one more action.

## The five agents (`.claude/agents/`, all `model: opus`)

Each file has: who the persona is, what it knows and doesn't, what it watches for, the driver loop, and the report format. Tools: `Read, Bash, Write`. The prompt forbids reading `src/`, `tests/`, `tools/`, `DESIGN.md`, `CLAUDE.md` and `docs/` outside `docs/playtest/`; it may read only its own screenshots and driver output. No politeness padding.

- [x] `persona-fab-engineer.md`: a fab engineer, not a gamer. Plays desktop. Looks for anything that teaches something false, wrong words, wrong cause and effect, numbers that look off. Judges only what the screen says.
- [x] `persona-spire-veteran.md`: a Slay the Spire veteran with no fab knowledge. Plays desktop. Checks whether choices are real, looks for a dominant card or route, an always-right side stop, or a do-nothing option that wins.
- [x] `persona-phone-5min.md`: a phone player with 5 minutes. Plays at 375×812 only. First-minute clarity, tap targets, scrolling to find things, the exact moment it would put the phone down. Notes how many taps and screens a full run takes.
- [x] `persona-student.md`: a curious student. Plays desktop and phone. Does the game explain itself; lists each term it met without an explanation (Q-time, SPC, CD, CMP, dishing…) and where.
- [x] `persona-exploit-hunter.md`: an exploit hunter. Plays desktop. Economy and shop (buy-everything runs, cash going negative, free options), seed abuse (reload, back button, changing `?seed=` mid-run, re-rolling for a good start), double taps.

Every persona plays seeds **123456, 42 and 777**, one full run each (to ship or scrap), and takes a screenshot at every decision.

## What each persona writes

- [ ] `docs/playtest/<persona>.md`:
  - **Where I'd quit, and why** (seed and step).
  - **Problems**, at least 3, each with seed + step number + screenshot path, what it saw, why it matters to this persona.
  - **One compliment** at most.
  - **Ratings 1–5**: clarity, real decisions, wanting another run.
- [ ] `docs/playtest/<persona>-log.md`: the play-by-play. Each step: seed, step number, screenshot path, the thinking out loud, the tap chosen. This is the "narrate as it plays" part, kept apart so the report stays short.

## Summary

- [ ] `docs/playtest/summary.md`, written by me after reading all five reports and checking the cited screenshots:
  - Issues merged where two personas hit the same thing, **ranked by how many personas hit it** (5 → 1), ties broken by how early in a run it bites.
  - Each issue tagged with the lane that owns the fix: **A** run spine, **C** content, **D** art. An issue that fits none (e.g. a balance number) is tagged **other: David** rather than forced into a lane.
  - Each issue keeps one seed + step to reproduce it.
  - The five ratings in one table.

## Steps

- [x] 1. Write `drive.mjs`; check it on seed 42 by walking 3 steps at both sizes; check the phone shot really is 375×812 (lesson).
- [x] 2. Write the five agent files. Commit.
- [ ] 3. Run the five personas in parallel (each writes only its own two files, so they don't collide). One server on port 8000 for all.
- [ ] 4. Read each report: every problem has a seed + step and a screenshot that exists; no quoting of source code; no padding. Send back any that fail.
- [ ] 5. Copy only the screenshots the reports cite into `docs/playtest/shots/` and fix the paths (see question 1). Commit.
- [ ] 6. Write `summary.md`. Commit and push `lane-f`.
- [ ] 7. 3-bullet summary to David.

**Acceptance criteria:**
- Five agent files with `model: opus`, each usable again later (e.g. after M4 or M6) with no edits.
- Five reports and five logs; every problem reproducible from seed + actions.
- `summary.md` ranked by persona count, every issue tagged A / C / D (or other).
- No file outside Lane F's paths changed (`git diff --stat main` checks this).

## Questions for David

1. **Screenshots in the repo?** The repo is public and PNGs add weight. Proposal: all shots stay in `screenshots/` (not committed); only the ones a report cites (about 20–40, phone shots are small) are copied into `docs/playtest/shots/` so the links work on GitHub. OK?
2. **Driver script in `docs/playtest/`?** It is code, but `tools/` and `tests/` are off-limits to Lane F. Proposal: `docs/playtest/drive.mjs` with a comment at the top saying what it is. OK, or would you rather another lane move it into `tools/` later?
3. **Personas and the source code.** Their tool list can't technically block them from opening `src/`; the rule is in their prompt. I'll grep each report for code names before accepting it. Enough?

**Progress notes:**
- 25 Oct 2026: plan written. Checked that `?seed=42` loads, the seed shows on screen and the first screen's button can be found by its label.

- 25 Oct 2026: David OK'd the plan and all three questions (shots: only cited ones committed; driver in docs/playtest/; prompt rule + grep for code names). Driver checked on seed 42 at both sizes (1280×800 and 375×812 confirmed from the PNG headers); added a `doubletap` action for the exploit hunter.

**Result:**
