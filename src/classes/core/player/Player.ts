import { Scene, MeshBuilder, TransformNode, Mesh } from "@babylonjs/core";
import { FreeCamera, Vector3 } from "@babylonjs/core";

class Player {
  private _mesh: Mesh;
  private _camera: FreeCamera;

  constructor(readonly scene: Scene) {
    this._mesh = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 3, segments: 10 },
      this.scene
    );
    this._camera = new FreeCamera(
      "player-cam",
      new Vector3(0, 5, -10),
      this.scene
    );

    this._camera.setTarget(new Vector3(0, 0, 0));
  }
}

export default Player;
