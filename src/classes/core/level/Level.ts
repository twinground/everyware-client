import {
  MeshBuilder,
  Scene,
  Color3,
  SceneLoader,
  ActionManager,
  Mesh,
  Texture,
  Quaternion,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
// class
import Player from "../player/Player";
import WorldScene from "../scene/WorldScene";

class Level {
  private _collisionArea: Mesh;

  constructor(
    public scene: Scene,
    public advancedTexture: AdvancedDynamicTexture,
    public player: Player,
    readonly worldScene: WorldScene
  ) {
    this.scene = scene;
    this.player = player;

    let level = this.scene.createDefaultEnvironment({
      enableGroundShadow: true,
    });
    level.setMainColor(new Color3(36 / 255, 113 / 255, 214 / 255));
    level.ground.receiveShadows = true;

    this._collisionArea = MeshBuilder.CreateBox(
      "AVAILABLE_RANGE_TO_VIEW",
      { width: 2, height: 2, depth: 2 },
      this.scene
    );
    this._collisionArea.actionManager = new ActionManager(this.scene);
    this._collisionArea.visibility = 0;
    this._collisionArea.position.set(0, 0.3, -5);

    this.Load().then(() => {
      // create view mode button (async)
      this.worldScene.CreateViewButton(this._collisionArea);
    });
  }

  public async Load() {
    const chairGLB = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "chair.glb",
      this.scene
    );

    const chairMesh = chairGLB.meshes[0];
    const monalisaMaterial = new StandardMaterial("test mat", this.scene);
    const monalisaTexture = new Texture("/images/monalisa.png", this.scene);
    monalisaMaterial.diffuseTexture = monalisaTexture;
    const panel = MeshBuilder.CreateBox(
      "test exhibit",
      { width: 1.5, height: 1.5, depth: 0.3 },
      this.scene
    );
    const background = MeshBuilder.CreateBox(
      "test background",
      {
        width: 1.5,
        height: 2.5,
        depth: 0.29,
      },
      this.scene
    );
    panel.material = monalisaMaterial;
    panel.rotate(new Vector3(0, 0, 1), Math.PI);
    background.position.set(0, 1.5, -7.5);
    panel.parent = background;

    chairMesh.parent = this._collisionArea;
  }
}

export default Level;
