import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/shopease';
const client = new MongoClient(uri);

let db = null;

export async function connectDb() {
  if (db) return db;
  await client.connect();
  db = client.db();          // uses DB name from the URI
  console.log(`✅ Connected to MongoDB: ${db.databaseName}`);
  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not connected. Call connectDb() first.');
  return db;
}
