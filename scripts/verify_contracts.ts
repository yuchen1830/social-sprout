import {
    GeneratePostsInputSchema,
    GeneratePostsResponseSchema,
    StylePresetEnum,
    PlatformEnum
} from "../lib/contracts";
import { FreepikImageProvider } from "../lib/providers/freepik";
import { CDPWalletProvider } from "../lib/providers/wallet";
import { X402PaywallProvider } from "../lib/providers/paywall";
import { z } from "zod";

async function runVerification() {
    console.log("--- Starting Contract & Provider Verification ---");

    // 1. Verify Zod Schemas
    console.log("\n1. Verifying Zod Schemas...");

    // Valid Input
    const validInput = {
        style: "UGC",
        budget: 100,
        providerConfig: {
            freepik: { styleId: "foo" }
        }
    };
    try {
        GeneratePostsInputSchema.parse(validInput);
        console.log("✅ GeneratePostsInputSchema (Valid) passed.");
    } catch (e) {
        console.error("❌ GeneratePostsInputSchema (Valid) failed:", e);
    }

    // Invalid Input (missing budget)
    const invalidInput = { style: "UGC" };
    try {
        GeneratePostsInputSchema.parse(invalidInput);
        console.error("❌ GeneratePostsInputSchema (Invalid) failed to throw.");
    } catch (e) {
        console.log("✅ GeneratePostsInputSchema (Invalid) threw expected error.");
    }

    // Payment Required Output
    const paymentReq = {
        error: "PAYMENT_REQUIRED",
        details: {
            amount: 0.5,
            currency: "USDC",
            receiverAddress: "0x123",
            chainId: 8453
        },
        quoteId: "q_1"
    };
    try {
        GeneratePostsResponseSchema.parse(paymentReq);
        console.log("✅ GeneratePostsResponseSchema (Payment) passed.");
    } catch (e) {
        console.error("❌ GeneratePostsResponseSchema (Payment) failed:", e);
    }

    // 2. Verify Providers
    console.log("\n2. Verifying Providers...");

    // Freepik
    const freepik = new FreepikImageProvider("fake_key");
    const img = await freepik.generateImage({ prompt: "Latte art", style: "CAFE" as any });
    console.log(`✅ Freepik generated: ${img.imageUrl}`);

    // Wallet
    const wallet = new CDPWalletProvider();
    const address = await wallet.createWallet("base-sepolia");
    console.log(`✅ Wallet created: ${address}`);

    // Paywall
    const paywall = new X402PaywallProvider("0xMerchant");
    const charge = await paywall.createCharge(1.00, "USDC");
    console.log(`✅ Charge created: ${charge.chargeId} for ${charge.details.amount} ${charge.details.currency}`);

    console.log("\n--- Verification Complete ---");
}

runVerification().catch(console.error);
