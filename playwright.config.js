// playwright.config.js — settings for the screen tests (npm run screens).
//
// Playwright drives a real browser through the game page. It starts the
// same local web server you use to play (python3 -m http.server 8000),
// then runs every test in tests/screens/ twice: once at desktop size and
// once at phone size.
//
// The sizes are written out in full on purpose. A device preset name that
// doesn't exist silently falls back to desktop size (tasks/lessons.md).

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/screens',
  outputDir: 'test-results',
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8000',
    browserName: 'chromium',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'phone', use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: 'python3 -m http.server 8000',
    url: 'http://localhost:8000',
    reuseExistingServer: true,
  },
});
