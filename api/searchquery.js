// api/searchquery.js - POST /api/searchquery endpoint
const { handleCors } = require('../lib/cors');
const { searchPdfs } = require('../logic');

/**
 * Serverless function to search PDFs
 * @param {import('http').IncomingMessage} req 
 * @param {import('http').ServerResponse} res 
 */
export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method === 'POST') {
    try {
      console.log("In backend searchquery");
      const { selectedSubject, searchQuery, pdfBookTitles } = req.body;
      
      if (!selectedSubject || !searchQuery || !pdfBookTitles) {
        return res.status(400).json({ 
          error: 'Missing selectedSubject, searchQuery, or pdfBookTitles' 
        });
      }

      if (pdfBookTitles.length > 40) {
        return res.status(400).json({ 
          error: 'Too many titles, max 25 allowed' 
        });
      }

      // Note: Vercel functions have a 10-second timeout on hobby plan
      // Consider upgrading if searches take longer
      
      const results = await searchPdfs(selectedSubject, searchQuery, pdfBookTitles);
      const total = Object.values(results).reduce((sum, pages) => sum + pages.length, 0);

      return res.status(200).json({
        message: 'Search completed',
        results, 
        total,
      });
    } catch (error) {
      console.error('API Error processing search:', error);
      return res.status(500).json({ error: 'Failed to process search' });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
