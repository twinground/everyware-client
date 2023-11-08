import {
  AbstractMesh,
  Vector3,
  Scene,
  SceneLoader,
  Quaternion,
  Mesh,
  TransformNode,
  MeshBuilder,
  Node,
  StandardMaterial,
  Texture,
  PBRMaterial,
  Color3,
  Nullable,
} from "@babylonjs/core";
import WorldScene from "../scene/WorldScene";

class Booth {
  readonly scene: Scene;
  readonly worldScene: WorldScene;
  // mesh
  public rootMesh: AbstractMesh | TransformNode;
  public deskCollision: Mesh;
  public boards: Mesh[] = [];
  public frontLogo: Node;
  public topLogo: Node;
  public boothCarpet: Mesh;
  public boothCollision: Mesh;
  // texture & material
  public dummyTextures: Texture[];
  public pbrMaterial: PBRMaterial;

  // uris
  public boardURI: string[] | undefined;

  constructor(
    worldScene: WorldScene,
    boothInstance?: TransformNode,
    boardURIs?: string[]
  ) {
    this.scene = worldScene.scene;
    this.worldScene = worldScene;
    this.boardURI = boardURIs;

    if (boothInstance) {
      this.rootMesh = boothInstance;
      for (let child of this.rootMesh.getChildren()) {
        if (child.id.match(RegExp("instance of board-*"))) {
          this.boards.push(child as Mesh);
        } else if (child.id == "instance of front-logo") {
          this.frontLogo = child;
        } else if (child.id == "instance of top-logo") {
          this.topLogo = child;
        } else if (child.id == "instance of booth-carpet") {
          this.boothCarpet = child as Mesh;
        }
      }
    }

    this.pbrMaterial = new PBRMaterial("booth-shared-pbr-material", this.scene);
    this.pbrMaterial.roughness = 1;

    this.dummyTextures = [
      new Texture("./images/board-1.jpeg", this.scene),
      new Texture("./images/board-2.jpg", this.scene),
      new Texture("./images/board-3.jpg", this.scene),
      new Texture("./images/board-4.jpg", this.scene),
      new Texture("./images/board-5.jpg", this.scene),
      new Texture("./images/board-6.png", this.scene),
      new Texture("./images/board-7.jpg", this.scene),
      new Texture("./images/board-8.jpg", this.scene),
      new Texture("./images/board-9.jpg", this.scene),
    ];
  }

  async LoadBooth(pos: Vector3, quat: Quaternion) {
    const boothGLB = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "booth_v2_compressed.glb",
      this.scene
    );

    this.rootMesh = boothGLB.meshes[0];
    for (let child of this.rootMesh.getChildren()) {
      if (child.id.match(RegExp("board-*"))) {
        this.boards.push(child as Mesh);
      } else if (child.id == "front-logo") {
        this.frontLogo = child;
      } else if (child.id == "top-logo") {
        this.topLogo = child;
      } else if (child.id == "booth-carpet") {
        this.boothCarpet = child as Mesh;
      }
    }

    this.rootMesh.scaling.setAll(0.6);
    this.rootMesh.position = pos;
    this.rootMesh.rotationQuaternion = quat;

    // compute world matrix again
    this.boothCarpet.computeWorldMatrix(true);
    // set booth area collisions
    this.SetCollisions(this.rootMesh);
    // set board textures
    this.CreateBoardMesh();
  }

  public SetCollisions(parent: AbstractMesh | TransformNode) {
    // desk collision area
    this.deskCollision = MeshBuilder.CreateBox(
      "collision-box-for-desk",
      { width: 2, height: 2, depth: 2 },
      this.scene
    );
    this.deskCollision.parent = parent;
    //this.deskCollision.actionManager = new ActionManager(this.scene);
    this.deskCollision.visibility = 0;
    this.deskCollision.position.set(2.35, 0, 3.8);

    // booth collision area
    this.boothCollision = MeshBuilder.CreateBox(
      "collision-box-for-booth",
      { width: 9, height: 1, depth: 12 },
      this.scene
    );
    this.boothCollision.parent = parent;
    this.boothCollision.visibility = 0;

    // create UI button and intersection event
    this.worldScene.CreateDeskCollisionEvent(this.deskCollision);
  }

  public CreateBoardMesh() {
    for (let i = 0; i < 3; i++) {
      const board = MeshBuilder.CreatePlane(
        `board-${i}-image`,
        {
          width: 2,
          height: 3.8,
        },
        this.scene
      );
      board.parent = this.rootMesh;
      board.rotation.y = Math.PI / 2;
      board.position.set(3.7, 3, 0.715 + i * -2.5);
      const mat = new StandardMaterial("board-mat", this.scene);

      mat.diffuseColor = new Color3(1, 1, 1);
      mat.roughness = 0.5;
      mat.diffuseTexture = this.dummyTextures[Math.floor(Math.random() * 8)];
      board.material = mat;
    }
  }

  public SetPosition(x: number, y: number, z: number) {
    this.rootMesh?.position.set(x, y, z);
  }

  public SetRotationQuat(quat: Quaternion) {
    if (this.rootMesh) this.rootMesh.rotationQuaternion = quat;
  }
}

export default Booth;
