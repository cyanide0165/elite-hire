import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const mongoUrl = process.env.MONGODB_URI;
  
  if (!mongoUrl) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(mongoUrl);
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db();
  return cachedDb;
}

export async function closeMongoDb(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}
