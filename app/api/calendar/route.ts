import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { PostModel } from '@/lib/models';
import { CalendarEvent, Post } from '@/lib/contracts'; // We'll map Post to CalendarEvent

export async function GET(request: Request) {
    try {
        // In a real app we'd parse ?from= and ?to= query params
        // const { searchParams } = new URL(request.url);

        await dbConnect();

        // Fetch relevant posts (Approved, Scheduled, Posted)
        // You might want to filter by date range here
        const posts = await PostModel.find({
            status: { $in: ['SCHEDULED', 'POSTED'] }
        }).populate('campaignId'); // Assuming we setup ref population, but we only need post data for the event typically

        const events: CalendarEvent[] = posts.map((post: any) => ({
            id: post._id.toString(),
            title: post.content.caption.substring(0, 30) + '...', // Simple title derivation
            start: post.scheduledTime || post.createdAt, // Fallback if needed
            status: post.status,
            thumbnail: post.content.imageUrl,
            platform: post.platform
        }));

        return NextResponse.json({ events });

    } catch (error) {
        console.error("Calendar Fetch Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
