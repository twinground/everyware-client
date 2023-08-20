import { Mesh, MeshBuilder, Scene, Vector3, Color3 } from "@babylonjs/core";

class Level {
  private _ground: Mesh;

  constructor(public scene: Scene) {
    let level = this.scene.createDefaultEnvironment({
      enableGroundShadow: true,
    });
    level.setMainColor(new Color3(36 / 255, 113 / 255, 214 / 255));
    level.ground.receiveShadows = true;
  }

  public async Load() {
    this._ground = MeshBuilder.CreateBox("ground", { size: 24 }, this.scene);
    this._ground.scaling = new Vector3(1, 0.02, 1);
    this._ground.position.set(0, -0.2, 0);
  }
}

export default Level;
