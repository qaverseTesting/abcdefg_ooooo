import { defineConfig } from '@playwright/test';
import { ENV } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },

  retries: process.env.CI ? 0 : 0,
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
    name: '01-create-group',
    dependencies: ['setup'],
    testMatch: /tests\/group\/create-group\.spec\.ts/,
    use: { storageState: 'storage/user.auth.json' },
  },
  {
    name: '02-group-activation',
    dependencies: ['01-create-group'],
    testMatch: /tests\/group\/group-activation-payment\.spec\.ts/,
    use: { storageState: 'storage/user.auth.json' },
  },
  {
    name: '03-group-membership',
    dependencies: ['02-group-activation'],
    testMatch: /tests\/group\/group-membership-setup\.spec\.ts/,
    use: { storageState: 'storage/user.auth.json' },
  },
  {
    name: '04-create-session',
    dependencies: ['03-group-membership'],
    testMatch: /tests\/session\/create-session\.spec\.ts/,
    use: { storageState: 'storage/user.auth.json' },
  },
]


});
