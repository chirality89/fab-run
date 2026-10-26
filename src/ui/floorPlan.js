// floorPlan.js — draws the map screen (the cleanroom floor plan) and the
// screens after a side stop (the procurement shop, and a placeholder for
// the stops not built yet), from mapView(), shopView() and stopView() in
// view.js.
//
// The floor plan lays the route's bays out as a snake, three to a row:
//   row 1:  1 → 2 → 3
//   row 2:  6 ← 5 ← 4
//   row 3:  7 → 8 → 9
// Corridors sit between neighbouring bays, and at the ends of the rows
// where the route turns. The look is plain for now; the toy-diorama art
// comes in M6.
//
// No game logic here, and text only through textContent (see render.js).

import { el, panel, onSingleClick, actionButton, showFromTop, notebookButton } from './render.js';
import { drawSpcPicture } from './spcChart.js';

const BAYS_PER_ROW = 3;

// Where bay `index` (0-based) sits in its row, counting from the left.
// Rows go left to right, then right to left, and so on.
function columnOf(index) {
  const row = Math.floor(index / BAYS_PER_ROW);
  const along = index % BAYS_PER_ROW;
  return row % 2 === 0 ? along : BAYS_PER_ROW - 1 - along;
}

// The plan is a grid with a narrow corridor track between bays:
//   grid columns 1, 3, 5 hold bays; 2 and 4 hold corridors between them
//   grid rows    1, 3, 5 hold bays; 2 and 4 hold the turns between rows
// These two functions give the CSS grid line numbers (counted from 1).
function bayCell(index) {
  const row = Math.floor(index / BAYS_PER_ROW);
  return { row: row * 2 + 1, column: columnOf(index) * 2 + 1 };
}

function corridorCell(afterStep) {
  const from = bayCell(afterStep);
  const to = bayCell(afterStep + 1);
  if (from.row === to.row) {
    // Side by side: the corridor is the column between them.
    return { row: from.row, column: Math.min(from.column, to.column) + 1, turn: false };
  }
  // End of a row: the corridor is the row between them, under the last bay.
  return { row: from.row + 1, column: from.column, turn: true };
}

function placeIn(node, cell) {
  node.style.gridRow = String(cell.row);
  node.style.gridColumn = String(cell.column);
}

// Words that say what state a bay is in, so it never rests on color alone.
const BAY_STATUS_TEXT = { done: 'Done', next: 'Next', ahead: '' };

function drawBay(bay, index) {
  const tile = el('div', `bay room-${bay.roomId} bay-${bay.status}`);
  tile.setAttribute('role', 'listitem');
  const statusText = BAY_STATUS_TEXT[bay.status];
  const alarmText = bay.spcAlarm ? ', SPC alarm on its tool' : '';
  tile.setAttribute('aria-label', `Step ${bay.number}: ${bay.label}${statusText ? `, ${statusText.toLowerCase()}` : ''}${alarmText}`);
  tile.title = bay.label;
  tile.append(el('span', 'bay-number', String(bay.number)), el('span', 'bay-name', bay.roomName));
  if (statusText) tile.append(el('span', 'bay-status', statusText));
  if (bay.spcAlarm) tile.append(el('span', 'chip chip-spc', 'SPC'));
  placeIn(tile, bayCell(index));
  return tile;
}

// One corridor: its offers as short labels, the one taken filled in, a Q-time
// mark, and "Lot" where the lot stands now.
function drawCorridor(corridor) {
  const cell = corridorCell(corridor.afterStep);
  const classes = ['corridor', cell.turn ? 'corridor-turn' : 'corridor-across'];
  if (corridor.here) classes.push('corridor-here');
  if (corridor.walked) classes.push('corridor-walked');
  if (corridor.qtime) classes.push('corridor-qtime');
  const node = el('div', classes.join(' '));
  node.setAttribute('role', 'listitem');

  const offerNames = corridor.offers.map(offer => offer.short).join(', ');
  const parts = [`Corridor after step ${corridor.afterStep + 1}: ${offerNames}`];
  if (corridor.qtime) parts.push('Q-time window');
  if (corridor.taken) parts.push(`took ${corridor.taken}`);
  else if (corridor.walked) parts.push('went straight on');
  if (corridor.here) parts.push('the lot is here');
  node.setAttribute('aria-label', parts.join(', '));

  if (corridor.here) node.append(el('span', 'chip chip-lot', 'LOT'));
  if (corridor.qtime) node.append(el('span', 'chip chip-qtime', 'QT'));
  for (const offer of corridor.offers) {
    const taken = corridor.taken === offer.kind;
    node.append(el('span', taken ? 'chip chip-taken' : 'chip', offer.short));
  }
  placeIn(node, cell);
  return node;
}

