// render.js — draws the room screen from the display data made by view.js.
//
// No game logic here: every number and word comes from roomView(). Text is
// always set with textContent (never innerHTML), so nothing in the data can
// turn into page code.

// Makes an element with a class and, optionally, some text.
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// A small heading for each panel.
function panel(title, className) {
  const box = el('section', `panel ${className}`);
  box.append(el('h2', 'panel-title', title));
  return box;
}

// Top bar: the room name on its room color, the step, the seed and cash.
function drawHeader(view) {
  const header = el('header', `room-band room-${view.roomId}`);
  header.append(el('h1', 'room-name', view.roomName));
  header.append(el('p', 'room-step', `Step ${view.stepNumber} of ${view.stepCount} · ${view.stepLabel}`));
  const facts = el('p', 'room-facts');
  const seed = el('span', 'seed', `Seed ${view.seed}`);
  const cash = el('span', 'cash', `Cash ${view.cash}`);
  facts.append(seed, cash);
  header.append(facts);
  return header;
}

// A mark on the yield bar (scrap line or spec), placed at its percent.
function barMark(percent, label, className) {
  const mark = el('div', `bar-mark ${className}`);
  mark.style.left = `${percent}%`;
  mark.append(el('span', 'bar-mark-label', label));
  return mark;
}

// Yield bar: always shows its number, with marks at the scrap line and spec.
function drawYield(view) {
  const box = panel('Line yield', 'yield-panel');
  const status = view.yieldPercent >= view.spec ? 'ok' : view.yieldPercent >= view.scrapLine ? 'warn' : 'bad';
  box.append(el('p', 'yield-number', `${view.yieldPercent.toFixed(1)}%`));

  const bar = el('div', 'yield-bar');
  bar.setAttribute('role', 'img');
  bar.setAttribute('aria-label', `Yield ${view.yieldPercent}%, scrap line ${view.scrapLine}%, spec ${view.spec}%`);
  const fill = el('div', `yield-fill yield-${status}`);
  fill.style.width = `${view.yieldPercent}%`;
  bar.append(fill, barMark(view.scrapLine, `Scrap ${view.scrapLine}%`, 'mark-scrap'),
    barMark(view.spec, `Spec ${view.spec}%`, 'mark-spec'));
  box.append(bar);
  box.append(el('p', 'expected-loss', view.expectedLossText));
  return box;
}

// Wafer map: 5 × 5 tiles, each with its band (color AND pattern) and percent.
function drawWaferMap(view) {
  const box = panel('Wafer map', 'map-panel');
  const grid = el('div', 'wafer-map');
  grid.setAttribute('role', 'list');
  view.sites.forEach((site, index) => {
    const tile = el('div', `site site-${site.band}`);
    tile.setAttribute('role', 'listitem');
    tile.setAttribute('aria-label', `Site ${index + 1}: ${site.percent}% good, ${site.band}`);
    tile.append(el('span', 'site-number', `${site.percent}`));
    grid.append(tile);
  });
  box.append(grid);
  box.append(el('p', 'map-key', 'Each site: % of the 25 wafers still good there. Pass 90%+, warning 70–89%, fail under 70%.'));
  return box;
}

// A labelled meter (time left, tool health): text first, then a plain bar.
function meter(title, text, fraction, className) {
  const box = panel(title, className);
  box.append(el('p', 'meter-text', text));
  const bar = el('div', 'meter-bar');
  const fill = el('div', 'meter-fill');
  fill.style.width = `${Math.max(0, Math.min(1, fraction)) * 100}%`;
  bar.append(fill);
  box.append(bar);
  return box;
}

// Slots: the equipment and materials in this room, or "empty".
function drawSlots(view) {
  const box = panel('Slots', 'slots-panel');
  if (view.slots.length === 0) {
    box.append(el('p', 'slot-empty', 'empty'));
    return box;
  }
  const list = el('ul', 'slot-list');
  for (const item of view.slots) list.append(el('li', 'slot-item', `${item.name} (${item.kind})`));
  box.append(list);
  return box;
}

// The cost line on a card, e.g. "4 min" or "20 min · 150 cash".
function costText(card) {
  const parts = [`${card.minutes} min`];
  if (card.cash > 0) parts.push(`${card.cash} cash`);
  return parts.join(' · ');
}

// One card in the hand. Not clickable yet (playing cards is the next item).
function drawCard(card) {
  const node = el('div', card.playable ? 'card' : 'card card-unplayable');
  node.setAttribute('role', 'listitem');
  const top = el('div', 'card-top');
  top.append(el('h3', 'card-name', card.name), el('span', 'card-cost', costText(card)));
  node.append(top, el('p', 'card-summary', card.summary));
  if (!card.playable) node.append(el('p', 'card-reason', `Can't play: ${card.reason}`));
  return node;
}

function drawHand(view) {
  const box = panel('Hand', 'hand-panel');
  if (view.hand.length === 0) {
    box.append(el('p', 'slot-empty', 'No practices for this room in your deck.'));
    return box;
  }
  const list = el('div', 'hand');
  list.setAttribute('role', 'list');
  for (const card of view.hand) list.append(drawCard(card));
  box.append(list);
  return box;
}

// Draws the whole room into the given container, replacing what was there.
export function renderRoom(container, view) {
  const body = el('div', 'room-body');
  body.append(
    drawWaferMap(view),
    meter('Time budget', `${view.timeLeft} of ${view.budget} min left`, view.timeLeft / view.budget, 'time-panel'),
    drawSlots(view),
    meter('Tool health', `${view.toolHealth} / 100`, view.toolHealth / 100, 'tool-panel'),
    drawHand(view),
  );
  container.replaceChildren(drawHeader(view), drawYield(view), body);
}

// Shows an error in a visible box, so a broken page never just looks blank.
export function renderError(container, error) {
  const box = el('div', 'error-box');
  box.setAttribute('role', 'alert');
  box.append(el('h2', 'error-title', 'Something went wrong'));
  box.append(el('pre', 'error-text', String(error && error.stack ? error.stack : error)));
  container.replaceChildren(box);
}
