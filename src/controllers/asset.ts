import { Request, Response } from "express";
import { UploadAssetInputSchema, AssetSchema } from "../../lib/contracts";
import { AssetModel } from "../models";
import { v4 as uuidv4 } from "uuid";

export class AssetController {
    async upload(req: Request, res: Response) {
        try {
            const input = UploadAssetInputSchema.parse(req.body);
            const assetId = uuidv4();
            const key = `uploads/${assetId}/${input.filename}`;

            // Stub Presigned URL (Local/Fake)
            const uploadUrl = `https://mock-s3.com/upload?key=${key}`;
            const publicUrl = `https://mock-s3.com/${key}`;

            // Create Stub Asset Entry
            // In reality, we might wait for a webhook to confirm upload, 
            // but for MVP we assume success or create it as "PENDING" (if status existed)
            const assetById = new AssetModel({
                _id: assetId,
                campaignId: input.campaignId,
                url: publicUrl,
                type: "IMAGE",
                createdAt: new Date().toISOString()
            });

            await assetById.save();

            res.json({
                uploadUrl,
                assetId,
                key
            });

        } catch (error) {
            console.error(error);
            res.status(400).json({ error: "Invalid Input", details: error });
        }
    }
}
