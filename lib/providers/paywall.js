"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X402PaywallProvider = void 0;
class X402PaywallProvider {
    constructor(merchantAddress) {
        this.merchantAddress = merchantAddress;
    }
    async createCharge(amount, currency) {
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
    async verifyPayment(chargeId) {
        console.log(`[x402] Verifying charge ${chargeId}`);
        // Simulate check
        return true;
    }
}
exports.X402PaywallProvider = X402PaywallProvider;
