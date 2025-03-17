export class PdfBookResult {
 
  constructor(bookTitle, pageNum, sentence,text) {
    this._bookTitle = bookTitle; // e.g., "01PsychiatricStudies"
    this._pageNum = pageNum;     // e.g., 36
    this._sentence = sentence;       // e.g., "The quick brown fox jumps over the lazy dog."
    this._pageText = text;       // Same as sentence for now, adjust if needed
    this._isChecked = false;
  }

  get bookTitle() {
    return this._bookTitle;
  }
  set bookTitle(value) {
    this._bookTitle = value;
  }
  get pageNum() {
    return this._pageNum;
  }
  set pageNum(value) {
      this._pageNum = value;
  }
  get sentence() {
        return this._sentence;
 }
  set sentence(value) {
      this._sentence = value;
  }
  get pageText() {
      return this._pageText;
  }
  set pageText(value) {
      this._pageText = value;
  }
  get isChecked() {
    return this._isChecked;
  }
  set isChecked(value) {  
    this._isChecked = value;
  }
  
  // Optional: Method to display the result
  toString() {
    return `${this.bookTitle} - Page ${this.pageNum}: ${this.sentence}`;
  }
}