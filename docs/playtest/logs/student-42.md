# Curious student — seed 42 (second run, using what I learned)

### Step 0 — Floor plan
Screenshot: docs/playtest/shots/student/42-00-s2-01-first.png
I see: Same Inlaid Cu line, same 9 rooms in the same order. This time red SPC tags on Wet clean (rooms 1 and 5), Deposition (2 and 6) and Etch.
I think: Same route, different tools flagged. Plan: PM the flagged tools in the corridors before their rooms, skip the rinse after the strip clean, never wait in the Q-time corridor. I tried tapping a room on the map to see its chart — nothing is tappable. I'd love that. I'm still not picking the NMOS lot: I want to see if my lessons work on the same line first.
I try: Tap "Deposition" on the map (does nothing), then Enter step 1.
Mood: curious

### Step 1 — Wet clean (step 1)
Screenshot: docs/playtest/shots/student/42-01-s2-02-excursion.png
I see: Chart has one red square above the upper control line, then the next point back near the centre. Red text: "Excursion: one lot measured past the control limit. Standard practice is to re-measure and check the tool. If it was a bad measurement or a one-off, the next lots come back inside the limits." "A point beyond the upper control limit."
I think: This is a real lesson and I get it: one bad point that comes back is probably a one-off, not drift. The chart literally shows it. But then why is the room tagged red on the map like the drifting ones? Same alarm colour for "probably nothing" and "your tool is walking away".
I try: Rinse (fine here, before the strip), Run. 100 → 99.5.
Mood: hooked

### Step 5 — PM / DOE after step 1
Screenshot: docs/playtest/shots/student/42-05-s2-03-pm.png
I see: Deposition "Shift" (points above centre), Litho in control, Etch "Shift" with two red squares below the lower control line, Wet clean excursion, Plating creeping up to ~3.2 (in control), CMP's last point dropping to ~222 (in control).
I think: Etch looks the scariest (two points out). But last run the etch tool's drift was only 0.3 of a 9.8-point loss, so I suspect PMs don't move much. There are PM stops in most corridors, so I plan: Deposition now, Etch next corridor, Plating after litho, CMP after barrier deposition.
I try: PM the Deposition tool.
Mood: curious

### Step 7 — Deposition (oxide) (step 2)
Screenshot: none
I see: Forecast 0.7 points. Pump-purge card now says "About 0.1 points more lost in this room."
I think: Good — the card is honest that it would hurt on a healthy chamber. That's a useful line. But it also means there's nothing to do here. Result 99.5 → 98.8.
I try: Run, then PM the Etch tool in the corridor.
Mood: bored

### Step 12 — Litho (trench) (step 3)
Screenshot: none
I see: "This room will cost about 2.7 points." Tool in control, never PM'd. Trim dose card says "it only fixes a steady shift, not scatter", but still "About 0.4 points less lost".
I think: Last run I PM'd litho and the forecast was 2.8. This run, no PM, healthy tool: 2.7. So that PM in run 1 bought me nothing. And the trim-dose card says it only fixes a shift — there is no shift — but the game says it saves 0.4 anyway. The card text and the number disagree. Which do I believe? I take the number.
I try: Trim dose, Run. 98.8 → 96.8. Then PM the Plating tool in the corridor (its chart was creeping up — keyhole void lesson from run 1).
Mood: confused

### Step 18 — Etch (trench) (step 4)
Screenshot: docs/playtest/shots/student/42-18-s2-04-etch.png
I see: Tool just PM'd, last measured 277.7 nm/min. "This room will cost about 9.6 points... About 3.8 from depth variation... without an etch stop." Over-etch card now has no "points less" line.
I think: I PM'd etch and it's still ~10 points. So etch costs ~10 points no matter what. The "etch stop" decision is supposedly upstream, but in two runs I've never been offered one. The game keeps pointing at a lever I can't reach. Over-etch shows no benefit on a fixed tool, which matches its text ("on a steady tool the attack costs about what it saves") — consistent, at least.
I try: Skip over-etch, Run. 96.8 → 87.6, "about 0.2 points from the Etch tool's drift" — even right after a PM.
Mood: annoyed

