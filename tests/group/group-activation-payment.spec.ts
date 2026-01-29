import { test, expect, BrowserContext, Page } from '@playwright/test';
import { MyGroupsPage } from '../../src/pages/dashboard/MyGroupsPage';
import { GroupActivationPaymentPage } from '../../src/pages/payment/GroupActivationPaymentPage';
import { ProfilePaymentPage } from '../../src/pages/profile/ProfilePaymentPage';
import { Logger } from '../../src/utils/Logger';
import { RuntimeStore } from '@utils/RuntimeStore';

test.describe.serial('Host Group Monetization Setup Flow', () => {
  let context: BrowserContext;
  let page: Page;
  let activatedGroupName: string;

  // 🔹 Create ONE browser context + page for the full flow
  test.beforeAll(async ({ browser }) => {
    Logger.info('Launching shared browser session for Group Monetization Flow');
    context = await browser.newContext();
    page = await context.newPage();
  });

  // 🔹 Cleanup after flow completes
  test.afterAll(async () => {
    Logger.info('Closing shared browser session');
    await context.close();
  });

  // =========================================================

  test('Host activates group by completing platform payment', async () => {
    Logger.info('STEP 1: Host begins group activation via platform payment');

    const myGroupsPage = new MyGroupsPage(page);
    const paymentPage = new GroupActivationPaymentPage(page);

    const targetGroupName = RuntimeStore.getGroupName();
    Logger.step(`Navigating to inactive group for activation: ${targetGroupName}`);

    const result =
      await myGroupsPage.openPriorityInactiveGroupAndRedirectToPayment(targetGroupName);

    if (result.status === 'NOT_FOUND') {
      test.skip(true, 'No inactive group available for activation');
      return;
    }

    activatedGroupName = result.groupName;
    Logger.step(`Redirected to payment page for group: ${activatedGroupName}`);

    Logger.step('Filling payment details');
    await paymentPage.waitForVisible();
    await paymentPage.fillPaymentDetails();

    Logger.step('Submitting platform activation payment');
    await paymentPage.submitPayment();

    await expect(page.getByText('Payment was successful!')).toBeVisible({ timeout: 10_000 });

    Logger.success('STEP 1 COMPLETE: Group successfully activated via platform payment');
  });

  // =========================================================

  test('Host configures group payment type for member access', async () => {
    Logger.info('STEP 2: Host sets how members will pay to join the group');

    const profilePaymentPage = new ProfilePaymentPage(page);

    Logger.step('Waiting for profile payment configuration page');
    await profilePaymentPage.waitForProfilePaymentPage();

    Logger.step('Selecting group payment type (Free / Subscription / Lifetime)');
    await profilePaymentPage.selectFreePaymentAndSave();

    await expect(page.getByText('Payment type set successfully')).toBeVisible({ timeout: 10_000 });

    Logger.success('STEP 2 COMPLETE: Group membership payment type configured successfully');
  });
});
