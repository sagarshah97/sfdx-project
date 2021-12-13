import { LightningElement, track } from "lwc";

export default class VerifyCardDetailsScreen extends LightningElement {
  @track openCardModal = false;
  @track paymentDetails;

  openVerifyCard() {
    this.openCardModal = true;
  }

  closeModal(event) {
    this.openCardModal = false;
    if (!event.detail.discard) {
      this.paymentDetails = JSON.stringify(event.detail.record, null, 4);
    }
  }
}