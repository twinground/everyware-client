import { Engine as BabylonEngine, Scene } from "@babylonjs/core";
import ICustomScene from "../../../interfaces/ICustomScene";

class PreviewScene implements ICustomScene {
  public scene: Scene;

  constructor(engine: BabylonEngine, canvas: HTMLCanvasElement) {
    this.scene = new Scene(engine);
  }
}

export default PreviewScene;
