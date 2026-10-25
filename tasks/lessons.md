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

## A layout change elsewhere broke an unrelated phone test

### What Happened
After the procurement offer lost its "(coming next update)" note, the phone etch test "tapping timed over-etch plays it" failed: the card tap did nothing. Only the double-tap test had waited out the double-click window; the other etch tests tapped the card straight after "go straight on".

### Root Cause
The shorter map buttons moved "go straight on" to about where the etch card appears. The same double-click window as the lesson above, hit by a test that had never needed the wait.

### Rule to Prevent
✅ A helper that ends on a tap and hands over to a test that taps again waits out the double-click window itself, once, so no test depends on where the last button happened to sit

## The shop sold items for rooms the lot had already left

### What Happened
code-explainer found that a shop after litho could offer a resist, which could never act again. The plan only said "rooms not on the route at all", and I built exactly that.

### Root Cause
"On the route" was checked against the whole route, not the part still ahead. The screen's "Not used again on this route" line hid the gap instead of showing it as a bug.

### Rule to Prevent
✅ Anything offered to the player must be able to matter from where the lot stands now. Check against the route still ahead, not the whole route.
✅ When a screen needs a "this does nothing" message, ask first whether the thing should be offered at all

## A bot test said "cash ≥ 0", but decision O4 allows running costs below 0

### What Happened
Once the bot could buy the pad conditioner, seed 17 (random, full deck) ended at −20 cash: it spent down to 0, then CMP charged 20 for pads. The bot test failed.

### Root Cause
The test's check was stricter than the agreed rule (O4: buying is blocked below 0, running costs may still go below). Until buying existed, nothing could reach that case.

### Rule to Prevent
✅ A test's limits come from the written decision, not from what the engine happens to do today. Read the decision before writing the limit.
✅ When a check fails, ask David which is right, the check or the rule. Never loosen it silently (David chose to change the test, 25 Oct 2026).

## The SPC chart drew a lower spec limit on particle counts

### What Happened
physics-reviewer found that the particle (clean, deposition) and seam-rate (plating) charts showed a lower spec line, and the yield math counted a lower tail. That teaches that "too few particles" is out of spec, which is false.

### Root Cause
I used one two-sided capability model for every parameter. Some parameters are only bad in one direction.

### Rule to Prevent
✅ For every monitored parameter, ask whether it has a lower spec, an upper spec, or both, and keep that as data (`oneSided`)
✅ A chart line on screen is a claim about physics: review it as content, not as decoration

## New content entries went in without draft: true

### What Happened
code-explainer found the six tool monitors had no `draft: true`, which CLAUDE.md §6 requires.

### Root Cause
They were a new kind of content in a new file, so the existing entries weren't there as a pattern to copy.

### Rule to Prevent
✅ Every new entry in `src/content/`, of any kind and in any file, starts with `draft: true`

## A PM could make a healthy tool worse

### What Happened
code-explainer found that a PM set health to the 75–95 roll whatever the tool's health was before, so a PM on a tool at 100 dropped it to 84.

### Root Cause
I built "PM restores to 75–95" literally as "set to 75–95" and never tested a tool that was already healthier than the range.

### Rule to Prevent
✅ For any "restore" or "repair" action, test it on something already in good shape. Repairing must never make a thing worse unless David asked for that as a side effect.
✅ When a rule moves a value into a range, write down what happens to values already above and below the range

## The double-click window caught a new screen test again

### What Happened
The phone DOE screen test failed every time on "Continue to the corridor". Its "Run litho" tap landed where "Continue to step 3" had been tapped a moment before, so the double-tap guard ignored it. My own run of the suite had passed once by timing luck.

### Root Cause
The rule from the earlier lessons (wait out the double-click window) lives in each spec file, not in one shared helper, so a new spec didn't have it.

### Rule to Prevent
✅ Every screen test that taps twice across a screen change waits `DOUBLE_CLICK_WINDOW_MS` between the taps. When a new spec chains screens, add the wait at each screen change.
✅ Run a new screen test with `--repeat-each=5` on the phone before calling it done

## An event's risk could not be diagnosed, and some options cost nothing

### What Happened
physics-reviewer found that the cheaper-slurry option added a polish-rate risk that never showed on any chart, so rule 6 (every failure is diagnosable) broke. It also found that an event could come up after its room had passed, making "take the cash" free.

### Root Cause
I checked each option against the physics but not against the evidence on screen, nor against where the lot is on the route. The second is the same root cause as the shop lesson.

### Rule to Prevent
✅ Every new way to lose yield must show up somewhere on screen (SPC, wafer map, metrology) before it ships. Name where.
✅ Anything offered between rooms (shop items, PM tools, DOE cards, events) is checked against the route still ahead

## The ship report said "Shipped yield" for a scrapped lot, and "CMP CMP"

### What Happened
The unit tests for the ship report passed, but the screenshots showed two wrong texts: a lot the player scrapped was labelled "Shipped yield", and steps whose label equals the room's name read twice ("CMP CMP", "Metrology Metrology").

### Root Cause
I wrote the labels for the shipped case and tested numbers, not words. Text built from two content fields can repeat itself when the fields hold the same words.

### Rule to Prevent
✅ Every label on an end screen is checked once for each end state (shipped, rejected, scrapped by the line, scrapped by the player)
✅ When text joins two content fields, check the screenshot for the case where both say the same thing
