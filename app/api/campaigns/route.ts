import { NextResponse } from 'next/server';
// These imports depend on Feature 1 (Infrastructure & DB) being implemented
import dbConnect from '@/lib/db';
import { CampaignModel, PostModel, AssetModel } from '@/lib/models';
import { CreateCampaignInputSchema } from '@/lib/contracts';
import { StubImageProvider, StubTextProvider } from '@/lib/providers/stub';

// Initialize providers (Stateless for stubs)
const imageProvider = new StubImageProvider();
const textProvider = new StubTextProvider();

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Validate Input
        const validationResult = CreateCampaignInputSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const input = validationResult.data;

        // Connect to DB (Depends on Feature 1)
        await dbConnect();

        // 2. Create Campaign (Depends on Feature 1 Models)
        const campaign = await CampaignModel.create({
            brandName: input.brandName,
            brandCategory: input.brandCategory,
            brandDescription: input.brandDescription,
            goal: input.goal,
            platforms: input.platforms,
            status: 'DRAFT', // Default
        });

        let firstRun = undefined;

        // 3. Handle Generation (if params provided)
        if (input.generationParams) {
            const { style, budget, referenceAssetIds, additionalContext } = input.generationParams;

            // Link orphaned assets if IDs provided
            if (referenceAssetIds && referenceAssetIds.length > 0) {
                // Link assets to this campaign
                await AssetModel.updateMany(
                    { _id: { $in: referenceAssetIds } },
                    { $set: { campaignId: campaign._id } }
                );
            }

            // Simulate Budget Check
            if (budget < 0.50) {
                return NextResponse.json({ error: "Budget too low" }, { status: 402 });
            }

            const drafts = [];

            // Generate 3 drafts
            for (let i = 0; i < 3; i++) {
                // Generate Image (Stub)
                const imageResult = await imageProvider.generateImage({
                    prompt: `${input.brandName} ${input.goal} ${additionalContext || ''}`,
                    style: style,
                    referenceAssetUrls: [], // In full impl, would fetch URLs from AssetModel
                });

                // Generate Caption (Stub)
                const textResult = await textProvider.generateText({
                    systemPrompt: "You are a social media manager.",
                    userPrompt: `Write a caption for ${input.brandName} about ${input.goal}`,
                });

                // Create Post Record
                const post = await PostModel.create({
                    campaignId: campaign._id,
                    status: 'DRAFT',
                    content: {
                        imageUrl: imageResult.imageUrl,
                        caption: textResult.text,
                    },
                    platform: input.platforms[0] || 'INSTAGRAM',
                });

                drafts.push(post);
            }

            firstRun = {
                runId: new Date().getTime().toString(), // Mock Run ID
                posts: drafts,
            };
        }

        // 4. Return Response
        return NextResponse.json({
            id: campaign._id,
            brandName: campaign.brandName,
            name: campaign.goal, // Using goal as name per spec
            platforms: campaign.platforms,
            createdAt: campaign.createdAt,
            firstRun,
        }, { status: 201 });

    } catch (error) {
        console.error("Campaign Creation Error:", error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
