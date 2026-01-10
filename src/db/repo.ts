// Basic In-Memory DB (Stub)
import { Campaign, Post } from "../../lib/contracts";

export class Database {
    private campaigns: Map<string, Campaign> = new Map();
    private posts: Map<string, Post> = new Map();

    // Singleton
    private static instance: Database;
    private constructor() { }
    static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    // Campaign Ops
    async saveCampaign(campaign: Campaign): Promise<void> {
        this.campaigns.set(campaign.id, campaign);
        console.log(`[DB] Saved campaign ${campaign.id}`);
    }

    async getCampaign(id: string): Promise<Campaign | undefined> {
        return this.campaigns.get(id);
    }

    // Post Ops
    async savePost(post: Post): Promise<void> {
        this.posts.set(post.id, post);
        console.log(`[DB] Saved post ${post.id}`);
    }

    async getPostsByCampaign(campaignId: string): Promise<Post[]> {
        return Array.from(this.posts.values()).filter(p => p.campaignId === campaignId);
    }
}
