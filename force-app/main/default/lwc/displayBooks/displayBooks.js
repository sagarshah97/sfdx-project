import { LightningElement } from "lwc";

const QUERY_URL =
  "https://www.googleapis.com/books/v1/volumes?langRestrict=en&q=";

export default class DisplayBooks extends LightningElement {
  selectedBook;
  searchKey;
  books;
  error;
  loading = false;

  handleChange(event) {
    this.searchKey = event.target.value;
  }

  handleSearchClick() {
    this.loading = true;
    // The Fetch API is currently not polyfilled for usage in IE11.
    // Use XMLHttpRequest instead in that case.
    fetch(QUERY_URL + this.searchKey)
      .then((response) => {
        // fetch isn't throwing an error if the request fails.
        // Therefore we have to check the ok property.
        // The thrown error will be catched on the catch() method
        if (!response.ok) {
          throw Error(response);
        } else {
          return response.json();
        }
      })
      .then((jsonResponse) => {
        this.books = jsonResponse;
        this.loading = false;
        console.log(this.books);
      })
      .catch((error) => {
        this.error = error;
        this.books = undefined;
        this.loading = false;
      });
  }

  handleSelection(event) {
    this.selectedBook = this.books.items.find(
      (obj) => obj.id == event.target.value
    );
    if (this.selectedBook) {
      this.sendOutput();
    }
  }

  sendOutput() {
    let output = { book: this.selectedBook };
    this.dispatchEvent(
      new CustomEvent("pass", {
        detail: output
      })
    );
  }
}