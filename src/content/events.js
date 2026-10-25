// events.js — the event side stop's events (M3 item 2e). Data only.
// Agreed with David, 25 Oct 2026; numbers are placeholders until M7.
//
// Each event is a short situation with two options. An option:
//   label        the button text
//   minutes      cycle time it adds (negative takes time off). In a Q-time
//                corridor, positive minutes also grow the Q-time pattern,
//                like a side stop's wait (run.js).
//   effects      effect operations, as in content.js. Between rooms these
//                make sense: cashCost (negative = cash in), addRisk,
//                toolHealth with a `room`.
//   result       the line shown after choosing
// An event's `mattersFor` says what must still be ahead on the route for it
// to be drawn: { room } (that room's tool) or { pattern } (a room that
// realizes it). Otherwise an option could cost nothing (tasks/lessons.md).
//   tradeoff, physicsNote   as for every content entry (CLAUDE.md §5 rule 7)

export const EVENTS = [
  {
    id: 'hotLot', draft: true,
    name: 'Hot lot request',
    mattersFor: { pattern: 'particles' },
    text: 'A customer wants this lot early for a product demo. Planning asks whether it can run as a hot lot.',
    options: [
      {
        label: 'Run it hot',
        minutes: -30,
        effects: [
          { op: 'cashCost', delta: -150 },
          { op: 'addRisk', pattern: 'particles', amount: 0.02 },
        ],
        result: 'The lot jumps the queues: 30 minutes saved and a 150 expedite fee earned, with rushed handling on the way.',
        tradeoff: 'Less waiting and an expedite fee, but hand-carrying and manual loading add particles.',
        physicsNote: 'A hot lot is hand-carried and loaded by hand at each tool as soon as it frees up; the extra manual handling adds particles.',
      },
      {
        label: 'Keep its place in line',
        minutes: 0,
        effects: [],
        result: 'The lot keeps its normal priority. Nothing changes.',
        tradeoff: 'No risk added, no fee earned.',
        physicsNote: 'Normal dispatching leaves the usual waits and handling in place.',
      },
    ],
  },
  {
    id: 'audit', draft: true,
    name: 'Quality audit',
    mattersFor: { room: 'clean' },
    text: 'A quality auditor is on the floor this shift and wants to walk the line your lot is on.',
    options: [
      {
        label: 'Walk them through now',
        minutes: 30,
        effects: [ { op: 'toolHealth', room: 'clean', delta: 15 } ],
        result: 'The audit holds the lot for 30 minutes. The auditor flags the wet bench as overdue, and it gets serviced: the wet clean tool is in better shape.',
        tradeoff: 'The lot waits (and grows Q-time in a Q-time window), but a flagged tool gets fixed.',
        physicsNote: 'Audits often turn up overdue maintenance; servicing a wet bench (fresh chemistry, filters) lowers its particle adders.',
      },
      {
        label: 'Ask them to come back later',
        minutes: 0,
        effects: [ { op: 'cashCost', delta: 100 } ],
        result: 'The auditor writes up a finding for the missing walk-through records: 100 cash in corrective-action work.',
        tradeoff: 'No delay, but a written finding costs corrective-action work.',
        physicsNote: 'A deferred audit becomes a documentation finding, closed with paperwork and engineering time.',
      },
    ],
  },
  {
    id: 'slurrySupplier', draft: true,
    name: 'Supplier change',
    mattersFor: { room: 'cmp' },
    text: 'Purchasing offers a cheaper CMP slurry from a second supplier, available now.',
    options: [
      {
        label: 'Switch now',
        minutes: 0,
        effects: [
          { op: 'cashCost', delta: -150 },
          // A step in the CMP removal rate: 40 health = a 2σ mean shift
          // (balance.js HEALTH_PER_SIGMA). It shows as a step on the CMP
          // SPC chart and costs yield like drift does (David, 25 Oct 2026).
          { op: 'toolHealth', room: 'cmp', delta: -40 },
        ],
        result: 'The cheaper slurry goes in: 150 cash saved, and the CMP removal rate steps off target. Watch the CMP SPC chart.',
        tradeoff: 'Cash saved, but the removal rate steps off target until the recipe is re-tuned for the new slurry.',
        physicsNote: 'Removal rate depends on abrasive size and concentration and on slurry chemistry; a new supplier\'s slurry shifts the rate in one step, which shows on the SPC chart from the next lot.',
      },
      {
        label: 'Keep the qualified slurry',
        minutes: 0,
        effects: [],
        result: 'You stay on the qualified slurry. Nothing changes.',
        tradeoff: 'No savings, no new risk.',
        physicsNote: 'A qualified consumable has a known removal rate on this tool.',
      },
    ],
  },
];
