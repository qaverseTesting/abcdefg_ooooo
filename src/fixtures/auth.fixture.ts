import { test as base, expect } from './base.fixture';
import { LoginPage } from '../pages/auth/LoginPage';
import { users } from '../test-data/users';
import { UserRole } from '../constants/roles';

type Fixtures = {
  loginAs: (role: UserRole) => Promise<void>;
};

export const test = base.extend<Fixtures>({
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
