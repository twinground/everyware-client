import {
  Scene,
  Color3,
  Quaternion,
  Vector3,
  EnvironmentHelper,
  GlowLayer,
  RecastJSPlugin,
  Mesh,
  ICrowd,
  TransformNode,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
// class
import Player from "../player/Player";
import WorldScene from "../scene/WorldScene";
import Booth from "./Booth";
import Expo from "./Expo";

const ENV_COLOR = new Color3(255 / 255, 240 / 255, 197 / 255);
const mainColor = {
  r: 255,
  g: 240,
  b: 197,
};
const dummy_booth_data = [
  "./images/board-1.jpeg",
  "./images/board-2.jpg",
  "./images/board-3.jpg",
  "./images/board-4.jpg",
  "./images/board-5.jpg",
  "./images/board-6.png",
  "./images/board-7.jpg",
  "./images/board-8.jpg",
  "./images/board-9.jpg",
];
const NAV_PARAMAS = {
  cs: 0.2,
  ch: 0.2,
  walkableSlopeAngle: 35,
  walkableHeight: 1,
  walkableClimb: 1,
  walkableRadius: 1,
  maxEdgeLen: 12,
  maxSimplificationError: 1.3,
  minRegionArea: 8,
  mergeRegionArea: 20,
  maxVertsPerPoly: 6,
  detailSampleDist: 6,
  detailSampleMaxError: 1,
};

const AGENT_PARAMS = {
  radius: 0.1,
  height: 0.2,
  maxAcceleration: 4.0,
  maxSpeed: 2.5,
  collisionQueryRange: 0.5,
  pathOptimizationRange: 0.0,
  separationWeight: 1.0,
};

class Level {
  public scene: Scene;
  /* layer */
  private _glowLayer: GlowLayer;
  /* mesh */
  public environment: EnvironmentHelper;
  private rootBooth: Booth;
  private _booths: Booth[] = [];
  private _expo: Expo;
  /* config */
  public cameraExposure: number;
  public isDarkMode: boolean = false;
  /* plugins */
  private _navigationPlugin: RecastJSPlugin;
  private _debugNavMesh: Mesh;
  private _agents: any[] = [];
  private _crowd: ICrowd;
  private pathLine: any;

  constructor(
    public advancedTexture: AdvancedDynamicTexture,
    public player: Player,
    readonly worldScene: WorldScene
  ) {
    // field overwrite
    this.scene = worldScene.scene;
    this.player = player;

    worldScene.Engine;

    // environment setup
    this.cameraExposure = 0.6;
    this.environment = this.scene.createDefaultEnvironment({
      skyboxSize: 200,
      enableGroundShadow: true,
      sizeAuto: false,
      rootPosition: new Vector3(0, -1, -50),
    }) as EnvironmentHelper;
    this.environment.setMainColor(ENV_COLOR);
    this._glowLayer = new GlowLayer("light-glow", this.scene, {
      mainTextureSamples: 4,
      mainTextureFixedSize: 1024,
      blurKernelSize: 25,
    });
    this._glowLayer.intensity = 0;

    // Load all mesh in this level
    this.LoadMeshes();

    // dark mode slider UI
    const modeSlider = document.querySelector(".slider");
    modeSlider?.addEventListener("click", () => {
      let colorStep = 2;
      let exposureStep = 0.005;
      let intensityStep = 0.01;
      const boundedDarkModeCallback = this.ConvertColorMode.bind(
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
    /**
     * Create Expo
     */
    this._expo = new Expo(this.scene);

    /**
     * Load and set Booths
     */
    this.rootBooth = new Booth(this.worldScene, undefined, [
      dummy_booth_data[Math.random() * 6],
      dummy_booth_data[Math.random() * 6],
      dummy_booth_data[Math.random() * 6],
    ]);
    await this.rootBooth.LoadBooth(
      new Vector3(6.5, 0, -9),
      Quaternion.FromEulerAngles(0, 2 * Math.PI, 0)
    );
    //TODO : change dummy booth data to response data from API server
    //left side booths
    for (let i = 2; i < 5; i++) {
      if (this.rootBooth) {
        const newBoothInstance =
          this.rootBooth.rootMesh?.instantiateHierarchy();
        const newBooth = new Booth(
          this.worldScene,
          newBoothInstance as TransformNode
        );
        newBooth.SetPosition(6.5, 0, -9 * i);
        newBooth.SetIntersectionEvent(newBooth.rootMesh);
        newBooth.CreateBoardMesh();
        newBooth.CreateLogoMesh();
        newBooth.CreateCollisionAreas();
        this._booths.push(newBooth);
      }
    }

    //right side booths
    for (let i = 1; i < 5; i++) {
      const newBoothInstance = this.rootBooth.rootMesh.instantiateHierarchy();
      const newBooth = new Booth(
        this.worldScene,
        newBoothInstance as TransformNode
      );
      newBooth.SetPosition(-6.5, 0, -9 * i);
      newBooth.SetRotationQuat(Quaternion.FromEulerAngles(0, Math.PI, 0));
      newBooth.SetIntersectionEvent(newBooth.rootMesh);
      newBooth.CreateBoardMesh();
      newBooth.CreateLogoMesh();
      newBooth.CreateCollisionAreas();
      this._booths.push(newBooth);
    }

    this.worldScene.CreateBoothCollisionEvent([
      this.rootBooth,
      ...this._booths,
    ]);
  }

  public ConvertColorMode(
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

      if (this.cameraExposure > 0.2) {
        this.cameraExposure -= exposureStep;
        this.environment.updateOptions({
          cameraExposure: this.cameraExposure,
        });
      }

      if (this._glowLayer.intensity < 1.0) {
        this._glowLayer.intensity += intensityStep;
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

      if (this._glowLayer.intensity > 0.0) {
        this._glowLayer.intensity -= intensityStep;
      }

      ENV_COLOR.set(mainColor.r / 255, mainColor.g / 255, mainColor.b / 255);
      this.environment.setMainColor(ENV_COLOR);
    }
  }
}

export default Level;
