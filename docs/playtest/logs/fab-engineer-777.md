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

### Step 9 — Room 5: Oxide fill + CMP (stop on SiN)
Screenshot: docs/playtest/shots/fab-engineer/777-23-s777-10-sti-cmp.png
I see: Forecast 3.5, "About 1.1 of these points come from dishing (wide features polished below the surface). The layout set how big this is: oxide in wide isolation trenches dishes in any polish. Dummy fill at the active litho or a gentler polish here reduces it." Card: Low-pressure final polish, dishing ×0.6, "About 0.4 points less". Played it. 91.5 → 88.4.
I think: This is the game at its best. Correct physics, it names the cause, it tells me which earlier choice (dummy fill) already shrank it, and it offers a sensible knob. The unlock from my notebook paid off in the place it should. If every room read like this I'd hand it to an intern.
I try: PM / DOE next: PM the Deposition tool (it's used again for poly at step 8 and it hurt me at step 2).
Mood: hooked

### Step 10 — PM list again, then pre-gate clean
Screenshot: docs/playtest/shots/fab-engineer/777-27-s777-11-pm2.png
I see: Deposition chart: last point right on the UCL (~27), still "In control". Wet clean "just serviced". PM'd deposition. Pre-gate clean: 88.4 → 87.8. Same rinse card, still talking about "the barrier".
I think: The deposition chart only now looks bad, after it already took 2.7 points from me. The telegraph came after the hit, not before.
I try: Run clean without rinse (Q-time next).
Mood: curious

### Step 11 — Q-time corridor (pre-gate)
Screenshot: docs/playtest/shots/fab-engineer/777-31-s777-12-qtime.png
I see: "Q-time window: native oxide keeps growing on the bare silicon until the gate oxide is grown." Same +0.040 / +0.010 oxide risk.
I think: Here "native oxide on bare silicon" is exactly right. In the copper flow the same sentence was wrong. Same mechanic, correct in one flow, wrong in the other. "Oxide risk 0.040" still has no unit.
I try: Go straight to gate oxidation.
Mood: curious

### Step 12 — Room 7: Gate oxidation (Diffusion)
Screenshot: docs/playtest/shots/fab-engineer/777-32-s777-13-gateox.png
I see: Ran on its own. "Nothing could be played here". 87.8 → 84.5, 3.3 points. No tool SPC chart at all on this room.
I think: Gate oxide — the most critical film in the device — and I get no chart (no thickness, no particles), no card, nothing. 3.3 points gone with no reason given. A new hire learns nothing from this step.
I try: Procurement (nothing worth buying), continue.
Mood: annoyed

### Step 13 — Room 8: Poly-Si deposition (after PM)
Screenshot: none
I see: Forecast 0.5 (vs 4.0 at the pad-oxide step on the same tool before PM). Ran: 84.5 → 84.1.
I think: The PM was worth it — 2.7 points saved. Good feedback, the one time a PM visibly paid.
I try: Event.
Mood: curious

### Step 14 — Event: Hot lot request, again (twice in this run)
Screenshot: docs/playtest/shots/fab-engineer/777-38-s777-14-event2.png, docs/playtest/shots/fab-engineer/777-47-s777-17-event3.png
I see: Same hot-lot request at the corridor after poly, and AGAIN after gate etch.
I think: Fifth time I've seen this event in three runs, twice in one lot. The customer apparently asks every two hours. Feels like there are only three events in the game.
I try: Keep its place both times.
Mood: bored

### Step 15 — Room 9: Litho (gate)
Screenshot: docs/playtest/shots/fab-engineer/777-40-s777-15-gate-litho.png
I see: Dummy fill offered again (useless here, nothing gets polished after gate), rework still greyed "No step on this route does that", trim dose "0.3 points less". Ran without: 84.1 → 82.6.
I think: Gate litho, the one place rework matters most, and the rework card can never be played anywhere on either route. It's dead weight in my hand that tells me something false about the route.
I try: Run, go straight to gate etch.
Mood: annoyed

### Step 16 — Room 10: Gate etch (stop on gate oxide)
Screenshot: docs/playtest/shots/fab-engineer/777-43-s777-16-gate-etch.png
I see: Forecast 4.8. Etch rate centred 303.2. Over-etch card, no estimate shown. Played it: forecast unchanged 4.8, actual 4.7.
I think: Over-etch on poly with a gate oxide stop: real tradeoff is stringers at the STI steps vs. punching through thin gate oxide. Here it does nothing either way. 4.7 points on a centred tool and no explanation of where it comes from.
I try: Event (hot lot again), continue.
Mood: bored

### Step 17 — Rooms 11–12: S/D implant, Activation anneal
Screenshot: docs/playtest/shots/fab-engineer/777-49-s777-18-implant.png, docs/playtest/shots/fab-engineer/777-51-s777-19-anneal.png
I see: Both auto-ran. Implant 77.9 → 77.5 (0.4). Activation anneal 77.5 → 72.7 (4.8 points!). No cards, no SPC charts in either room.
I think: An activation anneal killing 4.8% of die, the biggest single step loss of the run, with no chart, no cause, no choice. What failed? Slip? Contamination? Under-activation (that's parametric)? No dose, no sheet resistance, no thermal-budget hint. I can't diagnose it, and the game doesn't even try to make me. Only 2.7 points of margin left.
I try: Straight to the last room.
Mood: about to quit

### Step 18 — Room 13: Electrical test / ship report
Screenshot: docs/playtest/shots/fab-engineer/777-53-s777-20-etest.png, docs/playtest/shots/fab-engineer/777-54-s777-21-ship.png, docs/playtest/shots/fab-engineer/777-55-s777-23-ship-map.png
I see: Room header "METROLOGY", step name "Electrical test". Shipped at 72.7%. Lot cost 2160 ÷ 454.5 = 4.75. Cycle time 381 min. Diagnose options: Removal-rate drift, Isolation oxide dishing, Handling particles, Native oxide under the gate. Final map: one red site (69), rest 70–77, no pattern. Post-run SPC for wet clean, deposition, litho, etch, CMP only — none for diffusion or implant.
I think: These failure-mode descriptions are much better than the copper ones: "C-V shows electrical oxide thickness larger than the furnace recipe, Vt shifted, breakdown normal" — that's how you'd really spot interfacial oxide. "Step-height scan shows field oxide recessed in wide trenches" — correct. But I was never shown a C-V, a step-height scan or a cross-section, so the evidence they describe isn't on screen. Elimination: I PM'd CMP, did dummy fill + low-pressure, wet clean got serviced. The biggest losses I couldn't explain were gate ox (3.3), gate etch (4.7) and anneal (4.8). Gate ox is the only one linked to an option. Picked Native oxide.
I try: Native oxide under the gate.
Mood: confused

### Step 19 — Diagnosis result
Screenshot: docs/playtest/shots/fab-engineer/777-55-s777-22-diagnosis.png
I see: "Not this one. What did hurt this lot: Handling particles... 5.9 yield points" spread 0.3–1.0 over all 12 steps. "How to spot it: Random killed dies that move from lot to lot; particle adders climb on the wet clean SPC chart."
I think: In hindsight the wet clean adders did climb over the last ~7 lots, but never tripped a rule, and the game had me "service" that bench via an auditor. "Move from lot to lot" — I've only got one lot, I can't see lot-to-lot. And the 2.7 points the deposition tool's drift took at step 2 is apparently not a failure mode at all, while 0.4 points of particles spread over 12 steps is. So the "failure mode that hurt this lot" is the sum of a background tax, not the excursion I fought. As a training message that's backwards: it rewards guessing the baseline, not finding the excursion. Shipped at 72.7%. I'm done.
Mood: annoyed
