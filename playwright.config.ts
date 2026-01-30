import { defineConfig } from '@playwright/test';
import { ENV } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
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

  projects: [
    {
      name: 'prepare-auth',
      testMatch: /tests\/setup\/auth\.setup\.ts/,
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        baseURL: ENV.BASE_URL,
      },
    },
    {
      name: 'post-login-core',
      dependencies: ['prepare-auth'],
      testMatch: [
        /dashboard-load\.spec\.ts/,
        /group-listing\.spec\.ts/,
        /group-search\.spec\.ts/,
      ],
      use: {
        baseURL: ENV.BASE_URL,
        storageState: 'storage/user.auth.json',
      },
    },
    {
      name: 'create-group',
      dependencies: ['post-login-core'],
      testMatch: /tests\/group\/create-group\.spec\.ts/,
      use: {
        baseURL: ENV.BASE_URL,
        storageState: 'storage/user.auth.json',
      },
    },
    {
      name: 'group-monetization',
      dependencies: ['create-group'],
      testMatch: /tests\/group\/group-activation-payment\.spec\.ts/,
      use: {
        baseURL: ENV.BASE_URL,
        storageState: 'storage/user.auth.json',
      },
    },
    {
      name: 'create-session',
      dependencies: ['group-monetization'],
      testMatch: /tests\/session\/create-session\.spec\.ts/,
      use: {
        baseURL: ENV.BASE_URL,
        storageState: 'storage/user.auth.json',
      },
    },
    // {
    //   name: 'before-login',
    //   testMatch: [
    //     /login.*\.spec\.ts/,
    //     /registration.*\.spec\.ts/,
    //     /tests\/chat\/.*\.spec\.ts/,
    //     /tests\/core\/app-load\.spec\.ts/,
    //     /tests\/profile\/.*\.spec\.ts/,
    //   ],
    //   use: {
    //     baseURL: ENV.BASE_URL,
    //     storageState: undefined,
    //   },
    // },
  ],
});
