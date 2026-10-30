# Curious student — seed 123456 (first run, newcomer)

### Step 0 — Floor plan (first screen)
Screenshot: docs/playtest/shots/student/123456-00-s1-01-first.png
I see: Blue header "FLOOR PLAN", "Inlaid Cu line · yield 100.0%", Seed, Cash 1500, Cycle time 0 min. Buttons Notebook (0) and Words. Left: "The lot is at the door, ready for step 1", big "Enter step 1: Wet clean", a lot type choice "Run NMOS transistor instead". Right: a 9-room map (Wet clean, Deposition, Litho bay with a red SPC tag, Etch with SPC, Wet clean, Deposition, Plating, CMP, Metrology) with little PM/BUY/EVT/QT tags between rooms and a legend.
I think: Nobody tells me what I'm trying to do. Yield 100% — is that my health? What makes me lose? Is there a target? "Inlaid Cu line" — copper lines inlaid in something, I guess? That's a guess. The legend says "PM PM / DOE" which explains nothing — it explains PM with PM. Two rooms already have a red SPC tag, which the legend says means "the tool's chart trips a rule". Sounds like a warning, but I don't know what rule or whether I should care yet. There is a "Words" button — promising.
I try: Words, before anything else.
Mood: curious

### Step 1 — Words (glossary)
Screenshot: docs/playtest/shots/student/123456-01-s1-02-words.png
I see: An A-to-Z list: CD, CMP, Control limits, Cycle time, Die, DOE, Drift, Excursion, Failure mode, Lot, Metrology, PM, Q-time, Scrap line, Site, SPC, Spec, Tool health, Wafer, Yield. Each has a real definition plus an "In the game:" line.
I think: This is exactly what I wanted. The two-line format (real meaning, then what it does here) is great. Now I know: yield is my health bar, lose = fall below a scrap line, win = ship above a target. SPC = chart of a tool, PM = maintenance, DOE = paying to upgrade a practice. But this should have been on the first screen, not behind a button — I only found it because I click everything. Missing: litho, etch, deposition, plating, wet clean, NMOS, "inlaid Cu", "practice". The rooms themselves aren't defined, which is the thing I actually came to learn (litho vs etch). Tool health is "hidden, read it only through SPC" — interesting.
I try: Back, then enter step 1.
Mood: hooked

### Step 3 — Wet clean room (step 1 of 9)
Screenshot: docs/playtest/shots/student/123456-03-s1-03-wetclean.png, docs/playtest/shots/student/123456-03-s1-04-wetclean-spc.png
I see: Line yield 100% with a bar marked Scrap 40% and Spec 70%. "This room will cost about 0.8 points of yield if nothing changes." A 5x5 wafer map of 100s. Time budget 10 min. Slots: empty. A Tool SPC chart "Particle adders (per wafer)" with red spec line at 36, dashed control lines at 8 and 32, a key, "In control". One card in hand: Extra DI-water rinse, 3 min, 10 cash, with an explanation, "particles ×0.75 · qtime oxide ×1.1" and "About 0.2 points less lost in this room."
I think: Now I get the goal: stay above 70% (spec) to ship, under 40% = scrapped. That bar should be on the first screen. The card text is genuinely educational — water with oxygen grows oxide, which matters before the barrier. But what barrier? What is "strip clean"? "qtime oxide ×1.1" is a cost I can't weigh: I don't know how big qtime oxide is yet. Also, one card in hand and no choice of what else to do — it's "rinse or don't". The "about 0.2 points less" preview is helpful: it tells me what the card is worth. Half the screen on the right is empty under the hand; the SPC chart is hidden below the fold on the left.
I try: The rinse (cheap, says it helps), then Run wet clean.
Mood: curious

### Step 5 — Wet clean result
Screenshot: docs/playtest/shots/student/123456-05-s1-05-after-room1.png
I see: 100.0% → 99.5%. "This room cost 0.5 points of yield. Of this, about 0.1 points came from the Wet clean tool's drift (see its SPC chart)." Map now has some 99s. Buttons: Continue to the corridor, Replay this seed, New seed.
I think: Nice that it tells me where the loss came from. Odd though: the chart said "In control", yet 0.1 points came from drift. So even an in-control tool drifts a little? A bit confusing but okay. "Replay this seed" / "New seed" on a mid-run result screen looks like I could accidentally throw away my run.
I try: Continue to the corridor.
Mood: curious

