import { LightningElement } from "lwc";
import customResources from "@salesforce/resourceUrl/customResources";

export default class Banner extends LightningElement {
  heroImage = customResources + "/img/hero-image.jpg";
}