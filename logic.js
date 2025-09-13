import { getSubjects, getBookTitlesBySubject } from './db/models/book.js';
import { searchPages } from './db/models/page.js';

async function getSubjectsData() {
  try {
    const subjects = await getSubjects();
    return subjects;
  } catch (error) {
    console.error('Error getting subjects from MongoDB:', error);
    return [];
  }
}

async function getPdfBookTitles(subject) {
  try {
    const titles = await getBookTitlesBySubject(subject);
    return titles;
  } catch (error) {
    console.error(`Error getting PDF titles for ${subject} from MongoDB:`, error);
    return [];
  }
}

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