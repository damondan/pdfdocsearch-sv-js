import { searchPages } from '../../../db/models/page.js';

/**
 * SvelteKit API route handler for searching PDFs
 * @param {Object} params - SvelteKit request parameters
 * @param {Request} params.request - Web API Request object
 */
export async function POST({ request }) {
  try {
    console.log("In backend searchquery");
    
    const requestBody = await request.json();
    const { selectedSubject, searchQuery, pdfBookTitles } = requestBody;
    
    if (!selectedSubject || !searchQuery || !pdfBookTitles) {
      return new Response(JSON.stringify({ 
        error: 'Missing selectedSubject, searchQuery, or pdfBookTitles' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (pdfBookTitles.length > 40) {
      return new Response(JSON.stringify({ 
        error: 'Too many titles, max 25 allowed' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const results = await searchPages(selectedSubject, searchQuery, pdfBookTitles);
    const total = Object.values(results).reduce((sum, pages) => sum + pages.length, 0);

    return new Response(JSON.stringify({
      message: 'Search completed',
      results, 
      total,
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('API Error processing search:', error);
    return new Response(JSON.stringify({ error: 'Failed to process search' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}