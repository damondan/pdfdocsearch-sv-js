// lib/mongodb.js - Serverless MongoDB Connection
import { MongoClient, ServerApiVersion } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB with connection caching for serverless
 * @returns {Promise<import('mongodb').Db>}
 */
async function connect() {
  if (cachedDb) {
    console.log('Reusing cached MongoDB connection');
    return cachedDb;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

const client = new MongoClient(process.env.MONGODB_URI, {
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  tlsInsecure: false,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    // Use database name from env or default
    const db = client.db(process.env.MONGODB_DATABASE || 'pdf_search_db');

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Reset cache on error to allow retry
    cachedClient = null;
    cachedDb = null;
    throw error;
  }
}

/**
 * Get collection from cached database connection
 * @param {string} collectionName
 * @returns {Promise<import('mongodb').Collection>}
 */
async function getCollection(collectionName) {
  if (!collectionName) {
    throw new Error('Collection name is required');
  }
  const database = await connect();
  return database.collection(collectionName);
}

/**
 * Close MongoDB connection (mainly for cleanup in non-serverless contexts)
 */
async function close() {
  console.log('Closing MongoDB connection');
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}

export { connect, getCollection, close };