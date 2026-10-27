// notebookView.js — display data for the Notebook page (M4 item 3): the
// failure modes the player has diagnosed, newest first. No DOM and no game
// rules: it only reads the notebook and the content, so it runs in Node.
//
// Each entry also lists what it unlocks (M4 item 4): practices, equipment
// and materials. Consumables are left out until the game can use them
// (David, 26 Oct 2026).

import { FAILURE_MODES, PATTERNS, PRACTICES, EQUIPMENT, MATERIALS } from '../content/content.js';

// A failure mode's name. Entries without a name yet fall back to the
// pattern's description, so new content still shows something readable.
// The ship report uses this too, so both screens name things the same way.
export const modeName = mode => mode.name ?? PATTERNS[mode.pattern];

export const EMPTY_NOTEBOOK_TEXT = 'Nothing diagnosed yet. At the end of a run, '
  + 'name the failure mode that hurt the lot on the ship report.';

// The names of the remedies a failure mode unlocks that the game can use,
// in the order the failure mode lists them.
function remedyNames(mode) {
  const usable = [...PRACTICES, ...EQUIPMENT, ...MATERIALS];
  return mode.unlocks
    .map(id => usable.find(item => item.id === id))
    .filter(item => item !== undefined)
    .map(item => item.name);
}

// "Unlocks: …", or a plain line when there is nothing to unlock yet.
function unlocksText(mode) {
  const names = remedyNames(mode);
  return names.length === 0 ? 'No remedy yet.' : `Unlocks: ${names.join(', ')}`;
}

// The line under the list: how many failure modes are left to find.
function stillText(stillToFind) {
  if (stillToFind === 0) return 'Every failure mode is in your notebook.';
  if (stillToFind === 1) return '1 failure mode still to find.';
  return `${stillToFind} failure modes still to find.`;
}

// Everything the Notebook page shows:
//   entries      the diagnosed failure modes, newest first: name,
//                signature, seed and the "Unlocks: …" line
//   stillToFind  how many failure modes are not in the notebook yet (a
//                count only: their names are never shown), and stillText,
//                the sentence that says it
//   emptyText    the words for an empty notebook, or null
// Entries whose failure mode is no longer in the content are skipped (they
// stay in storage, in case the content comes back).
export function notebookView(notebook) {
  const entries = [];
  for (const entry of notebook.entries) {
    const mode = FAILURE_MODES.find(candidate => candidate.id === entry.id);
    if (!mode) continue;
    entries.push({ id: mode.id, name: modeName(mode), sig: mode.sig, seed: entry.seed, unlocksText: unlocksText(mode) });
  }
  entries.reverse();   // the notebook keeps them oldest first
  const stillToFind = FAILURE_MODES.length - entries.length;
  return {
    entries,
    count: entries.length,
    stillToFind,
    stillText: stillText(stillToFind),
    emptyText: entries.length === 0 ? EMPTY_NOTEBOOK_TEXT : null,
  };
}