function drawPlan(view) {
  const box = panel('Floor plan', 'plan-panel');
  const grid = el('div', 'floor-plan');
  grid.setAttribute('role', 'list');
  grid.setAttribute('aria-label', 'Floor plan of the route');
  view.bays.forEach((bay, index) => grid.append(drawBay(bay, index)));
  view.corridors.forEach(corridor => grid.append(drawCorridor(corridor)));
  box.append(grid);
  box.append(el('p', 'map-key', `${view.stopKeyText} · QT Q-time window · LOT where the lot is now · SPC the tool's chart trips a rule`));
  return box;
}

// Top bar of the map screen: the plan's own band, the seed, the lot's
// numbers and the Notebook button.
function drawMapHeader(view, notebook) {
  const header = el('header', 'room-band map-band');
  header.append(el('h1', 'room-name', 'Floor plan'));
  header.append(el('p', 'room-step', `Inlaid Cu line · yield ${view.yieldPercent.toFixed(1)}%`));
  const facts = el('p', 'room-facts');
  facts.append(
    el('span', 'seed', `Seed ${view.seed}`),
    el('span', 'cash', `Cash ${view.cash}`),
    el('span', 'cash', `Cycle time ${view.cycleTime} min`),
  );
  header.append(facts, notebookButton(notebook));
  return header;
}

// One side stop the lot can take here.
function drawOffer(offer, actions) {
  const button = el('button', 'stop-button');
  const top = el('span', 'card-top');
  top.append(el('span', 'card-name', offer.name), el('span', 'card-cost', `+${offer.minutes} min`));
  const what = offer.placeholder ? `${offer.what} (coming in a later update)` : offer.what;
  button.append(top, el('span', 'card-summary', what));
  if (offer.qtimeRisk > 0) {
    button.append(el('span', 'stop-qtime', `Waits in Q-time: +${offer.qtimeRisk.toFixed(3)} oxide risk`));
  }
  onSingleClick(button, () => actions.onTakeStop(offer.kind));
  return button;
}

function drawChoices(view, actions) {
  const box = panel(view.position === 'start' ? 'Start' : 'Corridor', 'choice-panel');
  box.append(el('p', 'outcome-text', view.whereText));
  if (view.qtimeText) box.append(el('p', 'qtime-warning', view.qtimeText));
  if (view.offers.length > 0) {
    const list = el('div', 'stop-list');
    for (const offer of view.offers) list.append(drawOffer(offer, actions));
    box.append(el('h3', 'choice-heading', 'Take one side stop'), list);
    box.append(el('h3', 'choice-heading', 'Or go straight on'));
  }
  box.append(actionButton(view.goText, 'go-button', actions.onGoStraight));
  if (view.position !== 'start') box.append(drawScrap(actions));
  return box;
}

// Scrap the lot (decision O4). The first tap only asks; "Keep the lot" takes
// the asking button's place, so a double tap can never scrap by accident.
function drawScrap(actions) {
  const box = el('div', 'scrap-box');
  const ask = actionButton('Scrap the lot', 'scrap-button secondary-button', () => {
    const keep = actionButton('Keep the lot', 'keep-button secondary-button', () => box.replaceChildren(ask));
    const buttons = el('div', 'result-buttons');
    buttons.append(keep, actionButton('Yes, scrap it', 'scrap-confirm-button', actions.onScrap));
    box.replaceChildren(el('p', 'scrap-question', 'Scrap this lot? The run ends, and everything spent on it is lost.'), buttons);
    keep.focus();
  });
  box.append(ask);
  return box;
}

// Draws the map screen. `actions` holds onTakeStop(kind), onGoStraight(),
// onScrap() and notebook ({ count, onOpen }, for the Notebook button).
export function renderMap(container, view, actions) {
  const body = el('div', 'map-body');
  body.append(drawChoices(view, actions), drawPlan(view));
  container.replaceChildren(drawMapHeader(view, actions.notebook), body);
  showFromTop(container);
}

// The placeholder screen after a side stop. `actions` holds onContinue().
export function renderStop(container, view, actions) {
  const header = el('header', 'room-band map-band');
  header.append(el('h1', 'room-name', view.name), el('p', 'room-step', view.what));
  header.append(el('p', 'room-facts', `Seed ${view.seed}`));
  const box = panel('Side stop', 'stop-panel');
  box.setAttribute('role', 'status');
  box.append(el('p', 'outcome-text', view.text));
  box.append(actionButton(view.goText, 'go-button', actions.onContinue));
  container.replaceChildren(header, box);
  showFromTop(container);
}

