import { Request, Response } from "express";
import {
    CreateCampaignInputSchema,
    CampaignSchema,
    GeneratePostsInputSchema,
    GeneratePostsResponse,
    PostSchema,
    PostStatusEnum
} from "../../lib/contracts";
import { Database } from "../db/repo";
import { StubImageProvider, StubTextProvider } from "../../lib/providers/stub";
import { v4 as uuidv4 } from "uuid";

export class CampaignController {
    private db = Database.getInstance();
    private imageProvider = new StubImageProvider(); // In real app, this would be Freepik
    private textProvider = new StubTextProvider();

    async create(req: Request, res: Response) {
        try {
            // Validate Input
            const input = CreateCampaignInputSchema.parse(req.body);

            // Create Entity
            const campaign = CampaignSchema.parse({
                id: uuidv4(),
                brandName: input.brandName,
                brandCategory: input.brandCategory,
                brandDescription: input.brandDescription,
                goal: input.goal,
                platforms: input.platforms,
                status: "DRAFT",
                createdAt: new Date().toISOString()
            });

            // Save to DB
            await this.db.saveCampaign(campaign);

            // Return
            res.status(201).json(campaign);
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: "Invalid Input", details: error });
        }
    }

    async generate(req: Request, res: Response) {
        try {
            const campaignId = req.params.id as string;
            const campaign = await this.db.getCampaign(campaignId);
            if (!campaign) {
                return res.status(404).json({ error: "Campaign not found" });
            }

            // Validate Input
            const input = GeneratePostsInputSchema.parse(req.body);

            // TODO: Payment Check Logic (Dev A integration point)
            // if (!input.payment?.proof) { return res.status(402).json(...) }

            // Stub Generation Logic
            const posts = [];
            for (const platform of campaign.platforms) {
                // Generate Image
                const img = await this.imageProvider.generateImage({
                    prompt: `${campaign.brandName} ${input.additionalContext || ""} ${platform}`,
                    style: input.style || "UGC",
                    referenceAssetUrls: [] // Fetch from asset DB if needed
                });

                // Generate Text
                const txt = await this.textProvider.generateText({
                    systemPrompt: "Write a social media post",
                    userPrompt: `For ${campaign.brandName} on ${platform}: ${input.additionalContext}`,
                });

                // Create Post Entity
                const post = PostSchema.parse({
                    id: uuidv4(),
                    campaignId: campaign.id,
                    status: PostStatusEnum.enum.DRAFT,
                    scheduledTime: null,
                    content: {
                        imageUrl: img.imageUrl,
                        caption: txt.text
                    },
                    platform: platform,
                    updatedAt: new Date().toISOString()
                });

                await this.db.savePost(post);
                posts.push(post);
            }

            const response: GeneratePostsResponse = {
                runId: uuidv4(),
                posts: posts
            };

            res.json(response);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Generation Failed", details: error });
        }
    }
}
