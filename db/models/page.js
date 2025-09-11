//const { getCollection } = require('../connection');
import { getCollection } from '../../lib/mongodb';

// Collection name
const COLLECTION = 'pages';

async function searchPages(subject, searchQuery, bookTitles) {
  const collection = await getCollection(COLLECTION);
  
  const wordRegex = new RegExp(`\\b${searchQuery}\\b`, 'i');
  
  const query = {
    subject: subject,
    bookTitle: { $in: bookTitles },
    text: wordRegex
  };
  
  const pages = await collection.find(query).toArray();
  
  const results = {};
  
  for (const page of pages) {
    const { bookTitle, pageNum, text } = page;
    
    if (!results[bookTitle]) {
      results[bookTitle] = [];
    }
    
    results[bookTitle].push({ pageNum, text });
  }
  
  const firstText = Object.values(results)[0][0].text;
  console.log("First text of book one is " + firstText);
  return results;
}

async function createIndexes() {
  const collection = await getCollection(COLLECTION);
  
  await collection.createIndex({ subject: 1, bookTitle: 1, pageNum: 1 }, { unique: true });
  
  // Create text index for efficient searching
  await collection.createIndex({ text: 1 });
  
  console.log('Page indexes created');
}

async function upsertPage(pageData) {
  const collection = await getCollection(COLLECTION);
  
  const { subject, bookTitle, pageNum } = pageData;
  
  return collection.updateOne(
    { subject, bookTitle, pageNum },
    { $set: { ...pageData, updatedAt: new Date() } },
    { upsert: true }
  );
}

exports = {
  upsertPage,
  searchPages,
  createIndexes
};
