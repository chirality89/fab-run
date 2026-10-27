// spcChart.js — draws a room tool's SPC chart from spcView() (M3 item 2b).
//
// An inline SVG picture: the centre line, the control limits (dashed), the
// spec limits (solid), each with its value at the left edge, and one dot per lot, oldest on the left. A point
// beyond the control limits is a larger square, not only a different color.
// Colors come from CSS classes (room.css), which use the tokens only.
// The words under the chart say the same as the picture, for everyone.

import { el, panel } from './dom.js';

const SVG = 'http://www.w3.org/2000/svg';
const WIDTH = 320;
const HEIGHT = 150;
const PAD = 10;
const LEFT = 36;     // room at the left edge for the axis numbers
const Z_RANGE = 5;   // the chart shows from −5σ to +5σ; points beyond sit on the edge

// Makes an SVG element with attributes. SVG needs its own namespace.
function svgEl(tag, attributes) {
  const node = document.createElementNS(SVG, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
  return node;
}

// Where a z value (sigma from the target) sits up the chart: +5σ at the top.
function yOf(z) {
  const clamped = Math.max(-Z_RANGE, Math.min(Z_RANGE, z));
  return PAD + ((Z_RANGE - clamped) / (2 * Z_RANGE)) * (HEIGHT - 2 * PAD);
}

// Where point `index` of `count` sits across the chart.
function xOf(index, count) {
  if (count <= 1) return (LEFT + WIDTH) / 2;
  return LEFT + (index / (count - 1)) * (WIDTH - LEFT - PAD);
}

function horizontalLine(z, className) {
  return svgEl('line', { x1: LEFT - 4, x2: WIDTH, y1: yOf(z), y2: yOf(z), class: className });
}

// A line's value at the left edge, e.g. "324", level with its line.
function axisLabel({ z, text }) {
  const label = svgEl('text', { x: LEFT - 6, y: yOf(z) + 3.5, 'text-anchor': 'end', class: 'spc-axis-label' });
  label.textContent = text;
  return label;
}

// The x position of a PM mark that sits just before point `index`: halfway
// between that point and the one before, or at an edge of the chart.
function xOfMark(index, count) {
  if (index <= 0) return LEFT - 2;
  if (index >= count) return WIDTH - PAD / 2;
  return (xOf(index - 1, count) + xOf(index, count)) / 2;
}

// A PM mark: a dotted vertical line with the word "PM" at its top.
function drawPmMark(index, count) {
  const x = xOfMark(index, count);
  const group = svgEl('g', { class: 'spc-pm' });
  // At an edge, the label hangs inwards so it is not cut off.
  let anchor = 'middle';
  if (index >= count) anchor = 'end';
  if (index <= 0) anchor = 'start';
  const label = svgEl('text', { x, y: PAD + 4, 'text-anchor': anchor, class: 'spc-pm-label' });
  label.textContent = 'PM';
  group.append(svgEl('line', { x1: x, x2: x, y1: PAD + 8, y2: HEIGHT - 2, class: 'spc-pm-line' }), label);
  return group;
}

// The chart picture alone (also used on the PM screen).
export function drawSpcPicture(view) {
  const svg = svgEl('svg', { viewBox: `0 0 ${WIDTH} ${HEIGHT}`, class: 'spc-chart' });
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `SPC chart of ${view.parameter}, last ${view.zs.length} lots. ${view.verdictText}`);
  for (const side of view.specSides) svg.append(horizontalLine(side * view.specSigma, 'spc-spec'));
  svg.append(
    horizontalLine(view.controlSigma, 'spc-control'), horizontalLine(-view.controlSigma, 'spc-control'),
    horizontalLine(0, 'spc-centre'),
  );
  for (const label of view.axisLabels) svg.append(axisLabel(label));
  const count = view.zs.length;
  const corners = view.zs.map((z, index) => `${xOf(index, count)},${yOf(z)}`).join(' ');
  svg.append(svgEl('polyline', { points: corners, class: 'spc-trace' }));
  for (const index of view.pmMarks) svg.append(drawPmMark(index, count));
  view.zs.forEach((z, index) => {
    const x = xOf(index, count);
    const y = yOf(z);
    if (view.outOfControl[index]) {
      svg.append(svgEl('rect', { x: x - 5, y: y - 5, width: 10, height: 10, class: 'spc-point spc-point-out' }));
    } else {
      svg.append(svgEl('circle', { cx: x, cy: y, r: 3.5, class: 'spc-point' }));
    }
  });
  return svg;
}

// The SPC panel for the room screen. `view` is spcView(), or null for a
// room without a monitored tool.
export function drawSpc(view) {
  const box = panel('Tool SPC', 'tool-panel spc-panel');
  if (view === null) {
    box.append(el('p', 'slot-empty', 'No SPC chart here: the metrology gauge is the reference.'));
    return box;
  }
  box.append(el('p', 'spc-title', `${view.parameter} (${view.unit})`));
  box.append(drawSpcPicture(view));
  box.append(el('p', 'spc-limits', view.limitsText));
  box.append(el('p', 'spc-limits', 'Key: solid red lines spec, dashed lines control limits, black line centre; a red square is beyond control; PM marks a PM or a service.'));
  if (view.latestText) box.append(el('p', 'spc-limits', view.latestText));
  box.append(el('p', view.inControl ? 'spc-verdict' : 'spc-verdict spc-verdict-out', view.verdictText));
  if (view.rules.length > 0) {
    const list = el('ul', 'spc-rules');
    for (const text of view.rules) list.append(el('li', 'spc-rule', text));
    box.append(list);
  }
  return box;
}
