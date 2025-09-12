export default async function handler(req, res) {
  try {
    // Test 1: Basic function works
    console.log("Function started");
    
    // Test 2: Environment variables exist
    const hasUri = !!process.env.MONGODB_URI;
    const hasDb = !!process.env.MONGODB_DATABASE;
    
    // Test 3: Try MongoDB connection
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    
    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE);
    const collections = await db.listCollections().toArray();
    await client.close();
    
    return res.status(200).json({
      message: "All tests passed",
      envVars: { hasUri, hasDb },
      collections: collections.map(c => c.name)
    });
    
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
