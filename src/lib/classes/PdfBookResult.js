/**
 * Class representing a PDF book search result
 */
export class PdfBookResult {
 
  /**
   * Create a PdfBookResult
   * @param {string} bookTitle - The title of the book (e.g., "01PsychiatricStudies")
   * @param {number} pageNum - The page number (e.g., 36)
   * @param {string} sentence - The sentence found (e.g., "The quick brown fox jumps over the lazy dog.")
   * @param {string} text - The page text (same as sentence for now, adjust if needed)
   */
  constructor(bookTitle, pageNum, sentence, text) {
    this._bookTitle = bookTitle; // e.g., "01PsychiatricStudies"
    this._pageNum = pageNum;     // e.g., 36
    this._sentence = sentence;       // e.g., "The quick brown fox jumps over the lazy dog."
    this._pageText = text;       // Same as sentence for now, adjust if needed
    this._isChecked = false;
  }

  /**
   * Get the book title
   * @returns {string} The book title
   */
  get bookTitle() {
    return this._bookTitle;
  }

  /**
   * Set the book title
   * @param {string} value - The book title to set
   */
  set bookTitle(value) {
    this._bookTitle = value;
  }

  /**
   * Get the page number
   * @returns {number} The page number
   */
  get pageNum() {
    return this._pageNum;
  }

  /**
   * Set the page number
   * @param {number} value - The page number to set
   */
  set pageNum(value) {
      this._pageNum = value;
  }

  /**
   * Get the sentence
   * @returns {string} The sentence
   */
  get sentence() {
        return this._sentence;
 }

  /**
   * Set the sentence
   * @param {string} value - The sentence to set
   */
  set sentence(value) {
      this._sentence = value;
  }

  /**
   * Get the page text
   * @returns {string} The page text
   */
  get pageText() {
      return this._pageText;
  }

  /**
   * Set the page text
   * @param {string} value - The page text to set
   */
  set pageText(value) {
      this._pageText = value;
  }

  /**
   * Get the checked status
   * @returns {boolean} Whether the result is checked
   */
  get isChecked() {
    return this._isChecked;
  }

  /**
   * Set the checked status
   * @param {boolean} value - The checked status to set
   */
  set isChecked(value) {  
    this._isChecked = value;
  }
  
  /**
   * Get a string representation of the result
   * @returns {string} A formatted string displaying the book title, page number, and sentence
   */
  // Optional: Method to display the result
  toString() {
    return `${this.bookTitle} - Page ${this.pageNum}: ${this.sentence}`;
  }
}