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
  EnvironmentHelper,
  Animation,
  SpotLight,
  PBRMaterial,
} from "@babylonjs/core";
import {
  AdvancedDynamicTexture,
  StackPanel,
  Control,
  Slider,
  Image,
  ImageBasedSlider,
} from "@babylonjs/gui";
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

  constructor(
    public scene: Scene,
    public advancedTexture: AdvancedDynamicTexture,
    public player: Player,
    readonly worldScene: WorldScene
  ) {
    this.scene = scene;
    this.player = player;

    this.cameraExposure = 0.6;
    this.environment = this.scene.createDefaultEnvironment({
      // groundSize: 100,
      // enableGroundMirror: true,
      // groundMirrorFallOffDistance: 4,
      // groundColor: new Color3(0, 0, 0),
      // groundMirrorBlurKernel: 1,
      // groundMirrorSizeRatio: 1,
      enableGroundShadow: true,
    });

    this.environment.setMainColor(ENV_COLOR);

    this._collisionArea = MeshBuilder.CreateBox(
      "AVAILABLE_RANGE_TO_VIEW",
      { width: 2, height: 2, depth: 2 },
      this.scene
    );
    this._collisionArea.actionManager = new ActionManager(this.scene);
    this._collisionArea.visibility = 0;
    this._collisionArea.position.set(0, 0.3, -5);

    const ground = MeshBuilder.CreateGround(
      "ground-mesh",
      {
        width: 50,
        height: 50,
      },
      this.scene
    );

    this.spotLight = new SpotLight(
      "spot-light",
      new Vector3(0, 0, -5),
      new Vector3(0, 1, 0),
      Math.PI,
      1,
      this.scene
    );
    // this.spotLight.diffuse = new Color3(255 / 255, 240 / 255, 197 / 255);
    this.spotLight.diffuse = Color3.Yellow();
    this.spotLight.intensity = 0.5;

    this.Load().then(() => {
      // create view mode button (async)
      this.worldScene.CreateViewButton(this._collisionArea);
    });

    const modeSlider = document.querySelector(".slider");
    modeSlider.addEventListener("click", () => {
      let colorStep = 2;
      let exposureStep = 0.003;
      let intensityStep = 0.01;
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
      }, 2125);
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

      if (this.spotLight.intensity < 2.5) {
        this.spotLight.intensity += intensityStep;
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
