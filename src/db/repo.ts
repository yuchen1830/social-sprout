// Native MongoDB Driver Repository
import { Campaign, Post } from "../../lib/contracts";
import { getDb } from "../../lib/db";

export class Database {
    // Singleton
    private static instance: Database;
    private constructor() { }
    static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    private get collection() {
        return {
            campaigns: getDb().collection<Campaign>('campaigns'),
            posts: getDb().collection<Post>('posts')
        };
    }

    // Campaign Ops
    async saveCampaign(campaign: Campaign): Promise<void> {
        await this.collection.campaigns.updateOne(
            { id: campaign.id },
            { $set: campaign },
            { upsert: true }
        );
        console.log(`[DB] Saved campaign ${campaign.id}`);
    }

    async getCampaign(id: string): Promise<Campaign | undefined> {
        const campaign = await this.collection.campaigns.findOne({ id });
        return campaign || undefined;
    }

    // Post Ops
    async savePost(post: Post): Promise<void> {
        await this.collection.posts.updateOne(
            { id: post.id },
            { $set: post },
            { upsert: true }
        );
        console.log(`[DB] Saved post ${post.id}`);
    }

    async getPostsByCampaign(campaignId: string): Promise<Post[]> {
        return await this.collection.posts.find({ campaignId }).toArray();
    }
}

