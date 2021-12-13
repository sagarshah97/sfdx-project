import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import customResources from "@salesforce/resourceUrl/customResources";
import getCardMetaData from "@salesforce/apex/GetCardBrandDetails.getCardMeta";

export default class VerifyCardDetails extends LightningElement {
  chosenOption;
  paymentRecordTypes = {
    card: "",
    bank: ""
  };

  label = {
    INVALID_CARD_NUMBER_ERROR: "Enter Valid Card Number",
    INVALID_CARD_EXPIRY: "Enter Valid Expiry Date MM/YY",
    INVALID_CVV_ERROR: "Enter Valid CVV",
    INVALID_ZIP_CODE_ERROR: "Enter a valid zip code",
    INVALID_ACCOUNT_NUMBER_ERROR: "Enter a valid account number",
    INVALID_BANK_ROUTING_NUMBER_ERROR: "Please enter valid routing number",
    CARD_EXPIRY_PAST_DATE_ERROR: "Card Expiry should not be in past"
  };

  @api recordTypeInfo = [
    { recordTypeApiName: "Card", recordTypeId: "001Card" },
    { recordTypeApiName: "Bank", recordTypeId: "001Bank" }
  ];

  @track paymentMethod = {
    type: null,
    recordTypeId: null,
    savePaymentMethod: true,
    cardType: null,
    cardBrand: null,
    cardNumber: null,
    cardLast4: null,
    cardExpires: null,
    cardCVV: null,
    cardZipCode: null,
    cardImgUrl: null,
    bankAccountNumber: null,
    bankAccountLast4: null,
    bankRoutingNumber: null,
    bankAccountType: null,
    bankName: null
  };

  @track showCardFormat = {
    cardBrand: "",
    cardPartition: [4, 4, 4, 4],
    cardLength: 16 + [4, 4, 4, 4].length - 1,
    cvvLength: 3,
    cardImgUrl: customResources + "/img/icon_defaultcard.svg"
  };

  @track wiredBankAccountTypes = {
    data: {
      values: [
        { label: "Checkings", value: "Checkings" },
        { label: "Savings", value: "Savings" }
      ]
    }
  };

  get isCard() {
    return this.chosenOption === "Card";
  }

  get isBank() {
    return this.chosenOption === "Bank";
  }

  get disableSave() {
    let result = true;

    const lightningCombobox = this.template.querySelector("lightning-combobox");
    const lightningInputs = Array.from(
      this.template.querySelectorAll("lightning-input")
    );
    if (lightningInputs.length !== 0) {
      result = !lightningInputs.every((element) => element.checkValidity());
      if (!result && lightningCombobox) {
        result = !lightningCombobox.checkValidity();
      }
    }

    return result;
  }

  get bankAccountTypePicklist() {
    let picklist = [];

    if (this.wiredBankAccountTypes.data !== undefined) {
      picklist = this.generatePicklist(this.wiredBankAccountTypes.data.values);
    }

    return picklist;
  }

  get isOptionSelected() {
    return this.chosenOption;
  }

  connectedCallback() {
    this.paymentRecordTypes.card = this.recordTypeInfo.find(
      (recordType) => recordType.recordTypeApiName === "Card"
    ).recordTypeId;
    this.paymentRecordTypes.bank = this.recordTypeInfo.find(
      (recordType) => recordType.recordTypeApiName === "Bank"
    ).recordTypeId;
  }

  generatePicklist(wiredList) {
    const picklist = [];

    wiredList.forEach((listItem) => {
      let picklistEntry = {
        value: listItem.value,
        label: listItem.label
      };
      picklist.push(picklistEntry);
    });

    return picklist;
  }

  //handles the event change for chosen option
  handleSelection(event) {
    this.chosenOption = event.target.value;

    this.resetPaymentRecord();

    this.paymentMethod.type = this.chosenOption;
    this.paymentMethod.recordTypeId =
      this.paymentRecordTypes[this.chosenOption];
  }

  resetPaymentRecord() {
    this.paymentMethod = {
      type: null,
      recordTypeId: null,
      savePaymentMethod: true,
      cardType: null,
      cardBrand: null,
      cardNumber: null,
      cardLast4: null,
      cardExpires: null,
      cardCVV: null,
      cardZipCode: null,
      cardImgUrl: null,
      bankAccountNumber: null,
      bankAccountLast4: null,
      bankRoutingNumber: null,
      bankAccountType: null,
      bankName: null
    };
  }

  //handle the change when other fields value changes
  handleChanges(event) {
    if (event.target.name === "savePaymentMethod") {
      this.paymentMethod[event.target.name] = event.target.checked;
    } else {
      this.paymentMethod[event.target.name] = event.target.value;
    }
  }

  //handle the change of card number value
  handleCardNumber(event) {
    if (event.target.value.length <= 3) {
      this.updateCardFormat(event.target.value);
    }
    if (event.key !== "Backspace" && event.key !== "Delete") {
      this.paymentMethod[event.target.name] = this.getupdatedInputFormat(
        event.target.value,
        this.showCardFormat.cardPartition
      );
    } else {
      this.paymentMethod[event.target.name] = event.target.value;
    }

    //if CVV is prefilled check if it is valid based on updated card format
    if (this.paymentMethod.cardCVV) {
      let cardCVVField = this.template.querySelector(".cardCVV");
      cardCVVField.reportValidity();
    }
  }