// One item on sale at the procurement stop: what it is, what it costs, its
// tradeoff, what it does in numbers, where it acts next, and a Buy button (greyed out with the
// reason when it can't be bought).
function drawShopItem(item, actions) {
  const box = el('li', item.bought ? 'card shop-item shop-item-bought' : 'card shop-item');
  const top = el('div', 'card-top');
  top.append(el('span', 'card-name', item.name), el('span', 'card-cost', `${item.price} cash`));
  box.append(top, el('span', 'shop-kind', `${item.kindText} · ${item.roomName}`));
  box.append(el('span', 'card-summary', item.tradeoff));
  if (item.effectsText) box.append(el('span', 'card-effects', item.effectsText));   // what it does, in numbers
  box.append(el('span', 'shop-next', item.nextUseText));
  if (item.replacesText) box.append(el('span', 'shop-next', item.replacesText));
  if (item.buyable) {
    const buy = actionButton(`Buy for ${item.price}`, 'buy-button', () => actions.onBuy(item.id));
    buy.setAttribute('aria-label', `Buy ${item.name} for ${item.price} cash`);
    box.append(buy);
  } else {
    if (item.bought) box.append(el('span', 'shop-bought', 'Bought'));
    else box.append(el('span', 'card-reason', `Can't buy: ${item.reason}`));
  }
  return box;
}

// The procurement screen. `actions` holds onBuy(itemId) and onContinue().
// `keepFocusOn` is the id of the item just bought, if any: the redraw then
// keeps keyboard focus near it instead of jumping back to the title.
export function renderShop(container, view, actions, keepFocusOn = null) {
  const header = el('header', 'room-band map-band');
  header.append(el('h1', 'room-name', view.name), el('p', 'room-step', view.what));
  const facts = el('p', 'room-facts');
  facts.append(el('span', 'seed', `Seed ${view.seed}`), el('span', 'cash shop-cash', `Cash ${view.cash}`));
  header.append(facts);

  const box = panel('For sale', 'shop-panel');
  box.append(el('p', 'outcome-text', view.text));
  const list = el('ul', 'shop-list');
  list.setAttribute('role', 'list');
  view.items.forEach((item, index) => {
    const node = drawShopItem(item, actions);
    node.dataset.index = String(index);
    list.append(node);
  });
  box.append(list, actionButton(view.goText, 'go-button', actions.onContinue));
  container.replaceChildren(header, box);

  if (keepFocusOn === null) {
    showFromTop(container);
    return;
  }
  // After a purchase: focus the next Buy button from the item just bought
  // on, or else Continue.
  const position = view.items.findIndex(item => item.id === keepFocusOn);
  const itemsFromHere = [...container.querySelectorAll('.shop-item')].slice(position);
  const buyButtons = itemsFromHere.map(node => node.querySelector('.buy-button')).filter(button => button !== null);
  const target = buyButtons.length > 0 ? buyButtons[0] : container.querySelector('.go-button');
  target.focus({ preventScroll: true });
}

// One tool on the PM screen: its room, where it is used next, its SPC
// chart and verdict, and a PM button (or why there is none).
function drawPmChoice(choice, actions) {
  const box = el('li', choice.done ? 'card shop-item shop-item-bought' : 'card shop-item');
  const top = el('div', 'card-top');
  top.append(el('span', 'card-name', choice.roomName), el('span', 'card-cost', choice.parameter));
  box.append(top, el('span', 'shop-next', choice.nextUseText));
  box.append(drawSpcPicture(choice.spc));
  box.append(el('p', choice.spc.inControl ? 'spc-verdict' : 'spc-verdict spc-verdict-out', choice.spc.verdictText));
  if (choice.done) {
    box.append(el('span', 'shop-bought', 'PM done: the next lots run on a restored tool'));
  } else if (choice.canPm) {
    // The button names its tool: six identical "PM this tool" buttons led a
    // player to PM the wrong one (Lane F issue 8).
    const button = actionButton(`PM the ${choice.roomName} tool`, 'pm-button', () => actions.onPm(choice.roomId));
    box.append(button);
  }
  return box;
}

