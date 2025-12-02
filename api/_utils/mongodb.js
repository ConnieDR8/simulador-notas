// api/_utils/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://202210036_db_user:ArquiProyecto@cluster0.bwxzc5x.mongodb.net/BDNotasSimuladas?retryWrites=true&w=majority";

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
};

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(uri, options);
  const db = client.db('BDNotasSimuladas');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getDatabase() {
  const { db } = await connectToDatabase();
  return db;
}