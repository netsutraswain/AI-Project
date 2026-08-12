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

describe('Enterprise Girl Registration Workflow', () => {

    let generatedFirstName: string;
    let generatedLastName: string;
    let generatedEmail: string;
    let generatedAddress: string;
    let generatedPhone: string;
    let generatedParentFirstName: string;
    let generatedParentLastName: string;

    before(async () => {
        allure.addFeature('Registration');
        allure.addSeverity('critical');
        allure.addStory('E2E Dynamic Girl Registration and Payment');
        allure.addEnvironment('BROWSER', browser.capabilities.browserName || 'unknown');

        // Generate dynamic data at the start of the test
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

    it('should successfully complete the end-to-end registration flow', async () => {
        
        await allure.step('1. Login Process', async () => {
            Logger.info('Opening Application');
            await LoginPage.open();
            await LoginPage.clickHeaderLogin();
            
            Logger.info('Logging in with valid credentials');
            await LoginPage.login(loginData.validUser.username, loginData.validUser.password);
            
            // Verify successful login
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
            
            Logger.info('Clicking Register New Member');
            await DashboardPage.clickRegisterNewMember();
        });

        await allure.step('3. Troop Search', async () => {
            Logger.info('Searching and Selecting Troop');
            await TroopSearchPage.searchAndSelectTroop('10001', 0);
        });

        await allure.step('4. Girl Information', async () => {
            Logger.info('Entering dynamically generated Girl Information');
            
            // Override static JSON data with generated dynamic data
            const dynamicGirlData = {
                ...registrationData.girlDetails,
                firstName: generatedFirstName,
                lastName: generatedLastName
            };
            
            // Address must be filled BEFORE Girl Details because School Attending is disabled until State is selected
            const dynamicAddressData = {
                ...registrationData.address,
                addressLine1: generatedAddress
            };
            await RegistrationPage.fillAddress(dynamicAddressData);
            
            await RegistrationPage.fillGirlDetails(dynamicGirlData);
        });

        await allure.step('5. Parent / Caregiver Information', async () => {
            Logger.info('Entering dynamically generated Caregiver Information');
            
            const dynamicCaregiverData = {
                ...registrationData.caregiverDetails,
                firstName: generatedParentFirstName,
                lastName: generatedParentLastName,
                email: generatedEmail
            };

            const dynamicAddressData = {
                ...registrationData.address,
                addressLine1: generatedAddress
            };
            
            await RegistrationPage.fillCaregiverDetails(dynamicCaregiverData, dynamicAddressData, generatedPhone);
            
            // Address has already been filled during Girl Information step, so we can just continue
            await RegistrationPage.clickContinue();
        });
            // Depending on the UAT flow, Medical and Agreements may be skipped entirely.
            // We will wait briefly and check if the Medical Info page appears.
            const medicalElement = $('input[formcontrolname="noAllergies"], [aria-label*="No Allergies" i]');
            try {
                await medicalElement.waitForDisplayed({ timeout: 5000 });
                // Step 7: Medical/Health Info
                await allure.step('Step 7: Medical and Health Information', async () => {
                    const medicalData = { hasAllergies: false, hasConditions: false, hasMedications: false };
                    await MedicalInfoPage.fillMedicalInformation(medicalData);
                    await MedicalInfoPage.clickContinue();
                });

                // Step 8: Agreements
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
            // Hardcoded "Membership" verification based on typical UAT response. 
            await PaymentPage.reviewCartAndAcceptTerms('Membership');
        });

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
            
            // Final Enterprise assertion
            expect(confirmationDetails.confirmationMessage.toLowerCase()).toMatch(/(thank you|success)/);
            Logger.info(`Registration successful! Order #: ${confirmationDetails.registrationNumber}`);
        });
    });
});
