# Student log, seed 123456

### Step 1 — Floor plan (first screen)
Screenshot: docs/playtest/shots/student/123456-00-s123456-01-floor.png
I see: Blue header "FLOOR PLAN", "Inlaid Cu line · yield 100.0%", seed, Cash 1500, Cycle time 0 min. A "START" box says the lot is at the door, one button "Enter step 1: Wet clean". A 3x3 grid of 9 coloured rooms (Wet clean, Deposition, Litho bay, Etch, Wet clean, Deposition, Plating, CMP, Metrology) with little tags between them: MET, PM, BUY, EVT, QT. Etch has a red "SPC" badge. Legend at the bottom.
I think: Okay, so it's a path through a factory. "Inlaid Cu line" — copper line, inlaid? No idea what that means; I'm guessing it's the thing I'm building. Yield is 100% and I guess it goes down. Nobody tells me what a "lot" is, how many wafers, what I'm trying to reach, or what makes me lose. The legend explains abbreviations with more abbreviations: "PM PM / DOE" — that explains nothing. "SPC the tool's chart trips a rule" — what chart? what rule? Etch already has a red SPC flag before I've done anything, which sounds bad, but I don't know what to do about it. CMP — no clue. Q-time window — no clue.
I try: Nothing else to tap, so "Enter step 1: Wet clean". Tried to think of tapping the words but they aren't buttons.
Mood: confused

### Step 2 — Wet clean room
Screenshot: docs/playtest/shots/student/123456-01-room1.png, docs/playtest/shots/student/123456-01-room1-lower.png
I see: Cyan header "WET CLEAN, Step 1 of 9". Line yield 100% bar with "Scrap 40%" and "Spec 70%" marks. "This room will cost about 1.0 points of yield if nothing changes." A 5x5 wafer map all 100. Hand: "No practices left in your hand." One button "Run wet clean". Below: time budget 10 of 10 min, slots empty, tool SPC chart "Particle adders (per wafer)" with a key.
I think: Okay, now I get two things: the yield bar has a scrap line at 40% (lose) and a spec at 70% (I guess I need to be above that to ship). That's the first time anything told me how to lose. Good. But "No practices left in your hand" — I never had any! It says "left" like I used them. What's a practice? The time budget says 10 min but I have nothing to spend it on. The wafer map caption is nice: each square is a die site, % of 25 wafers good there. So a lot = 25 wafers — I had to learn that from a caption under a grid. "Particle adders" — I guess particles added to the wafer by the tool? The SPC key is actually helpful: red = spec, dashed = control limits. Still no idea what SPC stands for. The dashed lines look brown/orange on screen, not described as such.
I try: "Run wet clean" (only choice).
Mood: confused

### Step 3 — Wet clean result
Screenshot: docs/playtest/shots/student/123456-02-after-room1.png
I see: Yield 100.0% -> 99.1%. "This room cost 0.9 points of yield." Wafer map now shows 98s and 99s. Buttons: Continue to the corridor, Replay this seed, New seed.
I think: So I pressed one button and lost a point. Nothing I did mattered. Fine as a tutorial step, but nobody said it was a tutorial step.
I try: Continue to the corridor.
Mood: bored

### Step 4 — Corridor after step 1
Screenshot: docs/playtest/shots/student/123456-03-corridor1.png
I see: "Take one side stop": Metrology +20 min "reveals hidden values (coming in a later update)", Event +10 min "A choice with a tradeoff". Or go straight to step 2: Deposition (SiN + oxide). Also "Scrap the lot". Cycle time 10 min in the header.
I think: Metrology is literally marked as not finished, so why offer it? "SiN + oxide" — silicon nitride, I can guess that from chemistry class. Oxide of what, silicon I guess. Cycle time is going up but I don't know if cycle time hurts me. Is there a time limit for the whole run? No idea. "Scrap the lot" sitting right there is weird — why would I ever press that?
I try: Event, because it promises a choice.
Mood: curious

### Step 5 — Event: Quality audit
Screenshot: docs/playtest/shots/student/123456-04-event1.png
I see: Auditor wants to walk the line. Option A: +30 min cycle time, wet clean tool serviced ("the lot waits and grows Q-time in a Q-time window"). Option B: -100 cash, a written finding.
I think: First real decision. But I can't weigh it: I don't know what cycle time costs me, what Q-time is, or what cash is for yet. And it fixes the *wet clean* tool, which I've already used and which looked fine; the tool with the red SPC flag is Etch. Picking A because cash sounds like something I might need later.
I try: Walk them through now.
Mood: confused

