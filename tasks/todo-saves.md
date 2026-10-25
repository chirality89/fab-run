# Fab Run — Lane B (saves) plan

Parallel day, 25 Oct 2026. This lane owns **only** `src/ui/storage.js` and its tests. It hooks into `main.js` only after Lane A's ship screen is merged to `main`. It doesn't touch `ROADMAP.md`, `tasks/lessons.md`, `tasks/todo.md` or `package.json`. Branch: `lane-b`.

ROADMAP item: M3, "Save and resume a run (`SAVE_KEY`, storage-blocked safe)".

### Task: save the run after every action and pick it up again on reload

**Part 1: `src/ui/storage.js` (new, about 100 lines). Can start now.**

It lives in `src/ui/` because it touches the browser. The engine stays pure and doesn't change.

**What is saved: the seed plus the list of actions** (David, 25 Oct 2026). A save looks like:
`{ version: 1, seed: 123456, actions: [ ['enter'], ['play', 'timedOverEtch'], ['run'], ['walk', 'procurement'], ['buy', 'endpointDetector'], ['enter'], … ] }`.
On load, the game builds a fresh run for the seed and plays the actions again through the engine. Same seed + same actions → same run (CLAUDE.md §8), so the lot ends up exactly where it was. This is the same replay a bot does (§4).

- [x] `SAVE_KEY = 'fabrun.run.v1'`. The `v1` goes up when the actions or rules change in a way that would replay differently, so an old save is ignored instead of replayed wrongly.
- [x] Three small helpers that any key can use. The M4 notebook will reuse them with its own key, so a run-version bump never touches the notebook:
  - `readJson(key, storage)` gives back the stored value, or `null` if there is nothing, it isn't valid JSON, or storage is blocked.
  - `writeJson(key, value, storage)` gives back `true` or `false`. It never throws. A full or blocked storage just means "not saved".
  - `removeKey(key, storage)`, the same.
- [x] Run-specific functions:
  - `saveRun(seed, actions, storage)` writes the save.
  - `loadRun(storage)` gives back `{ seed, actions }`, or `null` if it's missing, the wrong version, or not that shape.
  - `replayRun(startState, actions)` applies each action with the matching engine function (`enterStep`, `playCard`, `resolveStep`, `walkCorridor`, `buyItem`) and gives back the final state. `startState` comes from the caller (`main.js` already builds it with the starter deck and default loadout), so the starting deck isn't written in two places.
  - If any action fails during the replay (a save from older rules, an unknown action), `replayRun` gives back `null`, and the page starts that seed fresh instead.
  - `clearRun(storage)` removes the save.
- [x] **Every storage access is inside try/catch**, including just looking up `window.localStorage`, which itself throws in some blocked-storage browsers.
- [x] `storage` is an argument with the browser's `localStorage` as default. Tests pass in a pretend storage (a plain object with `getItem`/`setItem`/`removeItem`) and one that throws on every call. No new packages.

**Part 2: `tests/storage.test.js` (new). Can start now.**

- [x] **Resume gives the same run:** seed 123456. Play to the middle of the route while recording the actions (into a room, a card played, Run, a side stop, a purchase), then save, load and replay. The replayed state is **exactly equal** to the live one. Then finish both the same way: same yield, cash, cycle time, status.
- [x] Replay lands on every kind of spot: in a room with a hand, in a corridor, with the shop open, and at the end of the run.
- [x] A bad action list (unknown action, a card not in the hand, a stop not offered) gives back `null` from `replayRun`, never a half-played state.
- [x] Storage that throws: `saveRun` gives back `false`, `loadRun` gives back `null`, `clearRun` doesn't throw.
- [x] Junk is ignored: a non-JSON string, a wrong version, no seed, a bad seed, and `actions` that isn't a list all load as `null`.
- [x] `clearRun` really removes the save. Saving under the run key doesn't touch another key (stands in for the notebook).
- [x] When storage is missing completely (Node has no `localStorage`), the default argument still doesn't throw.

**Part 3: hook into `main.js` (about 40 lines). Only after Lane A's ship screen is on `main`.**

