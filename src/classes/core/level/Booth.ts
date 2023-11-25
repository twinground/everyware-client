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
  Matrix,
  ActionManager,
  ExecuteCodeAction,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
// class
import WorldScene from "../scene/WorldScene";
import BoardImage from "../ui/BoardImage";
import { createButton } from "../ui/ViewButton";
import { BoothData } from "../../../types/BoothDataType";
import Npc from "./Npc";

const BLUE_COLOR = new Color4(52 / 255, 152 / 255, 219 / 255, 0.8);

class Booth {
  readonly scene: Scene;
  readonly worldScene: WorldScene;
  readonly advancedTexture: AdvancedDynamicTexture;
  // mesh
  public rootMesh: AbstractMesh | TransformNode;
  public npc: Npc;
  public deskCollision: Mesh;
  public boards: Mesh[] = [];
  public frontLogo: Node;
  public topLogo: Node;
  public boothCarpet: Mesh;
  public boothCollision: Mesh;
  public mobileCollision: Mesh;
  public boardCollisions: Mesh[] = [];
  // texture & material
  public topLogoTexture: Texture;
  public bottomLogoTexture: Texture;
  public boardImageTexture: Texture[];
  public pbrMaterial: PBRMaterial;
  // ui
  public boardImageUI: BoardImage;
  // state
  public isInBooth: boolean = false;

  // booth data
  public id: number;
  public title: string;
  public topLogoURI: string;
  public bottomLogoURI: string;
  public boardImageURIS: string[];

  constructor(
    worldScene: WorldScene,
    advancedTexture: AdvancedDynamicTexture,
    boothData: BoothData,
    boothInstance?: TransformNode
  ) {
    this.scene = worldScene.scene;
    this.worldScene = worldScene;
    this.advancedTexture = advancedTexture;

    //data initialize
    this.id = boothData.id;
    this.title = boothData.title;
    this.topLogoURI = boothData.boothMaterials.top_logos;
    this.bottomLogoURI = boothData.boothMaterials.bottom_logos;
    this.boardImageURIS = boothData.boothMaterials.images;

    this.npc = new Npc(this.scene);
    if (boothInstance) {
      this.rootMesh = boothInstance;
      this.npc.LoadModelAsset().then((npcMesh: AbstractMesh) => {
        this.npc.SetParentMesh(this.rootMesh);

        npcMesh.position.set(-2.8, 0.1, -4.3);
        npcMesh.rotationQuaternion = Quaternion.FromEulerAngles(
          0,
          -Math.PI / 2,
          0
        );
      }); // load npc
    }

    // texture and material
    this.pbrMaterial = new PBRMaterial("booth-shared-pbr-material", this.scene);
    this.pbrMaterial.roughness = 1;

    this.topLogoTexture = new Texture(this.topLogoURI, this.scene);
    this.bottomLogoTexture = new Texture(this.bottomLogoURI, this.scene);
    this.boardImageTexture = [
      new Texture(this.boardImageURIS[0], this.scene),
      new Texture(this.boardImageURIS[1], this.scene),
      new Texture(this.boardImageURIS[2], this.scene),
    ];

    this.boardImageUI = new BoardImage();
  }

  async LoadBooth(pos: Vector3, quat: Quaternion) {
    const boothGLB = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "booth_v2_compressed.glb",
      this.scene
    );
    this.rootMesh = boothGLB.meshes[0];
    this.npc.LoadModelAsset().then((npcMesh: AbstractMesh) => {
      this.npc.SetParentMesh(this.rootMesh);

      npcMesh.position.set(-2.8, 0.1, -4.3);
      npcMesh.rotationQuaternion = Quaternion.FromEulerAngles(
        0,
        -Math.PI / 2,
        0
      );
    }); // load npc

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
    const bottomLogoMat = new StandardMaterial("board-mat", this.scene);
    const bottomLogo = MeshBuilder.CreatePlane(
      `bottomLogo-mesh`,
      {
        width: 1.8,
        height: 0.65,
      },
      this.scene
    );

    bottomLogo.parent = this.rootMesh;
    bottomLogo.rotation.y = Math.PI / 2;
    bottomLogo.position.set(-3.985, 0.9, -4.3);

    bottomLogoMat.diffuseColor = new Color3(1, 1, 1);
    bottomLogoMat.roughness = 0.5;
    bottomLogoMat.diffuseTexture = this.bottomLogoTexture;
    bottomLogo.material = bottomLogoMat;

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
    topLogoMat.diffuseTexture = this.topLogoTexture;
    topLogo.material = topLogoMat;
  }

  public CreateBoardMesh() {
    for (let i = 0; i < this.boardImageURIS.length; i++) {
      const board = MeshBuilder.CreateBox(
        `board-${i}-image`,
        {
          width: 2,
          height: 3.8,
          depth: 0.1,
        },
        this.scene
      );
      board.isPickable = true;
      board.parent = this.rootMesh;
      board.rotation.y = Math.PI / 2;
      board.position.set(3.6, 3, 0.715 + i * -2.5);
      board.edgesColor = BLUE_COLOR;
      board.edgesWidth = 5;
      const viewButton = createButton(
        board,
        "자세히 보기",
        this.advancedTexture
      );
      viewButton.linkOffsetY = 0;
      viewButton.linkOffsetX = 0;

      viewButton.onPointerClickObservable.add(() => {
        this.boardImageUI.Render(this.boardImageURIS[i]);
      });

      const mat = new StandardMaterial("board-mat", this.scene);
      mat.diffuseColor = new Color3(1, 1, 1);
      mat.roughness = 0.5;
      mat.diffuseTexture = this.boardImageTexture[i];
      board.material = mat;

      board.actionManager = new ActionManager(this.scene);

      board.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
          if (this.isInBooth) {
            board.enableEdgesRendering();
            viewButton.isVisible = true;
          }
        })
      );
      board.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
          board.disableEdgesRendering();
          viewButton.isVisible = false;
        })
      );
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
