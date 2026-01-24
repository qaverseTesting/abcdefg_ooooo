import { defineConfig } from '@playwright/test';
import { ENV } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 0,

 reporter: [
    ['list'],

    // 🔹 HTML Report (unchanged behavior)
    [
      'html',
      {
        open: !process.env.CI ? 'always' : 'never',
      },
    ],

    // 🔹 Allure Report (UNCHANGED – already correct)
    [
      'allure-playwright',
      {
        outputFolder: 'allure-results',
        detail: true,
        suiteTitle: true,
      },
    ],

    // 🔹 ADD: JUnit (CI / GitHub Actions)
    [
      'junit',
      {
        outputFile: 'results/junit.xml',
      },
    ],

    // 🔹 ADD: JSON (Optional, future dashboards)
    [
      'json',
      {
        outputFile: 'results/results.json',
      },
    ],
  ],

  use: {
    headless: process.env.CI === 'true',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

projects: [
  // 1️⃣ LOGIN ONCE
  {
    name: 'prepare-auth',
    testMatch: /tests\/setup\/auth\.setup\.ts/,
    use: {
      browserName: 'chromium',
      channel: 'chrome',
      baseURL: ENV.BASE_URL,
    },
  },

  // 2️⃣ CREATE GROUP (existing file)
  {
    name: 'create-group',
    dependencies: ['prepare-auth'],
    testMatch: /tests\/group\/create-group\.spec\.ts/,
    use: {
      baseURL: ENV.BASE_URL,
      storageState: 'storage/user.auth.json',
    },
  },

  // 3️⃣ PAYMENT / ACTIVATION (existing file)
  // {
  //   name: 'group-payment',
  //   dependencies: ['create-group'],
  //   testMatch: /tests\/group\/group-activation-payment\.spec\.ts/,
  //   use: {
  //     baseURL: ENV.BASE_URL,
  //     storageState: 'storage/user.auth.json',
  //   },
  // },

  // 4️⃣ CREATE SESSION (existing file)
  // {
  //   name: 'create-session',
  //   dependencies: ['group-payment'],
  //   testMatch: /tests\/session\/create-session\.spec\.ts/,
  //   use: {
  //     baseURL: ENV.BASE_URL,
  //     storageState: 'storage/user.auth.json',
  //   },
  // },

  // 5️⃣ ALL OTHER AFTER-LOGIN TESTS
  {
    name: 'after-login',
   // dependencies: ['create-session'],
    testIgnore: [
      /tests\/setup\/.*\.ts/,
      /tests\/group\/create-group\.spec\.ts/,
      /tests\/group\/group-activation-payment\.spec\.ts/,
      /tests\/session\/create-session\.spec\.ts/,
      /.*login\.spec\.ts/,
    ],
    use: {
      baseURL: ENV.BASE_URL,
      storageState: 'storage/user.auth.json',
    },
  },

  // 6️⃣ BEFORE LOGIN TESTS
  {
    name: 'before-login',
    testMatch: /.*login\.spec\.ts/,
    use: {
      baseURL: ENV.BASE_URL,
      storageState: undefined,
    },
  },
]
});

