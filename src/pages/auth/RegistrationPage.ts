import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { Wait } from '../../utils/Wait';

export class RegistrationPage extends BasePage {
  // --------- Input Fields ----------
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;

  // --------- Buttons ----------
  readonly createAccountButton: Locator;

  // --------- Validation Messages ----------
  readonly firstNameError: Locator;
  readonly lastNameError: Locator;
  readonly emailError: Locator;
  readonly usernameError: Locator;
  readonly passwordError: Locator;
  readonly confirmPasswordError: Locator;

  constructor(page: Page) {
    super(page);

    // Inputs (stable by name attribute)
    this.firstNameInput = page.locator('input[name="firstname"]');
    this.lastNameInput = page.locator('input[name="lastname"]');
    this.emailInput = page.locator('input[name="email"]');
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');

    // Button
    this.createAccountButton = page.locator('button[type="submit"]', {
      hasText: 'Create Account',
    });

    // Error messages - using more stable selectors if possible, but keeping originals for now
    this.firstNameError = page.locator('#field-\\:r2\\:-feedback');
    this.lastNameError = page.locator('#field-\\:r3\\:-feedback');
    this.emailError = page.locator('#field-\\:r4\\:-feedback');
    this.usernameError = page.locator('#field-\\:r5\\:-feedback');
    this.passwordError = page.locator('#field-\\:r6\\:-feedback');
    this.confirmPasswordError = page.locator('#field-\\:r7\\:-feedback');
  }

  // ---------- Actions ----------

  async goto() {
    await super.goto('/register');
  }

  async fillFirstName(firstName: string) {
    await this.stableFill(this.firstNameInput, firstName);
    await Wait.pause(this.page, 1000);
  }

  async fillLastName(lastName: string) {
    await this.stableFill(this.lastNameInput, lastName);
    await Wait.pause(this.page, 1000);
  }

  async fillEmail(email: string) {
    await this.stableFill(this.emailInput, email);
    await Wait.pause(this.page, 1000);
  }

  async fillUsername(username: string) {
    await this.stableFill(this.usernameInput, username);
    await Wait.pause(this.page, 1000);
  }

  async fillPassword(password: string) {
    await this.stableFill(this.passwordInput, password);
    await Wait.pause(this.page, 1000);
  }

  async fillConfirmPassword(password: string) {
    await this.stableFill(this.confirmPasswordInput, password);
    await Wait.pause(this.page, 1000);
  }

  async clickCreateAccount() {
    await this.click(this.createAccountButton);
    await Wait.pause(this.page, 20000);
  }

  // ---------- Composite Actions ----------

  async fillRegistrationForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
  }) {
    await this.fillFirstName(data.firstName);
    await this.fillLastName(data.lastName);
    await this.fillEmail(data.email);
    await this.fillUsername(data.username);
    await this.fillPassword(data.password);
    await this.fillConfirmPassword(data.password);
  }

  // ---------- Assertions ----------

  async expectCreateButtonEnabled() {
    await expect(this.createAccountButton).toBeEnabled();
  }

  async expectRequiredFieldErrors() {
    await this.expectVisible(this.firstNameError);
    await this.expectVisible(this.lastNameError);
    await this.expectVisible(this.emailError);
    await this.expectVisible(this.usernameError);
    await this.expectVisible(this.passwordError);
    await this.expectVisible(this.confirmPasswordError);
  }
}
