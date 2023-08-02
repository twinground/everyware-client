// Module import
import {
  Scene,
  SceneLoader,
  Mesh,
  ArcRotateCamera,
  Vector3,
  Node,
  AnimationGroup,
} from "@babylonjs/core";
// Type import
import { PlayerAsset } from "../types/PlayerType";

class Player {
  private _mesh: Node;
  private _camera: ArcRotateCamera;
  private _animationGroups: AnimationGroup[];

  constructor(readonly scene: Scene, asset: PlayerAsset) {
    this._camera = new ArcRotateCamera(
      "player-cam",
      Math.PI / 2,
      Math.PI / 4,
      20,
      new Vector3(0, 0, 0),
      this.scene
    );

    this._mesh = asset.mesh;
    this._animationGroups = asset.animationGroups;
    console.log(this._animationGroups);

    this._camera.setPosition(new Vector3(0, 0, -10));
    this._camera.attachControl(true);
  }
}

export default Player;
