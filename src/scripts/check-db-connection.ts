
import { connectToDatabase } from "../lib/db";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

// Load .env manually since dotenv might not be installed
try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
        console.log("📂 Found .env file, loading variables...");
        const envConfig = fs.readFileSync(envPath, "utf-8");
        envConfig.split("\n").forEach(line => {
            const [key, ...valueParts] = line.split("=");
            if (key && valueParts.length > 0) {
                const value = valueParts.join("=").trim();
                if (key.trim() && !process.env[key.trim()]) {
                    process.env[key.trim()] = value.replace(/^["']|["']$/g, ''); // Remove quotes if present
                }
            }
        });
    }
} catch (error) {
    console.warn("⚠️ Failed to load .env file manually:", error);
}

async function checkConnection() {
    console.log("🚀 Starting Native MongoDB Connection Check...");

    try {
        const { db } = await connectToDatabase();

        const testId = uuidv4();
        const testCampaign = {
            _id: testId,
            id: testId,
            brandName: "Social Sprout Native Test",
            brandCategory: "Technology",
            goal: "Native Connection Check",
            platforms: ["Twitter"],
            status: "DRAFT",
            createdAt: new Date().toISOString()
        };

        // 3. Create
        console.log("📝 Attempting to save test campaign...");
        await db.collection('campaigns').insertOne(testCampaign);
        console.log("✅ Successfully saved campaign!");

        // 4. Verify Read
        const found = await db.collection('campaigns').findOne({ _id: testId });
        if (found) {
            console.log("✅ Successfully read back campaign!");
        } else {
            throw new Error("Could not read back the campaign.");
        }

        // Cleanup
        await db.collection('campaigns').deleteOne({ _id: testId });
        console.log("🧹 Cleaned up test data.");

    } catch (error: any) {
        console.error("❌ Database Operation Failed!");
        console.error(`   Message: ${error.message || error}`);
    } finally {
        process.exit(0);
    }
}

checkConnection();

