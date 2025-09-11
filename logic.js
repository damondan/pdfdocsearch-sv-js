const bookModel = require('./db/models/book');
const pageModel = require('./db/models/page');

async function getSubjectsData() {
  try {
    const subjects = await bookModel.getSubjects();
    return subjects;
  } catch (error) {
    console.error('Error getting subjects from MongoDB:', error);
    return [];
  }
}

async function getPdfBookTitles(subject) {
  try {
    const titles = await bookModel.getBookTitlesBySubject(subject);
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
    
    const results = await pageModel.searchPages(selectedSubject, searchQuery, pdfBookTitles);

    return results;
  } catch (error) {
    console.error(`Error searching PDFs in MongoDB:`, error);
    return {};
  }
}

module.exports = { getSubjectsData, getPdfBookTitles, searchPdfs };