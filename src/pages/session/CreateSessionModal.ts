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

  // Timezone (React-Select)
  private readonly timezoneCombobox: Locator;
  private readonly selectedTimezoneLabel: Locator;

  constructor(page: Page) {
    super(page);

    this.modalRoot = page.locator('.chakra-modal__body');

    this.modalHeading = this.modalRoot.getByRole('heading', {
      name: /schedule a session/i,
    });

    this.dateInput = this.modalRoot.locator('input[name="date"]');
    this.titleInput = this.modalRoot.locator('input[name="title"]');

    this.descriptionEditor = this.modalRoot
      .locator('[data-lexical-editor="true"]')
      .first();

    this.submitButton = this.modalRoot.getByRole('button', {
      name: /^schedule a session$/i,
    });

    // React-Select timezone field
    this.timezoneCombobox = this.modalRoot.locator('input[role="combobox"]');
    this.selectedTimezoneLabel = this.modalRoot.locator(
      '.react-select__single-value'
    );
  }

  // --------------------------------------------------
  // PUBLIC API
  // --------------------------------------------------

  async waitForVisible(): Promise<void> {
    Logger.step('Waiting for Create Session modal');

    await this.modalHeading.waitFor({
      state: 'visible',
      timeout: 20_000,
    });

    Logger.success('Create Session modal visible');
  }

  async fillRequiredFields(data: {
    title: string;
    description: string;
  }): Promise<void> {
    Logger.step('Filling Create Session form');

    await this.setDateToNextDay();
    await this.selectDefaultTimezone();

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

    await expect(this.dateInput).toHaveValue(formatted);

    Logger.info(`Session date set to ${formatted}`);
  }

  /**
   * React-Select stable timezone selection
   */
  private async selectDefaultTimezone(): Promise<void> {
    Logger.step('Selecting default timezone');

    // Read currently displayed timezone (source of truth)
    const defaultTz = (await this.selectedTimezoneLabel.textContent())?.trim();

    if (!defaultTz) {
      throw new Error('No default timezone visible in UI');
    }

    Logger.info(`Default timezone detected: ${defaultTz}`);

    await this.timezoneCombobox.click();

    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Backspace');

    await this.page.keyboard.type(defaultTz, { delay: 40 });
    await this.page.keyboard.press('Enter');

    await expect(this.selectedTimezoneLabel).toHaveText(defaultTz);

    Logger.success(`Timezone confirmed: ${defaultTz}`);
  }
}
