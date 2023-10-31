import {
  MeshBuilder,
  Scene,
  Color3,
  SceneLoader,
  ActionManager,
  Mesh,
  Quaternion,
  Vector3,
  EnvironmentHelper,
  SpotLight,
  PBRMaterial,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
// class
import Player from "../player/Player";
import WorldScene from "../scene/WorldScene";

const ENV_COLOR = new Color3(255 / 255, 240 / 255, 197 / 255);
const mainColor = {
  r: 255,
  g: 240,
  b: 197,
};

class Level {
  private _collisionArea: Mesh;
  public environment: EnvironmentHelper;
  public spotLight: SpotLight;
  public cameraExposure: number;
  public isDarkMode: boolean = false;
  public pbrMaterial: PBRMaterial;

  constructor(
    public scene: Scene,
    public advancedTexture: AdvancedDynamicTexture,
    public player: Player,
    readonly worldScene: WorldScene
  ) {
    // field overwrite
    this.scene = scene;
    this.player = player;

    // environment setup
    this.cameraExposure = 0.6;
    this.environment = this.scene.createDefaultEnvironment({
      enableGroundShadow: true,
    });

    this.environment.setMainColor(ENV_COLOR);

    // PBR material
    this.pbrMaterial = new PBRMaterial("reflectional-mat", this.scene);
    this.pbrMaterial.metallic = 0;
    this.pbrMaterial.roughness = 1;
    this.pbrMaterial.subSurface.isRefractionEnabled = true;

    // collision area
    this._collisionArea = MeshBuilder.CreateBox(
      "AVAILABLE_RANGE_TO_VIEW",
      { width: 2, height: 2, depth: 2 },
      this.scene
    );
    this._collisionArea.actionManager = new ActionManager(this.scene);
    this._collisionArea.visibility = 0;
    this._collisionArea.position.set(0, 0.3, -5);

    // lighting
    this.spotLight = new SpotLight(
      "spot-light",
      new Vector3(0, 1, -4.5),
      new Vector3(0, 1, -0.1),
      Math.PI,
      1,
      this.scene
    );
    this.spotLight.diffuse = Color3.Yellow();
    this.spotLight.shadowEnabled = true;
    this.spotLight.intensity = 0.5;

    this.LoadMeshes().then(() => {
      // create view mode button (async)
      this.worldScene.CreateViewButton(this._collisionArea);
    });

    // dark mode slider UI
    const modeSlider = document.querySelector(".slider");
    modeSlider.addEventListener("click", () => {
      let colorStep = 2;
      let exposureStep = 0.003;
      let intensityStep = 0.05;
      const boundedDarkModeCallback = this.ConvertToColorMode.bind(
        this,
        mainColor,
        colorStep,
        intensityStep,
        exposureStep
      );
      this.scene.onBeforeRenderObservable.add(boundedDarkModeCallback);
      setTimeout(() => {
        this.scene.onBeforeRenderObservable.removeCallback(
          boundedDarkModeCallback
        );
        this.isDarkMode = !this.isDarkMode;
      }, 2500);
    });
  }

  public async LoadMeshes() {
    const boothGLB = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "booth.glb",
      this.scene
    );
    const boothMesh = boothGLB.meshes[0];
    boothMesh.scaling.setAll(0.5);

    const monitorGLB = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "monitor.glb",
      this.scene
    );

    const moniotrMesh = monitorGLB.meshes[0];
    moniotrMesh.rotationQuaternion = Quaternion.FromEulerAngles(
      0,
      -Math.PI / 2,
      0
    );

    const shelf = MeshBuilder.CreateBox(
      "shelf",
      {
        width: 0.6,
        height: 0.7,
        depth: 0.6,
      },
      this.scene
    );
    shelf.position.y += 0.2;
    shelf.material = this.pbrMaterial;

    const ground = MeshBuilder.CreateGround(
      "ground-mesh",
      {
        width: 50,
        height: 50,
      },
      this.scene
    );
    ground.material = this.pbrMaterial;

    moniotrMesh.parent = shelf;
    moniotrMesh.position.y += 0.4;
    shelf.parent = this._collisionArea;
  }

  public ConvertToColorMode(
    mainColor: { r: number; g: number; b: number },
    colorStep: number,
    intensityStep: number,
    exposureStep: number
  ) {
    if (this.isDarkMode == false) {
      if (mainColor.r > 10.0) {
        mainColor.r -= colorStep;
      }
      if (mainColor.g > 10.0) {
        mainColor.g -= colorStep;
      }
      if (mainColor.b > 10.0) {
        mainColor.b -= colorStep;
      }

      if (this.spotLight.intensity < 5.0) {
        //this.spotLight.intensity += intensityStep;
        this.spotLight.intensity = 20;
      }

      if (this.cameraExposure > 0.2) {
        this.cameraExposure -= exposureStep;
        this.environment.updateOptions({
          cameraExposure: this.cameraExposure,
        });
      }

      ENV_COLOR.set(mainColor.r / 255, mainColor.g / 255, mainColor.b / 255);
      this.environment.setMainColor(ENV_COLOR);
    } else {
      if (mainColor.r < 255.0) {
        mainColor.r += colorStep;
      }
      if (mainColor.g < 240.0) {
        mainColor.g += colorStep;
      }
      if (mainColor.b < 197.0) {
        mainColor.b += colorStep;
      }

      if (this.spotLight.intensity > 0.5) {
        this.spotLight.intensity -= intensityStep;
      }

      if (this.cameraExposure < 0.7) {
        this.cameraExposure += exposureStep;
        this.environment.updateOptions({ cameraExposure: this.cameraExposure });
      }

      ENV_COLOR.set(mainColor.r / 255, mainColor.g / 255, mainColor.b / 255);
      this.environment.setMainColor(ENV_COLOR);
    }
  }
}

export default Level;
