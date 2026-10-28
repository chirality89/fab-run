# PROJECT.md — Fab Run session routine

How a working session runs, start to finish. The rules themselves live in `CLAUDE.md`; this file is the order you do things in. If the two ever disagree, `CLAUDE.md` wins and you tell David about the conflict.

## 1. Start

1. Read the **Standing rules** at the top of `tasks/lessons.md`. These are rules learned the hard way. Search the full entries below them for the area this item touches (for example "SPC", "screen test", "shop").
2. Check open pull requests and remote branches (`git fetch`, `git branch -r`). If one holds roadmap work that isn't on `main` yet, tell David and bring it in before picking an item.
3. Read `tasks/todo.md` for work in progress and the `NEEDS NEW LOGIC` list. Finished tasks live in `tasks/done.md`; read one only when an item builds on it.
4. In `ROADMAP.md`, find the first unticked box in the current milestone. That is this session's item unless David names another.
5. Read only the parts of `DESIGN.md` and `docs/` that this item touches.

## 2. Plan

1. Enter plan mode.
2. Settle any open item in `docs/decisions.md` that this roadmap item depends on. Ask David one decision at a time, then move it to Settled with the date.
3. Write the plan in `tasks/todo.md` using the template below.
4. Wait for David's OK before editing code.

If the work goes sideways (a test you expected to pass fails, the plan meets something it didn't foresee), stop, write down what you learned, and re-plan with David. Don't push through a broken plan.

## 3. Build

- Work in small steps. Run `npm test` after each one and commit when it passes.
- Keep the change to what the plan says. No side refactors; note them in `tasks/todo.md` for later.
- Prefer the plainest code that works. If a solution feels like a workaround, pause and look for the simpler shape before going on.

**Bugs.** Find the root cause before fixing anything:

1. Reproduce it (with the seed, if a run is involved).
2. Write a failing test that shows it.
3. Fix the cause, not the symptom. Confirm the test now passes.
4. Add the lesson to `tasks/lessons.md`.

You don't need David's OK to fix a bug inside the current item, but the size limits in `CLAUDE.md` §3 still apply. Explain what you found in plain words.

## 4. Verify

Run the `playtester` agent, or do its steps yourself for small changes:

- [ ] `npm test` passes
- [ ] Bot runs clean, once the bot exists (no exceptions, no `NaN`/`Infinity`)
- [ ] Screenshots checked at both sizes, if the UI changed
- [ ] No console errors when the page is served
- [ ] No `Math.random` in `src/`

For a change to content or the yield model, also run `physics-reviewer`. For code David will read, run `code-explainer`.

## 5. Close

- Mark the plan's boxes done in `tasks/todo.md` and add a short Result line.
- Add any new lesson to `tasks/lessons.md`.
- Tick the `ROADMAP.md` box.
- Give David the 3-bullet summary from `CLAUDE.md` §11.

## tasks/todo.md template

```markdown
### Task: [roadmap item]
- [ ] Step 1
- [ ] Step 2

**Decisions settled:** [ids from docs/decisions.md, or none]

**Acceptance criteria:**
- [what David will see or what the test proves]

**Progress notes:**
- [date]: [what happened]

**Result:** [commit or one line on what shipped]
```

The `tasks/lessons.md` format is at the top of that file.
