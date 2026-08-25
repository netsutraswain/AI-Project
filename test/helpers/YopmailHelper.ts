import { Logger } from '@utils/logger';
import allure from '@wdio/allure-reporter';
import * as fs from 'fs';

export class YopmailHelper {
    /**
     * Retrieves the 6-digit OTP from Yopmail for the given email address.
     * This method opens a new browser window to Yopmail, extracts the OTP, 
     * closes the window, and switches back to the original window.
     * 
     * @param email The full Yopmail address (e.g. tester_123@yopmail.com)
     * @returns The 6-digit OTP string.
     */
    public static async getOtp(email: string): Promise<string> {
        const originalWindow = await browser.getWindowHandle();
        
        // Extract just the username part for Yopmail input
        const yopmailUser = email.split('@')[0];
        
        let recorder: any;
        const videoPath = `yopmail-otp-latest.mp4`;
        
        try {
            Logger.info(`Fetching OTP for ${yopmailUser} from Yopmail...`);
            
            // 1. Open new window and switch to it
            await browser.newWindow('https://yopmail.com/en/');
            await browser.pause(2000); // Allow Yopmail UI to settle

            try {
                const puppeteer = await browser.getPuppeteer();
                const pages = await puppeteer.pages();
                // Find the specific page that contains yopmail in the URL
                const yopmailPage = pages.find(p => p.url().includes('yopmail')) || pages[pages.length - 1];
                const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
                recorder = new PuppeteerScreenRecorder(yopmailPage);
                await recorder.start(videoPath);
            } catch (recError) {
                Logger.info('Failed to start Puppeteer video recording for Yopmail: ' + recError);
            }
            
            // 2. Enter email and check inbox
            const loginInput = await $('#login, .ycptinput, input[placeholder="Enter your inbox here"]');
            await loginInput.waitForDisplayed({ timeout: 10000 });
            await loginInput.setValue(yopmailUser);
            
            // Pressing Enter simulates clicking the 'Check Inbox' arrow
            await browser.keys('Enter');
            
            // Wait for inbox to load and emails to populate
            await browser.pause(4000); 
            
            let otpCode: string | null = null;
            
            // Retry loop to allow time for email to arrive (up to 120 seconds)
            for (let attempt = 1; attempt <= 12; attempt++) {
                Logger.info(`Checking Yopmail inbox (Attempt ${attempt}/12)...`);
                
                // If not first attempt, refresh the inbox
                if (attempt > 1) {
                    const refreshBtn = await $('#refresh');
                    if (await refreshBtn.isDisplayed()) {
                        await refreshBtn.click();
                        await browser.pause(3000);
                    }
                }

                // Switch to inbox and click the latest email to ensure it's loaded in ifmail
                const inboxIframe = await $('#ifinbox');
                if (await inboxIframe.isExisting()) {
                    await browser.switchToFrame(inboxIframe);
                    const firstEmail = await $$('.m'); // .m is the class for emails in Yopmail's inbox
                    if (firstEmail.length > 0) {
                        await firstEmail[0].click();
                        await browser.pause(2000);
                    }
                    await browser.switchToParentFrame();
                }
                
                // 3. The email body is rendered inside the 'ifmail' iframe
                const mailIframe = await $('#ifmail');
                if (await mailIframe.isExisting()) {
                    await browser.switchToFrame(mailIframe);
                    
                    // 4. Extract OTP from the body text
                    const body = await $('body');
                    const isBodyExist = await body.isExisting();
                    if (isBodyExist) {
                        const bodyText = await body.getText();
                        if (typeof bodyText === 'string' && bodyText.trim().length > 0) {
                            Logger.info(`Email body text preview: ${bodyText.substring(0, 150)}...`);
                            
                            // Look for exactly a 6-digit code
                            const match = bodyText.match(/\b\d{6}\b/);
                            if (match) {
                                otpCode = match[0];
                                Logger.info(`Successfully extracted OTP: ${otpCode}`);
                                break;
                            } else {
                                Logger.info(`Could not find OTP in email body.`);
                            }
                        }
                    }
                    await browser.switchToParentFrame();
                }
                
                if (otpCode) break;
                
                await browser.pause(7000);
            }
            
            if (!otpCode) {
                throw new Error('Could not find a 6-digit OTP in the email body after 120 seconds.');
            }
            
            // 5. Clean up window and switch back
            await browser.switchToParentFrame();
            await browser.closeWindow();
            await browser.switchToWindow(originalWindow);
            
            return otpCode;
        } catch (error) {
            Logger.error(`Failed to fetch OTP from Yopmail:`, error);
            // Ensure we switch back to the main app window even on error
            const currentHandles = await browser.getWindowHandles();
            if (currentHandles.includes(originalWindow)) {
                await browser.switchToWindow(originalWindow);
            }
            throw error;
        } finally {
            if (recorder) {
                try {
                    await recorder.stop();
                } catch (e) {
                    Logger.info('Failed to stop Yopmail video recorder.');
                }
            }
            if (fs.existsSync(videoPath)) {
                allure.addAttachment('Yopmail OTP Extraction Video', fs.readFileSync(videoPath), 'video/mp4');
            }
        }
    }
}
