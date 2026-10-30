# Fab engineer — seed 123456 (first run, newcomer)

### Step 1 — Floor plan / start
Screenshot: docs/playtest/shots/fab-engineer/123456-00-s123456-01-start.png
I see: Blue header "FLOOR PLAN", "Inlaid Cu line · yield 100.0%", Seed, Cash 1500, Cycle time 0 min. Nine rooms in a snake: Wet clean, Deposition, Litho bay, Etch, Wet clean, Deposition, Plating, CMP, Metrology. Little tags between rooms: PM, BUY, EVT, QT. Litho and Etch carry a red "SPC" badge. Option to run "NMOS transistor instead".
I think: OK, a damascene metal level. Clean, dielectric dep, pattern, trench etch, post-etch clean, barrier/seed, ECP, CMP, measure. That's a sensible flow, I recognise it. A Q-time box between post-etch clean and barrier/seed dep — good, that is exactly where we'd have one (Cu/low-k exposure, moisture). "Inlaid" instead of damascene is fine. Red SPC badges on litho and etch before I've even started: the legend says "the tool's chart trips a rule". So two tools are already out of control at lot start? Nobody would release a lot into a tool with an open OCAP. Want to see what it means. Cash 1500 of what? No unit.
I try: "Words" first to see if there is a glossary.
Mood: curious

### Step 2 — Words (glossary)
Screenshot: docs/playtest/shots/fab-engineer/123456-01-s123456-02-words.png
I see: A to Z list: CD, CMP, Control limits, Cycle time, Die, DOE, Drift, Excursion, Failure mode, Lot, Metrology, PM, Q-time, Scrap line, Site, SPC, Spec, Tool health, Wafer, Yield. Each has a real definition and an "In the game" line.
I think: Mostly correct and plainly written. Control limits at ~3 sigma, "runs and trends inside them are the usual early warning" — yes, that's Western Electric thinking, good. Spec vs control limits explained separately — good, half our new hires mix them up. Quibbles: "Excursion = one point past a control limit" is too narrow (an excursion is the event, the OOC point is the symptom) but tolerable. "CD: Litho prints it" — etch sets final CD too, etch bias; I'll see if the game knows. "Metrology: for now it only costs its minutes" — so the measure step does nothing? Strange thing to admit in a glossary. The 25-site stacked map is a simplification I can live with if it's clearly labelled. Tool health is hidden and read only through SPC — that's honest to real life, I like it.
I try: Back, then enter step 1.
Mood: curious

### Step 3 — Room 1: Wet clean
Screenshot: docs/playtest/shots/fab-engineer/123456-03-s123456-03-room1.png, docs/playtest/shots/fab-engineer/123456-03-s123456-04-room1-spc.png
I see: Line yield 100%, bar with "Scrap 40%" and "Spec 70%" marks. "This room will cost about 0.8 points of yield if nothing changes." A 5x5 square grid wafer map, all 100. Time budget 10 min. Slots empty. Tool SPC: Particle adders per wafer, centre 20, control 8–32, spec up to 36, last lot 22.2, in control. One card in hand: Extra DI-water rinse, 3 min, 10 cash, "particles ×0.75 · qtime oxide ×1.1", "About 0.2 points less lost". Button "Run wet clean".
I think: The wafer map is a square. A wafer is round. Twenty-five square die in a 5x5 block means the four corners are sitting off the wafer edge. Any new hire will learn "wafer = grid" from this. Small but it's the first picture you see. The SPC chart is right: one-sided spec on adders (only high is bad), control limits inside spec, centre line. Good. Spec 36 vs UCL 32 is a tight process, fine. The DI-rinse card text is actually correct physics — dissolved O2 in DI grows oxide, matters before barrier dep. But I'm in the FIRST clean, before dielectric dep. Does the ×1.1 q-time oxide carry from here to step 6? The text says it "only matters after the strip clean", so I read it as harmless here. Ambiguous. "0.8 points" — percentage points of line yield I assume. Fine. Spec 70% line yield for a single metal level is a very low target, but it's a game.
I try: Play the rinse (cheap, 0.2 points back), then run the clean.
Mood: curious