- [ ] Merge `main` into `lane-b` (no rebase) and read Lane A's ship screen code before writing anything.
- [ ] The page builds the starting run in **one** function (`createRun` with the lot type, starter deck, default loadout and normal scatter), used both for a new run and for the resume. That way the replay can't start from a different lot (code-explainer).
- [ ] `main.js` keeps an `actions` list next to `state`. An action is added only **after** the engine accepted it, so a refused tap never goes into the save. Every button that calls an engine function also adds that action to the list and calls `saveRun(state.seed, actions)`. "Go straight" records two actions: walk with no stop, then enter.
- [ ] On page load (David, 25 Oct 2026):
  - If the address has a `?seed=` that **differs** from the saved seed, the link wins: a fresh run for that seed starts and replaces the save.
  - Otherwise, if there is a save for a run still going, **resume silently** and draw the right screen for where the lot stands: room screen in a room, the shop if it's open, the map in a corridor or at the door. The result screen right after Run needs the "before" state, so a reload there shows the map instead.
  - The map shows one line, "Resumed seed 123456", next to the usual New seed button.
- [ ] When the run ends (Lane A's ship / reject / scrap screen), clear the save. Replay and New seed start fresh with an empty action list.
- [ ] Screen tests (Playwright, `tests/screens/saves.spec.js`): play a card, reload, and the hand and time left are the same. Reload in a corridor, and the map comes back. A different `?seed=` link starts fresh. With storage blocked (`localStorage` made to throw by an init script), the game still plays. Both sizes. Screenshots checked by eye.

**Decisions settled:** none needed from `docs/decisions.md`. Lane-level, from David (25 Oct 2026):
- A `?seed=` link that differs from the save wins and starts fresh.
- Resume silently.
- Save the seed plus the list of actions, not the whole state.
- Bump `SAVE_VERSION` (and the `v1` in `SAVE_KEY`) on any shipped change to the actions, the engine rules, `balance.js` or `content.js`.

**Size:** Parts 1–2 are `src/ui/` + `tests/` only, about 250 lines with tests. Part 3 is about 40 lines in `main.js` plus one screen test file. Two to three commits: storage + tests, then the hook.

**Not in this lane (noted):** the notebook itself (M4); a "your save was from an older version" message; saving more than one run; removing the old `v1` key after a version bump (a few bytes left behind).

**Lessons for David to add to `tasks/lessons.md`** (this lane may not edit it):
- *Test assumed the first room deals cards.* The "room with a hand" check ran at wet clean, but the starter deck has no wet-clean cards. Rule: before a test relies on a hand, check which room's cards are in the deck.
- *Test helper assumed the lot was never already in a room.* Rule: helpers that walk a run start from wherever the lot stands (door, room, corridor, shop).

**Acceptance criteria:**
- `npm test` passes with the new storage tests, including resume-gives-the-same-run and storage-blocked.
- After Part 3: reload mid-run on the page and the lot is where you left it; with storage blocked the game still plays; a finished run starts fresh on reload.

**Progress notes:**
- 2026-10-25: plan written on `lane-b`.
- 2026-10-25: David answered the three questions; the plan now saves the seed plus actions.
- 2026-10-25: David OK'd ("Build"). Parts 1–2 built: `src/ui/storage.js` (about 140 lines) and `tests/storage.test.js` (7 tests). `npm test` 139/139.
- The resume test on seed 123456 plays three rooms, including a procurement purchase after step 2, then saves, loads and replays. The state is exactly equal; both finish with the same status, cash, cycle time and lot.
- I broke the code twice on purpose (replay drops the last action; a storage read without try/catch). The tests failed both times, then passed again with the code restored.
- code-explainer: two must-fixes, done. The header claimed "nothing throws" (applyAction throws on purpose), and replayRun hid real engine bugs. It now prints a warning before starting fresh. Readability points done too: plain `check` function, a note on `Object.hasOwn`, a literal `SAVE_KEY`, short JavaScript notes in the header. Its Part 3 points are in the Part 3 list above.
- David: yes, bump the save version on any balance or content change that ships. Written in the `SAVE_VERSION` comment in `storage.js`.
- Part 3 waits for Lane A's ship screen on `main`.

**Result:**
