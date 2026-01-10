import mongoose, { Schema, Document } from "mongoose";
import {
    CategoryEnum,
    StylePresetEnum,
    PlatformEnum,
    CampaignStatusEnum,
    PostStatusEnum,
    AssetTypeEnum,
    Campaign,
    Post,
    Asset
} from "../../lib/contracts";

// --- Campaign Model ---
export interface ICampaignDocument extends Omit<Campaign, "id">, Omit<Document, "_id"> {
    _id: string;
}

const CampaignSchemaC = new Schema<ICampaignDocument>({
    _id: { type: String, required: true },
    brandName: { type: String, required: true },
    brandCategory: { type: String, enum: CategoryEnum.options, required: true },
    brandDescription: { type: String },
    goal: { type: String, required: true },
    platforms: [{ type: String, enum: PlatformEnum.options }],
    status: { type: String, enum: CampaignStatusEnum.options, default: "DRAFT" },
    createdAt: { type: String, required: true }
}, { _id: false });

export const CampaignModel = mongoose.model<ICampaignDocument>("Campaign", CampaignSchemaC);

// --- Post Model ---
export interface IPostDocument extends Omit<Post, "id">, Omit<Document, "_id"> {
    _id: string;
}

const PostSchemaP = new Schema<IPostDocument>({
    _id: { type: String, required: true },
    campaignId: { type: String, ref: "Campaign", required: true },
    status: { type: String, enum: PostStatusEnum.options, required: true },
    scheduledTime: { type: String, default: null },
    content: {
        imageUrl: { type: String, required: true },
        caption: { type: String, required: true }
    },
    platform: { type: String, enum: PlatformEnum.options, required: true },
    updatedAt: { type: String }
}, { _id: false });

export const PostModel = mongoose.model<IPostDocument>("Post", PostSchemaP);

// --- Asset Model ---
export interface IAssetDocument extends Omit<Asset, "id">, Omit<Document, "_id"> {
    _id: string;
}

const AssetSchemaA = new Schema<IAssetDocument>({
    _id: { type: String, required: true },
    campaignId: { type: String, ref: "Campaign" },
    url: { type: String, required: true },
    type: { type: String, enum: AssetTypeEnum.options, required: true },
    createdAt: { type: String, required: true }
}, { _id: false });

export const AssetModel = mongoose.model<IAssetDocument>("Asset", AssetSchemaA);
