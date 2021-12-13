import { LightningElement, track } from "lwc";

export default class DisplayBooksScreen extends LightningElement {
  @track openCardModal = false;

  @track bookData;

  openVerifyCard() {
    this.openCardModal = true;
  }

  closeModal() {
    this.openCardModal = false;
  }

  showData(event) {
    const bookData = event.detail.book;
    if (bookData) {
      this.bookData = JSON.stringify(bookData, null, 4);
    }
  }
}