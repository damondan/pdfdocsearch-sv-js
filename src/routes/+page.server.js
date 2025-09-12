// src/routes/+page.server.js

/**
 * Loads PDF subjects data for the page
 * @param {Object} params - The load function parameters
 * @param {Function} params.fetch - The fetch function
 * @returns {Promise<Object>} Object containing the PDF subjects data
 */
export async function load({ fetch }) {
  //for local
  //const response = await fetch('http://localhost:3001/api/subjects');
  try {
    const response = await fetch('/api/subjects');
    
    if (!response.ok) {
      console.log('API response not ok:', response.status);
      return { dataPdfSubjects: [] }; // Return empty array on error
    }
    
    const dataPdfSubjects = await response.json();
    return { dataPdfSubjects };
    
  } catch (error) {
    console.error('Load function error:', error);
    return { dataPdfSubjects: [] }; // Return empty array on error
  }
}
