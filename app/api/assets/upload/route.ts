import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// Simple mock upload for MVP
// In a real app, this would upload to S3/Blob storage
export async function POST(request: Request) {
    try {
        const { db } = await connectToDatabase();

        // Use formData() to handle file uploads
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const campaignId = formData.get("campaignId") as string | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // For MVP: We'll just create a mock URL based on the filename
        // In a real implementation: upload to cloud storage > get URL
        const mockUrl = `https://mock-storage.com/${file.name}-${Date.now()}`;

        // Create Asset Record
        const asset = {
            _id: uuidv4(),
            campaignId: campaignId || undefined,
            url: mockUrl,
            type: "IMAGE" as const,
            createdAt: new Date().toISOString(),
        };

        await db.collection("assets").insertOne(asset);

        return NextResponse.json({
            id: asset._id,
            url: asset.url
        }, { status: 201 });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
