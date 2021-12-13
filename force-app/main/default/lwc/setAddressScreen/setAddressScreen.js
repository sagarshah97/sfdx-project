import { LightningElement, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class SetAddressScreen extends LightningElement {
  @track openCardModal = false;
  @track address;

  openVerifyCard() {
    this.openCardModal = true;
  }

  saveAddress(event) {
    this.address = JSON.stringify(event.detail.address, null, 4);
  }

  closeModal() {
    this.openCardModal = false;
  }

  saveDetails() {
    if (this.address) {
      this.openCardModal = false;
      this.showToast(
        "Success!",
        "Address details successfully added",
        "success"
      );
    } else {
      this.showToast("Error!", "Please provide complete details", "error");
    }
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title,
      message,
      variant,
      mode: "dismissable"
    });
    this.dispatchEvent(event);
  }
}