### Step 21 — Event: quality auditor
Screenshot: docs/playtest/shots/student/42-21-s2-05-event.png
I see: "A quality auditor is on the floor... Walk them through now: +30 min cycle time · Wet clean tool serviced. The lot waits (and grows Q-time in a Q-time window)" or "Ask them to come back later: −100 cash".
I think: Fun. I'm not in the Q-time corridor yet, so waiting is free-ish, and I get a free service. Easy pick, and it's teaching me Q-time again in a new costume. After I chose, the result line printed under the option was confusing to read (it looked like "Chosen / Ask them to come back later −100"), I had to check my cash (still 1460) and the wet clean chart (it showed PM) to be sure I got what I clicked.
I try: Walk them through now.
Mood: curious

### Step 23 — Resist strip + wet clean (step 5)
Screenshot: docs/playtest/shots/student/42-23-s2-06-step5.png
I see: Forecast 0.6 points, rinse card offers "About 0.2 points less".
I think: Skip the rinse — it grows oxide before the barrier. I'm applying a lesson. Result 87.6 → 87.0.
I try: Run, go straight through the Q-time corridor.
Mood: curious

### Step 26 — Deposition (barrier + seed) (step 6)
Screenshot: none
I see: "about 3.1 points" — exactly like run 1, where I also skipped waiting.
I think: So the 3.1 isn't Q-time and isn't my rinse. It's just what this step costs. Nothing to play that helps. 87.0 → 83.5.
I try: Run, then PM the CMP tool.
Mood: bored

### Step 31 — Plating (step 7)
Screenshot: docs/playtest/shots/student/42-31-s2-07-plating.png
I see: Straight to result again: 83.5 → 78.6, 4.9 points, "about 0.1 points from the Plating tool's drift". "Nothing could be played here."
I think: I PM'd plating specifically because of run 1's keyhole void, and it cost MORE this time (4.9 vs 3.9). Drift was only 0.1. So the PM is basically decoration. What am I supposed to do about voids? There's no card.
I try: Continue, straight to CMP.
Mood: annoyed

### Step 33 — CMP and Metrology (steps 8, 9)
Screenshot: none
I see: CMP 78.6 → 72.5, 6.1 points, nothing to play. Metrology 0.0, "Lot shipped".
I think: Run 1: 72.4%. Run 2, with a completely different set of PMs, a free service and skipped rinses: 72.5%. My choices moved the final number by 0.1 points. That's the moment the "game" part dies for me. I'm still here for the reading.
I try: See the ship report.
Mood: about to quit

### Step 36 — Ship report
Screenshot: docs/playtest/shots/student/42-36-s2-08-ship.png, docs/playtest/shots/student/42-36-s2-09-ship-map.png, docs/playtest/shots/student/42-36-s2-10-ship-charts.png
I see: Shipped 72.5%. Diagnose options: Chamber flaking, Dishing, Removal-rate drift, Q-time oxide. Wafer map: right column and bottom row have red failed sites. After-run charts: etch, after the PM, is still sitting near 277-278 — the PM did not bring it back to 300.
I think: Keyhole void isn't even offered this time, though plating cost 4.9. I can rule out Q-time oxide (I never waited) and removal-rate drift (I PM'd CMP and its chart is back at 250). Between flaking (barrier deposition 3.5) and dishing (CMP 6.1), CMP lost more and the glossary said "wide lines dish". There's no evidence of wide vs narrow lines on screen, so this is half reasoning, half guess. Also: the etch chart didn't recover after PM. What did the PM do?
I try: Dishing.
Mood: curious

### Step 37 — Diagnosis right
Screenshot: docs/playtest/shots/student/42-37-s2-11-diagnosis.png
I see: "Diagnosed: Dishing. Written in your notebook. It cost 4.0 yield points: CMP, step 8. Unlocks for later runs: Add dummy fill to the mask, Low-pressure final polish."
I think: Got it! And the unlocks are cool — "dummy fill" is a real trick I'd never have heard of: you add fake metal so the polish sees even density. I'd repeat that to a friend. But I got it by elimination, not by reading evidence. The wafer map doesn't show "wide lines". So it still feels like a quiz I passed.
I try: Notebook.
Mood: hooked

### Step 38 — Notebook (1)
Screenshot: docs/playtest/shots/student/42-38-s2-12-notebook.png
I see: Dishing, its symptom, "Unlocks: Add dummy fill to the mask, Low-pressure final polish", "Found on seed 42", "19 failure modes still to find."
I think: First real reward. I want to see a CMP card next run. Next run I'll try the other lot type, NMOS transistor, as I've now done the copper line twice.
I try: Seed 777.
Mood: hooked