// One practice a DOE could upgrade: now → after, and a DOE button.
function drawDoeOffer(offer, actions) {
  const box = el('li', offer.done ? 'card shop-item shop-item-bought' : 'card shop-item');
  const top = el('div', 'card-top');
  top.append(el('span', 'card-name', offer.name), el('span', 'card-cost', offer.roomName));
  box.append(top);
  box.append(el('span', 'shop-next', `Now: ${offer.nowText}`));
  box.append(el('span', 'shop-next doe-after', `After the DOE (${offer.afterName}): ${offer.afterText}`));
  box.append(el('span', 'card-summary', offer.afterTradeoff));
  if (offer.done) {
    box.append(el('span', 'shop-bought', 'DOE done: this card plays its tuned recipe from now on'));
  } else if (offer.canDoe) {
    const button = actionButton('Run this DOE', 'doe-button', () => actions.onDoe(offer.cardId));
    button.setAttribute('aria-label', `Run a DOE on ${offer.name}`);
    box.append(button);
  } else if (!offer.choiceUsed) {
    box.append(el('span', 'card-reason', `Can't run: ${offer.reason}`));
  }
  return box;
}

// The PM/DOE screen: a DOE section (short), then the PM section (one card
// per tool), then Continue. `actions` holds onPm(roomId), onDoe(cardId) and
// onContinue(). `justChose` is true right after a PM or DOE: focus then
// moves to Continue instead of the title.
export function renderPm(container, view, actions, justChose = false) {
  const header = el('header', 'room-band map-band');
  header.append(el('h1', 'room-name', view.name), el('p', 'room-step', view.what));
  const facts = el('p', 'room-facts');
  facts.append(el('span', 'seed', `Seed ${view.seed}`), el('span', 'cash pm-cash', `Cash ${view.cash}`));
  header.append(facts);

  const doe = panel('DOE a practice', 'doe-panel');
  doe.append(el('p', 'outcome-text', view.doeText));
  const doeList = el('ul', 'shop-list');
  doeList.setAttribute('role', 'list');
  for (const offer of view.doeOffers) doeList.append(drawDoeOffer(offer, actions));
  if (view.doeOffers.length === 0) doe.append(el('p', 'slot-empty', 'No practice in your deck can be tuned here.'));
  doe.append(doeList);

  const pm = panel('Or PM a tool on the route ahead', 'pm-panel');
  pm.append(el('p', 'outcome-text', view.text));
  const list = el('ul', 'shop-list');
  list.setAttribute('role', 'list');
  for (const choice of view.choices) list.append(drawPmChoice(choice, actions));
  pm.append(list);

  const go = actionButton(view.goText, 'go-button', actions.onContinue);
  container.replaceChildren(header, doe, pm, go);
  if (justChose) go.focus({ preventScroll: true });
  else showFromTop(container);
}

// One option of an event: what it does, its tradeoff, and a button to
// choose it (until one is chosen).
function drawEventOption(option, chosen, actions) {
  const box = el('li', option.chosen ? 'card shop-item shop-item-bought' : 'card shop-item');
  box.append(el('span', 'card-name', option.label));
  box.append(el('span', 'shop-next doe-after', option.consequences));
  box.append(el('span', 'card-summary', option.tradeoff));
  if (option.chosen) {
    box.append(el('span', 'shop-bought', 'Chosen'));
  } else if (!chosen) {
    const button = actionButton('Choose this', 'event-button', () => actions.onChoose(option.index));
    button.setAttribute('aria-label', `Choose: ${option.label}`);
    box.append(button);
  }
  return box;
}

// The event screen. `actions` holds onChoose(optionIndex) and onContinue().
// After a choice the result shows, and focus moves to Continue.
export function renderEvent(container, view, actions) {
  const header = el('header', 'room-band map-band');
  header.append(el('h1', 'room-name', view.name), el('p', 'room-step', 'Event'));
  const facts = el('p', 'room-facts');
  facts.append(el('span', 'seed', `Seed ${view.seed}`), el('span', 'cash event-cash', `Cash ${view.cash}`));
  header.append(facts);

  const box = panel('What happens', 'event-panel');
  box.append(el('p', 'outcome-text', view.text), el('p', 'map-key', view.costText));
  const list = el('ul', 'shop-list');
  list.setAttribute('role', 'list');
  for (const option of view.options) list.append(drawEventOption(option, view.chosen, actions));
  box.append(list);
  if (view.resultText) {
    const result = el('p', 'outcome-text event-result', view.resultText);
    result.setAttribute('role', 'status');
    box.append(result);
  }
  const go = actionButton(view.goText, 'go-button', actions.onContinue);
  box.append(go);
  container.replaceChildren(header, box);
  if (view.chosen) go.focus({ preventScroll: true });
  else showFromTop(container);
}
