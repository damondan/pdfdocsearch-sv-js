// api/subjects.js - GET /api/subjects endpoint
const { handleCors } = require('../lib/cors');
const { getSubjectsData } = require('../logic');

/**
 * Serverless function to get all subjects
 * @param {import('http').IncomingMessage} req 
 * @param {import('http').ServerResponse} res 
 */
export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method === 'GET') {
    try {
      const subjects = await getSubjectsData();
      return res.status(200).json(subjects);
    } catch (error) {
      console.error('API Error fetching subjects:', error);
      return res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
