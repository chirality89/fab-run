# Fab Run — Lane B (saves) plan

Parallel day, 25 Oct 2026. This lane owns **only** `src/ui/storage.js` and its tests. It hooks into `main.js` only after Lane A's ship screen is merged to `main`. It doesn't touch `ROADMAP.md`, `tasks/lessons.md`, `tasks/todo.md` or `package.json`. Branch: `lane-b`.

ROADMAP item: M3, "Save and resume a run (`SAVE_KEY`, storage-blocked safe)".

### Task: save the run after every action and pick it up again on reload

**Part 1: `src/ui/storage.js` (new, about 80 lines). Can start now.**

It lives in `src/ui/` because it touches the browser. The engine stays pure.

- [ ] `SAVE_KEY = 'fabrun.run.v1'`. The `v1` goes up whenever the state shape changes, so an old save is ignored and never loaded into new code (CLAUDE.md §11).
- [ ] Three small helpers that any key can use. The M4 notebook will reuse them with its own key, so a run-version bump never touches the notebook:
  - `readJson(key, storage)` gives back the stored value, or `null` if there is nothing, it isn't valid JSON, or storage is blocked.
  - `writeJson(key, value, storage)` gives back `true` or `false`. It never throws. A full or blocked storage just means "not saved".
  - `removeKey(key, storage)`, the same.
- [ ] Run-specific wrappers:
  - `saveRun(state, storage)` saves `{ version: 1, state }`.
  - `loadRun(storage)` gives back the saved state, or `null` if it's missing, the wrong version, or fails a light shape check (has a valid seed, a known `status`, a `lot`, a `map`).
  - `clearRun(storage)` removes the save.
- [ ] **Every storage access is inside try/catch**, including just looking up `window.localStorage`, which itself throws in some blocked-storage browsers.
- [ ] `storage` is an argument with the browser's `localStorage` as default. Tests pass in a pretend storage (a plain object with `getItem`/`setItem`/`removeItem`) and one that throws on every call. No new packages.

**Part 2: `tests/storage.test.js` (new). Can start now.**

- [ ] Save then load gives back a state **exactly equal** to the original. Checked on a fresh run, on a run part-way through (in a room with a hand, in a corridor, in an open shop), and at the end. This also proves the state has nothing that JSON would quietly change (`undefined`, `Infinity`, `NaN`).
- [ ] **Resume gives the same run:** seed 123456, play to the middle of the route, save, load, finish. The result (yield, cash, cycle time, status) is identical to finishing without the save/load. Same seed + same actions → same run (§8).
- [ ] Storage that throws: `saveRun` gives back `false`, `loadRun` gives back `null`, `clearRun` doesn't throw.
- [ ] Junk is ignored: a non-JSON string, `{ version: 0 }`, a wrong version and a state with no seed all load as `null`.
- [ ] `clearRun` really removes the save. Saving under the run key doesn't touch another key (stands in for the notebook).
- [ ] When storage is missing completely (Node has no `localStorage`), the default argument still doesn't throw.

**Part 3: hook into `main.js` (about 30 lines). Only after Lane A's ship screen is on `main`.**

- [ ] Merge `main` into `lane-b` (no rebase) and read Lane A's ship screen code before writing anything.
- [ ] Every time the state changes (same places that already do `state = …`), call `saveRun(state)`.
- [ ] On page load: if there is a saved run that is still `running`, resume it and draw the right screen for where the lot stands:
  - in a room: the room screen;
  - with the shop open: the shop;
  - in a corridor or at the door: the map.
  - The result screen right after Run needs the "before" state, so a reload there shows the map instead.
- [ ] When the run ends (Lane A's ship / reject / scrap screen), clear the save. Replay and New seed start fresh.
- [ ] Screen tests (Playwright, `tests/screens/saves.spec.js`): play a card, reload, the hand and time left are the same. Reload in a corridor, the map comes back. With storage blocked (`localStorage` made to throw by an init script) the game still plays. Both sizes. Screenshots checked by eye.

**Questions for David (one decision each; my proposal first):**

1. **Seed in the address vs a saved run.** Proposed: if the page address has `?seed=` that **differs** from the saved run's seed, the link wins and a fresh run for that seed starts, replacing the save. Same seed or no seed: resume. (Reloading always matches, because the page already writes the seed into the address.)
2. **Resume silently, or ask?** Proposed: resume silently, with one line on the map "Resumed seed 123456" and the usual New seed button. A "Resume / New run" screen can come later if wanted.
3. **What to save.** Proposed: the whole state object (it's plain data). The other choice, seed + list of actions replayed on load, survives engine changes better but is more code. The version bump covers shape changes for now.

**Decisions settled:** none needed from `docs/decisions.md`. The three questions above are lane-level.

**Size:** Parts 1–2 are `src/ui/` + `tests/` only, about 200 lines with tests. Part 3 is about 30 lines in `main.js` plus one screen test file. Two to three commits: storage + tests, then the hook.

**Not in this lane (noted):** the notebook itself (M4); a "your save was from an older version" message; saving more than one run.

**Acceptance criteria:**
- `npm test` passes with the new storage tests, including resume-gives-the-same-run and storage-blocked.
- After Part 3: reload mid-run on the page and the lot is where you left it; with storage blocked the game still plays; a finished run starts fresh on reload.

**Progress notes:**
- 2026-10-25: plan written on `lane-b`; waiting for David's OK.

**Result:**
