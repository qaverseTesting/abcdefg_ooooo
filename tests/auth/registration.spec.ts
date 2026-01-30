import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/auth/LoginPage';
import { RegistrationPage } from '../../src/pages/auth/RegistrationPage';
import { DataGenerator } from '../../src/utils/DataGenerator';

test.describe('Registration Process', () => {
    test('Group Host user can Registration successfully', { tag: ['@auth', '@registration'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        const registrationPage = new RegistrationPage(page);

        // 1. Open Login page load
        await loginPage.openLoginPage();

        // 2. Click on Create an account
        await loginPage.clickCreateAccount();

        // 3. Open registration page and verify URL
        await expect(page).toHaveURL(/.*register/);

        // 4. Fill up all fields with generated data (Names: Letters Only)
        const password = 'Password123!';
        const userData = {
            firstName: DataGenerator.firstName(),
            lastName: DataGenerator.lastName(),
            email: DataGenerator.email(),
            username: DataGenerator.userName('User'),
            password: password,
        };

        await registrationPage.fillRegistrationForm(userData);

        // 5. Click Create Account
        await registrationPage.clickCreateAccount();

        // 6. Verify successful registration
        await expect(page).toHaveURL(/\/user\/email\/verify$/, { timeout: 20000 });
    });
});
