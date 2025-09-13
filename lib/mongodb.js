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
    // Explicitly enable TLS for Atlas
    tls: true,
    // Timeout settings to handle serverless network issues
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    // Connection pool settings for serverless
    maxPoolSize: 10,
    minPoolSize: 1,
    // Retry writes for Atlas
    retryWrites: true,
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    console.log('Attempting MongoDB connection with URI:', process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')); // Mask password
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