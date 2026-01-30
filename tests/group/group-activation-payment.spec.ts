import type { BrowserContext, Page } from '@playwright/test';
import { test as test, expect } from '../../src/fixtures/auth.fixture';
import { MyGroupsPage } from '../../src/pages/dashboard/MyGroupsPage';
import { GroupActivationPaymentPage } from '../../src/pages/payment/GroupActivationPaymentPage';
import { ProfilePaymentPage } from '../../src/pages/profile/ProfilePaymentPage';
import { Logger } from '../../src/utils/Logger';
import { RuntimeStore } from '@utils/RuntimeStore';

test.describe.serial('Host Group Monetization Setup Flow', () => {
  let context: BrowserContext;
  let page: Page;
  let activatedGroupName: string;

  // ---------------------------------------------------------
  // Global setup: single browser context and page
  // Used across all tests in this serial flow
  // ---------------------------------------------------------
  test.beforeAll(async ({ browser }) => {
    Logger.info('Initializing shared browser session for Host Group Monetization flow');

    context = await browser.newContext();
    page = await context.newPage();

    Logger.success('Shared browser context and page created');
  });

  // ---------------------------------------------------------
  // Global cleanup: close context after all steps complete
  // ---------------------------------------------------------
  test.afterAll(async () => {
    Logger.info('Tearing down shared browser session for Host Group Monetization flow');

    await context.close();

    Logger.success('Browser context closed successfully');
  });

  // =========================================================
  // STEP 1: Activate group by completing platform payment
  // =========================================================
  test('Host activates group by completing platform payment', async () => {
    Logger.info('STEP 1 STARTED: Group activation via platform payment');

    const myGroupsPage = new MyGroupsPage(page);
    const paymentPage = new GroupActivationPaymentPage(page);

    const targetGroupName = RuntimeStore.getGroupName();
    Logger.step(`Target group for activation: ${targetGroupName}`);

    Logger.step('Navigating to inactive group and initiating activation flow');
    const result =
      await myGroupsPage.openPriorityInactiveGroupAndRedirectToPayment(
        targetGroupName
      );

    if (result.status === 'NOT_FOUND') {
      Logger.warn('No inactive group found that supports activation');
      test.skip(true, 'No inactive group available for activation');
      return;
    }

    activatedGroupName = result.groupName;
    Logger.success(`Redirected to payment page for group: ${activatedGroupName}`);

    Logger.step('Waiting for group activation payment page to load');
    await paymentPage.waitForVisible();

    Logger.step('Entering platform payment details');
    await paymentPage.fillPaymentDetails();

    Logger.step('Submitting platform activation payment');
    await paymentPage.submitPayment();

    Logger.success(
      'STEP 1 COMPLETED: Group successfully activated via platform payment'
    );
  });

  // =========================================================
  // STEP 2: Configure how members pay to join the group
  // =========================================================
  test('Host configures group payment type for member access', async () => {
    Logger.info('STEP 2 STARTED: Configuring group membership payment type');

    const profilePaymentPage = new ProfilePaymentPage(page);

    Logger.step('Waiting for profile payment configuration page to be visible');
    await profilePaymentPage.waitForProfilePaymentPage();

    Logger.step('Selecting Free payment type and saving configuration');
    await profilePaymentPage.selectFreePaymentAndSave();

    Logger.step('Verifying payment type configuration success message');
    await expect(
      page.getByText('Payment type set successfully')
    ).toBeVisible({ timeout: 10_000 });

    Logger.success(
      'STEP 2 COMPLETED: Group membership payment type configured successfully'
    );
  });
});
