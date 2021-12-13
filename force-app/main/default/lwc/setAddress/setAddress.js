import { LightningElement, track, wire } from "lwc";
import { getPicklistValues } from "lightning/uiObjectInfoApi";

import COUNTRY_FIELD from "@salesforce/schema/Account.BillingCountryCode";
import STATE_FIELD from "@salesforce/schema/Account.BillingStateCode";

export default class SetAddress extends LightningElement {
  @track address = {
    street: "",
    city: "",
    stateCode: "",
    postalCode: "",
    countryCode: "US",
    stateName: "",
    countryName: "United States"
  };

  //get the country picklist values
  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA", //recordtype Id has no significance, included as a part of required framework of SF
    fieldApiName: COUNTRY_FIELD
  })
  wiredCountries;

  // //get the state picklist values
  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA", //recordtype Id has no significance, included as a part of required framework of SF
    fieldApiName: STATE_FIELD
  })
  wiredStates;

  get countryPicklist() {
    let picklist = [];

    if (this.wiredCountries.data !== undefined) {
      picklist = this.generatePicklist(this.wiredCountries.data.values);
    }

    return picklist;
  }

  get statePicklist() {
    let picklist = [];

    if (this.address.countryCode && this.wiredStates.data !== undefined) {
      let countryCode =
        this.wiredStates.data.controllerValues[this.address.countryCode];
      const specificCountryStates = this.wiredStates.data.values.filter(
        (state) => state.validFor[0] === countryCode
      );

      picklist = this.generatePicklist(specificCountryStates);
    }

    return picklist;
  }

  get province() {
    let result;

    if (this.statePicklist.length && this.address.stateCode) {
      result = this.address.stateCode;
    }

    return result;
  }

  get country() {
    let result;

    if (this.countryPicklist.length && this.address.countryCode) {
      result = this.address.countryCode;
    }

    return result;
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

  //handles the input from the address template
  handleAddressChange(event) {
    try {
      let countryName;
      if (this.countryPicklist.length && event.detail.country) {
        countryName = this.countryPicklist.find(
          (obj) => obj.value === event.detail.country
        ).label;
        this.address.countryCode = event.detail.country;
      }

      let stateName;
      if (this.statePicklist.length && event.detail.province) {
        stateName = this.statePicklist.find(
          (obj) => obj.value === event.detail.province
        ).label;
      }

      this.address = {
        street: event.detail.street,
        city: event.detail.city,
        stateCode: event.detail.province,
        postalCode: event.detail.postalCode,
        countryCode: event.detail.country,
        stateName,
        countryName
      };

      const address = this.template.querySelector("lightning-input-address");
      const isValid = address.checkValidity();
      if (isValid) {
        this.sendOutput();
      }
    } catch (error) {
      console.error(error);
    }
  }

  sendOutput() {
    let output = { address: this.address };
    this.dispatchEvent(
      new CustomEvent("pass", {
        detail: output
      })
    );
  }
}