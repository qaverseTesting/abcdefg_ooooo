import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { users } from '../test-data/users';
import { UserRole } from '../constants/roles';

/**
 * Minimal confirmation that fixture is loaded
 */
console.log('[PW] auth.fixture loaded');

type Fixtures = {
  loginAs: (role: UserRole) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  /**
   * Block Gleap / feedback widget at network level
   */
  context: async ({ context }, use) => {
    await context.route(/gleap|feedback|bb-feedback|widget/i, route => {
      console.log('[PW] Chat widget request blocked');
      route.abort();
    });

    await use(context);
  },

  /**
   * Existing login fixture (unchanged)
   */
  loginAs: async ({ page }, use) => {
    await use(async (role: UserRole) => {
      const loginPage = new LoginPage(page);
      const user = users[role];

      await loginPage.openLoginPage();
      await loginPage.login(user.username, user.password);
    });
  },
});

export { expect };
