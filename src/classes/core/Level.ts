import {
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  Vector3,
  IShadowLight,
  DirectionalLight,
  AbstractMesh,
} from "@babylonjs/core";

class Level {
  private _ground: Mesh;
  private _light: DirectionalLight;
  private _shadowGenerator: ShadowGenerator;

  constructor(public scene: Scene) {
    this._light = new DirectionalLight(
      "main_light",
      new Vector3(0, -1, -1),
      this.scene
    );
    //this._light.position.set(-40, 40, -40);
    this._shadowGenerator = new ShadowGenerator(1024, this._light);
    this._light.shadowMaxZ = 130;
    this._light.shadowMinZ = 10;
    this._shadowGenerator.useContactHardeningShadow = true;
    this._shadowGenerator.setDarkness(0.5);
  }

  public async Load() {
    this._ground = MeshBuilder.CreateBox("ground", { size: 24 }, this.scene);
    this._ground.scaling = new Vector3(1, 0.02, 1);
    this._ground.position.set(0, -0.2, 0);
  }

  public AddShawdowItem(mesh: AbstractMesh) {
    this._shadowGenerator.addShadowCaster(mesh);
  }

  get Light() {
    return this._light;
  }
}

export default Level;
