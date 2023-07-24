import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Color4,
  FreeCamera,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";

enum ESceneState {
  LOADING = 0,
  WORLD = 1,
  LOBBY = 2,
}

class Environment {
  private _engine: Engine;
  private _scene: Scene;
  private _hemLight: HemisphericLight;
  private _state: ESceneState;

  constructor(readonly canvas: HTMLCanvasElement) {
    // initialize babylon scene and engine
    this._engine = new Engine(this.canvas, true);
    this._scene = new Scene(this._engine);

    this._hemLight = new HemisphericLight(
      "light1",
      new Vector3(1, 1, 0),
      this._scene
    );

    this.LobbySceneSetup();

    window.addEventListener("resize", () => {
      this._engine.resize();
    });
  }

  private async LobbySceneSetup() {
    this._engine.displayLoadingUI();

    //unable inputs while loading
    this._scene.detachControl();
    let scene = new Scene(this._engine);
    scene.clearColor = new Color4(0, 0, 0, 1);

    //basic camera setup
    let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
    camera.setTarget(Vector3.Zero());

    //GUI menu
    const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("MENU");
    guiMenu.idealHeight = 720;
    const connectBtn = Button.CreateSimpleButton("start", "CONNECT");
    connectBtn.width = 0.2;
    connectBtn.color = "white";
    connectBtn.top = "-14px";
    connectBtn.thickness = 0;
    connectBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    guiMenu.addControl(connectBtn);

    connectBtn.onPointerDownObservable.add(() => {
      scene.detachControl();
    });

    //When scene is ready
    await scene.whenReadyAsync();
    this._engine.hideLoadingUI();
    this._scene.dispose(); //release resources of current scene
    this._scene = scene; // set new scene to current
    this._state = ESceneState.LOBBY; // update state
  }

  get Engine() {
    return this._engine;
  }

  get Scene() {
    return this._scene;
  }
}

export default Environment;
