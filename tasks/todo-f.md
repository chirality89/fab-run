# Lane F — simulated playtesting

Lane F owns: `.claude/agents/persona-*.md`, `docs/playtest/`, and this file. It never edits `src/`, `tools/`, `tests/`, `ROADMAP.md`, other `tasks/` files or `package.json`.

## Plan (approved by David)
Five persona agents (model: opus) play the served game through `docs/playtest/drive.mjs` (words, buttons and screenshots only, no source), on seeds 123456, 42 and 777, and write what a player would think.

- [x] Branch is current with `origin/main` (checked, 0 commits behind)
- [x] `docs/playtest/drive.mjs` — browser driver (open, look, tap, shot, reload, goto, scroll); phone = 375x812 mobile with touch; reports real screenshot size
- [x] Five persona files in `.claude/agents/`: fab-engineer, spire-veteran, phone-5min, student, minmaxer
- [x] Run the five personas (3 seeds each) → `docs/playtest/logs/<persona>-<seed>.md` (15 logs), screenshots in `docs/playtest/shots/<persona>/`
- [x] Each writes `docs/playtest/<persona>.md`: where I'd quit, 3+ problems with evidence, at most 1 compliment, ratings 1–5 (clarity, real decisions, another run)
- [x] Audit: no persona read forbidden paths; reports have the required parts; phone shots are 375 wide
- [x] `docs/playtest/summary.md`: issues ranked by persona count, tagged A (run spine) / C (content) / D (art) / other

## Result
All five personas played seeds 123456, 42 and 777 (15 logs, reports, screenshots). Audit passed: each report has 3 ratings, 7 to 9 problems with evidence, 1 compliment; every cited screenshot exists; phone shots are 375 wide, desktop 1280; no transcript read a forbidden path.
- No lot shipped in any run (47.9% to 59.5% against a 70% spec). All five quit at or just after Etch.
- Hit by all five: the spec feels unreachable and choices barely matter (A/C); diagnosis can't be worked out from the screen (C/A); no decisions in most rooms and an unexplained greyed card (C); SPC flags don't predict losses (A); placeholders that still cost minutes and cash (A).
- Ranked list with lane tags: `docs/playtest/summary.md`. The false-physics claims (issue 12) should go to `physics-reviewer` before anyone changes content.
