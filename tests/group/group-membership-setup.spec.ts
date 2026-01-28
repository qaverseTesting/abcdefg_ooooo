// import { expect, test } from '@playwright/test';
// import { MyGroupsPage } from '../../src/pages/dashboard/MyGroupsPage';
// import { GroupActivationPaymentPage } from '../../src/pages/payment/GroupActivationPaymentPage';
// import { ProfilePaymentPage } from '../../src/pages/profile/ProfilePaymentPage';
// import { Logger } from '../../src/utils/Logger';
// import { RuntimeStore } from '@utils/RuntimeStore';


// test(
//     'Host configures group membership settings',
//     { tag: ['@regression', '@membership'] },
//     async ({ page }) => {
//         Logger.info('Starting Group Membership Setup test');

//         const myGroupsPage = new MyGroupsPage(page);
//         const profilePaymentPage = new ProfilePaymentPage(page);

//         await profilePaymentPage.openProfilePaymentPage();
//         const targetGroupName = RuntimeStore.getGroupName();
        
//         await profilePaymentPage.openGroupRef(targetGroupName);
//         // This step moved here
//         await profilePaymentPage.selectFreePaymentAndSave();

//         Logger.success('Group membership setup completed');
//     }
// );
