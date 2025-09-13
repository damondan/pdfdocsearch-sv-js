// lib/mongodb.js - Serverless MongoDB Connection (replaces db/connection.js)
import { MongoClient, ServerApiVersion } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB with connection caching for serverless
 * @returns {Promise<import('mongodb').Db>}
 */
async function connect() {
  if (cachedDb) {
    return cachedDb;
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Use your database name
    const db = client.db(process.env.MONGODB_DATABASE || 'pdf_search_db');

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Get collection from cached database connection
 * @param {string} collectionName 
 * @returns {Promise<import('mongodb').Collection>}
 */
async function getCollection(collectionName) {
  const database = await connect();
  return database.collection(collectionName);
}

/**
 * Close MongoDB connection (mainly for cleanup)
 */
async function close() {
  console.log("Closing MongoDB connection");
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}

export { connect, getCollection, close };
