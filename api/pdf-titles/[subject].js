// api/pdf-titles/[subject].js - GET /api/pdf-titles/:subject endpoint
import { handleCors } from require('../../lib/cors');
import { getPdfBookTitles } from require('../../logic');

/**
 * Serverless function to get PDF titles by subject
 * @param {import('http').IncomingMessage} req 
 * @param {import('http').ServerResponse} res 
 */
export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method === 'GET') {
    try {
      // Get subject from query params (Vercel provides route params here)
      const { subject } = req.query;
      
      if (!subject) {
        return res.status(400).json({ error: 'Subject parameter is required' });
      }

      const pdfTitles = await getPdfBookTitles(subject);
      return res.status(200).json(pdfTitles);
    } catch (error) {
      console.error(`API Error fetching PDF titles for ${req.query.subject}:`, error);
      return res.status(500).json({ error: 'Failed to fetch PDF titles' });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
