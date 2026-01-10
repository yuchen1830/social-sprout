"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCalendarResponseSchema = exports.CalendarEventSchema = exports.SchedulePostInputSchema = exports.ApprovePostInputSchema = exports.GeneratePostsResponseSchema = exports.GeneratePostsInputSchema = exports.PaymentProofSchema = exports.PaymentDetailsSchema = exports.InitiatePaymentResponseSchema = exports.InitiatePaymentInputSchema = exports.UploadAssetResponseSchema = exports.UploadAssetInputSchema = exports.CreateCampaignInputSchema = exports.PostSchema = exports.PostContentSchema = exports.AssetSchema = exports.CampaignSchema = exports.AssetTypeEnum = exports.CampaignStatusEnum = exports.PostStatusEnum = exports.PlatformEnum = exports.StylePresetEnum = exports.CategoryEnum = void 0;
const zod_1 = require("zod");
// --- Enums ---
exports.CategoryEnum = zod_1.z.enum([
    "LIFESTYLE_PRODUCT",
    "CONSUMER_PRODUCT",
    "CAFE_OR_RESTAURANT",
    "SERVICE",
]);
exports.StylePresetEnum = zod_1.z.enum([
    "UGC",
    "CLEAN_STUDIO",
    "WARM_LIFESTYLE",
    "EDITORIAL",
    "MINIMAL",
    "DOCUMENTARY",
]);
exports.PlatformEnum = zod_1.z.enum(["INSTAGRAM", "FACEBOOK", "PINTEREST"]);
exports.PostStatusEnum = zod_1.z.enum([
    "DRAFT",
    "APPROVED",
    "SCHEDULED",
    "POSTED",
    "FAILED",
]);
exports.CampaignStatusEnum = zod_1.z.enum(["DRAFT", "PAID", "COMPLETED"]);
exports.AssetTypeEnum = zod_1.z.enum(["IMAGE"]);
// --- Entities ---
exports.CampaignSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    brandName: zod_1.z.string().min(1),
    brandCategory: exports.CategoryEnum,
    brandDescription: zod_1.z.string().optional(),
    goal: zod_1.z.string().min(1),
    platforms: zod_1.z.array(exports.PlatformEnum),
    status: exports.CampaignStatusEnum.default("DRAFT"),
    createdAt: zod_1.z.string().datetime(),
});
exports.AssetSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    campaignId: zod_1.z.string().uuid().optional(), // Nullable if uploaded before campaign creation
    url: zod_1.z.string().url(),
    type: exports.AssetTypeEnum,
    createdAt: zod_1.z.string().datetime(),
});
exports.PostContentSchema = zod_1.z.object({
    imageUrl: zod_1.z.string().url(),
    caption: zod_1.z.string(),
});
exports.PostSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    campaignId: zod_1.z.string().uuid(),
    status: exports.PostStatusEnum,
    scheduledTime: zod_1.z.string().datetime().nullable(),
    content: exports.PostContentSchema,
    platform: exports.PlatformEnum,
    updatedAt: zod_1.z.string().datetime().optional(),
});
// --- API Contracts ---
// POST /api/campaigns
exports.CreateCampaignInputSchema = zod_1.z.object({
    brandName: zod_1.z.string().min(1),
    brandCategory: exports.CategoryEnum,
    brandDescription: zod_1.z.string().optional(),
    goal: zod_1.z.string(),
    platforms: zod_1.z.array(exports.PlatformEnum).min(1),
    generationParams: zod_1.z.object({
        style: exports.StylePresetEnum.optional(),
        budget: zod_1.z.number().min(50),
        referenceAssetIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
        additionalContext: zod_1.z.string().optional(),
    }).optional(),
});
// POST /api/assets/upload
exports.UploadAssetInputSchema = zod_1.z.object({
    campaignId: zod_1.z.string().uuid().optional(),
    filename: zod_1.z.string().min(1),
    contentType: zod_1.z.string().regex(/^image\//),
});
exports.UploadAssetResponseSchema = zod_1.z.object({
    uploadUrl: zod_1.z.string().url(),
    assetId: zod_1.z.string().uuid(),
    key: zod_1.z.string(),
});
// POST /api/payment/checkout
exports.InitiatePaymentInputSchema = zod_1.z.object({
    campaignId: zod_1.z.string().uuid(),
});
exports.InitiatePaymentResponseSchema = zod_1.z.object({
    checkoutUrl: zod_1.z.string().url(),
    transactionId: zod_1.z.string(),
});
// --- Payment Schemas ---
exports.PaymentDetailsSchema = zod_1.z.object({
    amount: zod_1.z.number().min(0.01), // Amount in major currency unit (e.g., 0.05 USDC)
    currency: zod_1.z.enum(["USDC", "ETH", "EURC"]),
    receiverAddress: zod_1.z.string(),
    chainId: zod_1.z.number().int(),
});
exports.PaymentProofSchema = zod_1.z.object({
    transactionHash: zod_1.z.string(),
    quantity: zod_1.z.number(), // The amount paid
});
// POST /api/campaigns/:id/generate
exports.GeneratePostsInputSchema = zod_1.z.object({
    style: exports.StylePresetEnum.optional(), // Overrides brand/campaign defaults
    budget: zod_1.z.number().min(50), // Minimum budget in cents (e.g., $0.50)
    referenceAssetIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    additionalContext: zod_1.z.string().optional(),
    // Provider specific settings
    providerConfig: zod_1.z.object({
        freepik: zod_1.z.object({
            styleId: zod_1.z.string().optional(),
            imageType: zod_1.z.enum(["vector", "photo", "psd"]).optional(),
        }).optional(),
    }).optional(),
    // Payment: specific wallet to charge or pre-signed proof
    payment: zod_1.z.object({
        proof: exports.PaymentProofSchema.optional(),
    }).optional(),
});
exports.GeneratePostsResponseSchema = zod_1.z.object({
    runId: zod_1.z.string().uuid(),
    posts: zod_1.z.array(exports.PostSchema),
}).or(zod_1.z.object({
    error: zod_1.z.literal("PAYMENT_REQUIRED"),
    details: exports.PaymentDetailsSchema,
    quoteId: zod_1.z.string(), // ID to reference this specific price quote
}));
// POST /api/posts/:id/approve
exports.ApprovePostInputSchema = zod_1.z.object({
    editedCaption: zod_1.z.string().optional(),
});
// POST /api/posts/:id/schedule
exports.SchedulePostInputSchema = zod_1.z.object({
    scheduledTime: zod_1.z.string().datetime(), // Future timestamp
});
// GET /api/calendar
exports.CalendarEventSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string(),
    start: zod_1.z.string().datetime(),
    status: exports.PostStatusEnum,
    thumbnail: zod_1.z.string().url(),
    platform: exports.PlatformEnum,
});
exports.GetCalendarResponseSchema = zod_1.z.object({
    events: zod_1.z.array(exports.CalendarEventSchema),
});
