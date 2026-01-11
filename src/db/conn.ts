import { connectToDatabase } from '../../lib/db';

export const connectDB = async () => {
    try {
        await connectToDatabase();
    } catch (error: any) {
        console.error("❌ MongoDB Connection Error:", error.message || error);
        process.exit(1);
    }
};

