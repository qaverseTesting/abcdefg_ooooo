import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { ENV } from '../../config/env';
import { MESSAGES } from '../../constants/messages';

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly logInButton: Locator;

  constructor(page: Page) {
    super(page);

    this.usernameInput = page.getByRole('textbox', { name: 'Username / Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.logInButton = page.getByRole('button', { name: 'Log in', exact: true });
  }

  async openLoginPage() {
    await this.goto(ENV.BASE_URL);
  }

  async login(username: string, password: string) {
    await this.stableFill(this.usernameInput, username);
    await this.stableFill(this.passwordInput, password);

    // Real user submit
    await this.click(this.logInButton);
  }

}
