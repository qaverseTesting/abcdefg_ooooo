import { test } from '../../src/fixtures/auth.fixture';
import { UserRole } from '../../src/constants/roles';
import { DashboardPage } from '../../src/pages/dashboard/DashboardPage';
import { LoginPage } from '../../src/pages/auth/LoginPage';
import { Logger } from '../../src/utils/Logger';

const TEST_ROLE = process.env.TEST_ROLE;

/* =========================================================
   Dashboard loads after fresh login (Smoke + Regression)
========================================================= */

  test(
    'Dashboard loads after fresh login',
    { tag: ['@auth', '@regression'] },
    async ({ loginAs, page }, testInfo) => {

      testInfo.annotations.push(
        { type: 'severity', description: 'critical' }
      );

      Logger.step('Logging in as Group Host');
      await loginAs(UserRole.GROUP_HOST);

      const dashboard = new DashboardPage(page);
      await dashboard.verifyDashboardLoaded();

      Logger.success('Login › Dashboard loads after fresh login');
    }
  );
