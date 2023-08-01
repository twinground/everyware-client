import { Mesh, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";

class Level {
  private _ground: Mesh;

  constructor(public scene: Scene) {}

  public async Load() {
    this._ground = MeshBuilder.CreateBox("ground", { size: 24 }, this.scene);
    this._ground.scaling = new Vector3(1, 0.02, 1);
    this._ground.position.set(0, -5, 0);
  }
}

export default Level;
