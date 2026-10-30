# Fab engineer — seed 777 (third run, NMOS transistor lot — the one I hadn't played)

### Step 1 — Floor plan, switching lot type
Screenshot: docs/playtest/shots/fab-engineer/777-01-s777-01-nmos-start.png
I see: Started as Inlaid Cu, tapped "Run NMOS transistor instead". URL got "&lot=nmos". 13 rooms: Wet clean, Deposition, Litho, Etch, CMP (SPC flag), Wet clean, Diffusion, Deposition, Litho, Etch, Implant, Diffusion, Metrology. Q-time between room 6 (wet clean) and room 7 (diffusion). Notebook (1) carried over.
I think: I read this as: pad oxide/nitride, active litho, STI etch, STI CMP, pre-gate clean, gate oxidation, poly dep, gate litho, gate etch, S/D implant, activation anneal. That's a believable skeleton. The Q-time between pre-gate clean and gate oxidation is THE textbook Q-time — good, they got that one right. Missing: no STI fill dep between etch and CMP (you'd polish what, exactly?), no well implants, no spacer, no LDD. Simplification I'll allow, though "CMP straight after etch" will make a new hire ask what got polished. Only CMP flagged; everything else clean.
I try: Enter step 1.
Mood: curious

### Step 2 — Room 1: Wet clean (NMOS)
Screenshot: docs/playtest/shots/fab-engineer/777-02-s777-02-room1.png
I see: Same wet clean room, chart in control (last 23.4). DI rinse card still says "That only matters after the strip clean, where the barrier goes on next." Played it, ran: 100 → 99.0, "0.6 points came from the Wet clean tool's drift".
I think: That rinse text is copper-line text. There's no barrier in an NMOS front end. In this flow the oxide that matters is before gate oxidation. A new hire would be lost. And 0.6 of 1.0 points blamed on "drift" on a chart the game calls in control. Either the chart is lying or the word is.
I try: Continue; take the Event.
Mood: confused

### Step 3 — Event: Quality audit
Screenshot: docs/playtest/shots/fab-engineer/777-06-s777-03-event.png
I see: "A quality auditor ... wants to walk the line." Walk them through now: +30 min, "Wet clean tool serviced". Or ask them to come back later: −100 cash, a written finding.
I think: Auditors don't fix tools. An audit finding opens a CAPA; it doesn't send a tech to service the wet bench in 30 minutes while the lot waits. And "come back later" as a way to dodge an auditor is a terrible thing to put in front of a new hire, even with a cost on it. This one teaches a wrong idea of what quality does.
I try: Walk them through (I want the bench serviced before the pre-gate clean anyway). Result: "The auditor flags the wet bench as overdue, and it gets serviced."
Mood: annoyed

### Step 4 — Room 2: Pad oxide + SiN
Screenshot: docs/playtest/shots/fab-engineer/777-08-s777-04-padox.png, docs/playtest/shots/fab-engineer/777-08-s777-05-padox-spc.png
I see: Forecast 4.0 points. Particle chart "In control", last lot 19.8, centre 15. Pump-purge card: "With a healthy chamber it buys almost nothing" … "About 0.8 points less lost in this room." Played it, ran: 99.0 → 95.8, 3.2 points, "about 2.7 points came from the Deposition tool's drift".
I think: This is the worst one yet. The chart is green, no badge on the floor plan, no PM stop offered before this room — and 2.7 of 3.2 points are drift. The glossary promised drift "shows on SPC before the lot gets there". By eye the points sit mostly above centre, so in hindsight it was running dirty, but by the game's own rules it was "in control". Telling a new hire "in control" and then charging them for drift teaches them SPC doesn't work. Pad oxide is normally grown, not deposited, but I'll let that go.
I try: PM / DOE stop next.
Mood: annoyed

### Step 5 — PM / DOE (NMOS)
Screenshot: docs/playtest/shots/fab-engineer/777-12-s777-06-pm.png
I see: Litho (active) in control, Etch (isolation trench) in control, CMP "Oxide fill + CMP (stop on SiN)" Shift — all points above centre. Wet clean just serviced. Deposition next used at step 8 Poly-Si — "In control".
I think: OK, step 5 includes the oxide fill, so my "what are you polishing" complaint is answered. STI CMP with a nitride stop: a fast removal rate is less dangerous with a stop layer, but you still get more oxide dishing in wide trenches. The same "Deposition" tool did pad oxide + nitride and will do poly. Three different tools in real life. The deposition tool that just cost me 2.7 points still reads "In control" — I don't trust that chart now. One PM: CMP is flagged, deposition is the one that actually hurt. I'll trust what I saw, not what the chart says: but CMP comes first and the next stop might not have a PM. CMP now.
I try: PM the CMP tool.
Mood: confused

### Step 6 — Room 3: Litho (active), dummy fill unlocked
Screenshot: docs/playtest/shots/fab-engineer/777-14-s777-07-litho-active.png
I see: i-line resist, CD chart in control at 253.5. New card from my notebook: "Add dummy fill to the mask, 0 min, 100 cash, dishing ×0.4. Costs a mask change and adds capacitance from the fill shapes." Rework still greyed with "no step on this route". Trim dose again "0.3 points less".
I think: Dummy active fill to even out STI CMP is exactly right, nice that the unlock lands where it's useful. But "add dummy fill to the mask" as a 0-minute, 100-cash move made in the litho bay while the lot sits on the scanner? Fill is a design/tape-out decision and a new reticle is weeks and serious money. "Capacitance" is a metal-fill concern, not active fill. I played it anyway — forecast didn't change here (it pays at CMP), no estimate shown. Ran: 95.8 → 94.0.
I try: Procurement.
Mood: curious

### Step 7 — Procurement (NMOS)
Screenshot: docs/playtest/shots/fab-engineer/777-18-s777-08-procurement.png
I see: Radial gas-flow trim (etch), Inline metrology "next used at step 13: Electrical test", Thick resist for deep etch, 90 cash, "Survives long etches (TSVs)... cd error ×1.3", next used at step 9: Litho (gate).
I think: Step 13 is shown as "Metrology" on the floor plan and "Electrical test" here — which is it? Very different things. Inline metrology at the last step still can't warn me of anything. Thick TSV resist offered for a gate litho is a trap a new hire might fall into; at least the cd ×1.3 tells them. Bought nothing.
I try: Continue to etch.
Mood: bored

### Step 8 — Room 4: Etch (isolation trench)
Screenshot: docs/playtest/shots/fab-engineer/777-19-s777-09-sti-etch.png
I see: Forecast 4.0. Etch rate centred, 301.1, in control. Over-etch card: "on a steady tool the attack costs about what it saves" ... "About 1.4 points less lost in this room." Played it: forecast 4.0 → 2.5, actual 2.5.
I think: The card text and the number disagree again: steady tool, centred chart, and over-etch saves 1.4 points. And for an STI trench etched into silicon, "residue" and "attack on the film below" don't mean much — there is no film below, over-etch just makes the trench deeper. The card is copied from the metal etch and doesn't fit the step. What a player learns: "always over-etch, it's free yield". Wrong.
I try: Continue.
Mood: annoyed
