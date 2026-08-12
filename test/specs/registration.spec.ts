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

    it('should successfully register a new girl and complete payment', async () => {
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
    });

    it('should fail when invalid payment information is submitted', async () => {
        allure.addStory('Negative E2E Registration Flow - Invalid Payment');
        
        await executeFlowUpToPayment();

        await allure.step('10. Enter intentionally invalid payment information', async () => {
            Logger.info('Entering Invalid Payment Details');
            await PaymentPage.fillCardholderName({
                firstName: generatedParentFirstName,
                lastName: generatedParentLastName
            });
            
            // Intentionally invalid card number for negative testing
            const invalidPaymentData = {
                ...registrationData.payment,
                cardNumber: '4000000000000012' // typical declined/invalid card
            };
            await PaymentPage.fillCreditCardDetails(invalidPaymentData);
            
            Logger.info('Submitting Invalid Payment');
            await PaymentPage.submitPayment();
        });

        await allure.step('11. Verify that payment is NOT successful', async () => {
            Logger.info('Checking for expected payment failure message');
            
            // We expect an error message to be displayed on the page instead of redirecting to confirmation
            const errorLocator = $('//*[contains(@class, "error") or contains(@class, "alert") or contains(translate(text(), "DECLININVALIDFAIL", "declininvalidfail"), "declin") or contains(translate(text(), "DECLININVALIDFAIL", "declininvalidfail"), "invalid") or contains(translate(text(), "DECLININVALIDFAIL", "declininvalidfail"), "fail")]');
            
            try {
                await errorLocator.waitForDisplayed({ timeout: 15000 });
                const errorText = await errorLocator.getText();
                Logger.info(`Successfully intercepted expected payment rejection: ${errorText}`);
                expect(errorText.length).toBeGreaterThan(0);
            } catch (err) {
                // If specific error message is not found, verify we at least didn't reach the confirmation page
                Logger.warn('Specific error element not found. Verifying we did not reach Confirmation page.');
                const isConfirmationDisplayed = await ConfirmationPage.lblConfirmationMessage.isDisplayed();
                expect(isConfirmationDisplayed).toBe(false);
            }
        });
    });
});
