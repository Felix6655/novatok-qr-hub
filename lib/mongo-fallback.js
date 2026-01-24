// MongoDB fallback when Supabase is not configured
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME || 'novatok_qr_hub';

let client = null;
let db = null;

export async function getMongoDb() {
  if (!mongoUrl) {
    return null;
  }
  
  if (!client) {
    client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db(dbName);
  }
  
  return db;
}

// Simple in-memory store for demo mode (when no DB is configured)
let memoryStore = {
  users: [],
  qr_codes: [],
  qr_events: []
};

export function getMemoryStore() {
  return memoryStore;
}

// Demo user session
export function getDemoUser() {
  return {
    id: 'demo-user-' + uuidv4().substring(0, 8),
    email: 'demo@novatok.app',
    isDemo: true
  };
}
