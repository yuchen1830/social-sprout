import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { AssetModel } from '@/lib/models';
import { AssetTypeEnum } from '@/lib/contracts';

// Simple mock upload for MVP
// In a real app, this would upload to S3/Blob storage
export async function POST(request: Request) {
    try {
        await dbConnect();

        // Use formData() to handle file uploads
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // For MVP: We'll just create a mock URL based on the filename
        // In a real implementation: upload to cloud storage > get URL
        const mockUrl = `https://mock-storage.com/${file.name}-${Date.now()}`;

        // Create Asset Record
        const asset = await AssetModel.create({
            url: mockUrl,
            type: 'IMAGE', // Default to image for this feature
        });

        return NextResponse.json({
            id: asset._id,
            url: asset.url
        }, { status: 201 });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
