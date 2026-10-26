// notebook.spec.js — screen tests for the Notebook page (M4 item 3), in a
// real browser.
// Run with: npm run screens   (needs npm install once; see CLAUDE.md §11)
//
// Runs at desktop and phone size (playwright.config.js), seed 123456.
// Screenshots go to screenshots/desktop/ and screenshots/phone/.

import { test, expect } from '@playwright/test';
import { FAILURE_MODES } from '../../src/content/content.js';
import { createRun, enterStep, resolveStep, walkCorridor } from '../../src/engine/run.js';
import { emptyNotebook, diagnosisFor, findFailureMode } from '../../src/engine/notebook.js';

const SEED = 123456;
const PAGE = `/?seed=${SEED}`;
const STEP_COUNT = 9;
const DOUBLE_CLICK_WINDOW_MS = 600;   // a little more than Chrome's 500 ms
const TOUCH = 44;                     // smallest touch target, px (CLAUDE.md §10)

async function press(page, locator) {
  if (test.info().project.use.hasTouch) await locator.tap();
  else await locator.click();
}

// Waits out the double-click window, then presses (tasks/lessons.md: a
// phone tap at the same spot right after a screen change is ignored).
async function pressAfterChange(page, locator) {
  await page.waitForTimeout(DOUBLE_CLICK_WINDOW_MS);
  await press(page, locator);
}

async function screenshot(page, name) {
  const project = test.info().project.name;
  const buffer = await page.screenshot({ path: `screenshots/${project}/${name}.png`, fullPage: true });
  expect(buffer.readUInt32BE(16), `${name}.png width (seed ${SEED})`).toBe(page.viewportSize().width);
}

function watchForErrors(page) {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(String(error)));
  return errors;
}

async function expectNoSidewaysScroll(page) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth, `page width (seed ${SEED})`).toBe(page.viewportSize().width);
}

async function expectTouchSize(locator) {
  const box = await locator.boundingBox();
  expect(box.height, `touch target height (seed ${SEED})`).toBeGreaterThanOrEqual(TOUCH);
}

const title = page => page.locator('.room-name');
const goButton = page => page.locator('.go-button');
const runButton = page => page.locator('.run-button');
const notebookButton = page => page.locator('.notebook-button');
const backButton = page => page.locator('.back-button');
const button = (page, name) => page.getByRole('button', { name });

// The right diagnose choice for seed 123456 played straight through,
// worked out by the engine itself.
function idleRightName() {
  let state = createRun({ seed: SEED });
  while (state.status === 'running') {
    state = resolveStep(enterStep(state));
    if (state.status === 'running') state = walkCorridor(state, null);
  }
  const { rightIds, candidates } = diagnosisFor(state, emptyNotebook());
  return findFailureMode(candidates.find(id => rightIds.includes(id))).name;
}

async function walkToShipReport(page) {
  await page.goto(PAGE);
  await press(page, goButton(page));
  for (let step = 1; step < STEP_COUNT; step++) {
    await pressAfterChange(page, runButton(page));
    await pressAfterChange(page, button(page, 'Continue to the corridor'));
    await expect(title(page)).toHaveText('Floor plan');
    await pressAfterChange(page, goButton(page));
  }
  await pressAfterChange(page, runButton(page));
  await pressAfterChange(page, button(page, 'See the ship report'));
  await expect(title(page)).toHaveText('Ship report');
}

