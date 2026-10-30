# Curious student — seed 777 (third run, NMOS transistor lot)

### Step 0 — Floor plan, switching lot type
Screenshot: docs/playtest/shots/student/777-01-s3-01-nmos-first.png
I see: Seed 777 opened as Inlaid Cu line again. I tapped "Run NMOS transistor instead". Now 13 rooms: Wet clean, Deposition, Litho, Etch, CMP, Wet clean, Diffusion, Deposition, Litho, Etch, Implant, Diffusion, Metrology. Only CMP has a red SPC tag. A QT tag sits after the second wet clean. Notebook (1).
I think: A transistor! This is what I actually wanted to learn. But two new room types — Diffusion and Implant — and the Words list has neither. I checked. "NMOS" isn't explained either. I know NMOS from circuits class (n-channel transistor), but a first-year wouldn't. Nothing on screen says what the steps build: no picture of the transistor taking shape.
I try: Enter step 1.
Mood: curious

### Step 4 — Wet clean (step 1 of 13)
Screenshot: docs/playtest/shots/student/777-04-s3-02-step1.png
I see: Same rinse card, same text: "That only matters after the strip clean, where the barrier goes on next."
I think: There's no barrier in a transistor flow. The card is still talking about the copper line. Small thing, but it makes me trust the card text less.
I try: Rinse, Run. 100 → 99.0, "about 0.6 points from the Wet clean tool's drift" — on a chart that said "In control".
Mood: confused

### Step 8 — Procurement
Screenshot: docs/playtest/shots/student/777-08-s3-03-procure.png
I see: Same three items. Radial gas-flow trim: "depth variation ×0.75 · edge ring ×1.25", 200 cash.
I think: In two runs cash did nothing, and etch's depth variation cost me ~4 points each time. Experiment: buy the trim. I'm guessing the edge ring cost is small.
I try: Buy for 200 (cash 1290).
Mood: curious

### Step 10 — Pad oxide + SiN (deposition, step 2)
Screenshot: docs/playtest/shots/student/777-10-s3-04-padox.png
I see: "about 4.0 points". Chart "In control". Pump-purge: "About 0.8 points less lost".
I think: "Pad oxide + SiN" — SiN, silicon nitride? Guessing. The chart is green, yet the forecast is 4.0 and the purge card says it saves 0.8 — while its own text says "With a healthy chamber it buys almost nothing". So the chamber isn't healthy, but the chart said it was. Then the result: "cost 3.2 points. Of this, about 2.7 points came from the Deposition tool's drift." 2.7 points of drift with no warning, and the corridor before this room had no PM stop. Rule broken: the chart didn't telegraph it.
I try: Purge, Run. 99.0 → 95.8.
Mood: annoyed

### Step 14 — PM / DOE after step 2
Screenshot: docs/playtest/shots/student/777-14-s3-05-pm.png
I see: DOE list now includes "Add dummy fill to the mask" (my unlock!). CMP "Shift". Litho, Etch, Wet clean, Deposition "In control". Diffusion and Implant don't appear at all — no charts for them.
I think: My notebook entry turned into a real card. That's satisfying. CMP is next-next and shifted, so PM CMP. Deposition is used again at step 8; it just bit me for 2.7 points while "in control", so I'll PM it later.
I try: PM the CMP tool.
Mood: hooked

### Step 16 — Litho (active) (step 3)
Screenshot: docs/playtest/shots/student/777-16-s3-06-litho.png
I see: Cards: Strip and re-expose (greyed, "Needs a litho step just before this one"), Add dummy fill (0 min, 100 cash, "dishing ×0.4", no forecast line), Trim dose ("About 0.3 points less").
I think: Dummy fill is played at litho but helps at CMP two rooms later. That's a real cause-and-effect chain — it's put into the mask, so it's decided at the printing step. Love it. No preview of its benefit here though, so I'm trusting it.
I try: Dummy fill + Trim dose, Run. 95.8 → 94.3.
Mood: hooked

### Step 21 — Event: supplier change (again)
Screenshot: none
I see: Same cheaper-slurry event as run 1.
I think: Already seen it. Events repeat quickly.
I try: Keep the qualified slurry.
Mood: bored

### Step 23 — Etch (isolation trench) (step 4)
Screenshot: docs/playtest/shots/student/777-23-s3-07-etch.png
I see: "about 4.3 points". Slot: Radial gas-flow trim (equipment). Over-etch "About 1.4 points less" on a steady tool.
I think: 4.3 instead of ~10 in the copper line. Is that my gas trim, or because this etch stops on SiN? The game doesn't separate them. The over-etch text says "on a steady tool the attack costs about what it saves", but the preview says 1.4 points saved on a steady tool. Again the text and the number disagree.
I try: Over-etch, Run. 94.3 → 91.4.
Mood: confused

### Step 27 — Oxide fill + CMP (stop on SiN) (step 5)
Screenshot: docs/playtest/shots/student/777-27-s3-08-cmp.png
I see: "about 3.4 points. About 1.1 of these points come from dishing (wide features polished below the surface). The layout set how big this is: oxide in wide isolation trenches dishes in any polish. Dummy fill at the active litho or a gentler polish here reduces it." Card: Low-pressure final polish, "About 0.4 points less".
I think: This is the best screen in the game. It names the mechanism, says where it was set and what fixes it, and I already did one of those fixes. I learned what shallow trench isolation dishing is, sort of. I'd tell a friend: "wide trenches dish, so they add fake shapes to keep the density even." But I can't tell how much my dummy fill already saved — is 1.1 before or after?
I try: Low-pressure polish, Run. 91.4 → 88.3.
Mood: hooked

