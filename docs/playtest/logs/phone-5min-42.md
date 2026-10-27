# Phone player with 5 minutes — seed 42

Plan from last time: the red "SPC" tags on the map are the danger. Find a PM stop before them.

### Step 1 — Floor plan
Screenshot: docs/playtest/shots/phone-5min/42-00-s42-01-first.png
I see: Same factory, three red SPC tags this time: Wet clean (step 1), Etch (4), Wet clean (5). PM stops between 1–2 and 2–3, none between 3–4.
I think: (0:00) Now I get the map: tags between rooms are the stops I can pick. Step 1 is flagged and there's no stop before it, so I just eat it. I need a PM before Etch.
I try: Enter step 1.
Mood: curious

### Step 2 — Wet clean (flagged)
Screenshot: none
I see: Red "Out of control… A point beyond the upper control limit." But forecast: "about 1.0 points" — same as last run's healthy wet clean. Empty hand again, button at the bottom.
I think: (0:15) So red here costs nothing extra? Last run red etch cost 25 points. Red means "maybe a bomb, maybe nothing". I can't read that.
I try: Scroll, Run wet clean. 100 → 99.1. Corridor.
Mood: confused

### Step 3 — Corridor → PM / DOE
Screenshot: docs/playtest/shots/phone-5min/42-04-s42-02-pm.png ; docs/playtest/shots/phone-5min/42-04-s42-03-pm-tools.png
I see: A page about four phone-screens tall. Top: "DOE a practice" with lines like "residue ×0.3 · underlayer attack ×1.5 · underlayer attack ×0.5 with etch stop" vs "×1.25". Then "PM a tool on the route ahead": six tools each with its own full control chart and a "PM this tool" button.
I think: (0:40) Wall of text and multipliers. I skip the DOE part entirely — I don't know what ×1.25 underlayer attack means for me. I scroll past four charts to find Etch. It's the right idea, but on a phone it's a lot of thumb work for one tap.
I try: Scroll down, "PM this tool" on Etch. It says "PM done: the next lots run on a restored tool". Good, clear.
Mood: curious

### Step 4 — Deposition
Screenshot: none
I see: Same empty-hand room. 99.1 → 97.9.
I think: (1:10) Still a press-one-button room. I already scroll to the bottom by reflex.
I try: Run deposition, corridor.
Mood: bored

### Step 5 — Corridor → PM again, then Litho
Screenshot: none
I see: Second PM stop. Wet clean (step 5) now restored. The list also shows Deposition at step 6 has just turned red.
I think: (1:40) Fixed the other flagged tool. Of course a new one pops up. Litho forecast 6.6 points with default resist and my one card is greyed out again ("condition is not met" — which condition?!).
I try: PM wet clean; Run litho bay. 97.9 → 91.7.
Mood: curious

### Step 6 — Procurement
Screenshot: none
I see: Optical endpoint detector 600 (etch, "only helps when there is a clear film change"), pad conditioner 350, three-additive copper bath 200.
I think: (2:10) Etch is the killer room, so I'll buy the expensive etch thing. Bath for plating too.
I try: Buy 600 and 200. Cash 700.
Mood: hooked

### Step 7 — Etch (PM'd, with endpoint detector)
Screenshot: docs/playtest/shots/phone-5min/42-17-s42-04-etch.png ; docs/playtest/shots/phone-5min/42-19-s42-05-etch-result.png
I see: "This room will cost about 21.4 points" — even after the PM and the 600-cash detector in the slot. Played the over-etch card: forecast 18.1. Ran: 91.7 → 73.4.
I think: (2:40) WHAT. I did everything the last run taught me — PM'd the tool, bought the etch upgrade, played the card — and etch still takes ~18 points. Last time with nothing it took ~22. So my whole plan bought me 3–4 points and 850 cash. Nothing on screen tells me why etch is so brutal or what would actually fix it. The detector's text said "only helps when there is a clear film change" — no idea if there is one. Spec is 70% and I'm at 73.4% with five rooms left. Same dead end as last run.
I try: Continue anyway, I want to see an ending once.
Mood: annoyed

### Step 8 — Wet clean (5), Q-time corridor, Deposition (6)
Screenshot: docs/playtest/shots/phone-5min/42-23-s42-06-qtime.png
I see: Wet clean 0.8 points. Corridor now has a Q-time warning: every side stop adds "+0.020 oxide risk". Deposition (6) was red and cost 3.2: 72.6 → 69.3, now under spec.
I think: (3:20) Q-time note is short and clear: don't dawdle here. Fine, go straight. Dropping under 70% was announced by nothing in particular — it just ticked over.
I try: Go straight, run, run.
Mood: bored

### Step 9 — Plating, CMP
Screenshot: docs/playtest/shots/phone-5min/42-27-s42-07-plating.png
I see: Plating with my bath in the slot, empty hand, 2.4 points. CMP, empty hand, "about 8.2 points", cost 8.2. 67.0 → 58.8.
I think: (3:50) Another surprise big room with zero cards. CMP was "in control" all run and still took 8 points. So the SPC flags aren't even the main predictor of pain. I'm just watching numbers fall.
I try: Run, continue, go straight.
Mood: bored

### Step 10 — Metrology, end
Screenshot: docs/playtest/shots/phone-5min/42-33-s42-08-metrology.png ; docs/playtest/shots/phone-5min/42-34-s42-09-end.png
I see: Metrology costs 0.0. A card "Measure all 25 sites, 20 min · 150 cash". I skip it. "Lot rejected: shipped below the customer spec."
I think: (4:05) Finally an ending. Final room is a formality. 
I try: "See the ship report".
Mood: bored

### Step 11 — Ship report + diagnose
Screenshot: docs/playtest/shots/phone-5min/42-35-s42-10-report.png ; docs/playtest/shots/phone-5min/42-36-s42-11-diagnose.png
I see: Verdict rejected, 58.8%, cost per good die 7.62, cycle time 223 min. Then "Diagnose: which failure mode hurt this lot? One guess." Four options: Underlayer attack, Etch residue, Q-time oxide, Removal-rate drift. Then a yield-by-step table (etch 18.4 is the big one, CMP 8.2) and six SPC charts. Page is about five phone screens tall.
I think: (4:30) The yield-by-step table is the best thing in the game — that's what I wanted to see DURING the run. Diagnose is a neat idea; it's under the fold though. I guessed Etch residue (run 1's etch chart said "8 points below the centre line", i.e. rate falling). Wrong: it was Underlayer attack. Which is… the over-etch card I played, both runs, because it was the only card and it lowered the forecast. So the game nudged me to play it and then blamed me for it. I feel tricked, not taught. Also "not written in your notebook: diagnose it on a later run to earn it" — what notebook? I've never seen one.
I try: Nothing. One guess and done.
Mood: annoyed

Run summary: about 4:30 of my time for a full run, because I now skip everything and know where the buttons are. Rejected at 58.8%. Finishable in five minutes only on the second run, and only by not reading.
