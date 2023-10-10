import {
  DirectionalLight,
  Scene,
  UniversalCamera,
  Vector3,
  Color3,
  ShadowGenerator,
  EnvironmentHelper,
  SceneLoader,
  ArcRotateCamera,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
// class
import Engine from "../Engine";
import ICustomScene from "../../../interfaces/ICustomScene";
import { ISceneStateMachine } from "../../../interfaces/IStateMachine";
import { createExitButton } from "../ui/ExitButton";

class PreviewScene implements ICustomScene {
  public scene: Scene;
  private _level: EnvironmentHelper;
  private _camera: UniversalCamera;
  private _light: DirectionalLight;
  private _advancedTexture: AdvancedDynamicTexture;
  private _shadowGenerator: ShadowGenerator;
  private _exitButton: Button;

  constructor(
    private engine: Engine,
    private _sceneMachine: ISceneStateMachine
  ) {
    console.log("preview scene initailized");
    this.scene = new Scene(engine.BabylonEngine);

    // fullscreen gui
    this._advancedTexture = this._advancedTexture =
      AdvancedDynamicTexture.CreateFullscreenUI("PREVIEW_GUI");
    this._exitButton = createExitButton(this._advancedTexture);
    this._exitButton.onPointerClickObservable.add(() => {
      this._sceneMachine.UpdateMachine(0);
    });

    // Level setup
    this._level = this.scene.createDefaultEnvironment({
      enableGroundShadow: true,
    });
    this._level.setMainColor(new Color3(36 / 255, 113 / 255, 214 / 255));
    this._level.ground.receiveShadows = true;
    // TODO : this is temp model
    this.LoadWatch();

    // Camera Setup
    this._camera = new UniversalCamera(
      "preview-cam",
      new Vector3(0, 0, 0),
      this.scene
    );
    this._camera.attachControl(true);

    // Light Setup
    this._light = new DirectionalLight(
      "main-light",
      new Vector3(0, -1, -1),
      this.scene
    );
    this._light.shadowMaxZ = 130;
    this._light.shadowMinZ = 10;
    this._shadowGenerator = new ShadowGenerator(1024, this._light);
  }

  async LoadWatch() {
    const watchGLB = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "watch.glb",
      this.scene
    );

    watchGLB.meshes[0].position.set(0, 0.5, 3);
  }
}

export default PreviewScene;
