// notebookView.test.js — checks the Notebook page's display data
// (src/ui/notebookView.js, M4 item 3). No browser needed.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FAILURE_MODES } from '../src/content/content.js';
import { notebookView, EMPTY_NOTEBOOK_TEXT } from '../src/ui/notebookView.js';

const ALL = FAILURE_MODES.length;
const notebookOf = (...entries) => ({ version: 1, entries });

test('an empty notebook: no entries, the empty text, every failure mode still to find', () => {
  const view = notebookView(notebookOf());
  assert.deepEqual(view.entries, []);
  assert.equal(view.count, 0);
  assert.equal(view.emptyText, EMPTY_NOTEBOOK_TEXT);
  assert.equal(view.stillToFind, ALL);
  assert.equal(view.stillText, `${ALL} failure modes still to find.`);
});

test('two entries come out newest first, with name, signature, seed and unlocks', () => {
  // The notebook keeps entries oldest first: keyhole was found before edge ring.
  const view = notebookView(notebookOf({ id: 'fm_keyhole', seed: 111 }, { id: 'fm_edge_ring', seed: 222 }));
  assert.deepEqual(view.entries, [
    { id: 'fm_edge_ring', name: 'Edge ring', sig: 'Only the outer ring of sites fails; inner sites are clean.', seed: 222,
      unlocksText: 'Unlocks: Edge-tuned chuck' },
    { id: 'fm_keyhole', name: 'Keyhole void',
      sig: 'Opens on narrow vias only; a seam or void sits in the middle of the fill.', seed: 111,
      unlocksText: 'Unlocks: Low-current start step, Three-additive copper bath' },
  ]);
  assert.equal(view.count, 2);
  assert.equal(view.emptyText, null);
  assert.equal(view.stillToFind, ALL - 2);
});

test('each entry says what it unlocks; consumables are left out (David, 26 Oct 2026)', () => {
  const unlocksOf = id => notebookView(notebookOf({ id, seed: 1 })).entries[0].unlocksText;
  // Keyhole void unlocks a practice, a material and bath analysis (a consumable, left out).
  assert.equal(unlocksOf('fm_keyhole'), 'Unlocks: Low-current start step, Three-additive copper bath');
  assert.equal(unlocksOf('fm_residue'), 'No remedy yet.');
});

test('an id no longer in the content is skipped and does not change the count', () => {
  const view = notebookView(notebookOf({ id: 'fm_renamed_long_ago', seed: 5 }, { id: 'fm_dishing', seed: 6 }));
  assert.deepEqual(view.entries.map(entry => entry.id), ['fm_dishing']);
  assert.equal(view.count, 1);
  assert.equal(view.stillToFind, ALL - 1);
});

test('the line under the list reads right for 1 and for none left', () => {
  const allButOne = FAILURE_MODES.slice(1).map(mode => ({ id: mode.id, seed: 1 }));
  assert.equal(notebookView(notebookOf(...allButOne)).stillText, '1 failure mode still to find.');
  const all = FAILURE_MODES.map(mode => ({ id: mode.id, seed: 1 }));
  assert.equal(notebookView(notebookOf(...all)).stillText, 'Every failure mode is in your notebook.');
});
