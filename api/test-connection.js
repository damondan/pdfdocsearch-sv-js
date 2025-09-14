import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    // Attempt connection
    await client.connect();
    
    // Test basic operation
    const db = client.db(process.env.MONGODB_DATABASE);
    const collections = await db.listCollections().toArray();
    
    await client.close();
    
    return res.status(200).json({
      success: true,
      database: process.env.MONGODB_DATABASE,
      collectionsCount: collections.length,
      collections: collections.map(c => c.name)
    });
    
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      code: error.code,
      codeName: error.codeName
    });
  }
}