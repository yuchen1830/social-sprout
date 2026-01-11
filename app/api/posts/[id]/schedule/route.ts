import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SchedulePostInputSchema } from "@/lib/contracts";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { id } = params;

        const validationResult = SchedulePostInputSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.format() },
                { status: 400 }
            );
        }
        const input = validationResult.data;

        const { db } = await connectToDatabase();

        const post = await db.collection("posts").findOne({ _id: id });
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        if (post.status !== "APPROVED" && post.status !== "SCHEDULED") {
            return NextResponse.json({ error: "Post must be approved before scheduling" }, { status: 400 });
        }

        // Update status and time
        const result = await db.collection("posts").findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    status: "SCHEDULED",
                    scheduledTime: input.scheduledTime,
                    updatedAt: new Date().toISOString(),
                },
            },
            { returnDocument: "after" }
        );

        return NextResponse.json(result.value);
    } catch (error) {
        console.error("Schedule Post Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
