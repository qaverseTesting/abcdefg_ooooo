import { defineConfig } from '@playwright/test';
import { ENV } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },

  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,

  globalSetup: './tests/setup/global-setup.ts',

  reporter: [
    ['list'],
    ['html', { open: !process.env.CI ? 'always' : 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results', detail: true, suiteTitle: true }],
    ['junit', { outputFile: 'results/junit.xml' }],
    ['json', { outputFile: 'results/results.json' }],
  ],

  use: {
    baseURL: ENV.BASE_URL,
    headless: process.env.CI === 'true',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  /* ================= ENTERPRISE PROJECT ARCHITECTURE ================= */

  projects: [
  {
    name: 'setup',
    testMatch: /tests\/setup\/.*\.ts/,
  },
  {
    name: 'e2e',
    dependencies: ['setup'],
    testMatch: /tests\/(core|group|session|profile)\/.*\.spec\.ts/,
    use: { storageState: 'storage/user.auth.json' },
  },
  {
    name: 'public',
    testMatch: /tests\/public\/.*\.spec\.ts/,
    use: { storageState: undefined },
  },
]

});
