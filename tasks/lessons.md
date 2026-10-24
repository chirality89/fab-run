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
