import {
  MeshBuilder,
  Scene,
  Color3,
  SceneLoader,
  ActionManager,
  Mesh,
  Quaternion,
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
    const watchGLB = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "watch.glb",
      this.scene
    );
    const watchMesh = watchGLB.meshes[0];
    const chairMesh = chairGLB.meshes[0];

    watchMesh.rotationQuaternion.multiplyInPlace(
      Quaternion.FromEulerAngles(0, Math.PI, 0)
    );
    watchMesh.position.set(0, 2, -6.5);

    chairMesh.parent = this._collisionArea;
  }
}

export default Level;
