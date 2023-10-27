import * as BABYLON from "@babylonjs/core";

export default class CSS3DObject extends BABYLON.Mesh {
  constructor(element) {
    super();
    this.element = element;
    this.element.style.position = "absolute";
    this.element.style.pointerEvents = "auto";
  }
}
