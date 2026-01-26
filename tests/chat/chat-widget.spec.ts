import { test, expect } from '../../src/fixtures/base.fixture';
import { ChatWidget } from '@pages/chat/ChatWidget';

test(
  '@chat Chat widget is accessible to user',
  { tag: ['@chat'] },
  async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const chat = new ChatWidget(page);

    // Deterministic wait for Gleap injection
    await expect.poll(() => chat.exists(), { timeout: 10_000 }).toBeTruthy();

    await expect(chat.launcher).toBeVisible();
  }
);
