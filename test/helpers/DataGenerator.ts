export class DataGenerator {
    /**
     * Generates a unique timestamp to append to data.
     */
    private static getTimestamp(): string {
        return Date.now().toString();
    }

    private static getRandomString(length: number): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Generates a unique first name.
     */
    public static generateUniqueName(baseName: string = 'Test'): string {
        return `${baseName}${this.getRandomString(5)}_${this.getTimestamp()}`;
    }

    /**
     * Generates a unique email.
     */
    public static generateUniqueEmail(prefix: string = 'girl', domain: string = 'yopmail.com'): string {
        return `${prefix}${this.getRandomString(5)}_${this.getTimestamp()}@${domain}`;
    }

    /**
     * Generates a unique address.
     */
    public static generateUniqueAddress(baseAddress: string = 'Street'): string {
        return `${Math.floor(Math.random() * 9000) + 100} ${this.getRandomString(6)} ${baseAddress} ${this.getTimestamp()}`;
    }

    /**
     * Generates a random valid US phone number.
     * Format: 10 digits starting with a valid area code (e.g., 2-9).
     */
    public static generateUniquePhone(): string {
        const areaCode = Math.floor(Math.random() * 800) + 200; // 200-999
        const prefix = Math.floor(Math.random() * 800) + 200; // 200-999
        const lineNumber = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
        return `${areaCode}${prefix}${lineNumber}`;
    }
}
