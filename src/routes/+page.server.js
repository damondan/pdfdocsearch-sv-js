// src/routes/+page.server.js - Direct database access
import { getSubjects } from '../db/models/book.js';

/**
 * Loads PDF subjects data directly from database
 * @returns {Promise<Object>} Object containing the PDF subjects data
 */
export async function load() {
  try {
    const dataPdfSubjects = await getSubjects();
    return { dataPdfSubjects };
  } catch (error) {
    console.error('Load function error:', error);
    return { dataPdfSubjects: [] };
  }
}