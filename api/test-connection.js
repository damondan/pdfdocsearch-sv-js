export default async function handler(req, res) {
  try {
    // Log what Vercel actually has
    const uri = process.env.MONGODB_URI;
    const db = process.env.MONGODB_DATABASE;
    
    return res.status(200).json({
      hasUri: !!uri,
      hasDb: !!db,
      uriStart: uri ? uri.substring(0, 20) + '...' : 'undefined',
      dbName: db || 'undefined'
    });
    
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
