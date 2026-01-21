import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';

export class CreateSessionModal extends BasePage {
  private readonly modalRoot: Locator;
  private readonly modalHeading: Locator;

  private readonly dateInput: Locator;
  private readonly titleInput: Locator;
  private readonly descriptionEditor: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);

    this.modalRoot = page.locator('.chakra-modal__body');

    this.modalHeading = this.modalRoot.getByRole('heading', {
      name: /schedule a session/i,
    });

    this.dateInput = this.modalRoot.locator('input[name="date"]');
    this.titleInput = this.modalRoot.locator('input[name="title"]');

    // STRICT-MODE SAFE (scoped to modal)
    this.descriptionEditor = this.modalRoot
      .locator('[data-lexical-editor="true"]')
      .first();

    this.submitButton = this.modalRoot.getByRole('button', {
      name: /^schedule a session$/i,
    });
  }

  // --------------------------------------------------
  // PUBLIC API (USED BY TESTS)
  // --------------------------------------------------

  async waitForVisible(): Promise<void> {
    Logger.step('Waiting for Create Session modal');

    await this.modalHeading.waitFor({
      state: 'visible',
      timeout: 10_000,
    });

    Logger.success('Create Session modal visible');
  }

  async fillRequiredFields(data: {
    title: string;
    description: string;
  }): Promise<void> {
    Logger.step('Filling Create Session form');

    await this.setDateToNextDay();

    await this.titleInput.fill(data.title);

    await this.descriptionEditor.click();
    await this.page.keyboard.type(data.description);

    await expect(this.submitButton).toBeEnabled();

    Logger.success('Required fields filled');
  }

  async submit(): Promise<void> {
    Logger.step('Submitting session');
    await this.submitButton.click();
  }

  async expectSessionCreated(): Promise<void> {
    Logger.step('Verifying session creation (modal closed)');

    await expect(this.modalHeading).toBeHidden({
      timeout: 10_000,
    });

    Logger.success('Create Session modal closed');
  }


  // --------------------------------------------------
  // INTERNAL HELPERS
  // --------------------------------------------------

  /**
   * CRITICAL FIX
   * Ensures date is always at least +1 day
   */
  private async setDateToNextDay(): Promise<void> {
    Logger.step('Setting session date to next day');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const day = String(tomorrow.getDate()).padStart(2, '0');
    const month = tomorrow.toLocaleString('en-US', { month: 'long' });
    const year = tomorrow.getFullYear();

    const formatted = `${day} ${month}, ${year}`;

    await this.dateInput.click();
    await this.dateInput.press('Control+A');
    await this.dateInput.press('Backspace');

    await this.dateInput.type(formatted, { delay: 50 });
    await this.dateInput.press('Enter');

    // HARD ASSERT — ensures UI actually updated
    await expect(this.dateInput).toHaveValue(formatted);

    Logger.info(`Session date set to ${formatted}`);
  }

}