### Step 4 — Room 1 result
Screenshot: docs/playtest/shots/fab-engineer/123456-05-s123456-05-after-room1.png
I see: Rinse cost 3 min and 10 cash, forecast went 0.8 → 0.6. Ran the clean: 100.0% → 99.5%, "cost 0.5 points", "about 0.1 points came from the Wet clean tool's drift (see its SPC chart)". Map now 99s and 100s scattered.
I think: The SPC chart I just read said in control, last lot 22.2 against a centre of 20. Then the game tells me the tool's drift cost me yield. If a tool is in control, by definition its variation is common cause, not drift. Calling 0.1 points "drift" on an in-control chart teaches the wrong thing. Small number, wrong word. Random 99s scattered over the map for particles: right pattern, particles are random.
I try: Continue to the corridor.
Mood: curious

### Step 5 — Corridor after step 1
Screenshot: docs/playtest/shots/fab-engineer/123456-06-s123456-06-corridor1.png
I see: Floor plan again with "LOT" marker. Choices: PM / DOE (+40 min), Event (+10 min), go straight to step 2, or Scrap the lot. Cycle time 10 min.
I think: "Scrap the lot" offered at 99.5% — fine, it's a button you'd never hit. Two tools flagged on SPC ahead; this is where I deal with that. Cycle time now counts. Don't know yet if cycle time hurts me.
I try: PM / DOE.
Mood: curious

### Step 6 — PM / DOE stop
Screenshot: docs/playtest/shots/fab-engineer/123456-07-s123456-07-pm.png, docs/playtest/shots/fab-engineer/123456-07-s123456-08-pm-charts.png
I see: DOE options (100 cash each): Timed over-etch, Strip and re-expose, Trim dose from the SPC trend. Or PM one tool on the route ahead, with its chart: Deposition particles (in control), Litho Monitor CD 250 (control 238–262, spec 234–266) "Shift", Etch rate 300 (control 276–324, spec 268–332) "Shift", Wet clean particles, Plating "Seam rate on fill monitor", CMP removal rate. PM brings a tool back to 75–95% health.
I think: This is the best screen so far. I checked the charts by eye. Litho: all 11 points above centre — 9-in-a-row rule, correctly called a shift. Etch: one point above, then 9 straight below centre — correct shift call. CD has a two-sided spec, etch rate two-sided, particles one-sided: all right. Plating is creeping up the last four lots but no rule tripped and the game correctly says in control — a real engineer would still eyeball that, nice telegraph. CMP last point near the LCL, also not tripped, correct. The DOE text on dose trim ("averages more past lots, so noise moves the dose less, but the correction lags a drifting tool") is exactly the EWMA lambda tradeoff. That's good teaching. Wince: "Seam rate on fill monitor" isn't a term anyone uses; we'd say void/seam count on a fill monitor or just bath additive concentration. "PM never perfect, 75–95%" is a fair simplification (seasoning). Calling a PM vs a DOE the same "stop" is odd — different people, different ticket — but fine as a game.
Choice: litho CD is +3 nm on 250 nm, well inside spec and I can trim dose later. Etch rate is -10 on a timed etch: that's under-etch, residue, opens. Etch is the one I'd PM.
I try: PM the Etch tool.
Mood: hooked

### Step 7 — PM done
Screenshot: docs/playtest/shots/fab-engineer/123456-08-s123456-09-after-pm.png
I see: Etch chart now has a "PM" marker, "Just PM'd or serviced: no lots measured since yet." Cash unchanged at 1490.
I think: PM cost 40 minutes and zero cash. A real PM costs parts and tool-down hours, but OK. Nice that the chart says nothing measured since — honest; you'd want a qual wafer before releasing the tool. No qual step, the tool just comes back.
I try: Continue to step 2.
Mood: curious

### Step 8 — Room 2: Deposition (oxide)
Screenshot: docs/playtest/shots/fab-engineer/123456-09-s123456-10-room2.png
I see: 15 min budget. Particle adders SPC in control (centre 15, last lot 19.3). One card: Pump-purge cycles before the run, 5 min, 20 cash, flakes ×0.75, particles ×1.1. Forecast 0.8 points. No "about X points less" line on this card, unlike room 1.
I think: Pump-purge doesn't really fix wall flaking — that's a chamber clean / seasoning job — but "vent and pump stirs up particles" is true. The card says itself it buys nothing on a healthy chamber, and the chart says healthy. Skip. The "about X points" estimate is missing on this card; I'd have liked it.
I try: Run deposition. Result 99.5 → 98.8, 0.7 points, again "0.1 from drift" on an in-control tool.
Mood: curious

