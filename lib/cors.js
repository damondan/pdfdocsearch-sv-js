// lib/cors.js - CORS Helper for Serverless Functions
/**
 * Set CORS headers for API responses
 * @param {import('http').ServerResponse} res - The response object
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or specify your domains
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Search-ID');
}

/**
 * Handle CORS preflight requests
 * @param {import('http').IncomingMessage} req - The request object
 * @param {import('http').ServerResponse} res - The response object
 * @returns {boolean} - Returns true if preflight was handled
 */
function handleCors(req, res) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // Preflight handled
  }
  
  return false; // Continue with normal request
}

module.exports = { setCorsHeaders, handleCors };