### Step 31 — PM / DOE before the Q-time corridor
Screenshot: none
I see: Wet clean, Deposition, Litho, Etch all "In control".
I think: Everything is green, but green lied to me at step 2. PM deposition, since it's the one that bit me.
I try: PM the Deposition tool.
Mood: curious

### Step 33 — SiN strip + pre-gate clean (step 6)
Screenshot: none
I see: Rinse "About 0.4 points less". Chart "In control".
I think: Next is a Q-time window and then the gate oxide, so extra oxide is bad. I skip the rinse. Result: "cost 1.8 points. Of this, about 1.3 points came from the Wet clean tool's drift" — again from an "In control" chart. Second unwarned drift hit in this run.
I try: Run.
Mood: annoyed

### Step 35 — Q-time corridor (gate)
Screenshot: docs/playtest/shots/student/777-35-s3-09-qt.png
I see: "Q-time window: native oxide keeps growing on the bare silicon until the gate oxide is grown."
I think: Same idea as the copper barrier, applied to the gate. Now I've seen it twice in two flows, so it sticks. Good.
I try: Go straight to Gate oxidation.
Mood: curious

### Step 36 — Gate oxidation (Diffusion, step 7)
Screenshot: docs/playtest/shots/student/777-36-s3-10-diffusion.png
I see: Result straight away: 86.5 → 83.3, 3.2 points, "Nothing could be played here".
I think: A new room type and I don't get to see inside it. What is diffusion? A furnace? No glossary entry, no card, no chart. 3.2 points with no explanation.
I try: Continue.
Mood: annoyed

### Step 38 — Poly-Si deposition (step 8)
Screenshot: none
I see: "about 0.5 points", tool just PM'd.
I think: Here PM clearly worked: 4.0 points at step 2 vs 0.5 now. First time a PM visibly paid off. But I only knew to do it because it hurt me first, not because the chart warned me.
I try: Run. 83.3 → 82.9.
Mood: curious

### Step 41 — Event: hot lot (again)
Screenshot: none
I see: Hot lot request, "+0.02 risk (about 2.0 points of yield): random dots across the wafer".
I think: I have margin, and I want to see the "random dots". So I run it hot. It's a test.
I try: Run it hot.
Mood: curious

### Step 43 — Litho (gate) (step 9)
Screenshot: docs/playtest/shots/student/777-43-s3-11-gate-litho.png
I see: Dummy fill offered again, no warning that there's no CMP after this litho.
I think: Nice trap: 100 cash for nothing. I only skip it because I worked it out myself.
I try: Trim dose, Run. 82.9 → 80.1.
Mood: curious

### Step 47 — Gate etch (stop on gate oxide) (step 10)
Screenshot: docs/playtest/shots/student/777-47-s3-12-gate-etch.png
I see: "about 5.0 points". Over-etch with no forecast line.
I think: I meant to tap the over-etch just to see the preview, but tapping a card plays it at once. No undo. The forecast didn't move, so no harm, but I'd like to inspect without committing.
I try: (accidentally) Over-etch, Run. 80.1 → 75.2.
Mood: annoyed

### Step 51 — S/D implant (step 11) and Activation anneal (step 12)
Screenshot: docs/playtest/shots/student/777-51-s3-13-implant.png
I see: Implant: 75.2 → 74.8, nothing to play. Anneal: 74.8 → 70.2, 4.6 points, nothing to play.
I think: "S/D" — source/drain, I'm guessing. Two rooms I just watch. Anneal ate 4.6 points and I'm at 70.2, a hair above the 70 spec, with nothing I could do. Was that the hot lot's 2 points landing? It doesn't say. I'm sweating over a number I can't touch.
I try: Continue, straight to Electrical test.
Mood: annoyed

### Step 55 — Electrical test (step 13)
Screenshot: docs/playtest/shots/student/777-55-s3-14-test.png
I see: 70.2 → 70.2, "Lot shipped".
I think: Shipped by 0.2 points. Relief, but no sense of having earned it.
I try: See the ship report.
Mood: curious

### Step 56 — Ship report
Screenshot: docs/playtest/shots/student/777-56-s3-15-ship.png, docs/playtest/shots/student/777-56-s3-16-ship-map.png
I see: 70.2%. Diagnose: Unannealed implant damage, Front-end etch residue, Edge ring, Isolation oxide dishing. Wafer map: every red failed site is on the outer ring; inner sites are 70-75.
I think: Finally a diagnosis I can do from what's on the screen: the red squares are all on the edge. And I bought the gas trim that said "edge ring ×1.25". The anneal lost the most (4.6), which tempts me toward "implant damage", but the map is the clearest evidence I've had all game.
I try: Edge ring.
Mood: hooked

### Step 57 — Diagnosis right
Screenshot: docs/playtest/shots/student/777-57-s3-17-diagnosis.png
I see: "Diagnosed: Edge ring. It cost 3.4 yield points: Etch, step 4 (1.8 points); Etch, step 10 (1.6 points). Unlocks for later runs: Edge-tuned chuck."
I think: This one taught me: I read the map, picked the pattern, and the answer told me which rooms caused it. But it doesn't say the gas trim I bought made it worse, or by how much. Did buying the trim help or hurt overall? I still don't know. Edge-tuned chuck — no idea what a chuck is (the thing that holds the wafer?).
I try: Notebook, then stop.
Mood: hooked

### Step 58 — Notebook (2)
Screenshot: docs/playtest/shots/student/777-58-s3-18-notebook.png
I see: Edge ring and Dishing, each with unlocks and the seed. "18 failure modes still to find."
I think: The notebook is the reason I'd come back. The rooms where I'm a passenger are the reason I might not.
I try: Stop.
Mood: curious
