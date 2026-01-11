import { MongoClient, Db } from 'mongodb';
import dns from 'node:dns';

const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/social-sprout';
const fallbackUri = process.env.MONGODB_URI_FALLBACK || 'mongodb://127.0.0.1:27017/social-sprout';
const dbName = process.env.MONGODB_DB || 'social-sprout';

const configuredDnsServers = process.env.MONGODB_DNS_SERVERS
    ?.split(',')
    .map(s => s.trim())
    .filter(Boolean);

if (configuredDnsServers && configuredDnsServers.length > 0) {
    dns.setServers(configuredDnsServers);
    console.log(`MongoDB DNS servers set (${configuredDnsServers.join(',')})`);
}

let client: MongoClient | null = null;
let db: Db | null = null;

async function connectWithUri(uri: string) {
    const nextClient = new MongoClient(uri);
    await nextClient.connect();
    return nextClient;
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
    if (client && db) {
        return { client, db };
    }

    const urisToTry = [primaryUri, ...(primaryUri === fallbackUri ? [] : [fallbackUri])];
    let lastError: unknown = null;

    for (const uri of urisToTry) {
        const tag = uri === primaryUri ? 'primary' : 'fallback';
        try {
            const nextClient = await connectWithUri(uri);
            client = nextClient;
            db = client.db(dbName);
            console.log(`Connected to MongoDB (${tag} URI)`);
            return { client, db };
        } catch (error) {
            lastError = error;
            console.error(`MongoDB connection failed for ${tag} URI`, error);
        }
    }

    throw lastError instanceof Error ? lastError : new Error('Failed to connect to MongoDB');
}

export function getDb(): Db {
    if (!db) {
        throw new Error('Database not initialized. Call connectToDatabase first.');
    }
    return db;
}
