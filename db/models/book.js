//const { getCollection } = require('../connection');
import { getCollection } from '../../lib/mongodb.js';

const COLLECTION = 'books';

async function getSubjects() {
  const collection = await getCollection(COLLECTION);
  console.log("In getSubjects and returns distinct subject" +
    "which is a field in books table");
  return collection.distinct('subject');
}

// Get book titles by subject
async function getBookTitlesBySubject(subject) {
  const collection = await getCollection(COLLECTION);
  const books = await collection.find({ subject }, { projection: { bookTitle: 1 } }).toArray();
  return books.map(book => book.bookTitle);
}

async function getBooksBySubject(subject) {
  const collection = await getCollection(COLLECTION);
  return collection.find({ subject }).toArray();
}

async function upsertBook(bookData) {
  const collection = await getCollection(COLLECTION);
  
  const { subject, bookTitle } = bookData;
  
  return collection.updateOne(
    { subject, bookTitle },
    { $set: { ...bookData, updatedAt: new Date() } },
    { upsert: true }
  );
}

export {
  getSubjects,
  getBooksBySubject,
  getBookTitlesBySubject,
  upsertBook
};