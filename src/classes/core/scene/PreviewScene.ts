import { Scene } from "@babylonjs/core";
import Engine from "../Engine";
import ICustomScene from "../../../interfaces/ICustomScene";

class PreviewScene implements ICustomScene {
  public scene: Scene;

  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    console.log("preview scene initailized");
    this.scene = new Scene(engine.BabylonEngine);
  }
}

export default PreviewScene;
