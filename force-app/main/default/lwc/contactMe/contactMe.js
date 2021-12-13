import { LightningElement } from "lwc";

export default class ContactMe extends LightningElement {
  openGitHub() {
    window.open("https://github.com/sagarshah97/sfdx-project", "_self");
  }
}