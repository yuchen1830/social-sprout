import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { CreateCampaignInputSchema } from "@/lib/contracts";
import { StubTextProvider } from "@/lib/providers/stub";
import { FreepikImageProvider } from "@/lib/providers/freepik";
import { v4 as uuidv4 } from "uuid";

// Use real Freepik provider for images, Stub for text
const imageProvider = new FreepikImageProvider();
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

        // 3. Handle Generation (Async Fire-and-Forget)
        if (input.generationParams) {
            const { style, budget, referenceAssetIds } = input.generationParams;

            // Check budget first
            if (budget < 0.50) {
                return NextResponse.json({ error: "Budget too low" }, { status: 402 });
            }

            // Create 3 placeholder posts with GENERATING status
            const placeholders = [];
            for (let i = 0; i < 3; i++) {
                const post = {
                    _id: uuidv4(),
                    campaignId: campaign._id,
                    status: "GENERATING",
                    scheduledTime: null,
                    content: {
                        imageUrl: null,
                        caption: null,
                    },
                    platform: input.platforms[0] || "INSTAGRAM",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                placeholders.push(post);
            }

            // Insert placeholders
            if (placeholders.length > 0) {
                await db.collection("posts").insertMany(placeholders);
            }

            // Link assets
            if (referenceAssetIds && referenceAssetIds.length > 0) {
                await db.collection("assets").updateMany(
                    { _id: { $in: referenceAssetIds } },
                    { $set: { campaignId: campaign._id } }
                );
            }

            // Trigger Background Generation
            // Note: In strict serverless environments (e.g. Vercel Functions), this promise might be cancelled
            // if the runtime freezes immediately after response. For Vercel, usage of 'waitUntil' is recommended.
            // For this MVP/Local usage, this floating promise works.
            generateInBackground(campaign._id, input, placeholders, db).catch(err =>
                console.error(`[Background] Fatal error for campaign ${campaign._id}`, err)
            );

            firstRun = {
                runId: uuidv4(),
                posts: placeholders, // Returns posts with status: "GENERATING"
            };
        }

        // 4. Return Response Immediately
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

// Background Worker Function
async function generateInBackground(campaignId: string, input: any, placeholders: any[], db: any) {
    const { style, additionalContext } = input.generationParams;
    console.log(`[Background] Starting generation for Campaign ${campaignId}`);

    const generateForItem = async (post: any, index: number) => {
        try {
            console.log(`[Background] Generating draft ${index + 1}/3 for Post ${post._id}...`);

            // Parallel calls
            const [imageResult, textResult] = await Promise.all([
                imageProvider.generateImage({
                    prompt: `${input.brandName} ${input.goal} ${additionalContext || ""}`,
                    style: style,
                    referenceAssetUrls: [],
                }),
                textProvider.generateText({
                    systemPrompt: "You are a social media manager.",
                    userPrompt: `Write a caption for ${input.brandName} about ${input.goal}`,
                })
            ]);

            // Update Post in DB to DRAFT
            await db.collection("posts").updateOne(
                { _id: post._id },
                {
                    $set: {
                        status: "DRAFT",
                        content: {
                            imageUrl: imageResult.imageUrl,
                            caption: textResult.text
                        },
                        updatedAt: new Date().toISOString()
                    }
                }
            );
            console.log(`[Background] Post ${post._id} updated to DRAFT.`);

        } catch (err) {
            console.error(`[Background] Failed for Post ${post._id}`, err);
            await db.collection("posts").updateOne(
                { _id: post._id },
                { $set: { status: "FAILED", updatedAt: new Date().toISOString() } }
            );
        }
    };

    // Run all updates in parallel
    await Promise.all(placeholders.map((p, i) => generateForItem(p, i)));
    console.log(`[Background] Campaign ${campaignId} generation complete.`);
}