test('an empty notebook opens from the floor plan, and Back returns there', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto(PAGE);
  await expect(title(page)).toHaveText('Floor plan');
  await expect(notebookButton(page)).toHaveText('Notebook (0)');
  await expectTouchSize(notebookButton(page));
  await screenshot(page, '21-map-notebook-button');

  await pressAfterChange(page, notebookButton(page));
  await expect(title(page)).toHaveText('Notebook');
  await expect(page.locator('.notebook-empty')).toContainText('Nothing diagnosed yet.');
  await expect(page.locator('.notebook-still')).toHaveText(`${FAILURE_MODES.length} failure modes still to find.`);
  await expectTouchSize(backButton(page));
  await expectNoSidewaysScroll(page);
  await screenshot(page, '22-notebook-empty');

  await pressAfterChange(page, backButton(page));
  await expect(title(page)).toHaveText('Floor plan');
  await expect(goButton(page)).toBeVisible();   // the same corridor choice, nothing taken
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('after a right diagnosis the notebook lists it; Back returns to the ship report as it was', async ({ page }) => {
  test.slow();   // walks the whole route: triple the usual 30 s limit
  const errors = watchForErrors(page);
  const right = idleRightName();
  await walkToShipReport(page);
  await expect(notebookButton(page)).toHaveText('Notebook (0)');
  await pressAfterChange(page, page.locator('.diagnose-button', { hasText: right }));
  const diagnosed = `Diagnosed: ${right}. Written in your notebook.`;
  await expect(page.locator('.diagnose-text')).toHaveText(diagnosed);
  await expect(notebookButton(page)).toHaveText('Notebook (1)');

  await pressAfterChange(page, notebookButton(page));
  await expect(title(page)).toHaveText('Notebook');
  await expect(page.locator('.notebook-entry')).toHaveCount(1);
  await expect(page.locator('.notebook-entry .card-name')).toHaveText(right);
  await expect(page.locator('.notebook-seed')).toHaveText(`Found on seed ${SEED}`);
  await expect(page.locator('.notebook-still')).toHaveText(`${FAILURE_MODES.length - 1} failure modes still to find.`);
  await expectNoSidewaysScroll(page);
  await screenshot(page, '23-notebook-one-entry');

  await pressAfterChange(page, backButton(page));
  await expect(title(page)).toHaveText('Ship report');
  await expect(page.locator('.diagnose-text')).toHaveText(diagnosed);
  await expect(page.locator('.diagnose-button')).toHaveCount(0);   // still one guess per lot
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

// --- the unlocked pool (M4 item 4) -----------------------------------------

const PLATING_STEP = 7;
const KEYHOLE_NOTEBOOK = { version: 1, entries: [{ id: 'fm_keyhole', seed: 1 }] };

// Goes straight on, running every room idle, until the lot stands in the
// room of step `step`.
async function walkIntoStep(page, step) {
  await page.goto(PAGE);
  await press(page, goButton(page));
  for (let done = 1; done < step; done++) {
    await pressAfterChange(page, runButton(page));
    await pressAfterChange(page, button(page, 'Continue to the corridor'));
    await expect(title(page)).toHaveText('Floor plan');
    await pressAfterChange(page, goButton(page));
  }
  await expect(title(page)).toHaveText('Plating');
}

test('with keyhole void in the notebook, the plating room deals Low-current start', async ({ page }) => {
  test.slow();   // walks six rooms: triple the usual 30 s limit
  const errors = watchForErrors(page);
  await page.addInitScript(notebook => {
    localStorage.setItem('fabrun.notebook', JSON.stringify(notebook));
  }, KEYHOLE_NOTEBOOK);
  await page.goto(PAGE);
  await expect(notebookButton(page)).toHaveText('Notebook (1)');
  await pressAfterChange(page, notebookButton(page));
  await expect(page.locator('.notebook-unlocks')).toHaveText('Unlocks: Low-current start step, Three-additive copper bath');
  await screenshot(page, '24-notebook-unlocks');

  await walkIntoStep(page, PLATING_STEP);
  await expect(page.locator('.hand .card-name', { hasText: 'Low-current start step' })).toHaveCount(1);
  await expectNoSidewaysScroll(page);
  await screenshot(page, '25-plating-unlocked-card');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('with an empty notebook, the plating room deals nothing', async ({ page }) => {
  test.slow();
  const errors = watchForErrors(page);
  await walkIntoStep(page, PLATING_STEP);
  await expect(page.locator('.hand-empty')).toBeVisible();
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});
