import { test } from '../../src/fixtures/auth.fixture';
import { UserRole } from '../../src/constants/roles';
import { DashboardPage } from '../../src/pages/dashboard/DashboardPage';
import { LoginPage } from '../../src/pages/auth/LoginPage';
import { DataGenerator } from '../../src/utils/DataGenerator';
import { Logger } from '../../src/utils/Logger';

const TEST_ROLE = process.env.TEST_ROLE;

/* =========================================================
   Login – Single User (Smoke + Regression)
========================================================= */
test.describe('Login – Single User', () => {

  test(
    'Group Host user can login successfully',
    { tag: ['@auth', '@regression'] },
    async ({ loginAs, page }, testInfo) => {

      testInfo.annotations.push(
        { type: 'severity', description: 'critical' }
      );

      Logger.step('Logging in as Group Host');
      await loginAs(UserRole.GROUP_HOST);

      const dashboard = new DashboardPage(page);
      await dashboard.verifyDashboardLoaded();
    }
  );

  test.describe('Invalid Login - Verify error message appears with incorrect credentials', () => {
    test(
        'Invalid Login Error',
        { tag: ['@auth', '@security', '@negative'] },
        async ({ page }) => {
            const loginPage = new LoginPage(page);

            // 1. Open Login page
            Logger.step('Navigating to Login page');
            await loginPage.openLoginPage();

            // 2. Enter incorrect credentials
            const invalidUsername = DataGenerator.email();
            const invalidPassword = 'WrongPassword123!';

            Logger.step(`Attempting login with invalid credentials: ${invalidUsername}`);
            await loginPage.login(invalidUsername, invalidPassword);

            // 3. Verify error message appears
            Logger.step('Verifying error message visibility');
            await loginPage.verifyInvalidLoginError();

            Logger.success('Invalid Login test passed successfully');
        }
    );
});
});
