import { LightningElement, track } from "lwc";

export default class ExpenseTrackerScreen extends LightningElement {
  @track openCardModal = false;
  @track data;

  openVerifyCard() {
    this.openCardModal = true;
  }

  closeModal() {
    this.openCardModal = false;
  }

  showData(event) {
    const reportData = event.detail.data;
    if (reportData) {
      this.data = JSON.stringify(reportData, null, 4);
    }
  }
}