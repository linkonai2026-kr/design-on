import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.mjs',
  globalSetup: './tests/global-setup.mjs',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  snapshotPathTemplate: '{testDir}/__snapshots__/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.12,
      threshold: 0.35
    }
  },
  use: {
    ...devices['Desktop Chrome'],
    colorScheme: 'light'
  }
});
