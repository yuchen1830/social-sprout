import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { PostModel } from '@/lib/models';
import { ApprovePostInputSchema } from '@/lib/contracts';

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

        await dbConnect();

        const post = await PostModel.findById(id);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Update status and optionally caption
        post.status = 'APPROVED';
        if (input.editedCaption) {
            post.content.caption = input.editedCaption;
        }

        await post.save();

        return NextResponse.json(post);
    } catch (error) {
        console.error("Approve Post Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
