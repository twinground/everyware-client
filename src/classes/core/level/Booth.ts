import {
  AbstractMesh,
  Vector3,
  Scene,
  SceneLoader,
  Quaternion,
  Mesh,
  TransformNode,
  MeshBuilder,
  ActionManager,
} from "@babylonjs/core";
import WorldScene from "../scene/WorldScene";

class Booth {
  readonly scene: Scene;
  readonly worldScene: WorldScene;
  public rootMesh: AbstractMesh | TransformNode;
  public deskCollision: Mesh;

  constructor(worldScene: WorldScene, boothInstance?: TransformNode) {
    this.scene = worldScene.scene;
    this.worldScene = worldScene;
    if (boothInstance) {
      this.rootMesh = boothInstance;
    }
  }

  async LoadBooth(pos: Vector3, quat: Quaternion) {
    const boothGLB = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "booth-v3.glb",
      this.scene
    );

    this.rootMesh = boothGLB.meshes[0];
    this.rootMesh.scaling.setAll(0.6);
    this.rootMesh.position = pos;
    this.rootMesh.rotationQuaternion = quat;
    this.SetCollisions(this.rootMesh);
  }

  public SetCollisions(parent: AbstractMesh | TransformNode) {
    // collision area
    this.deskCollision = MeshBuilder.CreateBox(
      "AVAILABLE_RANGE_TO_VIEW",
      { width: 2, height: 2, depth: 2 },
      this.scene
    );
    this.deskCollision.parent = parent;
    this.deskCollision.actionManager = new ActionManager(this.scene);
    this.deskCollision.visibility = 0;
    this.deskCollision.position.set(2.35, 0, 3.8);

    // create UI button and intersection event
    this.worldScene.CreateViewButton(this.deskCollision);
  }

  public SetPosition(x: number, y: number, z: number) {
    this.rootMesh.position.set(x, y, z);
  }

  public SetRotationQuat(quat: Quaternion) {
    this.rootMesh.rotationQuaternion = quat;
  }
}

export default Booth;
