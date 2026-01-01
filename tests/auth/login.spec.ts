import { test } from '../../src/fixtures/auth.fixture';
import { UserRole } from '../../src/constants/roles';
import { DashboardPage } from '../../src/pages/dashboard/DashboardPage';
import { LoginPage } from '../../src/pages/auth/LoginPage';

const TEST_ROLE = process.env.TEST_ROLE;


/* =========================================================
   Login – Single User (Smoke + Regression)
========================================================= */
test.describe('Login – Single User', () => {

  test(
    'Group Host user can login successfully',
    { tag: ['@smoke', '@regression'] },
    async ({ loginAs, page }, testInfo) => {

      testInfo.annotations.push(
        { type: 'severity', description: 'critical' }
      );

      await loginAs(UserRole.GROUP_HOST);

     const dashboard = new DashboardPage(page);
     await dashboard.verifyDashboardLoaded();
    }
  );
});
