import { Page, Locator, expect, FrameLocator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';

export class GroupActivationPaymentPage extends BasePage {
  private readonly stripeFrame: FrameLocator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);

    // Stripe-hosted iframe containing secure payment inputs
    this.stripeFrame = page.frameLocator(
      'iframe[title="Secure payment input frame"]'
    );

    // Primary CTA to submit payment and activate the group
    this.submitButton = page.getByRole('button', {
      name: /pay and activate group/i,
    });
  }

  /**
   * Waits until Stripe Elements are fully mounted and ready for interaction.
   * This ensures card inputs are visible and editable before filling data.
   */
  async waitForVisible(): Promise<void> {
    Logger.step('Waiting for Stripe payment iframe to become interactive');

    const cardNumber = this.stripeFrame.locator(
      'input[autocomplete="cc-number"]'
    );

    await cardNumber.waitFor({ state: 'visible', timeout: 30_000 });
    await expect(cardNumber).toBeEditable({ timeout: 10_000 });

    Logger.success('Stripe payment iframe and card inputs are ready');
  }

  /**
   * Fills Stripe test card details in a stable and repeatable way.
   * Uses typing with delay to mimic real user input and avoid Stripe flakiness.
   */
  async fillPaymentDetails(): Promise<void> {
    Logger.step('Entering Stripe test card details');

    const frame = this.stripeFrame;

    const cardNumber = frame.locator('input[autocomplete="cc-number"]');
    const expiry = frame.locator('input[autocomplete="cc-exp"]');
    const cvc = frame.locator('input[autocomplete="cc-csc"]');
    const zip = frame.locator('input[autocomplete="postal-code"]');

    // Card number
    Logger.step('Entering card number');
    await cardNumber.click({ force: true });
    await cardNumber.type('4242424242424242', { delay: 50 });

    // Expiry date
    Logger.step('Entering expiry date');
    await expiry.click({ force: true });
    await expiry.type('1234', { delay: 50 }); // Stripe auto-formats

    // CVC
    Logger.step('Entering CVC');
    await cvc.click({ force: true });
    await cvc.type('123', { delay: 50 });

    // ZIP / Postal code (optional field)
    if (await zip.isVisible().catch(() => false)) {
      Logger.step('Entering ZIP / postal code');
      await zip.click({ force: true });
      await zip.type('12345', { delay: 50 });
    }

    // Final sanity checks to avoid silent Stripe failures
    await expect(cardNumber).not.toBeEmpty();
    await expect(expiry).not.toBeEmpty();
    await expect(cvc).not.toBeEmpty();

    Logger.success('Stripe payment details entered successfully');
  }

  /**
   * Submits the payment and validates that the success toast appears.
   * This method asserts that the payment submission completed successfully.
   */
  async submitPayment(): Promise<void> {
    Logger.step('Submitting group activation payment');

    await expect(this.submitButton).toBeEnabled({ timeout: 15_000 });

    const successToast = this.page.getByText('Payment was successful!');

    // Start waiting for success toast before clicking submit
    const toastAppeared = successToast
      .waitFor({ state: 'visible', timeout: 20_000 })
      .then(() => true)
      .catch(() => false);

    Logger.step('Clicking Pay and Activate Group button');
    await this.submitButton.click();

    const appeared = await toastAppeared;

    // Assertion ensures payment confirmation was shown
    expect(appeared).toBe(true);

    Logger.success('Payment submitted and confirmed successfully');
  }
}
