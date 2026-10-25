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
//   tradeoff, physicsNote   as for every content entry (CLAUDE.md §5 rule 7)

export const EVENTS = [
  {
    id: 'hotLot', draft: true,
    name: 'Hot lot request',
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
        tradeoff: 'Less waiting and an expedite fee, but rushed moves and skipped buffer waits add particles.',
        physicsNote: 'A hot lot is moved and loaded as soon as a tool frees up, with more manual handling and fewer settling waits between steps.',
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
    text: 'Purchasing offers a cheaper CMP slurry from a second supplier, available now.',
    options: [
      {
        label: 'Switch now',
        minutes: 0,
        effects: [
          { op: 'cashCost', delta: -150 },
          { op: 'addRisk', pattern: 'rr_drift', amount: 0.03 },
        ],
        result: 'The cheaper slurry goes in: 150 cash saved, and the CMP removal rate is less certain until the new slurry is characterized.',
        tradeoff: 'Cash saved, but a slurry not yet characterized on this tool makes the polish rate wander.',
        physicsNote: 'Removal rate depends on abrasive size and concentration and on slurry chemistry; a new supplier\'s lot needs characterizing on the tool before it is as stable.',
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
