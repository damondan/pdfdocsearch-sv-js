// api/test-hardcoded.js
import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  // TEMPORARILY hardcode the working connection string
  const uri = "mongodb+srv://damon5185:YOUR_ACTUAL_PASSWORD@clustersearchpdf.37gzhel.mongodb.net/pdf_search_db?retryWrites=true&w=majority";
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('pdf_search_db');
    const collections = await db.listCollections().toArray();
    await client.close();
    
    return res.json({ success: true, collections: collections.length });
  } catch (error) {
    return res.json({ error: error.message });
  }
}
