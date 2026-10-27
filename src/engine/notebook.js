// notebook.js — diagnosing a failure mode at the end of a run (M4 item 1)
// and the engineering notebook it writes to. Pure: no storage here (the
// notebook is saved under its own key in M4 item 2).
//
// Decision O1 (David, 25 Oct 2026): diagnosing a failure mode is what earns
// its unlocks. A failure mode is a right answer when its pattern cost the
// lot at least DIAGNOSE_MIN_POINTS yield points this run.
//
// A notebook is a plain object: { version: 1, entries: [{ id, seed }] }.

import { FAILURE_MODES, PRACTICES, EQUIPMENT, MATERIALS, CONSUMABLES } from '../content/content.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import { DIAGNOSE_MIN_POINTS, DIAGNOSE_CANDIDATES } from '../content/balance.js';
import { pointsLostByPattern } from './lot.js';
import { conditionMet } from './resolve.js';
import { normalizeSeed, shuffle } from './rng.js';

// Any fixed number works; it differs from the other generators' constants.
const DIAGNOSE_SEED_MIX = 0x94D049BB;

export function emptyNotebook() {
  return { version: 1, entries: [] };
}

// The item ids the notebook has earned: what its failure modes unlock
// (decision O1), in content order (practices, equipment, materials,
// consumables). Entries whose failure mode is no longer in the content
// unlock nothing.
export function unlockedIds(notebook) {
  const earned = new Set(FAILURE_MODES
    .filter(mode => inNotebook(notebook, mode.id))
    .flatMap(mode => mode.unlocks));
  return [...PRACTICES, ...EQUIPMENT, ...MATERIALS, ...CONSUMABLES]
    .map(item => item.id)
    .filter(id => earned.has(id));
}

export function inNotebook(notebook, failureModeId) {
  return notebook.entries.some(entry => entry.id === failureModeId);
}

// Looks up a failure mode by id, or throws naming it.
export function findFailureMode(failureModeId) {
  const mode = FAILURE_MODES.find(entry => entry.id === failureModeId);
  if (!mode) throw new Error(`Unknown failure mode: ${failureModeId}`);
  return mode;
}

// What can be diagnosed on this finished run:
//   rightIds    every failure mode whose pattern cost ≥ DIAGNOSE_MIN_POINTS
//   candidates  the ones offered: one right answer (one not yet in the
//               notebook if there is one), filled up with wrong ones, in a
//               seeded order. Empty when the lot lost too little to tell.
export function diagnosisFor(state, notebook) {
  if (state.status === 'running') throw new Error('diagnosisFor: the run is not over yet');
  const points = pointsLostByPattern(state.lot);
  // Right: its pattern cost enough, and its cause was there (a `when` on
  // the failure mode, e.g. T-top needs the lot to have waited before bake).
  const isRight = mode => (points[mode.pattern] ?? 0) >= DIAGNOSE_MIN_POINTS && conditionMet(state, mode.when);
  const rightIds = FAILURE_MODES.filter(isRight).map(mode => mode.id);
  if (rightIds.length === 0) return { rightIds, candidates: [] };

  let rng = normalizeSeed((state.seed ^ DIAGNOSE_SEED_MIX) >>> 0);
  const draw = list => {
    const shuffled = shuffle(rng, list);
    rng = shuffled.rngState;
    return shuffled.value;
  };
  const rights = draw(rightIds);
  const newRight = rights.find(id => !inNotebook(notebook, id)) ?? rights[0];
  // Wrong choices come first from patterns this lot's route can make, so a
  // choice from another lot type (implant damage on a Cu line) is not a
  // giveaway; others fill in only if those run out.
  const route = LOT_TYPES[state.lotTypeId].route;
  const onRoute = mode => route.some(step => step.realizes.includes(mode.pattern));
  const wrongModes = FAILURE_MODES.filter(mode => !isRight(mode));
  const wrongs = [
    ...draw(wrongModes.filter(onRoute).map(mode => mode.id)),
    ...draw(wrongModes.filter(mode => !onRoute(mode)).map(mode => mode.id)),
  ];
  const otherRights = rights.filter(id => id !== newRight);   // only if wrong ones run out
  const fill = [...wrongs, ...otherRights].slice(0, DIAGNOSE_CANDIDATES - 1);
  return { rightIds, candidates: draw([newRight, ...fill]) };
}

// The player names one of the offered failure modes, once per run.
// Gives back the new state (diagnosed = the id named), the notebook (with
// the entry added if right and new) and what happened:
//   correct       the pattern did cost the lot ≥ DIAGNOSE_MIN_POINTS
//   alreadyKnown  right, but already in the notebook (nothing added)
//   revealedId    when wrong: a right answer, named but NOT written
export function diagnoseLot(state, notebook, failureModeId) {
  if (state.diagnosed !== null) throw new Error('diagnoseLot: this lot was already diagnosed');
  const { rightIds, candidates } = diagnosisFor(state, notebook);
  if (!candidates.includes(failureModeId)) {
    throw new Error(`diagnoseLot: ${failureModeId} is not one of the choices`);
  }
  const correct = rightIds.includes(failureModeId);
  const alreadyKnown = correct && inNotebook(notebook, failureModeId);
  const next = correct && !alreadyKnown
    ? { ...notebook, entries: [...notebook.entries, { id: failureModeId, seed: state.seed }] }
    : notebook;
  const revealedId = correct ? null : candidates.find(id => rightIds.includes(id));
  return {
    state: { ...state, diagnosed: failureModeId },
    notebook: next,
    result: { failureModeId, correct, alreadyKnown, revealedId },
  };
}
