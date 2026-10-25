// ship.spec.js — screen tests for the ship report and the player's scrap
// (M3 item 3), in a real browser.
// Run with: npm run screens   (needs npm install once; see CLAUDE.md §11)
//
// Runs at desktop and phone size (playwright.config.js), seed 123456.
// Screenshots go to screenshots/desktop/ and screenshots/phone/.

import { test, expect } from '@playwright/test';
import { createRun, enterStep, resolveStep, walkCorridor } from '../../src/engine/run.js';
import { emptyNotebook, diagnosisFor, findFailureMode } from '../../src/engine/notebook.js';

const SEED = 123456;
const PAGE = `/?seed=${SEED}`;
const STEP_COUNT = 9;
const DOUBLE_CLICK_WINDOW_MS = 600;   // a little more than Chrome's 500 ms

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

const title = page => page.locator('.room-name');
const goButton = page => page.locator('.go-button');
const runButton = page => page.locator('.run-button');
const button = (page, name) => page.getByRole('button', { name });

// Runs the room doing nothing and continues to the floor plan.
async function runRoomAndContinue(page) {
  await pressAfterChange(page, runButton(page));
  await pressAfterChange(page, button(page, 'Continue to the corridor'));
  await expect(title(page)).toHaveText('Floor plan');
}

test('going straight on to the end leads to the ship report', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto(PAGE);
  await press(page, goButton(page));
  for (let step = 1; step < STEP_COUNT; step++) {
    await runRoomAndContinue(page);
    await pressAfterChange(page, goButton(page));
  }
  await pressAfterChange(page, runButton(page));
  await pressAfterChange(page, button(page, 'See the ship report'));

  await expect(title(page)).toHaveText('Ship report');
  await expect(page.locator('.outcome-text')).toHaveText(/^(Shipped|Rejected): yield/);
  await expect(page.locator('.ship-tile')).toHaveCount(3);
  await expect(page.locator('.ship-tile-label')).toHaveText(['Shipped yield', 'Cost per good die', 'Cycle time']);
  await expect(page.locator('.ship-tile-value').nth(1)).toHaveText(/^\d+\.\d\d$/);
  await expect(page.locator('.step-table tr')).toHaveCount(STEP_COUNT + 1);   // a header row + one per room
  await expect(page.locator('.site')).toHaveCount(25);
  await expectNoSidewaysScroll(page);
  await screenshot(page, '16-ship-report');

  await pressAfterChange(page, button(page, 'Replay this seed'));
  await expect(title(page)).toHaveText('Floor plan');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('scrap the lot in a corridor: asks once, Keep goes back, Yes ends the run', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto(PAGE);
  await expect(button(page, 'Scrap the lot')).toHaveCount(0);   // not offered at the door
  await press(page, goButton(page));
  await runRoomAndContinue(page);   // step 1 run; the lot stands in corridor 1

  await pressAfterChange(page, button(page, 'Scrap the lot'));
  await expect(page.locator('.scrap-question')).toContainText('Scrap this lot?');
  await expect(button(page, 'Keep the lot')).toBeFocused();
  await expectNoSidewaysScroll(page);
  await screenshot(page, '17-scrap-question');
  await pressAfterChange(page, button(page, 'Keep the lot'));
  await expect(button(page, 'Scrap the lot')).toHaveCount(1);
  await expect(title(page)).toHaveText('Floor plan');

  await pressAfterChange(page, button(page, 'Scrap the lot'));
  await pressAfterChange(page, button(page, 'Yes, scrap it'));
  await expect(title(page)).toHaveText('Ship report');
  await expect(page.locator('.outcome-text')).toHaveText(/^Scrapped by you before step 2/);
  await expect(page.locator('.ship-tile-label').first()).toHaveText('Yield at scrap');
  await expect(page.locator('.ship-tile-value').nth(1)).toHaveText('none');
  await expect(page.locator('.step-table tr')).toHaveCount(2);   // a header row + step 1
  await expect(page.locator('.steps-panel')).toContainText(`${STEP_COUNT - 1} later steps were not run`);
  await expectNoSidewaysScroll(page);
  await screenshot(page, '18-ship-scrapped');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

// The diagnose choices for seed 123456 played straight through, worked out
// by the engine itself, so the test knows which button is right.
function idleDiagnosis() {
  let state = createRun({ seed: SEED });
  while (state.status === 'running') {
    state = resolveStep(enterStep(state));
    if (state.status === 'running') state = walkCorridor(state, null);
  }
  const { rightIds, candidates } = diagnosisFor(state, emptyNotebook());
  const nameOf = id => findFailureMode(id).name;
  return {
    right: nameOf(candidates.find(id => rightIds.includes(id))),
    wrong: nameOf(candidates.find(id => !rightIds.includes(id))),
  };
}

async function walkToShipReport(page) {
  await page.goto(PAGE);
  await press(page, goButton(page));
  for (let step = 1; step < STEP_COUNT; step++) {
    await runRoomAndContinue(page);
    await pressAfterChange(page, goButton(page));
  }
  await pressAfterChange(page, runButton(page));
  await pressAfterChange(page, button(page, 'See the ship report'));
  await expect(title(page)).toHaveText('Ship report');
}

test('diagnose: four choices; the right one is written in the notebook', async ({ page }) => {
  const errors = watchForErrors(page);
  const { right } = idleDiagnosis();
  await walkToShipReport(page);
  await expect(page.locator('.diagnose-button')).toHaveCount(4);
  await expect(page.locator('.route-spc-item')).toHaveCount(6);   // the six monitored tools
  await expectNoSidewaysScroll(page);
  await screenshot(page, '19-diagnose-choices');
  await pressAfterChange(page, page.locator('.diagnose-button', { hasText: right }));
  await expect(page.locator('.diagnose-text')).toHaveText(`Diagnosed: ${right}. Written in your notebook.`);
  await expect(page.locator('.diagnose-button')).toHaveCount(0);   // one guess per lot
  await screenshot(page, '20-diagnose-right');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('diagnose: a wrong guess writes nothing and names what did hurt the lot', async ({ page }) => {
  const errors = watchForErrors(page);
  const { wrong } = idleDiagnosis();
  await walkToShipReport(page);
  await pressAfterChange(page, page.locator('.diagnose-button', { hasText: wrong }));
  await expect(page.locator('.diagnose-text')).toHaveText(/^Not this one\. What did hurt this lot: .+ It is not written in your notebook/);
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});
