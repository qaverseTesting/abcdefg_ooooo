import { Page, Locator, expect, FrameLocator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Logger } from '../../utils/Logger';

export class GroupActivationPaymentPage extends BasePage {
  private readonly stripeFrame: FrameLocator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);

    // ONE Stripe iframe containing ENTIRE form
    this.stripeFrame = page.frameLocator(
      'iframe[title="Secure payment input frame"]'
    );

    this.submitButton = page.getByRole('button', {
      name: /pay and activate group/i,
    });
  }

  async waitForVisible(): Promise<void> {
    Logger.step('Waiting for Stripe full form');

    const cardNumber = this.stripeFrame.locator('#payment-numberInput');

    await cardNumber.waitFor({ state: 'visible', timeout: 30_000 });
    await expect(cardNumber).toBeEditable();

    Logger.success('Stripe form ready');
  }

  async fillPaymentDetails(): Promise<void> {
    Logger.step('Filling Stripe full payment form');

    const frame = this.stripeFrame;

    // All fields live INSIDE iframe
    const country = frame.locator('#payment-countryInput');
    const postal = frame.locator('#payment-postalCodeInput');
    const cardNumber = frame.locator('#payment-numberInput');
    const expiry = frame.locator('#payment-expiryInput');
    const cvc = frame.locator('#payment-cvcInput');

    // ---- COUNTRY ----
    Logger.step('Selecting country');
    await country.selectOption('US');

    // ---- POSTAL ----
    if (await postal.count()) {
      await postal.fill('560001');
    }

    // ---- CARD NUMBER ----
    await cardNumber.click();
    await cardNumber.type('4242424242424242', { delay: 40 });

    // ---- EXPIRY ----
    await expiry.click();
    await expiry.type('1234', { delay: 40 });

    // ---- CVC ----
    await cvc.click();
    await cvc.type('123', { delay: 40 });

    Logger.success('Stripe form filled');
  }

  async submitPayment(): Promise<void> {
    Logger.step('Submitting payment');

    await this.page.waitForLoadState('networkidle');

    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();

    await expect(
      this.page.getByText(/payment was successful!/i)
    ).toBeVisible({ timeout: 20_000 });

    Logger.success('Payment success confirmed');
  }
}
