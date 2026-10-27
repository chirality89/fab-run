// eventView.js — display data for the event screen (M3 item 2e). No DOM and
// no game rules: it only reads the state and the content.

import { ROOMS } from '../content/content.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import { SIDE_STOP_MINUTES, QTIME_RISK_PER_MINUTE } from '../content/balance.js';
import { findEvent } from '../engine/events.js';
import { riskText } from './effectsText.js';   // "+0.02 risk (about 2.0 points of yield): …"


// One effect of an option, in plain words. Tool health stays hidden (SPC
// only, David), so a toolHealth effect is said as a service, not a number.
function effectText(effect) {
  if (effect.op === 'cashCost') return effect.delta < 0 ? `+${-effect.delta} cash` : `−${effect.delta} cash`;
  if (effect.op === 'addRisk') return riskText(effect.amount, effect.pattern);
  if (effect.op === 'toolHealth' && effect.delta > 0) return `${ROOMS[effect.room].name} tool serviced`;
  if (effect.op === 'toolHealth') return `${ROOMS[effect.room].name} tool steps off target (watch its SPC chart)`;
  return effect.op;   // any other op: show its name rather than invent words
}

// An option's consequences in one line, e.g.
// "−30 min cycle time · +150 cash · +0.02 risk: random dots across the wafer".
function consequencesText(option, qtimePattern) {
  const parts = [];
  if (option.minutes < 0) parts.push(`${option.minutes} min cycle time`.replace('-', '−'));
  if (option.minutes > 0) parts.push(`+${option.minutes} min cycle time`);
  if (option.minutes > 0 && qtimePattern) {
    parts.push(`${riskText((QTIME_RISK_PER_MINUTE * option.minutes).toFixed(3), qtimePattern)} (Q-time wait)`);
  }
  parts.push(...option.effects.map(effectText));
  return parts.length > 0 ? parts.join(' · ') : 'Nothing changes';
}

// Everything the event screen shows, while an event stop is open.
export function eventView(state) {
  if (state.event === null) throw new Error('eventView: no event is open');
  const event = findEvent(state.event.eventId);
  const route = LOT_TYPES[state.lotTypeId].route;
  const qtimePattern = route[state.event.corridor].qtime || null;
  const nextIndex = state.event.corridor + 1;
  const chosen = state.event.chosen;
  return {
    seed: state.seed,
    cash: state.cash,
    name: event.name,
    text: event.text,
    costText: `The event stop cost ${SIDE_STOP_MINUTES.event} min of cycle time. Choose one option.`,
    options: event.options.map((option, index) => ({
      index,
      label: option.label,
      consequences: consequencesText(option, qtimePattern),
      tradeoff: option.tradeoff,
      chosen: chosen === index,
    })),
    chosen: chosen !== null,
    resultText: chosen === null ? null : event.options[chosen].result,
    goText: `Continue to step ${nextIndex + 1}: ${route[nextIndex].label}`,
  };
}
