import {
  Mesh,
  MeshBuilder,
  Quaternion,
  Scene,
  SceneLoader,
  SpotLight,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

class Expo extends TransformNode {
  readonly scene: Scene;
  public leftWall: Mesh;
  public rightWall: Mesh;
  public backWall: Mesh;
  public frontWall: Mesh;
  public ceiling: Mesh;
  public ground: Mesh;

  constructor(scene: Scene) {
    super("expo-set", scene);
    this.scene = scene;
    // left wall
    this.leftWall = MeshBuilder.CreatePlane(
      "left-wall",
      { width: 40, height: 8 },
      scene
    );
    this.leftWall.parent = this;
    this.leftWall.rotation.y = -Math.PI / 2;
    this.leftWall.position.set(-11, 4, -20);

    // right wall
    this.rightWall = MeshBuilder.CreatePlane(
      "right-wall",
      { width: 40, height: 8 },
      scene
    );
    this.rightWall.parent = this;
    this.rightWall.rotation.y = Math.PI / 2;
    this.rightWall.position.set(11, 4, -20);

    // front wall
    this.frontWall = MeshBuilder.CreatePlane(
      "right-wall",
      { width: 22, height: 8 },
      scene
    );
    this.frontWall.parent = this;
    this.frontWall.rotation.y = Math.PI;
    this.frontWall.position.set(0, 4, -40);

    // back wall
    this.backWall = MeshBuilder.CreatePlane(
      "right-wall",
      { width: 22, height: 8 },
      scene
    );
    this.backWall.parent = this;
    this.backWall.position.set(0, 4, 0);

    // ceiling
    this.ceiling = MeshBuilder.CreatePlane(
      "right-wall",
      { width: 40, height: 24 },
      scene
    );
    this.ceiling.parent = this;
    this.ceiling.rotation.y = -Math.PI / 2;
    this.ceiling.rotation.x = -Math.PI / 2;
    this.ceiling.position.set(0, 6, -20);

    // point light
    const spotLight = new SpotLight(
      "ceiling-light",
      this.ceiling.position.clone(),
      new Vector3(0, -1, 0),
      Math.PI,
      1,
      scene
    );
    spotLight.position.y += 1;

    // ground
    this.ground = MeshBuilder.CreateGround(
      "ground-mesh",
      {
        width: 30,
        height: 50,
      },
      scene
    );
    this.ground.position.z -= 20;
    this.ground.parent = this;

    this.position.set(0, 0, -4);

    this.LoadLightAsset();
  }

  public async LoadLightAsset() {
    const ceilingLightGLB = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "ceiling_light.glb",
      this.scene
    );

    const rootLight = ceilingLightGLB.meshes[0];
    rootLight.parent = this.ceiling;
    rootLight.rotationQuaternion = Quaternion.FromEulerAngles(
      Math.PI / 2,
      0,
      0
    );
    rootLight.position.set(-15, 0, 0);
    for (let i = 1; i <= 3; i++) {
      const newLight = rootLight.instantiateHierarchy();
      newLight.position.set(rootLight.position.x + i * 10, 0, 0);
    }
  }
}

export default Expo;
