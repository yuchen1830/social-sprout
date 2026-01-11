import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ApprovePostInputSchema } from "@/lib/contracts";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { id } = params;

        const validationResult = ApprovePostInputSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.format() },
                { status: 400 }
            );
        }
        const input = validationResult.data;

        const { db } = await connectToDatabase();

        const update = {
            $set: {
                status: "APPROVED",
                ...(input.editedCaption ? { "content.caption": input.editedCaption } : {}),
                updatedAt: new Date().toISOString(),
            },
        };

        const result = await db.collection("posts").findOneAndUpdate(
            { _id: id },
            update,
            { returnDocument: "after" }
        );

        if (!result.value) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json(result.value);
    } catch (error) {
        console.error("Approve Post Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
