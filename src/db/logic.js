import { getSubjects, getBookTitlesBySubject } from '../db/models/book.js';
import { searchPages } from '../db/models/page.js';

/**
 * Get all subjects from the books collection
 * @returns {Promise<string[]>} Array of subject names, or empty array on error
 */
async function getSubjectsData() {
  try {
    const subjects = await getSubjects();
    return subjects;
  } catch (error) {
    console.error('Error getting subjects from MongoDB:', error);
    return [];
  }
}

/**
 * Get PDF book titles for a specific subject
 * @param {string} subject The subject to get book titles for
 * @returns {Promise<string[]>} Array of book titles, or empty array on error
 */
async function getPdfBookTitles(subject) {
  try {
    const titles = await getBookTitlesBySubject(subject);
    return titles;
  } catch (error) {
    console.error(`Error getting PDF titles for ${subject} from MongoDB:`, error);
    return [];
  }
}

/**
 * Search for text across PDF pages within specified books and subject
 * @param {string} selectedSubject The subject to search within
 * @param {string} searchQuery The text to search for
 * @param {string[]} pdfBookTitles Array of book titles to search
 * @returns {Promise<Object.<string, Array<{pageNum: number, text: string}>>>} Search results grouped by book title, or empty object on error
 */
async function searchPdfs(selectedSubject, searchQuery, pdfBookTitles) {
  try {
    if (!pdfBookTitles || pdfBookTitles.length === 0) {
      return {};
    }
    
    const results = await searchPages(selectedSubject, searchQuery, pdfBookTitles);

    return results;
  } catch (error) {
    console.error(`Error searching PDFs in MongoDB:`, error);
    return {};
  }
}

export { getSubjectsData, getPdfBookTitles, searchPdfs };