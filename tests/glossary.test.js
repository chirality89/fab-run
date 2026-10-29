// glossary.test.js — checks the Words page data (src/content/glossary.js).
// Run with: npm test
//
// It checks shape, not wording: every term has both sentences, is still a
// draft until David has read it, and the list stays in A-to-Z order.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GLOSSARY } from '../src/content/glossary.js';

// A to Z, ignoring capitals ("SPC" sorts with "Spec", not before "CD").
const byTerm = (a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' });

test('every term has a word, a plain sentence and an in-the-game sentence', () => {
  for (const entry of GLOSSARY) {
    for (const field of ['term', 'plain', 'inGame']) {
      assert.equal(typeof entry[field], 'string', `${entry.term}: ${field} is text`);
      assert.ok(entry[field].trim().length > 0, `${entry.term}: ${field} is not empty`);
    }
    assert.ok(/[.!?]$/.test(entry.plain), `${entry.term}: plain ends with a full stop`);
    assert.ok(/[.!?]$/.test(entry.inGame), `${entry.term}: inGame ends with a full stop`);
  }
});

test('every term is a draft until David has reviewed it', () => {
  for (const entry of GLOSSARY) assert.equal(entry.draft, true, entry.term);
});

test('each term is listed once, in A-to-Z order', () => {
  const terms = GLOSSARY.map(entry => entry.term.toLowerCase());
  assert.equal(new Set(terms).size, terms.length);
  assert.deepEqual(GLOSSARY.map(entry => entry.term), [...GLOSSARY].sort(byTerm).map(entry => entry.term));
});
