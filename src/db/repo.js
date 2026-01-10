"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
class Database {
    constructor() {
        this.campaigns = new Map();
        this.posts = new Map();
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    // Campaign Ops
    async saveCampaign(campaign) {
        this.campaigns.set(campaign.id, campaign);
        console.log(`[DB] Saved campaign ${campaign.id}`);
    }
    async getCampaign(id) {
        return this.campaigns.get(id);
    }
    // Post Ops
    async savePost(post) {
        this.posts.set(post.id, post);
        console.log(`[DB] Saved post ${post.id}`);
    }
    async getPostsByCampaign(campaignId) {
        return Array.from(this.posts.values()).filter(p => p.campaignId === campaignId);
    }
}
exports.Database = Database;
