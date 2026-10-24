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

## Stopping the local server killed the command running it

### What Happened
After the local screenshots, `pkill -f "http.server 8000"` was run in the same shell command as the next steps. The whole command died (exit 144) and the steps after it never ran.

### Root Cause
`pkill -f` matches the full command line of every process. The shell running that command line also contained the text "http.server 8000", so pkill stopped it too.

### Rule to Prevent
✅ Stop a background server in its own command, or by its process number (`kill <pid>`), never with `pkill -f` inside a longer command
✅ After stopping it, check the steps that were meant to follow actually ran (`git status`)