### Step 6 — Corridor (between rooms)
Screenshot: docs/playtest/shots/student/123456-06-s1-06-corridor.png
I see: Floor plan again with the lot after step 1. Choices: "PM / DOE +40 min — PM one tool, or DOE one practice", "Event +10 min — A choice with a tradeoff", "Go straight to step 2", "Scrap the lot". Cycle time 10 min.
I think: Litho and Etch have red SPC tags on the map. If a tool is drifting, maintenance seems smart. But +40 min of cycle time — does cycle time hurt me? Nothing says. There's no limit shown for cycle time. So minutes look free, which makes the choice feel fake. I'll PM anyway because the tags look scary.
I try: PM / DOE.
Mood: curious

### Step 7 — PM / DOE stop
Screenshot: docs/playtest/shots/student/123456-07-s1-07-pm.png, docs/playtest/shots/student/123456-07-s1-08-pm-charts.png
I see: Top: three DOE upgrades (100 cash each) with "Now:" vs "After the DOE:" lines full of multipliers: "residue ×0.3 · underlayer attack ×2 · underlayer attack ×0.525 with etch stop". Below: six SPC charts, one per tool on the route ahead, each with a PM button. Litho "Monitor CD" sits all above the centre line: "Shift: the monitor cd chart has moved off centre." Etch "Etch rate" sits below centre, also "Shift". Plating creeps up and CMP creeps down, but both say "In control".
I think: The DOE section is a wall of multipliers. "Underlayer attack ×2" and then "×0.525 with etch stop" in the same line — what's an etch stop? Do I have one? No idea. "Over-etch" — I'm guessing it means etching a bit longer than needed to be sure. The charts are the best part: I can actually SEE litho's points all sitting above the middle line, and the glossary told me "runs inside the limits are the early warning". That's a real lesson. I pick litho: it's first, and the over-etch card says it "pays only when the etch rate has drifted down" — and etch rate has drifted down, so maybe I can fix etch with a card. I feel smart. Plating trending up toward its limit worries me, but it says "in control", so I'll trust it... for now.
I try: PM the Litho bay tool.
Mood: hooked

### Step 8 — PM done
Screenshot: docs/playtest/shots/student/123456-08-s1-09-after-pm.png
I see: The litho chart now shows a "PM" mark and "Just PM'd or serviced: no lots measured since yet." "PM done: the next lots run on a restored tool". Only button: Continue to step 2.
I think: Good, clear. The page scrolled down by itself to the litho card, which is nice. I didn't see any cash change; PM seems free except 40 minutes.
I try: Continue.
Mood: curious

### Step 9 — Deposition (oxide) room (step 2)
Screenshot: docs/playtest/shots/student/123456-09-s1-10-depo.png
I see: Same layout. One card: "Pump-purge cycles before the run", 5 min, 20 cash, "flakes ×0.75 · particles ×1.1", "With a healthy chamber it buys almost nothing." Chart in control. No "about X points less" line on this card.
I think: The card itself tells me it's useless on a healthy chamber, and the chart says healthy. So no decision here, really. I'm reading the card text as a lesson (pumping the chamber stirs up particles — neat), but as a game it's "tap Run".
I try: Run deposition. Result: 99.5 → 98.8, "about 0.1 from drift".
Mood: curious

### Step 11 — Corridor after step 2
Screenshot: none
I see: Same corridor, now with a third option "Procurement +10 min — Spend cash on equipment and materials". Cycle time 65 min.
I think: Cycle time keeps climbing but nothing says what it does to me. Let me see the shop.
I try: Procurement.
Mood: curious

