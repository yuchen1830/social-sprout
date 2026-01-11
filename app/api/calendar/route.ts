import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { CalendarEvent } from "@/lib/contracts"; // We'll map Post to CalendarEvent

export async function GET(request: Request) {
    try {
        // In a real app we'd parse ?from= and ?to= query params
        // const { searchParams } = new URL(request.url);

        const { db } = await connectToDatabase();

        // Fetch relevant posts (Approved, Scheduled, Posted)
        // You might want to filter by date range here
        const posts = await db.collection("posts")
            .find({ status: { $in: ["SCHEDULED", "POSTED"] } })
            .toArray();

        const events: CalendarEvent[] = posts.map((post: any) => ({
            id: post._id.toString(),
            title: (post.content?.caption || "").substring(0, 30) + "...",
            start: post.scheduledTime || post.createdAt || new Date().toISOString(),
            status: post.status,
            thumbnail: post.content?.imageUrl,
            platform: post.platform,
        }));

        return NextResponse.json({ events });

    } catch (error) {
        console.error("Calendar Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
