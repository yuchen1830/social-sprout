import { z } from "zod";

// --- Enums ---

export const CategoryEnum = z.enum([
  "LIFESTYLE_PRODUCT",
  "CONSUMER_PRODUCT",
  "CAFE_OR_RESTAURANT",
  "SERVICE",
]);
export type Category = z.infer<typeof CategoryEnum>;

export const StylePresetEnum = z.enum([
  "UGC",
  "CLEAN_STUDIO",
  "WARM_LIFESTYLE",
  "EDITORIAL",
  "MINIMAL",
  "DOCUMENTARY",
]);
export type StylePreset = z.infer<typeof StylePresetEnum>;

export const PlatformEnum = z.enum(["INSTAGRAM", "FACEBOOK", "PINTEREST"]);
export type Platform = z.infer<typeof PlatformEnum>;

export const PostStatusEnum = z.enum([
  "DRAFT",
  "APPROVED",
  "SCHEDULED",
  "POSTED",
  "FAILED",
]);
export type PostStatus = z.infer<typeof PostStatusEnum>;

export const CampaignStatusEnum = z.enum(["DRAFT", "PAID", "COMPLETED"]);
export type CampaignStatus = z.infer<typeof CampaignStatusEnum>;

export const AssetTypeEnum = z.enum(["IMAGE"]);
export type AssetType = z.infer<typeof AssetTypeEnum>;

// --- Entities ---

export const CampaignSchema = z.object({
  id: z.string().uuid(),
  brandName: z.string().min(1),
  brandCategory: CategoryEnum,
  brandDescription: z.string().optional(),
  goal: z.string().min(1),
  platforms: z.array(PlatformEnum),
  status: CampaignStatusEnum.default("DRAFT"),
  createdAt: z.string().datetime(),
});
export type Campaign = z.infer<typeof CampaignSchema>;

export const AssetSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid().optional(), // Nullable if uploaded before campaign creation
  url: z.string().url(),
  type: AssetTypeEnum,
  createdAt: z.string().datetime(),
});
export type Asset = z.infer<typeof AssetSchema>;

export const PostContentSchema = z.object({
  imageUrl: z.string().url(),
  caption: z.string(),
});
export type PostContent = z.infer<typeof PostContentSchema>;

export const PostSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  status: PostStatusEnum,
  scheduledTime: z.string().datetime().nullable(),
  content: PostContentSchema,
  platform: PlatformEnum,
  updatedAt: z.string().datetime().optional(),
});
export type Post = z.infer<typeof PostSchema>;

// --- API Contracts ---

// POST /api/campaigns
export const CreateCampaignInputSchema = z.object({
  brandName: z.string().min(1),
  brandCategory: CategoryEnum,
  brandDescription: z.string().optional(),
  goal: z.string(),
  platforms: z.array(PlatformEnum).min(1),
  generationParams: z.object({
    style: StylePresetEnum.optional(),
    budget: z.number().min(50),
    referenceAssetIds: z.array(z.string().uuid()).optional(),
    additionalContext: z.string().optional(),
  }).optional(),
});
export type CreateCampaignInput = z.infer<typeof CreateCampaignInputSchema>;

// POST /api/assets/upload
export const UploadAssetInputSchema = z.object({
  campaignId: z.string().uuid().optional(),
  filename: z.string().min(1),
  contentType: z.string().regex(/^image\//),
});
export type UploadAssetInput = z.infer<typeof UploadAssetInputSchema>;

export const UploadAssetResponseSchema = z.object({
  uploadUrl: z.string().url(),
  assetId: z.string().uuid(),
  key: z.string(),
});
export type UploadAssetResponse = z.infer<typeof UploadAssetResponseSchema>;

// POST /api/payment/checkout
export const InitiatePaymentInputSchema = z.object({
  campaignId: z.string().uuid(),
});
export type InitiatePaymentInput = z.infer<typeof InitiatePaymentInputSchema>;

export const InitiatePaymentResponseSchema = z.object({
  checkoutUrl: z.string().url(),
  transactionId: z.string(),
});
export type InitiatePaymentResponse = z.infer<typeof InitiatePaymentResponseSchema>;

// POST /api/campaigns/:id/generate
export const GeneratePostsInputSchema = z.object({
  style: StylePresetEnum.optional(), // Overrides brand/campaign defaults
  budget: z.number().min(50), // Minimum budget in cents (e.g., $0.50)
  referenceAssetIds: z.array(z.string().uuid()).optional(),
  additionalContext: z.string().optional(),
});
export type GeneratePostsInput = z.infer<typeof GeneratePostsInputSchema>;

export const GeneratePostsResponseSchema = z.object({
  runId: z.string().uuid(),
  posts: z.array(PostSchema),
});
export type GeneratePostsResponse = z.infer<typeof GeneratePostsResponseSchema>;

// POST /api/posts/:id/approve
export const ApprovePostInputSchema = z.object({
  editedCaption: z.string().optional(),
});
export type ApprovePostInput = z.infer<typeof ApprovePostInputSchema>;

// POST /api/posts/:id/schedule
export const SchedulePostInputSchema = z.object({
  scheduledTime: z.string().datetime(), // Future timestamp
});
export type SchedulePostInput = z.infer<typeof SchedulePostInputSchema>;

// GET /api/calendar
export const CalendarEventSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  start: z.string().datetime(),
  status: PostStatusEnum,
  thumbnail: z.string().url(),
  platform: PlatformEnum,
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

export const GetCalendarResponseSchema = z.object({
  events: z.array(CalendarEventSchema),
});
export type GetCalendarResponse = z.infer<typeof GetCalendarResponseSchema>;