### Step 6 — Event result
Screenshot: none
I see: "The auditor flags the wet bench as overdue, and it gets serviced." Continue button.
I think: "Wet bench" — is that the wet clean tool? I assume so. Nice bit of flavour.
I try: Continue.
Mood: curious

### Step 7 — Deposition room
Screenshot: docs/playtest/shots/student/123456-06-room2.png
I see: Same layout as wet clean. 15 min budget, still "No practices left in your hand", one Run button. Cost 0.9 points.
I think: Two rooms, zero decisions. Starting to think the "hand" is broken or I missed something. Where are my cards?
I try: Run deposition, then continue.
Mood: bored

### Step 8 — Corridor after step 2
Screenshot: none
I see: PM / DOE +40 min ("PM one tool, or DOE one practice"), Procurement +10, Event +10, go straight to Litho (trench). Cycle time 65 min.
I think: PM and DOE still never spelled out. Since Etch has a red SPC flag, "PM one tool" sounds like the fix. I'm guessing PM = preventive maintenance. DOE I genuinely don't know.
I try: PM / DOE.
Mood: curious

### Step 9 — PM / DOE screen
Screenshot: docs/playtest/shots/student/123456-09-pm1.png
I see: "DOE A PRACTICE: A DOE tunes one practice's recipe for the rest of the run. 100 cash." Two DOE options: "Timed over-etch (+20%)" with "residue ×0.3 · underlayer attack ×1.5 · ×0.5 with etch stop", and "Measure all 25 sites". Then "PM A TOOL ON THE ROUTE AHEAD": comes back to 75–95% health. Cards for Litho (Monitor CD), Etch (Etch rate — "Out of control: the etch rate may be shifting. A shifted tool costs yield in this room."), Wet clean, Deposition, Plating (Seam rate on fill monitor), CMP (Removal rate).
I think: OK this screen actually has stuff to read and I like it. Etch says "out of control" in plain words, and the game told me to read SPC charts to choose. That connects the red flag on the map to an action. But: I've never seen "Timed over-etch" as a card — DOE-ing a practice I don't own is abstract. "Underlayer attack", "etch stop", "residue" — I can kind of guess (etching too long eats what's under it), which is cool, that's a real idea. "Monitor CD" — CD? Compact disc? "Seam rate on fill monitor" — no idea. DOE still not expanded: "tunes the recipe" so I'm guessing design of experiments.
I try: PM the Etch tool.
Mood: hooked

### Step 10 — PM done
Screenshot: none
I see: Etch card now "Just PM'd: no lots measured since the PM yet. PM done: the next lots run on a restored tool".
I think: Satisfying. I fixed the problem the map flagged. I'd like to see the health number though — it said 75–95% but won't tell me which.
I try: Continue to Litho.
Mood: curious

### Step 11 — Litho bay room
Screenshot: docs/playtest/shots/student/123456-11-litho.png, docs/playtest/shots/student/123456-11-litho-lower.png
I see: Yellow room. "This room will cost about 6.7 points of yield if nothing changes." First card in my hand ever: "Strip and re-expose, 30 min · 150 cash. Saves a bad exposure, but only before etch, and each strip adds handling particles." In red: "Can't play: Its condition is not met". Slot: "i-line positive resist (material)". SPC chart "Monitor CD (nm)", centre 250, in control.
I think: Finally a card, and I can't play it. "Its condition is not met" — WHICH condition? I guess "a bad exposure has to have happened", but the exposure happens when I press Run, so... when could it ever be playable? Chicken and egg. Why does litho cost 6.7 points when its chart is fine, when wet clean cost 1? Nothing says. "i-line positive resist" — resist I half know (the light-sensitive goo). i-line? positive vs negative? No idea and tapping it does nothing. CD is in nanometres, centred at 250 — so it's a size of something. Critical dimension? I'm guessing the line width.
I try: Tapped "i-line positive resist", "Strip and re-expose" and "CD" to see if they explain themselves. Nothing is tappable. Then Run litho bay.
Mood: confused

### Step 12 — Litho result
Screenshot: docs/playtest/shots/student/123456-12-litho-result.png
I see: 98.2% -> 91.2%. Cost 6.9 points. Wafer map now has a bunch of beige dotted-border squares in the 86–89 range ("warning").
I think: Lost 7 points and I have no idea why. The map has a pattern maybe (more beige on the top row?) but nothing tells me what went wrong at litho. Was the 7 points just "litho is hard"? Is there something I should have done?
I try: Continue.
Mood: confused

### Step 13 — Corridor after litho
Screenshot: none
I see: Metrology (still "coming in a later update"), Procurement, Event, go straight to Etch.
I think: I have 1500 cash and haven't spent any. Let's see what money buys.
I try: Procurement.
Mood: curious

### Step 14 — Procurement
Screenshot: docs/playtest/shots/student/123456-14-procurement.png
I see: Inline metrology 500 (shows drift sooner), In-situ pad conditioner 350 (CMP: stable polish rate, pads consumed faster), Three-additive copper bath 200 (plating: bottom-up fill of narrow features, ages every lot).
I think: Every item has a one-line tradeoff, which I like. "Bottom-up fill of narrow features" — oh, like filling a trench from the bottom so you don't trap a void? That's a cool real-sounding idea I could repeat. "In-situ" I know (in place). "Pad" — polishing pad, guessing. But I have no idea how bad my plating or CMP would be without these, so I'm buying blind.
I try: Bought the copper bath (200) and the pad conditioner (350). Cash 950.
Mood: curious

### Step 15 — Etch room
Screenshot: docs/playtest/shots/student/123456-17-etch.png
I see: "This room will cost about 23.0 points of yield if nothing changes." 8 min budget. SPC chart shows my PM mark. Card: "Timed over-etch (+20%), 4 min. Clears residue but attacks the film below, unless an etch stop is there."
I think: WHAT. 23 points?! I PM'd this tool specifically. The SPC says "Just PM'd". So either the PM did nothing or there's another reason etch is expensive and I'm not told it. Is there an etch stop? I deposited "SiN + oxide" earlier — is SiN an etch stop? I'm guessing. The game doesn't say whether I have one. "Residue" of what?
I try: Play Timed over-etch.
Mood: annoyed

### Step 16 — Etch after playing the card
Screenshot: docs/playtest/shots/student/123456-18-etch-played.png
I see: Forecast dropped from 23.0 to 19.7. Time 4 of 8 left. No more cards.
I think: OK, the card helped by 3 points, I can see that and that's nice feedback. But I'm still eating ~20 points with no idea why.
I try: Run etch.
Mood: annoyed

### Step 17 — Etch result
Screenshot: docs/playtest/shots/student/123456-19-etch-result.png
I see: 91.2% -> 71.6%. Cost 19.6. Map is now a mix of red crossed squares (63–69, "fail") and beige. Red ones seem more on the edges/top-left.
I think: I'm now basically AT spec (70%) with 5 rooms left. I did the one thing the game hinted at (PM the flagged tool) and still got hammered. If wet clean costs ~1 per room, I'll be below 70 by the end. I feel cheated, not taught: the game never told me why etch was 23 points. The red squares do seem to be on the outside of the wafer — edge problem? I'm guessing.
I try: Continue.
Mood: annoyed

### Step 18 — Corridor after etch, Metrology side stop
Screenshot: docs/playtest/shots/student/123456-21-metrology.png
I see: I tried the Metrology stop. "Metrology cost 20 min of cycle time. What this stop does comes in the next update."
I think: I paid 20 minutes for a sign saying "not built yet". Don't offer me a button that does nothing.
I try: Continue.
Mood: annoyed

### Step 19 — Resist strip + wet clean
Screenshot: docs/playtest/shots/student/123456-22-room5.png
I see: Cost about 0.7. No cards. Ran it: 71.6 -> 71.0.
I think: Fine. "Resist strip" makes sense — you take the resist off after etch. That's a nugget I actually picked up from the room name, not from anything explaining it.
I try: Run, continue.
Mood: bored

### Step 20 — Corridor in a Q-time window
Screenshot: docs/playtest/shots/student/123456-24-corridor-qt.png
I see: "Q-time window: native oxide keeps growing until the barrier goes on. Every minute the lot waits at a side stop here adds oxide risk." Side stops show "Waits in Q-time: +0.020 oxide risk".
I think: THERE it is. Q-time finally explained, and it's a genuinely cool fact: clean silicon/copper starts oxidising in air, so you have a clock between clean and the next layer. I'd tell a friend that. But it shows up at step 5, after the floor plan and the audit event had both thrown "Q-time" at me. And "+0.020 oxide risk" — 0.02 of what? 2%? 2 points?
I try: Go straight on (I'm at 71%, spec is 70, no room for risk).
Mood: curious

### Step 21 — Deposition (barrier + seed)
Screenshot: docs/playtest/shots/student/123456-25-room6.png
I see: Cost about 3.6 points. No cards. Ran it: 71.0 -> 67.2.
I think: Now I'm under spec and there's literally nothing I can do in this room. Why 3.6 here when the first deposition was 0.9? Silence.
I try: Run, continue.
Mood: about to quit

### Step 22 — Event: Hot lot request
Screenshot: docs/playtest/shots/student/123456-28-event2.png
I see: Run it hot: -30 min, +150 cash, +0.02 risk random dots. Or keep its place, nothing changes.
I think: Readable. I still don't know if cycle time or cash count toward a score. I'm already failing, so I just keep it safe.
I try: Keep its place in line.
Mood: bored

### Step 23 — Plating
Screenshot: docs/playtest/shots/student/123456-30-plating.png
I see: My copper bath is in the slot. Cost about 2.0. "Seam rate on fill monitor (%)". No cards. Ran: 67.2 -> 65.0.
I think: Did the bath I bought help? I have no before/after. Paid 200 and can't tell.
I try: Run.
Mood: bored

### Step 24 — CMP
Screenshot: docs/playtest/shots/student/123456-33-cmp.png
I see: Cash went from 950 to 930 with nothing telling me why. Pad conditioner in the slot. Removal rate chart. Cost about 6.6. No cards. Ran: 65.0 -> 58.8.
I think: CMP is never spelled out. "Removal rate" plus "pad" makes me guess it's polishing. Lost 6 points with no choice. Someone took 20 cash out of my pocket and I'm guessing it's the "pads consumed faster" thing.
I try: Run, go straight to Metrology.
Mood: about to quit

### Step 25 — Metrology room
Screenshot: docs/playtest/shots/student/123456-36-metro-room.png, docs/playtest/shots/student/123456-37-measured.png
I see: "No SPC chart here: the metrology gauge is the reference." Card "Measure all 25 sites, 20 min · 150 cash, Full information". I played it: cash 930 -> 780, nothing on screen changed.
I think: "Full information" — where? The wafer map looks the same. I paid 150 for nothing I can see.
I try: Run metrology.
Mood: annoyed

### Step 26 — End: lot rejected
Screenshot: docs/playtest/shots/student/123456-38-end.png
I see: "Lot rejected: shipped below the customer spec." 58.8%.
I think: Expected. Lost at etch, really, and I still don't know why etch was so bad.
I try: See the ship report.
Mood: annoyed

### Step 27 — Ship report + Diagnose
Screenshot: docs/playtest/shots/student/123456-39-ship-report.png, docs/playtest/shots/student/123456-39-ship-report-lower.png, docs/playtest/shots/student/123456-40-diagnosed.png
I see: Verdict, cost per good die 7.41, cycle time 253 min. A "Yield by step" table (etch 19.6 is the obvious villain). Final wafer map: all red except the centre 72. Tool SPC after the run, all "in control". DIAGNOSE: "Which failure mode hurt this lot? One guess." Edge ring / Keyhole void / Etch residue / Post-exposure delay T-top.
I think: The yield-by-step table is the most useful thing in the game. Etch was the killer. Options: "Etch residue: opens spread evenly after etch, while the etch rate falls on the etch SPC chart" — etch is where I lost, so I picked it, even though I'd PM'd the tool. "Edge ring: only the outer ring fails; inner sites are clean" — but my final map has the inner sites at 56–64, all red. That's not "inner sites are clean". At the etch step the edges were a bit worse (63–68) than the middle (72–87), but the middle wasn't clean either.
I try: Etch residue.
Result: "Not this one. What did hurt this lot: Edge ring. It is not written in your notebook: diagnose it on a later run to earn it."
I think: That's it? No why. Which step caused the edge ring? Was it etch? Was the 23-point forecast the edge ring? What should I have done — is there a card or a tool for it? What notebook? First time I've ever heard of a notebook. This is a quiz with the answer key withheld. I learned nothing about edge rings except that the game's description of one didn't match my map.
Mood: annoyed
