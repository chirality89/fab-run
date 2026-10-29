// glossary.js — the Words page: fab words the screens use, each said once
// in plain words. Data only; wordsPage.js draws it.
//
//   term     the word as the screens write it
//   plain    what it is in a real fab, in one sentence
//   inGame   where the player meets it in this game, in one sentence
//   draft    true until David has reviewed the wording
//
// Terms are not items, so they have no tradeoff or physicsNote. Keep the
// list in A-to-Z order (tests/glossary.test.js checks it). Numbers that are
// balance (the spec, the scrap line) are not written here, so they can
// change without the words going stale.

export const GLOSSARY = [
  { term: 'CD', draft: true,
    plain: 'Critical dimension: the width of the smallest line or space a step prints or etches, measured in nanometers.',
    inGame: 'Litho prints it. When the litho tool drifts, CD error grows and sites across the wafer fail.' },
  { term: 'CMP', draft: true,
    plain: 'Chemical-mechanical polishing: a pad and a slurry of fine abrasive grind the wafer flat, removing the extra film above the lines.',
    inGame: 'The polishing room. Wide lines dish, dense areas erode, and a worn pad polishes slower.' },
  { term: 'Control limits', draft: true,
    plain: 'Lines on an SPC chart, usually three standard deviations from the center, that show how far a healthy tool normally wanders.',
    inGame: 'The dashed lines on a tool\'s chart. One point beyond them is an excursion to check; runs and trends inside them are the usual early warning of drift.' },
  { term: 'Cycle time', draft: true,
    plain: 'How long a lot takes to get through the line, waiting included.',
    inGame: 'The minutes the lot has spent in rooms, side stops and events. Side stops help, but each one costs time.' },
  { term: 'Die', draft: true,
    plain: 'One chip on the wafer, before or after it is cut out. Many die are built side by side on each wafer.',
    inGame: 'The ship report gives the cost per good die: what the lot cost, divided by the die that work.' },
  { term: 'DOE', draft: true,
    plain: 'Design of experiments: a planned set of runs that changes a few settings on purpose to find a better recipe.',
    inGame: 'At a PM / DOE stop you can pay cash to upgrade one practice for the rest of the run, instead of servicing a tool. The stop still costs its minutes.' },
  { term: 'Drift', draft: true,
    plain: 'A tool slowly moving off target as parts wear, chambers coat or chemistry ages.',
    inGame: 'Some runs start with a tool overdue for PM, and every visit wears it a little more. A drifted tool adds losses in its room, and it shows on SPC before the lot gets there.' },
  { term: 'Excursion', draft: true,
    plain: 'A sudden, unexpected jump in a measurement, from a tool fault, a bad batch of material or a bad measurement.',
    inGame: 'One point past a control limit on SPC. Check it: if it was a one-off, the next lots come back inside the limits.' },
  { term: 'Failure mode', draft: true,
    plain: 'A root cause of lost die, such as a void in a line or residue left after etch, that engineers learn to recognize from its evidence.',
    inGame: 'Name the one that hurt your lot on the ship report. A right answer goes in your notebook and unlocks new remedies.' },
  { term: 'Lot', draft: true,
    plain: 'A batch of wafers, usually 25, that moves through the line together in one carrier.',
    inGame: 'One run is one lot. Its yield is your health bar, and the run ends when it ships or is scrapped.' },
  { term: 'Metrology', draft: true,
    plain: 'Measuring the wafers between steps: film thickness, line width, defects.',
    inGame: 'A side stop that will reveal hidden values. For now it only costs its minutes.' },
  { term: 'PM', draft: true,
    plain: 'Preventive maintenance: taking a tool down on schedule to clean it and swap worn parts before it drifts out of control.',
    inGame: 'At a PM / DOE stop you can service one room\'s tool, which brings its health back up.' },
  { term: 'Q-time', draft: true,
    plain: 'Queue time: the longest a wafer may wait between two steps before its surface changes, for example by growing a thin oxide.',
    inGame: 'Some corridors are Q-time corridors: every minute the lot waits there, at a side stop or an event, adds risk that shows up in a later room.' },
  { term: 'Scrap line', draft: true,
    plain: 'The yield below which a lot is not worth finishing, so it is thrown away.',
    inGame: 'The low mark on the yield bar. Fall below it and the lot is scrapped.' },
  { term: 'Site', draft: true,
    plain: 'One die position on the wafer, where one chip will be cut out.',
    inGame: 'One of the 25 squares on the wafer map. Its number is the percent of the lot\'s 25 wafers still good at that position, and its color and pattern show the band.' },
  { term: 'SPC', draft: true,
    plain: 'Statistical process control: charting a measurement from every run so a tool going wrong is seen before it ruins wafers.',
    inGame: 'Each room shows its tool\'s chart. Read it before you choose to PM.' },
  { term: 'Spec', draft: true,
    plain: 'The customer\'s requirement the lot must meet to be shipped and paid for.',
    inGame: 'The high mark on the yield bar: ship at or above it and the lot is accepted, below it rejected. On a tool\'s SPC chart, the solid red lines are spec limits: product outside them is lost.' },
  { term: 'Tool health', draft: true,
    plain: 'How close a tool is to its freshly maintained state.',
    inGame: 'Hidden: you read it only through the tool\'s SPC chart. It starts each run somewhere between worn and fresh, drops a little every time the lot runs in that room, and a low one adds losses there until a PM brings it back up.' },
  { term: 'Wafer', draft: true,
    plain: 'A thin disc of silicon on which hundreds of chips are built at once.',
    inGame: 'The map stacks all 25 wafers of your lot into one picture of 25 sites.' },
  { term: 'Yield', draft: true,
    plain: 'The share of die that work at the end. Losses at each step multiply.',
    inGame: 'Your health bar. It only goes down, and each room\'s losses apply to what is left.' },
];
