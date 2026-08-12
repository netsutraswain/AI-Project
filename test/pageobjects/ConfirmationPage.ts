import BasePage from './BasePage';
import { WaitHelper } from '@helpers/WaitHelper';
import allure from '@wdio/allure-reporter';
import { Logger } from '@utils/logger';

export interface ConfirmationDetails {
    registrationNumber: string;
    girlName: string;
    parentName: string;
    email: string;
    troop: string;
    membership: string;
    confirmationMessage: string;
}

class ConfirmationPage extends BasePage {
    /**
     * Define Locators
     */
    public get lblConfirmationMessage() { return $('//h1[contains(text(), "Thank You") or contains(text(), "Confirmation") or contains(text(), "Success")]'); }
    public get lblRegistrationNumber() { return $('//div[contains(@class, "order-number") or contains(text(), "Order #")]/span'); }
    
    // Abstract locators for summary data on the confirmation page
    public get lblGirlName() { return $('//div[contains(@class, "member-name")]'); }
    public get lblParentName() { return $('//div[contains(@class, "caregiver-name")]'); }
    public get lblEmail() { return $('//div[contains(@class, "email")]'); }
    public get lblTroop() { return $('//div[contains(@class, "troop-info")]'); }
    public get lblMembership() { return $('//div[contains(@class, "membership-type")]'); }

    /**
     * Verifies successful registration and captures all relevant details.
     * @returns ConfirmationDetails object containing captured text
     */
    public async verifyAndCaptureConfirmation(): Promise<ConfirmationDetails> {
        Logger.info('Waiting for Registration Confirmation Page to load');
        await WaitHelper.waitForDisplayed(this.lblConfirmationMessage, 60000); // Payment processing can take time

        const confirmationMsg = await this.lblConfirmationMessage.getText();
        expect(confirmationMsg.toLowerCase()).toMatch(/(thank you|confirmation|success)/);

        // Capture details safely (some might not exist depending on the UI layout)
        const details: ConfirmationDetails = {
            confirmationMessage: confirmationMsg,
            registrationNumber: await this.safeGetText(this.lblRegistrationNumber, 'Unknown'),
            girlName: await this.safeGetText(this.lblGirlName, 'Unknown'),
            parentName: await this.safeGetText(this.lblParentName, 'Unknown'),
            email: await this.safeGetText(this.lblEmail, 'Unknown'),
            troop: await this.safeGetText(this.lblTroop, 'Unknown'),
            membership: await this.safeGetText(this.lblMembership, 'Unknown')
        };

        this.logDetailsToAllure(details);

        return details;
    }

    /**
     * Helper to retrieve text without failing if the element isn't rendered exactly as expected.
     */
    private async safeGetText(element: WebdriverIO.Element, fallback: string): Promise<string> {
        try {
            if (await element.isExisting() && await element.isDisplayed()) {
                return await element.getText();
            }
        } catch (e) {
            Logger.warn(`Failed to capture text for element, using fallback: ${fallback}`);
        }
        return fallback;
    }

    /**
     * Stores captured values securely into the Allure Report.
     */
    private logDetailsToAllure(details: ConfirmationDetails): void {
        allure.addStep('Captured Registration Details');
        allure.addAttachment('Registration Summary', JSON.stringify(details, null, 2), 'application/json');
        
        // Add specific key-value arguments to Allure for easy filtering/viewing in the report dashboard
        allure.addArgument('Registration Number', details.registrationNumber);
        allure.addArgument('Girl Name', details.girlName);
        allure.addArgument('Troop', details.troop);
    }
}

export default new ConfirmationPage();
