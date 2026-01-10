"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignController = void 0;
const contracts_1 = require("../../lib/contracts"); // Relative path to lib
const repo_1 = require("../db/repo");
const stub_1 = require("../../lib/providers/stub");
const uuid_1 = require("uuid");
class CampaignController {
    constructor() {
        this.db = repo_1.Database.getInstance();
        this.imageProvider = new stub_1.StubImageProvider(); // In real app, this would be Freepik
        this.textProvider = new stub_1.StubTextProvider();
    }
    async create(req, res) {
        try {
            // Validate Input
            const input = contracts_1.CreateCampaignInputSchema.parse(req.body);
            // Create Entity
            const campaign = contracts_1.CampaignSchema.parse({
                id: (0, uuid_1.v4)(),
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
        }
        catch (error) {
            console.error(error);
            res.status(400).json({ error: "Invalid Input", details: error });
        }
    }
    async generate(req, res) {
        try {
            const campaignId = req.params.id;
            const campaign = await this.db.getCampaign(campaignId);
            if (!campaign) {
                return res.status(404).json({ error: "Campaign not found" });
            }
            // Validate Input
            const input = contracts_1.GeneratePostsInputSchema.parse(req.body);
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
                const post = contracts_1.PostSchema.parse({
                    id: (0, uuid_1.v4)(),
                    campaignId: campaign.id,
                    status: contracts_1.PostStatusEnum.enum.DRAFT,
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
            const response = {
                runId: (0, uuid_1.v4)(),
                posts: posts
            };
            res.json(response);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Generation Failed", details: error });
        }
    }
}
exports.CampaignController = CampaignController;
