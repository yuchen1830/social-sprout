import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { PostModel } from '@/lib/models';
import { SchedulePostInputSchema } from '@/lib/contracts';

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

        await dbConnect();

        const post = await PostModel.findById(id);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        if (post.status !== 'APPROVED' && post.status !== 'SCHEDULED') {
            return NextResponse.json({ error: 'Post must be approved before scheduling' }, { status: 400 });
        }

        // Update status and time
        post.status = 'SCHEDULED';
        post.scheduledTime = input.scheduledTime;

        await post.save();

        return NextResponse.json(post);
    } catch (error) {
        console.error("Schedule Post Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
