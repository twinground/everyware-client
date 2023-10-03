import { Scene, TargetCamera, TouchCamera } from "@babylonjs/core";

export default interface ICustomScene {
  scene: Scene;

  //get Camera(): TargetCamera | TouchCamera;
}
