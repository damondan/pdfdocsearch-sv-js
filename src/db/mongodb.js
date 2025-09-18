// lib/mongodb.js - Serverless MongoDB Connection
import { MongoClient } from 'mongodb';

/**
 * @type {string} MONGODB_URI
 * @constant
 * @readonly
 */
  const MONGODB_URI = "mongodb+srv://damon5185:D27934GvIkHalIef@clustersearchpdf.37gzhel.mongodb.net/?retryWrites=true&w=majority&appName=ClusterSearchPdf"

  /**
 * @type {string} MONGODB_DATABASE
 * @constant
 * @readonly
 */

  const MONGODB_DATABASE = "pdf_search_db";

/**
 * Cached MongoDB client instance for connection reuse
 * @type {import('mongodb').MongoClient|null}
 */
let cachedClient = null;

/**
 * Cached MongoDB database instance for connection reuse
 * @type {import('mongodb').Db|null}
 */
let cachedDb = null;

/**
 * Connect to MongoDB with connection caching for serverless
 * @returns {Promise<import('mongodb').Db>} MongoDB database instance
 * @throws {Error} When MONGODB_URI environment variable is not defined
 * @throws {Error} When connection to MongoDB fails
 */
async function connect() {
  // if (cachedDb && !process.env.MONGODB_URI) {
  //   console.log('Reusing cached MongoDB connection');
  //   return cachedDb;
  // }

  // if (!process.env.MONGODB_URI) {
  //   throw new Error('MONGODB_URI is not defined in environment variables');
  // }

  //const client = new MongoClient(process.env.MONGODB_URI);
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    // Use the same database selection logic that worked
    //const db = client.db(process.env.MONGODB_DATABASE);
    const db = client.db(MONGODB_DATABASE);

        const adminDb = client.db().admin();
    const dbList = await adminDb.listDatabases();
    console.log('Available databases:', dbList.databases.map(db => db.name));
    const collections = await db.listCollections().toArray();
    console.log('Collections in', MONGODB_DATABASE + ':', collections.map(col => col.name));

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
 * @param {string} collectionName The name of the collection to retrieve
 * @returns {Promise<import('mongodb').Collection>} MongoDB collection instance
 * @throws {Error} When collection name is not provided
 * @throws {Error} When database connection fails
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
 * @returns {Promise<void>}
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