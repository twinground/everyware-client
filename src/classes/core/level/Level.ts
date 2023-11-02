import {
  MeshBuilder,
  Scene,
  Color3,
  ActionManager,
  Mesh,
  Quaternion,
  Vector3,
  EnvironmentHelper,
  PBRMaterial,
  TransformNode,
  Texture,
  PBRBaseMaterial,
  StandardMaterial,
  NoiseProceduralTexture,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
// class
import Player from "../player/Player";
import WorldScene from "../scene/WorldScene";
import Booth from "./Booth";
import { TextureHelper } from "@babylonjs/inspector/textureHelper";

const ENV_COLOR = new Color3(255 / 255, 240 / 255, 197 / 255);
const mainColor = {
  r: 255,
  g: 240,
  b: 197,
};

class Level {
  /* mesh */
  public environment: EnvironmentHelper;
  private rootBooth: Booth;
  private _booths: Booth[] = [];
  /* config */
  public cameraExposure: number;
  public isDarkMode: boolean = false;

  constructor(
    public scene: Scene,
    public advancedTexture: AdvancedDynamicTexture,
    public player: Player,
    readonly worldScene: WorldScene
  ) {
    // field overwrite
    this.scene = worldScene.scene;
    this.player = player;

    // environment setup
    this.cameraExposure = 0.6;
    this.environment = this.scene.createDefaultEnvironment({
      skyboxSize: 200,
      enableGroundShadow: true,
      sizeAuto: false,
      rootPosition: new Vector3(0, -1, -50),
    });
    this.environment.setMainColor(ENV_COLOR);

    // Load all mesh in this level
    this.LoadMeshes();

    // dark mode slider UI
    const modeSlider = document.querySelector(".slider");
    modeSlider.addEventListener("click", () => {
      let colorStep = 2;
      let exposureStep = 0.003;
      //let intensityStep = 0.05;
      const boundedDarkModeCallback = this.ConvertColorMode.bind(
        this,
        mainColor,
        colorStep,
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
    this.rootBooth = new Booth(this.worldScene);
    await this.rootBooth.LoadBooth(
      new Vector3(6.5, 0, -9),
      Quaternion.FromEulerAngles(0, 2 * Math.PI, 0)
    );

    //left side booths
    for (let i = 2; i < 5; i++) {
      const newBoothInstance = this.rootBooth.rootMesh.instantiateHierarchy();
      const newBooth = new Booth(this.worldScene, newBoothInstance);
      newBooth.SetPosition(6.5, 0, -9 * i);
      newBooth.SetCollisions(newBooth.rootMesh);
      this._booths.push(newBooth);
    }

    //right side booths
    for (let i = 1; i < 5; i++) {
      const newBoothInstance = this.rootBooth.rootMesh.instantiateHierarchy();
      const newBooth = new Booth(this.worldScene, newBoothInstance);
      newBooth.SetPosition(-6.5, 0, -9 * i);
      newBooth.SetRotationQuat(Quaternion.FromEulerAngles(0, Math.PI, 0));
      newBooth.SetCollisions(newBooth.rootMesh);
      this._booths.push(newBooth);
    }

    const ground = MeshBuilder.CreateGround(
      "ground-mesh",
      {
        width: 50,
        height: 100,
      },
      this.scene
    );
    ground.position.z -= 50; // Adjust position to center the ground mesh
    // ground.material = groundMat;
  }

  public ConvertColorMode(
    mainColor: { r: number; g: number; b: number },
    colorStep: number,
    //intensityStep: number,
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
