import { Scene } from "@babylonjs/core";

export default interface ICustomScene {
  scene: Scene;

  Transition(nextScene: ICustomScene): void;
}
