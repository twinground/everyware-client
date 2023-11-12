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
  PhysicsAggregate,
  PhysicsShapeType,
  Color4,
} from "@babylonjs/core";
import WorldScene from "../scene/WorldScene";
import Player from "../player/Player";

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
  public mobileCollision: Mesh;
  public boardCollisions: Mesh[] = [];
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
    this.SetIntersectionEvent(this.rootMesh);
    // set board textures
    this.CreateBoardMesh();
    // set logo textures
    this.CreateLogoMesh();
    // create booth collisions
    this.CreateCollisionAreas();
  }

  public SetIntersectionEvent(parent: AbstractMesh | TransformNode) {
    // desk collision area
    this.deskCollision = MeshBuilder.CreateBox(
      "collision-box-for-desk",
      { width: 2, height: 2, depth: 2 },
      this.scene
    );
    this.deskCollision.parent = parent;
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

    // board collision area
    for (let i = 0; i < 3; i++) {
      const boardCollisionMesh = MeshBuilder.CreateBox(
        `board-${i}-collision`,
        { width: 1.3, height: 3, depth: 1.3 },
        this.scene
      );
      boardCollisionMesh.parent = parent;
      boardCollisionMesh.position.set(1.5, 0.5, 0.6 + i * -2.5);
      boardCollisionMesh.visibility = 0;

      this.worldScene.CreateBoardCollisionEvent(this, boardCollisionMesh, i);
    }

    this.mobileCollision = MeshBuilder.CreateBox(
      "mobile-collision",
      { width: 1.3, height: 3, depth: 1.3 },
      this.scene
    );
    this.mobileCollision.position.set(-0.5, 1, 4);
    this.mobileCollision.parent = parent;
    this.mobileCollision.visibility = 0;

    // create UI button and intersection event
    this.worldScene.CreateDeskCollisionEvent(this.deskCollision);
    this.worldScene.CreateMobileCollisionEvent(this.mobileCollision);
  }

  public CreateLogoMesh() {
    const frontLogoMat = new StandardMaterial("board-mat", this.scene);
    const frontLogo = MeshBuilder.CreatePlane(
      `frontLogo-mesh`,
      {
        width: 1.8,
        height: 0.65,
      },
      this.scene
    );

    frontLogo.parent = this.rootMesh;
    frontLogo.rotation.y = Math.PI / 2;
    frontLogo.position.set(-3.985, 0.9, -4.3);

    frontLogoMat.diffuseColor = new Color3(1, 1, 1);
    frontLogoMat.roughness = 0.5;
    frontLogoMat.diffuseTexture =
      this.dummyTextures[Math.floor(Math.random() * 8)];
    frontLogo.material = frontLogoMat;

    const topLogoMat = new StandardMaterial("board-mat", this.scene);
    const topLogo = MeshBuilder.CreatePlane(
      `topLogo-mesh`,
      {
        width: 3.25,
        height: 1.35,
      },
      this.scene
    );

    topLogo.parent = this.rootMesh;
    topLogo.rotation.y = Math.PI / 2;
    topLogo.position.set(-1.1, 4.32, 3.67);

    topLogoMat.diffuseColor = new Color3(1, 1, 1);
    topLogoMat.roughness = 0.5;
    topLogoMat.diffuseTexture =
      this.dummyTextures[Math.floor(Math.random() * 8)];
    topLogo.material = topLogoMat;
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
      board.position.set(3.6, 3, 0.715 + i * -2.5);
      board.edgesColor = new Color4(1, 1, 0, 0.5);
      board.edgesWidth = 5;

      const mat = new StandardMaterial("board-mat", this.scene);

      mat.diffuseColor = new Color3(1, 1, 1);
      mat.roughness = 0.5;
      mat.diffuseTexture = this.dummyTextures[Math.floor(Math.random() * 8)];
      board.material = mat;
    }
  }

  public CreateCollisionAreas() {
    const pipeOne = MeshBuilder.CreateBox(
      "pipe-one",
      { width: 0.3, height: 2.5, depth: 0.3 },
      this.scene
    );
    pipeOne.position.set(-1, 1.5, 2);

    const pipeTwo = MeshBuilder.CreateBox(
      "pipe-two",
      { width: 0.3, height: 2.5, depth: 0.3 },
      this.scene
    );
    pipeTwo.position.set(-2.8, 1.5, -5.5);

    const wallOne = MeshBuilder.CreateBox(
      "wall-one",
      { width: 0.8, height: 2.5, depth: 11.5 },
      this.scene
    );
    wallOne.position.set(3.8, 1.5, 0);

    const wallTwo = MeshBuilder.CreateBox(
      "wall-two",
      { width: 4.5, height: 2.5, depth: 0.5 },
      this.scene
    );
    wallTwo.position.set(1, 1.5, -5.5);

    const wallThree = MeshBuilder.CreateBox(
      "wall-three",
      { width: 4.3, height: 2.5, depth: 0.5 },
      this.scene
    );
    wallThree.position.set(1, 1.5, 5.5);

    const frontDesk = MeshBuilder.CreateBox(
      "front-desk",
      { width: 1, height: 1, depth: 2.5 },
      this.scene
    );
    frontDesk.position.set(-3.5, 0.5, -4.3);

    const monitor = MeshBuilder.CreateBox(
      "monitor",
      { width: 1, height: 1, depth: 3.5 },
      this.scene
    );
    monitor.position.set(2.2, 0.5, 3.8);
    monitor.rotation.y = -Math.PI / 4;

    pipeOne.parent = this.rootMesh;
    pipeTwo.parent = this.rootMesh;
    wallOne.parent = this.rootMesh;
    wallTwo.parent = this.rootMesh;
    wallThree.parent = this.rootMesh;
    frontDesk.parent = this.rootMesh;
    monitor.parent = this.rootMesh;

    const meshes = [
      pipeOne,
      pipeTwo,
      wallOne,
      wallThree,
      wallTwo,
      frontDesk,
      monitor,
    ];
    for (let mesh of meshes) {
      const _aggregation = new PhysicsAggregate(
        mesh,
        PhysicsShapeType.MESH,
        { mass: 0 },
        this.scene
      );
      mesh.visibility = 0;
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
