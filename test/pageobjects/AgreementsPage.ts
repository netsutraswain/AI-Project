import BasePage from './BasePage';
import { ElementHelper } from '@helpers/ElementHelper';
import { WaitHelper } from '@helpers/WaitHelper';

class AgreementsPage extends BasePage {
    /**
     * Define Locators for Agreements and Signatures
     */
    
    // Checkboxes for required policies
    public get checkboxGirlScoutPromise() { return $('input[formcontrolname="promiseLaw"], [aria-label*="Promise and Law" i]'); }
    public get checkboxMediaPermission() { return $('input[formcontrolname="mediaPermission"], [aria-label*="Media Permission" i]'); }
    public get checkboxWaiver() { return $('input[formcontrolname="waiver"], [aria-label*="Waiver" i]'); }
    
    // E-Signatures (usually typed name matching parent name)
    public get inputSignature() { return $('input[formcontrolname="signature"], [placeholder*="Signature" i]'); }
    
    // Navigation
    public get btnContinue() { return $('//button[contains(translate(text(), "continue", "CONTINUE"), "CONTINUE") or contains(@aria-label, "CONTINUE")]'); }

    /**
     * Accepts all required agreements and signs the document.
     * @param signatureName The exact name to type as electronic signature (usually Caregiver First + Last)
     */
    public async acceptAgreements(signatureName: string): Promise<void> {
        await WaitHelper.waitForDisplayed(this.btnContinue, 20000);

        // Click required agreement checkboxes if they exist and are not selected
        const checkboxes = [
            { el: this.checkboxGirlScoutPromise, name: 'Girl Scout Promise' },
            { el: this.checkboxMediaPermission, name: 'Media Permission' },
            { el: this.checkboxWaiver, name: 'Liability Waiver' }
        ];

        for (const cb of checkboxes) {
            if (await cb.el.isExisting() && await cb.el.isDisplayed()) {
                if (!(await cb.el.isSelected())) {
                    await ElementHelper.click(cb.el, `${cb.name} Checkbox`);
                }
            }
        }

        // Apply E-Signature if present
        if (await this.inputSignature.isExisting() && await this.inputSignature.isDisplayed()) {
            await ElementHelper.setValue(this.inputSignature, signatureName, 'Electronic Signature');
        }

        await WaitHelper.waitForLoadingToDisappear();
    }

    /**
     * Proceeds to Cart Review / Payment
     */
    public async clickContinue(): Promise<void> {
        await ElementHelper.click(this.btnContinue, 'Agreements Continue Button');
        await WaitHelper.waitForLoadingToDisappear();
    }
}

export default new AgreementsPage();