### Step 9 — Corridor 2, PM litho
Screenshot: none
I see: Corridor now offers PM / DOE, Procurement (+10 min), Event. Cycle time 65 min.
I think: Litho is the other shifted tool and it's next. PM it before I run product on it. That's what the OCAP would say anyway.
I try: PM / DOE → PM the Litho bay tool → continue.
Mood: curious

### Step 10 — Room 3: Litho (trench)
Screenshot: docs/playtest/shots/fab-engineer/123456-14-s123456-11-litho.png
I see: Yellow room. Forecast 2.8 points. 35 min budget. Slot holds "i-line positive resist (material)". SPC Monitor CD, PM marker, "no lots measured since yet". Hand: "Strip and re-expose" greyed: "Can't play: Needs a litho step just before this one. No step on this route does that." And "Trim dose from the SPC trend", 5 min, 30 cash, cd error ×0.8, "About 0.4 points less lost in this room."
I think: Two things are wrong here. (1) Rework. I'm standing IN the litho bay and it says rework needs a litho step "just before this one" and "no step on this route does that" — but step 3 is litho, right before etch. So where do I play it, in the etch room? Rework is done at the track after ADI says the CD is off, not in the etch bay. And the message contradicts the route on screen. Confused. (2) Dose trim from the SPC trend, on a tool I just PM'd. The trend is from the old, shifted tool. Feed that correction forward onto a freshly PM'd scanner and you over-correct — you'd push CD the other way. The game still promises 0.4 points back. That teaches a new hire to run APC across a PM boundary, which is exactly how you make an excursion. Also: 250 nm trench with i-line resist is a stretch; that's DUV territory for most people. Minor.
I try: Not playing the trim, on principle. Run litho. Result 98.8 → 96.0 (2.7 points), no drift line this time, so the PM did something. Map now 93–99, scattered.
Mood: confused

### Step 11 — Procurement
Screenshot: docs/playtest/shots/fab-engineer/123456-17-s123456-13-procurement.png
I see: Two items. Radial gas-flow trim, 200 cash, Etch equipment: "depth variation ×0.75 · edge ring ×1.25", more gas to centre, rim fails a little more. Inline metrology, 500 cash, "shows drift earlier on SPC", next used at step 9.
I think: Gas-flow trim tradeoff is honest: centre-to-edge tuning trades one for the other. Inline metrology "next used at step 9: Metrology" — my metrology step is the last one. Buying an early warning that sits at the end of the line, for this lot, is pointless. Also inline metrology "as equipment in the metrology room" is a bit muddled; the point of inline is it's between steps. Bought the gas trim to see what an edge ring looks like.
I try: Buy for 200, continue to etch.
Mood: curious

### Step 12 — Room 4: Etch (trench)
Screenshot: docs/playtest/shots/fab-engineer/123456-19-s123456-14-etch.png, docs/playtest/shots/fab-engineer/123456-20-s123456-15-etch-result.png
I see: Forecast 8.8 points (!). "About 2.9 of these points come from depth variation... without an etch stop, trench depth follows the etch rate across the wafer." Budget 8 min. Card: Timed over-etch (+20%), "About 0.1 points more lost in this room". Ran without it: 96.0 → 87.1, 8.9 points. Map: centre sites 90–91 green, outer ring 82–88 amber with dotted borders.
I think: Physics of "no etch stop → depth follows rate" is right. But "the film stack set how big this is before the lot got here" — when did I choose a film stack? The deposition room gave me one card, pump-purge. Nobody offered me an etch-stop layer. So I'm told I made a choice I never saw. Annoying. The edge ring on the map after I bought an edge-hurting gas trim is exactly what I'd expect — I could diagnose that. I averaged the 25 sites: 87.04, matches line yield 87.1. Good, the map is honest. Over-etch card correctly says it only pays when rate is falling; tool just PM'd, so I skipped — and the forecast agreed. 8.9 points in one trench etch is brutal, but it's a game.
Still "0.1 points from drift" on a tool PM'd one step ago. That line seems to always be there.
I try: Continue.
Mood: curious
