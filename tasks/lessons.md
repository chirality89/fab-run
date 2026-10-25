# Lessons Learned

Add an entry after any bug or correction. Format: what happened → root cause → rule to prevent it.

The first two entries are carried over from FabSim2 because they apply here too.

## Template

### What Happened
[2–3 sentences]

### Root Cause
[Why it happened]

### Rule to Prevent
✅ [Specific rule]
✅ [Test or check that would catch it]

---

## Notes edit silently did nothing (from FabSim2)

### What Happened
Results were supposed to go into `tasks/todo.md` and were reported as recorded, but they never landed.

### Root Cause
A scripted find-and-replace looked for text with different capitalization. It found no match, made no change and raised no error.

### Rule to Prevent
✅ After any scripted text edit, check the diff shows the new text before committing or reporting it as done
✅ Prefer the Edit tool for notes, since it fails loudly when the old text isn't found

## Phone screenshot silently came out at desktop size (from FabSim2)

### What Happened
"Phone" screenshots came out at 1280×720.

### Root Cause
The Playwright device preset name didn't exist in that version. The lookup returned nothing and the browser fell back to desktop size without an error.

### Rule to Prevent
✅ Give phone screenshots an explicit size: `viewport: {width: 375, height: 812}, isMobile: true, hasTouch: true`
✅ Check every screenshot's pixel size before judging it

## Repo check tripped on its own warning comment

### What Happened
The new "no `Math.random` in `src/`" test failed on the first run. The only match was the comment in `rng.js` that says never to use it.

### Root Cause
The check searched the whole file text, comments included, so a warning about the rule looked like breaking it.

### Rule to Prevent
✅ Text-search checks over source code skip comment lines (`codeOnly()` in `tests/rng.test.js`)
✅ After loosening a check, prove it still fails on a real violation before trusting it

## Finite inputs can still make an infinite risk (lot.js review)

### What Happened
`physics-reviewer` found that `scaleRisk` checked its multiplier but not the result. A huge finite multiplier could push a risk to Infinity, and Infinity × a site weight of 0 (edge ring, center site) gives NaN on the wafer map.

### Root Cause
Input checks guard each argument, but overflow happens in the arithmetic after the checks.

### Rule to Prevent
✅ Engine functions that store a number check the stored *result* with `Number.isFinite`, not just the inputs
✅ When writing an overflow test, confirm the input really overflows (1e300 + 1.7e308 is still finite; `Number.MAX_VALUE` twice is not)

## Wrote expected values before the calculation returned

### What Happened
While planning lotTypes.js, the do-nothing yield was written into `tasks/todo.md` in the same step as the script that computed it. Two digits were guessed and came out wrong (0.518320 instead of 0.517954).

### Root Cause
The expected values were typed from mental arithmetic and not copied from the computed output.

### Rule to Prevent
✅ Compute expected values first, then copy them from the output in a separate step
✅ Engine tests use these values, so a wrong one in the plan becomes a wrong test

## Read the sign convention from the code, not from memory (M1 bot, 24 Oct 2026)
- What happened: the bot plan said the i-line resist's `timeCost: -5` made litho 25 minutes. The engine (and the balance table) treat a negative cost as minutes given back, so litho is 35 and idle cycle time is 133, not 123. The test caught it.
- Root cause: I hand-computed from what "−5" looked like instead of reading `resolve.js` timeCost.
- Rule: before writing an expected value that goes through an effect op, read that op's code and its comment for the sign.

## Colour from the raw number, not the rounded one (M2 room, 24 Oct 2026)
- What happened: the yield bar picked its colour from the value rounded to 0.1%, so a raw 69.96% showed "70.0%" in the pass colour while the engine rejects it. Found by code-explainer.
- Root cause: the screen made its own pass/fail call from a display string instead of the same number the engine judges.
- Rule: any verdict shown on screen (pass, warn, fail, scrap) is computed from the raw engine value, in view.js, with a test at the edge (e.g. 0.6996). Rounding is for printing only.

## Started over on work an earlier session had already done

### What Happened
A session started from `main`, saw M0 unticked and began planning `rng.js` again, re-asking David decisions O2–O8. All of M1 and M2 item 1 already existed on an earlier session's branch (PR #1), which had never been merged.

### Root Cause
The start routine only reads files on the current branch. Work that lives on an open PR or another branch is invisible from there.

### Rule to Prevent
✅ At session start, list open PRs and remote branches (`git branch -r`, GitHub PR list) and check none holds newer roadmap work before picking an item
✅ When an item is done, get its PR merged to `main` (or tell David it's still open) before the session ends

## A double tap could play a card and run the room

### What Happened
Playing a card redraws the screen at once. In review, the second click of a fast double tap was found to land on whatever slid into the card's place, which with one card in hand is the Run etch button.

### Root Cause
Buttons that move under the finger after a redraw. Nothing told a deliberate second tap from the tail end of a double tap.

### Rule to Prevent
✅ Every button that changes the run uses `onSingleClick` (render.js), which ignores the second click of a double click
✅ After any redraw on tap, test a fast double tap at the same spot in the browser

## A screen test tapped off the edge of the screen

### What Happened
The phone double-tap test failed: the card was never played. No click reached the page at all.

### Root Cause
On the phone the card sits below the bottom of the screen. A raw `page.touchscreen.tap(x, y)` does not scroll, so it tapped a spot outside the window. (`locator.tap()` does scroll, which is why the other tests passed.)

### Rule to Prevent
✅ Before a raw tap or click at coordinates, call `scrollIntoViewIfNeeded()` on the target and measure it after
✅ When a guard test passes, switch the guard off once and confirm the test then fails


## A screen test's tap was eaten as the second click of a double click

### What Happened
After the screen tests started walking the route to reach etch, the phone double-tap test failed: the card was never played. The test had tapped "go straight on" a moment before, at about the same spot.

### Root Cause
Chrome counts two taps close together in time and place as a double click (`event.detail` 2), even across a screen change. The double-tap guard (`onSingleClick`) correctly ignored the second one; the test was simply faster than a person.

### Rule to Prevent
✅ In screen tests, wait out the double-click window (`DOUBLE_CLICK_WINDOW_MS`) before a tap that must count as a fresh gesture
✅ When a tap seems to do nothing, log `event.detail` and the click target before changing game code
