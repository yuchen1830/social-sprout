import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { CreateCampaignInputSchema } from "@/lib/contracts";
import { StubImageProvider, StubTextProvider } from "@/lib/providers/stub";
import { v4 as uuidv4 } from "uuid";

// Stubs avoid network calls during local dev
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
        const { db } = await connectToDatabase();

        // 2. Create Campaign
        const campaign = {
            _id: uuidv4(),
            brandName: input.brandName,
            brandCategory: input.brandCategory,
            brandDescription: input.brandDescription,
            goal: input.goal,
            platforms: input.platforms,
            status: "DRAFT",
            createdAt: new Date().toISOString(),
        };

        await db.collection("campaigns").insertOne(campaign);

        let firstRun = undefined;

        // 3. Handle Generation (if params provided)
        if (input.generationParams) {
            const { style, budget, referenceAssetIds, additionalContext } = input.generationParams;

            // Link orphaned assets if IDs provided
            if (referenceAssetIds && referenceAssetIds.length > 0) {
                await db.collection("assets").updateMany(
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
                    prompt: `${input.brandName} ${input.goal} ${additionalContext || ""}`,
                    style: style,
                    referenceAssetUrls: [],
                });

                // Generate Caption (Stub)
                const textResult = await textProvider.generateText({
                    systemPrompt: "You are a social media manager.",
                    userPrompt: `Write a caption for ${input.brandName} about ${input.goal}`,
                });

                // Create Post Record
                const post = {
                    _id: uuidv4(),
                    campaignId: campaign._id,
                    status: "DRAFT",
                    scheduledTime: null,
                    content: {
                        imageUrl: imageResult.imageUrl,
                        caption: textResult.text,
                    },
                    platform: input.platforms[0] || "INSTAGRAM",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                await db.collection("posts").insertOne(post);

                drafts.push(post);
            }

            firstRun = {
                runId: uuidv4(),
                posts: drafts,
            };
        }

        // 4. Return Response
        return NextResponse.json({
                id: campaign._id,
                brandName: campaign.brandName,
                name: campaign.goal,
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
