// src/routes/+page.server.js

/**
 * Loads PDF subjects data for the page
 * @param {Object} params - The load function parameters
 * @param {Function} params.fetch - The fetch function
 * @returns {Promise<Object>} Object containing the PDF subjects data
 */
export async function load({ fetch }) {
  console.log("Load Fetch");
  const response = await fetch('http://localhost:3001/api/subjects');
  const dataPdfSubjects = await response.json();

  return {
    dataPdfSubjects // Directly return the data, no "props" wrapper
  };
}
