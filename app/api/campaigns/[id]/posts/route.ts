import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const campaignId = params.id;
        const { db } = await connectToDatabase();

        const posts = await db.collection("posts")
            .find({ campaignId: campaignId })
            .toArray();

        // Convert Dates to strings if needed, though JSON.stringify handles it usually
        return NextResponse.json({ posts }, { status: 200 });

    } catch (error) {
        console.error("Fetch Posts Error:", error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
