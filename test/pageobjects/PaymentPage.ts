import BasePage from './BasePage';
import { ElementHelper } from '@helpers/ElementHelper';
import { IFrameHelper } from '@helpers/IFrameHelper';
import { WaitHelper } from '@helpers/WaitHelper';
import { Logger } from '@utils/logger';

class PaymentPage extends BasePage {
    /**
     * Define Locators
     */
    public get btnReviewCart() { return $('//*[self::button or self::a][contains(translate(text(), "review cart", "REVIEW CART"), "REVIEW CART") or contains(@aria-label, "REVIEW CART") or contains(translate(., "review cart", "REVIEW CART"), "REVIEW CART")]'); }
    public get chkTermsAndConditions() { return $('#isTermsAndConditions'); }
    public get btnAddPaymentDetails() { return $('//*[self::button or self::a][contains(translate(text(), "add payment details", "ADD PAYMENT DETAILS"), "ADD PAYMENT DETAILS") or contains(@aria-label, "ADD PAYMENT DETAILS") or contains(translate(., "add payment details", "ADD PAYMENT DETAILS"), "ADD PAYMENT DETAILS")]'); }
    
    // Cardholder Details
    public get inputCardholderFirstName() { return $('input[placeholder*="first name" i], input[aria-label*="first name" i], input[name*="first" i], input[id*="first" i], input[formcontrolname*="first" i]'); }
    public get inputCardholderLastName() { return $('input[placeholder*="last name" i], input[aria-label*="last name" i], input[name*="last" i], input[id*="last" i], input[formcontrolname*="last" i]'); }

    // Tokenizer IFrame and its internal fields
    public get iframeOuterPayment() { return $('iframe[src*="snappayglobal.com"]'); }
    public get iframePayment() { return $('iframe[src*="ajax-tokenizer"], iframe[title*="payment" i], iframe'); }
    public get iframeTokenizerInner() { return $('#tokenframe'); }
    
    public get inputCardNumber() { return $('#ccnumfield'); }
    public get inputExpiryMonth() { return $('#ccexpirymonth'); }
    public get inputExpiryYear() { return $('#ccexpiryyear'); }
    public get inputCvv() { return $('#cccvvfield'); }

    // Final Submission
    public get btnSubmitPayment() { return $('//button[contains(translate(text(), "submit payment", "SUBMIT PAYMENT"), "SUBMIT PAYMENT") or contains(@aria-label, "SUBMIT PAYMENT") or contains(translate(., "submit payment", "SUBMIT PAYMENT"), "SUBMIT PAYMENT")]'); }

    // Cart Verification Locators
    public get lblMembershipItem() { return $('//div[contains(@class, "cart-item") and contains(text(), "Membership")]'); }
    public get lblTotalPrice() { return $('//div[contains(@class, "total-price") or contains(text(), "Total:")]'); }

