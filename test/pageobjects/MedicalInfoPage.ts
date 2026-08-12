import BasePage from './BasePage';
import { ElementHelper } from '@helpers/ElementHelper';
import { WaitHelper } from '@helpers/WaitHelper';

class MedicalInfoPage extends BasePage {
    /**
     * Define Locators for Medical / Health Information
     */
    
    // Checkboxes (Assuming standard Angular Material or custom checkboxes)
    public get checkboxNoAllergies() { return $('input[formcontrolname="noAllergies"], [aria-label*="No Allergies" i]'); }
    public get checkboxNoMedications() { return $('input[formcontrolname="noMedications"], [aria-label*="No Medications" i]'); }
    
    // Physician Info
    public get inputPhysicianName() { return $('input[formcontrolname="physicianName"], [placeholder*="Physician Name" i]'); }
    public get inputPhysicianPhone() { return $('input[formcontrolname="physicianPhone"], [placeholder*="Physician Phone" i]'); }
    
    // Medical Insurance
    public get inputInsuranceCompany() { return $('input[formcontrolname="insuranceCompany"], [placeholder*="Insurance Company" i]'); }
    public get inputPolicyNumber() { return $('input[formcontrolname="policyNumber"], [placeholder*="Policy Number" i]'); }

    // Conditional text areas (e.g., if allergies is checked)
    public get inputAllergiesDetails() { return $('textarea[formcontrolname="allergiesDetails"]'); }

    // Navigation
    public get btnContinue() { return $('//button[contains(translate(text(), "continue", "CONTINUE"), "CONTINUE") or contains(@aria-label, "CONTINUE")]'); }

    /**
     * Fills out the Medical and Health Information section.
     * @param medicalData The data to populate the medical form.
     */
    public async fillMedicalInformation(medicalData: any): Promise<void> {
        await WaitHelper.waitForDisplayed(this.checkboxNoAllergies, 20000);

        // Handle Allergies
        if (medicalData.hasAllergies) {
            await ElementHelper.setValue(this.inputAllergiesDetails, medicalData.allergiesDetails, 'Allergies Details');
        } else {
            if (!(await this.checkboxNoAllergies.isSelected())) {
                await ElementHelper.click(this.checkboxNoAllergies, 'No Allergies Checkbox');
            }
        }

        // Handle Medications
        if (!medicalData.hasMedications) {
            if (!(await this.checkboxNoMedications.isSelected())) {
                await ElementHelper.click(this.checkboxNoMedications, 'No Medications Checkbox');
            }
        }

        // Physician Info
        if (await this.inputPhysicianName.isDisplayed()) {
            await ElementHelper.setValue(this.inputPhysicianName, medicalData.physicianName, 'Physician Name');
            await ElementHelper.setValue(this.inputPhysicianPhone, medicalData.physicianPhone, 'Physician Phone');
        }

        // Insurance Info
        if (await this.inputInsuranceCompany.isDisplayed()) {
            await ElementHelper.setValue(this.inputInsuranceCompany, medicalData.insuranceCompany, 'Insurance Company');
            await ElementHelper.setValue(this.inputPolicyNumber, medicalData.policyNumber, 'Policy Number');
        }

        await WaitHelper.waitForLoadingToDisappear();
    }

    /**
     * Clicks continue to proceed to Agreements.
     */
    public async clickContinue(): Promise<void> {
        await ElementHelper.click(this.btnContinue, 'Medical Info Continue Button');
        await WaitHelper.waitForLoadingToDisappear();
    }
}

export default new MedicalInfoPage();
