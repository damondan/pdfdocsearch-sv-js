import { getPdfBookTitles } from '../../../../db/logic.js';

/**
 * SvelteKit API route handler for getting PDF titles by subject
 * @param {Object} params - SvelteKit request parameters
 * @param {Request} params.request - Web API Request object
 * @param {Object} params.params - Route parameters
 * @param {string} params.params.subject - Subject parameter from URL
 */
export async function GET({ request, params }) {
  try {
    const { subject } = params;
    
    if (!subject) {
      return new Response(JSON.stringify({ error: 'Subject parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pdfTitles = await getPdfBookTitles(subject);
    
    return new Response(JSON.stringify(pdfTitles), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error(`API Error fetching PDF titles for ${params.subject}:`, error);
    return new Response(JSON.stringify({ error: 'Failed to fetch PDF titles' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}