    /**
     * Verifies the cart contents and accepts terms.
     */
    public async reviewCartAndAcceptTerms(expectedMembership?: string, expectedPrice?: string): Promise<void> {
        // Handle new UAT mandatory Membership Year selection
        const membershipYearOptions = await $$('//*[contains(text(), "Next Year") or contains(text(), "Extended Year") or contains(text(), "Current Year")]');
        if (membershipYearOptions.length > 0) {
            for (const option of membershipYearOptions) {
                if (await option.isDisplayed()) {
                    await ElementHelper.click(option, 'Membership Year Option');
                    await browser.pause(500);
                    break;
                }
            }
        }

        // Handle new UAT mandatory Payment Type selection
        const creditCardRadio = await $$('//*[contains(text(), "Credit Card")]/preceding-sibling::input[@type="radio"] | //label[contains(text(), "Credit Card")]');
        if (creditCardRadio.length > 0) {
            for (const radio of creditCardRadio) {
                if (await radio.isDisplayed() && await radio.isEnabled()) {
                    await ElementHelper.click(radio, 'Credit Card Payment Type');
                    await browser.pause(500);
                    break;
                }
            }
        }
        
        // Click SAVE DETAILS to unlock REVIEW CART
        const saveDetails = await $$('//button[contains(translate(text(), "save details", "SAVE DETAILS"), "SAVE DETAILS")]');
        if (saveDetails.length > 0) {
            for (const btn of saveDetails) {
                if (await btn.isDisplayed() && await btn.isEnabled()) {
                    await ElementHelper.click(btn, 'Save Details Button');
                    await WaitHelper.waitForLoadingToDisappear();
                    break;
                }
            }
        }
        const reviewCartLocator = '//*[self::button or self::a][contains(translate(text(), "review cart", "REVIEW CART"), "REVIEW CART") or contains(@aria-label, "REVIEW CART") or contains(translate(., "review cart", "REVIEW CART"), "REVIEW CART")]';
        await browser.waitUntil(async () => {
            const btns = await $$(reviewCartLocator);
            for (const btn of btns) {
                if (await btn.isDisplayed() && await btn.isEnabled()) return true;
            }
            return false;
        }, { timeout: 15000, timeoutMsg: 'Could not find a visible Review Cart button' });
        
        const reviewCartButtons = await $$(reviewCartLocator);
        for (const btn of reviewCartButtons) {
            if (await btn.isDisplayed() && await btn.isEnabled()) {
                await browser.pause(1000);
                await ElementHelper.click(btn, 'Review Cart Button');
                await browser.pause(1000);
                break;
            }
        }
        
        await WaitHelper.waitForLoadingToDisappear();
        
        await WaitHelper.waitForDisplayed(this.chkTermsAndConditions, 30000);
        await ElementHelper.click(this.chkTermsAndConditions, 'Terms and Conditions Checkbox');
        
        const addPaymentLocator = '//*[self::button or self::a][contains(translate(text(), "add payment details", "ADD PAYMENT DETAILS"), "ADD PAYMENT DETAILS") or contains(@aria-label, "ADD PAYMENT DETAILS") or contains(translate(., "add payment details", "ADD PAYMENT DETAILS"), "ADD PAYMENT DETAILS")]';
        await browser.waitUntil(async () => {
            const btns = await $$(addPaymentLocator);
            for (const btn of btns) {
                if (await btn.isDisplayed() && await btn.isEnabled()) return true;
            }
            return false;
        }, { timeout: 15000, timeoutMsg: 'Could not find a visible Add Payment Details button' });

        const addPaymentButtons = await $$(addPaymentLocator);
        for (const btn of addPaymentButtons) {
            if (await btn.isDisplayed() && await btn.isEnabled()) {
                await ElementHelper.click(btn, 'Add Payment Details Button');
                break;
            }
        }
        await WaitHelper.waitForLoadingToDisappear();
    }

    /**
     * Fills out the billing name fields in the main document.
     */
    public async fillCardholderName(paymentData: any): Promise<void> {
        await ElementHelper.setValue(this.inputCardholderFirstName, paymentData.firstName, 'Cardholder First Name');
        await ElementHelper.setValue(this.inputCardholderLastName, paymentData.lastName, 'Cardholder Last Name');
    }

    public async fillCreditCardDetails(paymentData: any): Promise<void> {
        await WaitHelper.waitForDisplayed(this.iframePayment, 30000);
        
        try {
            await browser.switchFrame(await this.iframePayment);
            Logger.info('Switched to CardConnect Interop/Tokenizer IFrame');

            await this.inputCardNumber.waitForExist({ timeout: 15000 });
            await this.inputCardNumber.setValue(paymentData.cardNumber);
            await this.inputExpiryMonth.waitForExist({ timeout: 15000 });
            await this.inputExpiryMonth.selectByAttribute('value', paymentData.expiryMonth);
            await this.inputExpiryYear.waitForExist({ timeout: 15000 });
            await this.inputExpiryYear.selectByAttribute('value', paymentData.expiryYear);
            await this.inputCvv.waitForExist({ timeout: 15000 });
            await this.inputCvv.setValue(paymentData.cvv);

            // The script clicked a specific token form area. Sometimes needed to trigger validation blur.
            const tokenForm = $('#tokenform');
            if (await tokenForm.isExisting()) {
                await ElementHelper.click(tokenForm, 'Token Form Blur Click');
            }
        } finally {
            await browser.switchFrame(null);
            Logger.info('Switched back to Top-Level Context');
        }
    }

    /**
     * Submits the final payment.
     */
    public async submitPayment(): Promise<void> {
        await ElementHelper.click(this.btnSubmitPayment, 'Submit Payment Button');
        await WaitHelper.waitForLoadingToDisappear();
    }
}

export default new PaymentPage();
