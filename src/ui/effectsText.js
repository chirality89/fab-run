// effectsText.js — what a card or an item does, in plain words (M4.5 item 5,
// Lane F issue 6: show effects before you commit). No DOM and no game
// rules: it only reads an entry's `effects` from content.js, so the screen
// never invents a number.
//
// One effect becomes one short phrase, e.g.
//   { op: 'defectMult', pattern: 'residue', mult: 0.3 }  → "residue ×0.3"
// and a list of effects becomes one line joined by " · ".

import { PRACTICES, EQUIPMENT, MATERIALS, PATTERNS } from '../content/content.js';

// A pattern or flag name in words: 'underlayer_attack' → 'underlayer attack'.
export const words = name => name.replace(/_/g, ' ');

// A camelCase name in words: 'narrowFeatures' → 'narrow features',
// 'tightCD' → 'tight CD' (a word in capitals stays in capitals).
const camelWords = name => name
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .split(' ')
  .map(word => (word.length > 1 && word === word.toUpperCase() ? word : word.toLowerCase()))
  .join(' ');

// The name of a card, equipment or material, or its id if it is unknown.
export function itemName(id) {
  const item = [...PRACTICES, ...EQUIPMENT, ...MATERIALS].find(entry => entry.id === id);
  return item ? item.name : id;
}

// A risk that enters the lot, with its size in yield points as well, since
// "risk" is the game's own exponent and means nothing to a player (Lane F
// issue 10): "+0.02 risk (about 2.0 points of yield): random dots across
// the wafer". Points = 100 × (1 − e^−risk), the same rule as yield. For a
// pattern that hits only some sites (edge ring) it is the lot average.
// `amount` may be a number or text such as '0.010'.
export function riskText(amount, pattern) {
  const points = (100 * (1 - Math.exp(-Number(amount)))).toFixed(1);
  return `+${amount} risk (about ${points} points of yield): ${PATTERNS[pattern] ?? words(pattern)}`;
}

// What a `reveal` shows, in words. Anything not listed is said from its id.
const REVEAL_TEXT = {
  allSites: 'all 25 sites',
  driftTelegraphEarly: 'drift earlier on SPC',
  toolFault: 'the tool fault',
  bathAge: 'the bath age',
  oxideThickness: 'the oxide thickness',
  implantDose: 'the implant dose',
};

// The condition an effect waits for, as a few words after it, e.g.
// " with etch stop" or " with Optical endpoint detector". Empty if none.
function conditionText(when) {
  if (!when) return '';
  if (when.flag) return ` with ${words(when.flag)}`;
  if (when.equipment) return ` with ${itemName(when.equipment)}`;
  if (when.material) return ` with ${itemName(when.material)}`;
  if (when.lot) return ` (${camelWords(when.lot)} only)`;
  return '';
}

// One effect in words. Tool health stays hidden (SPC only, David), so it is
// said as a service or as wear, never as a number. Returns null for an
// effect with nothing to say (a reveal of 'none').
export function effectText(effect) {
  const when = conditionText(effect.when);
  switch (effect.op) {
    case 'defectMult': return `${words(effect.pattern)} ×${effect.mult}${when}`;
    case 'addRisk': return `${riskText(effect.amount, effect.pattern)}${when}`;
    case 'timeCost': return effect.delta >= 0
      ? `uses ${effect.delta} min of room time${when}`
      : `gives ${-effect.delta} min more room time${when}`;
    case 'cashCost': return effect.delta >= 0 ? `−${effect.delta} cash${when}` : `+${-effect.delta} cash${when}`;
    case 'setFlag': return `sets ${words(effect.flag)}${when}`;
    case 'enables': return `lets you play ${itemName(effect.id)}${when}`;
    case 'reveal': return effect.what === 'none' ? null : `shows ${REVEAL_TEXT[effect.what] ?? camelWords(effect.what)}${when}`;
    case 'toolHealth': return effect.delta > 0 ? `services the tool${when}` : `wears the tool faster${when}`;
    case 'decayPerUse': return `weakens with each use (${words(effect.target)} ×${effect.mult} per use)${when}`;
    default: return effect.op;   // an operation this file doesn't know: show its name, invent nothing
  }
}

// All of an entry's effects in one line, e.g.
// "residue ×0.3 · underlayer attack ×1.5 · underlayer attack ×0.5 with etch stop".
// Empty text if it has none.
export function effectsLine(effects = []) {
  return effects.map(effectText).filter(text => text !== null).join(' · ');
}