  //update the format of card based on card number value
  updateCardFormat(cardNumber) {
    getCardMetaData({ ccNumber: cardNumber })
      .then((result) => {
        const cardFormat = JSON.parse(JSON.stringify(result));
        cardFormat.cardImgUrl = this.getCardImgUrl(cardFormat.cardBrand);
        this.showCardFormat = cardFormat;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  //set the appropriate image icon for the credit card
  getCardImgUrl(cardBrand) {
    let cardImgUrl;

    if (cardBrand === "American Express") {
      cardImgUrl = customResources + "/img/icon_americanexpress.svg";
    } else if (cardBrand === "Mastercard") {
      cardImgUrl = customResources + "/img/icon_mastercard.svg";
    } else if (cardBrand === "Visa Card") {
      cardImgUrl = customResources + "/img/icon_visa.svg";
    } else {
      cardImgUrl = customResources + "/img/icon_defaultcard.svg";
    }

    return cardImgUrl;
  }

  //update the card number input to pretty format
  getupdatedInputFormat(cardNumber, pattern) {
    const numberValue = cardNumber.split(" ").join("");
    const reg = RegExp(this.constructRegex(pattern), "g");
    const result = reg
      .exec(numberValue)
      .filter((matchedString) => matchedString !== "");
    result.shift();
    return result.join(" ");
  }

  //return regex of the partition
  constructRegex(pattern) {
    let result = "";
    pattern.forEach((pat) => {
      result += `([0-9]{0,${pat}})`;
    });
    return result;
  }

  //handle when cardnumber input is not upto expected length
  reportCardNumberValidity() {
    const cardNumberField = this.template.querySelector(".cardNumber");
    if (cardNumberField.value.length != this.showCardFormat.cardLength) {
      cardNumberField.setCustomValidity(this.label.INVALID_CARD_NUMBER_ERROR);
    } else {
      cardNumberField.setCustomValidity("");
    }
    cardNumberField.reportValidity();
  }

  //handle the change of card expiry value
  handleCardExpires(event) {
    this.paymentMethod[event.target.name] = event.target.value;

    this.validateCardExpiry(event.target.value);
    this.formatCardExpiry(event);
  }

  //check if the entered card expiry value is valid
  validateCardExpiry(cardExpiryVal) {
    if (cardExpiryVal.length === 5) {
      const cardExpiresField = this.template.querySelector(".cardExpires");

      const [month, year] = cardExpiryVal.split("/");
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear().toString().substr(-2);
      if (year < currentYear || (year == currentYear && month < currentMonth)) {
        cardExpiresField.setCustomValidity(
          this.label.CARD_EXPIRY_PAST_DATE_ERROR
        );
      } else {
        cardExpiresField.setCustomValidity("");
      }
      cardExpiresField.reportValidity();
    }
  }

  //format the card expiry value on input
  formatCardExpiry(event) {
    const cardExpiryVal = event.target.value;
    if (cardExpiryVal.length == 2) {
      this.paymentMethod[event.target.name] = cardExpiryVal + "/";
    }
  }

  //handle the change of rounting number value
  handleRoutingNumber(event) {
    this.paymentMethod[event.target.name] = event.target.value;
    this.validateRoutingNumber(event.target.value);
  }

  //check if the entered rounting number is valid
  validateRoutingNumber(routingNum) {
    let routingField = this.template.querySelector(".bankRoutingNumber");

    let checkSum = 0;
    for (let i = 0; i < routingNum.length; i += 3) {
      checkSum +=
        parseInt(routingNum.charAt(i), 10) * 3 +
        parseInt(routingNum.charAt(i + 1), 10) * 7 +
        parseInt(routingNum.charAt(i + 2), 10);
    }

    if (checkSum != 0 && checkSum % 10 == 0) {
      routingField.setCustomValidity("");
    } else {
      routingField.setCustomValidity(
        this.label.INVALID_BANK_ROUTING_NUMBER_ERROR
      );
    }
    routingField.reportValidity();
  }

  //form output before passing the response
  formOutput() {
    if (this.paymentMethod.cardNumber) {
      this.paymentMethod.cardNumber = this.paymentMethod.cardNumber
        .split(" ")
        .join("");
      this.paymentMethod.cardLast4 = this.paymentMethod.cardNumber.slice(-4);
      this.paymentMethod.cardType = "Credit";
      this.paymentMethod.cardBrand = this.showCardFormat.cardBrand;
      this.paymentMethod.cardImgUrl = this.showCardFormat.cardImgUrl;
    }
    if (this.paymentMethod.bankAccountNumber) {
      this.paymentMethod.bankName = "Chase Bank";
      if (this.paymentMethod.bankAccountNumber.length > 4) {
        this.paymentMethod.bankAccountLast4 =
          this.paymentMethod.bankAccountNumber.slice(-4);
      }
    }
  }

  //handle save by passing JSON reponse
  handleSave() {
    this.formOutput();

    let output = { record: this.paymentMethod, discard: false };
    this.dispatchEvent(
      new CustomEvent("pass", {
        detail: output
      })
    );

    this.showToast();
  }

  //handle cancel to discard changes and close this component
  handleCancel() {
    let output = { discard: true };
    this.dispatchEvent(
      new CustomEvent("pass", {
        detail: output
      })
    );
  }

  //show toast
  showToast() {
    const event = new ShowToastEvent({
      title: "Success!",
      message: "Payment details successfully added",
      variant: "success",
      mode: "dismissable"
    });
    this.dispatchEvent(event);
  }
}