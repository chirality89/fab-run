// effectsText.test.js — checks the plain-words effects line (src/ui/effectsText.js,
// M4.5 item 5). Expected strings are written by hand from the entries in
// content.js. Never edit one to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRACTICES, EQUIPMENT, MATERIALS } from '../src/content/content.js';
import { effectText, effectsLine, riskText } from '../src/ui/effectsText.js';

const entry = id => [...PRACTICES, ...EQUIPMENT, ...MATERIALS].find(item => item.id === id);

test('a starter card: timed over-etch, with its etch-stop condition', () => {
  assert.equal(effectsLine(entry('timedOveretch').effects),
    'residue ×0.3 · underlayer attack ×2 · underlayer attack ×0.525 with etch stop');
});

test('equipment: endpoint detector (enables a card) and pad conditioner (costs cash each use)', () => {
  assert.equal(effectsLine(entry('oesEndpoint').effects), 'lets you play Stop on endpoint · depth variation ×0.7');
  assert.equal(effectsLine(entry('padConditioner').effects), 'rr drift ×0.4 · −20 cash');
});

test('materials: lot conditions, room time and decay per use', () => {
  assert.equal(effectsLine(entry('resistIline').effects), 'gives 5 min more room time · cd error ×1.5 (tight CD only)');
  assert.equal(effectsLine(entry('resistThick').effects),
    'underlayer attack ×0.5 (deep etch only) · cd error ×1.3 · uses 10 min of room time');
  assert.equal(effectsLine(entry('additiveBath').effects),
    'void ×0.25 (narrow features only) · weakens with each use (void ×1.15 per use)');
});

test('a practice that sets a flag', () => {
  assert.equal(effectsLine(entry('etchStopLayer').effects), 'sets etch stop · depth variation ×0.4');
});

test('one phrase per operation, and nothing invented for an unknown one', () => {
  assert.equal(effectText({ op: 'cashCost', delta: -150 }), '+150 cash');
  assert.equal(effectText({ op: 'toolHealth', delta: 100 }), 'services the tool');
  assert.equal(effectText({ op: 'toolHealth', delta: -5 }), 'wears the tool faster');
  assert.equal(effectText({ op: 'reveal', what: 'allSites' }), 'shows all 25 sites');
  assert.equal(effectText({ op: 'reveal', what: 'none' }), null);
  // Hand check: 100 × (1 − e^−0.02) = 1.98, shown as 2.0.
  assert.equal(effectText({ op: 'addRisk', pattern: 'particles', amount: 0.02 }),
    '+0.02 risk (about 2.0 points of yield): random dots across the wafer');
  assert.equal(effectText({ op: 'somethingNew' }), 'somethingNew');
  assert.equal(effectsLine([]), '');
  assert.equal(effectsLine(undefined), '');
});

test('risk in yield points: 100 × (1 − e^−risk), one decimal', () => {
  // 0.04 → 3.92; '0.010' (text, as the Q-time line passes it) → 0.995.
  assert.equal(riskText(0.04, 'particles'), '+0.04 risk (about 3.9 points of yield): random dots across the wafer');
  assert.equal(riskText('0.010', 'particles'), '+0.010 risk (about 1.0 points of yield): random dots across the wafer');
});
