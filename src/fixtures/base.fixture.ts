import { test as base, expect } from '@playwright/test';
import { allure } from 'allure-playwright';

export const test = base.extend({
  context: async ({ context }, use, testInfo) => {
    const allowChat =
      testInfo.tags.includes('@chat') ||
      process.env.ALLOW_CHAT === 'true';

    console.log(
      `[CHAT WIDGET] ${allowChat ? 'ALLOWED' : 'HIDDEN'} | Test: ${testInfo.title}`
    );

    if (!allowChat) {
      // BLOCK before any page is created
      await context.route(/gleap|chat|livechat/i, route => route.abort());

      // Inject hide script for all pages in this context
      await context.addInitScript(() => {
        const style = document.createElement('style');
        style.setAttribute('data-test', 'chat-hidden-style');
        style.innerHTML = `
          iframe,
          .bb-feedback-button,
          [class*="chat"],
          [id*="chat"] {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
        `;
        document.documentElement.appendChild(style);

        const kill = () => {
          document
            .querySelectorAll('.bb-feedback-button, iframe, [class*="chat"], [id*="chat"]')
            .forEach(el => (el as HTMLElement).remove());
        };

        new MutationObserver(kill).observe(document, {
          childList: true,
          subtree: true,
        });

        kill();
      });
    }

    await use(context);
  },

  page: async ({ page }, use, testInfo) => {
    // Allure metadata still here
    allure.parameter('Project', testInfo.project.name);
    allure.parameter('Browser', testInfo.project.use.browserName ?? 'unknown');
    allure.parameter('BaseURL', testInfo.project.use.baseURL ?? 'unknown');
    allure.parameter('Worker', String(testInfo.workerIndex));

    await use(page);
  },
});

export { expect };
