import { RuntimeStore } from '@utils/RuntimeStore';
import { test } from '../../src/fixtures/auth.fixture';
import { ProfilePaymentPage } from '../../src/pages/profile/ProfilePaymentPage';
import { Logger } from '../../src/utils/Logger';

test(
    'Host configures group payment type for member access',
    async ({ page }) => {
        Logger.info('Starting Group Membership Setup test');

        const profilePaymentPage = new ProfilePaymentPage(page);

        await profilePaymentPage.openProfilePaymentPage();

        const targetGroupName = RuntimeStore.getGroupName();
        Logger.step(`Target group for configures member access: ${targetGroupName}`);
        await profilePaymentPage.selectGroup(targetGroupName);

        await profilePaymentPage.selectFreePaymentAndSave();

        Logger.success('Group membership selection completed');
    }
);
