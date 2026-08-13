import allure from '@wdio/allure-reporter';
import { Logger } from '@utils/logger';

// Page Objects
import LoginPage from '@pageobjects/LoginPage';
import DashboardPage from '@pageobjects/DashboardPage';
import TroopSearchPage from '@pageobjects/TroopSearchPage';
import RegistrationPage from '@pageobjects/RegistrationPage';
import MedicalInfoPage from '@pageobjects/MedicalInfoPage';
import AgreementsPage from '@pageobjects/AgreementsPage';
import PaymentPage from '@pageobjects/PaymentPage';
import ConfirmationPage from '@pageobjects/ConfirmationPage';

// Helpers
import { DataGenerator } from '@helpers/DataGenerator';
import { WaitHelper } from '@helpers/WaitHelper';

// Data
import loginData from '@data/login.json';
import registrationData from '@data/registration.json';

describe('Girl Registration and Payment Workflow', () => {

    let generatedFirstName: string;
    let generatedLastName: string;
    let generatedEmail: string;
    let generatedAddress: string;
    let generatedPhone: string;
    let generatedParentFirstName: string;
    let generatedParentLastName: string;

    beforeEach(async () => {
        await browser.url('/');
        await browser.deleteCookies();
        await browser.execute(() => {
            window.localStorage.clear();
            window.sessionStorage.clear();
        });
        await browser.refresh();
        
        allure.addFeature('Registration');
        allure.addSeverity('critical');
        allure.addEnvironment('BROWSER', browser.capabilities.browserName || 'unknown');

        // Generate dynamic data for each test run to avoid state conflicts
        generatedFirstName = DataGenerator.generateUniqueName('Emma');
        generatedLastName = DataGenerator.generateUniqueName('Johnson');
        generatedParentFirstName = DataGenerator.generateUniqueName('Sarah');
        generatedParentLastName = generatedLastName; // Usually same family name
        generatedEmail = DataGenerator.generateUniqueEmail('girl');
        generatedAddress = DataGenerator.generateUniqueAddress('4837 Maple Street');
        generatedPhone = DataGenerator.generateUniquePhone();

        // Log generated data as an attachment for auditability
        allure.addAttachment('Generated Test Data', JSON.stringify({
            girlName: `${generatedFirstName} ${generatedLastName}`,
            parentName: `${generatedParentFirstName} ${generatedParentLastName}`,
            email: generatedEmail,
            address: generatedAddress,
            phone: generatedPhone
        }, null, 2), 'application/json');
    });

    afterEach(async function () {
        if (this.currentTest?.state === 'failed') {
            Logger.error(`Test failed: ${this.currentTest.title}`);
            const screenshot = await browser.takeScreenshot();
            allure.addAttachment('Failure Screenshot', Buffer.from(screenshot, 'base64'), 'image/png');
        }
    });

    /**
     * Reusable flow to reach the payment step
     */
    async function executeFlowUpToPayment() {
        await allure.step('1. Login Process', async () => {
            Logger.info('Opening Application');
            await LoginPage.open();
            await LoginPage.clickHeaderLogin();
            
            Logger.info('Logging in with valid credentials');
            await LoginPage.login(loginData.validUser.username, loginData.validUser.password);
            
            await browser.waitUntil(
                async () => {
                    const url = await browser.getUrl();
                    return url.includes('household') || url.includes('dashboard') || url.includes('my-account');
                },
                { timeout: 30000, timeoutMsg: 'Dashboard did not load after login' }
            );
        });

        await allure.step('2. Navigate to Registration', async () => {
            Logger.info('Navigating to My Household');
            await DashboardPage.navigateToMyHousehold();
            await DashboardPage.clickRegisterNewMember();
        });

        await allure.step('3. Troop Search', async () => {
            Logger.info('Searching and Selecting Troop');
            await TroopSearchPage.searchAndSelectTroop('10001', 0);
        });

        await allure.step('4. Girl Information', async () => {
            Logger.info('Entering dynamically generated Girl Information');
            const dynamicGirlData = { ...registrationData.girlDetails, firstName: generatedFirstName, lastName: generatedLastName };
            const dynamicAddressData = { ...registrationData.address, addressLine1: generatedAddress };
            
            await RegistrationPage.fillAddress(dynamicAddressData);
            await RegistrationPage.fillGirlDetails(dynamicGirlData);
        });

        await allure.step('5. Parent / Caregiver Information', async () => {
            Logger.info('Entering dynamically generated Caregiver Information');
            const dynamicCaregiverData = { ...registrationData.caregiverDetails, firstName: generatedParentFirstName, lastName: generatedParentLastName, email: generatedEmail };
            const dynamicAddressData = { ...registrationData.address, addressLine1: generatedAddress };
            
            await RegistrationPage.fillCaregiverDetails(dynamicCaregiverData, dynamicAddressData, generatedPhone);
            await RegistrationPage.clickContinue();
        });

        const medicalElement = $('input[formcontrolname="noAllergies"], [aria-label*="No Allergies" i]');
        try {
            await medicalElement.waitForDisplayed({ timeout: 5000 });
            await allure.step('Step 7: Medical and Health Information', async () => {
                const medicalData = { hasAllergies: false, hasConditions: false, hasMedications: false };
                await MedicalInfoPage.fillMedicalInformation(medicalData);
                await MedicalInfoPage.clickContinue();
            });

            await allure.step('Step 8: Agreements and Policies', async () => {
                const signatureName = registrationData.caregiverInfo.firstName + ' ' + registrationData.caregiverInfo.lastName;
                await AgreementsPage.acceptAgreements(signatureName);
                await AgreementsPage.clickContinue();
            });
        } catch (e) {
            Logger.info('Medical and Agreements pages were skipped in this flow. Proceeding to Cart.');
        }

        await allure.step('9. Cart Review', async () => {
            Logger.info('Verifying Cart and Membership');
            await PaymentPage.reviewCartAndAcceptTerms('Membership');
        });
    }

    it('Enterprise Girl Registration Workflow with Payment Flow', async () => {
        const timestamp = Date.now();
        const videoPath = `enterprise-girl-registration-payment-${timestamp}.mp4`;
        let recorder;
        try {
            const puppeteer = await browser.getPuppeteer();
            const pages = await puppeteer.pages();
            const page = pages[0];
            const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
            recorder = new PuppeteerScreenRecorder(page);
            await recorder.start(videoPath);

            allure.addStory('Positive E2E Registration Flow');
            
            await executeFlowUpToPayment();

            await allure.step('10. Payment', async () => {
                Logger.info('Entering Payment Details within CardConnect IFrame');
                await PaymentPage.fillCardholderName({
                    firstName: generatedParentFirstName,
                    lastName: generatedParentLastName
                });
                await PaymentPage.fillCreditCardDetails(registrationData.payment);
                
                Logger.info('Submitting Payment');
                await PaymentPage.submitPayment();
            });

            await allure.step('11. Registration Confirmation', async () => {
                Logger.info('Verifying Registration Success and Extracting Data');
                const confirmationDetails = await ConfirmationPage.verifyAndCaptureConfirmation();
                
                expect(confirmationDetails.confirmationMessage.toLowerCase()).toMatch(/(thank you|success)/);
                Logger.info(`Registration successful! Order #: ${confirmationDetails.registrationNumber}`);
            });
        } finally {
            if (recorder) {
                await recorder.stop();
            }
            const fs = require('fs');
            if (fs.existsSync(videoPath)) {
                allure.addAttachment('Video Recording', fs.readFileSync(videoPath), 'video/mp4');
            }
        }
    });

    it('Enterprise Login Failed', async () => {
        const timestamp = Date.now();
        const videoPath = `enterprise-login-failed-${timestamp}.mp4`;
        let recorder;
        try {
            const puppeteer = await browser.getPuppeteer();
            const pages = await puppeteer.pages();
            const page = pages[0];
            const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
            recorder = new PuppeteerScreenRecorder(page);
            await recorder.start(videoPath);
            
            allure.addStory('Negative Login Flow');
            
            Logger.info('Opening Application');
            await LoginPage.open();
            await LoginPage.clickHeaderLogin();
            
            Logger.info('Logging in with invalid credentials');
            // This will intentionally fail since we use dummy credentials
            await LoginPage.login('invalidUser@yopmail.com', 'invalidPassword');
            
            // Intentionally fail the test
            const errorElement = await $('//*[contains(text(), "Invalid credentials") or contains(@class, "error")]');
            await errorElement.waitForDisplayed({ timeout: 5000 });
            
            // This expectation will fail intentionally to make the test RED
            expect(await errorElement.isDisplayed()).toBe(false);

        } finally {
            if (recorder) {
                await recorder.stop();
            }
            const fs = require('fs');
            if (fs.existsSync(videoPath)) {
                allure.addAttachment('Video Recording', fs.readFileSync(videoPath), 'video/mp4');
            }
        }
    });
});