### Step 12 — Procurement
Screenshot: docs/playtest/shots/student/123456-12-s1-11-procure.png
I see: Three items. "Radial gas-flow trim" 200 cash, etch equipment, "depth variation ×0.75 · edge ring ×1.25", "Cheap, but weaker than an endpoint detector". "Inline metrology" 500 cash, "shows drift earlier on SPC", next used at step 9. "Thick resist for deep etch" 90 cash, "Survives long etches (TSVs)", "cd error ×1.3", "Replaces the i-line positive resist".
I think: New words in one go: endpoint detector, TSVs, i-line, positive resist, edge ring. I'm guessing a resist is the light-sensitive coating for litho. "Inline metrology" is used at step 9 — the last room — so how does it show drift "sooner" if it only kicks in at the end? Makes no sense to me. I have no idea what cash is for overall, so I can't tell if 200 is a lot. I don't buy.
I try: Continue to step 3.
Mood: confused

### Step 13 — Litho bay (step 3)
Screenshot: docs/playtest/shots/student/123456-13-s1-12-litho.png
I see: Yellow room. "This room will cost about 2.8 points". Slots: "i-line positive resist (material)". Chart shows the PM mark. Cards: "Strip and re-expose" greyed with red text "Can't play: Needs a litho step just before this one. No step on this route does that." and "Trim dose from the SPC trend", 5 min, 30 cash, "About 0.4 points less lost".
I think: The red text makes no sense to me: I'm IN the litho room. "Needs a litho step just before this one"? I guess it means re-exposing only makes sense after a litho... which is now? Confusing. Also, I just PM'd litho so the shift should be gone, and still trimming the dose "from the SPC trend" says it saves 0.4. So did my PM even matter? Can't tell. 35 min budget, I use 5 — the time budget never runs out, so it's not a constraint.
I try: Trim dose, Run litho bay. Result 98.8 → 96.4, 2.3 points, 0.1 from drift.
Mood: confused

### Step 16 — Corridor after litho, then Event
Screenshot: docs/playtest/shots/student/123456-17-s1-14-event.png
I see: Event "HOT LOT REQUEST": customer wants it early. "Run it hot: −30 min cycle time · +150 cash · +0.02 risk (about 2.0 points of yield): random dots across the wafer" or "Keep its place in line: nothing changes".
I think: Cool flavour — I didn't know "hot lot" was a thing. But I still don't know what cash buys me at the end, so 150 cash vs 2 points of yield is a coin flip. I go safe. "random dots across the wafer" is a nice hint at what the defect will look like.
I try: Keep its place in line, continue to etch.
Mood: curious

### Step 19 — Etch (trench) room (step 4)
Screenshot: docs/playtest/shots/student/123456-19-s1-15-etch.png
I see: "This room will cost about 10.1 points of yield if nothing changes. About 3.8 of these points come from depth variation (etch depth differs center to edge). The film stack set how big this is before the lot got here: without an etch stop, trench depth follows the etch rate across the wafer." Chart: "Shift ... 8 points in a row below the centre line". Time 8 min. One card: Timed over-etch, "About 0.5 points less".
I think: 10 points! Ouch, and I get a single 0.5-point card. "The film stack set how big this is before the lot got here" — so there was a decision earlier about an etch stop? I never saw one. I feel cheated: the game is telling me the damage was decided somewhere I didn't get a choice. Where are the other 6.3 points from? Not said. Good news: I finally learned what "Shift" means — 8 points in a row below centre. That's a real SPC rule I can repeat.
I try: Over-etch, then Run etch.
Mood: confused

### Step 21 — Etch result
Screenshot: docs/playtest/shots/student/123456-21-s1-16-etch-result.png
I see: 96.4 → 86.6%, "cost 9.8 points. Of this, about 0.3 from the Etch tool's drift". Wafer map now has edge sites in tan dotted squares (80s) and centre sites green (90s).
I think: Only 0.3 from drift — so the scary SPC tag was nearly irrelevant, and PMing etch wouldn't have saved me. The rest is "just etch". The map is cool though: the edge ring is visibly worse, matching "depth differs center to edge". I can see the physics. But 9.8 points with nothing I could do feels like a tax, not a decision.
I try: Continue.
Mood: confused
