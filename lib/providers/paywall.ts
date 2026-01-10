import { PaymentDetails } from "../contracts";

export interface PaywallProvider {
    createCharge(amount: number, currency: "USDC" | "ETH" | "EURC"): Promise<{ chargeId: string, details: PaymentDetails }>;
    verifyPayment(chargeId: string): Promise<boolean>;
}

export class X402PaywallProvider implements PaywallProvider {
    private merchantAddress: string;

    constructor(merchantAddress: string) {
        this.merchantAddress = merchantAddress;
    }

    async createCharge(amount: number, currency: "USDC" | "ETH" | "EURC"): Promise<{ chargeId: string, details: PaymentDetails }> {
        const chargeId = "ch_" + Math.random().toString(36).substring(7);
        // In real x402, this might interact with their API to register a charge

        return {
            chargeId,
            details: {
                amount: amount,
                currency: currency,
                receiverAddress: this.merchantAddress,
                chainId: 8453, // Base
            }
        };
    }

    async verifyPayment(chargeId: string): Promise<boolean> {
        console.log(`[x402] Verifying charge ${chargeId}`);
        // Simulate check
        return true;
    }
}
