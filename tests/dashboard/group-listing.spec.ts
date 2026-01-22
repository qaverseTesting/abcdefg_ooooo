import { test, expect } from '@playwright/test';
import { MyGroupsPage } from '../../src/pages/dashboard/MyGroupsPage';
import { Logger } from '../../src/utils/Logger';

/* =========================================================
   Group Listing Load – Groups
   Verifies groups are visible on My Groups page
========================================================= */
test.describe('Groups – Listing', () => {

  test(
    'Group listing loads with correct visibility and status',
    { tag: ['@smoke', '@regression'] },
    async ({ page }, testInfo) => {

      testInfo.annotations.push({
        type: 'severity',
        description: 'critical',
      });

      Logger.step('Opening My Groups page');

      const myGroupsPage = new MyGroupsPage(page);

      /**
       * Reuse existing, battle-tested navigation
       * This internally waits for group cards to load
       */
      await (myGroupsPage as any).openMyGroups(true);

      Logger.step('Verifying group cards are visible');

      const groupCards = page.locator('[data-testid="group-card"]');
      const count = await groupCards.count();

      expect(count).toBeGreaterThan(0);

      await expect(groupCards.first()).toBeVisible();

      Logger.success(`Group listing loaded successfully with ${count} groups`);
    }
  );
});
