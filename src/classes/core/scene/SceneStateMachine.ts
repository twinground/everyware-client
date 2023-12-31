//module
import { PostProcess } from "@babylonjs/core";
// class
import Socket from "../../network/SocketClient";
import Engine from "../Engine";
import WorldScene from "./WorldScene";
import PreviewScene from "./PreviewScene";
import MobileScene from "./MobileScene";
//interface
import ICustomScene from "../../../interfaces/ICustomScene";
import { ISceneStateMachine } from "../../../interfaces/IStateMachine";

class SceneStateMachine implements ISceneStateMachine {
  private _currentScene: ICustomScene;
  private _worldScene: WorldScene;
  private _previewScene: PreviewScene;
  private _mobileScene: MobileScene;
  private _engine: Engine;
  private _canvas: HTMLCanvasElement;
  private _socket: Socket | null;
  private _expoName: string;

  constructor(
    engine: Engine,
    canvas: HTMLCanvasElement,
    expoName: string,
    socket?: Socket
  ) {
    //initial scene
    this._engine = engine;
    this._engine.BabylonEngine.displayLoadingUI();
    this._canvas = canvas;
    this._expoName = expoName;
    if (socket) {
      this._socket = socket;
      this._worldScene = new WorldScene(this._engine, this, expoName, socket);
    } else {
      this._worldScene = new WorldScene(this._engine, this, expoName);
    }

    this._worldScene.scene.whenReadyAsync(true).then(() => {
      this._engine.BabylonEngine.hideLoadingUI();
    });

    this._currentScene = this._worldScene;
  }

  private IncrementAlpha(params: any) {
    params.fadeLevel = Math.abs(Math.cos(params.alpha));
    params.alpha += 0.015;
  }

  private DecrementAlpha(params: any) {
    params.fadeLevel = Math.abs(Math.cos(params.alpha));
    if (params.alpha > 0.01) params.alpha -= 0.01;
  }

  public FadeScene(startValue: number) {
    const params = {
      postName: startValue == 1 ? "FADEOUT" : "FADEIN",
      shaderName: startValue == 1 ? "fadeOut" : "fadeIn",
      fadeLevel: startValue,
      alpha: 1.0 - startValue,
    };
    const postProcess = new PostProcess(
      params.postName,
      params.shaderName,
      ["fadeLevel"],
      null,
      1.0,
      this._currentScene.scene.activeCamera
    );

    const boundedModifyAlpha =
      startValue == 1
        ? this.IncrementAlpha.bind(this, params)
        : this.DecrementAlpha.bind(this, params);
    postProcess.onApply = (effect) => {
      effect.setFloat("fadeLevel", params.fadeLevel);
    };

    this._currentScene.scene.onBeforeRenderObservable.add(boundedModifyAlpha);

    // dispose postProcess after 2617ms
    setTimeout(() => {
      this._currentScene.scene.onBeforeRenderObservable.removeCallback(
        boundedModifyAlpha
      );
      console.log("dispose postprocess & render callback");
      postProcess.dispose();
    }, 1701); // 60 frames per second * 0.015 => 0.6 per second
    // cos(0) = 1, cos(pi/2) = 0, pi/2 = 1.517 -> need 1685ms for fade out
  }

  UpdateMachine(nextSceneType: number): void {
    this.FadeScene(1.0); // start fade out effect
    setTimeout(() => {
      this.Transition(nextSceneType);
    }, 1700); // transition first before dispose effect resource
  }

  async Transition(nextSceneType: number) {
    this._currentScene.scene.detachControl();

    switch (nextSceneType) {
      case 0: // WorldScene
        // preprocess for local player
        const localPlayer = this._worldScene.LocalPlayer;
        localPlayer.Controller.UpdateViewMode(false);
        this._worldScene.isViewing = false;
        localPlayer.CurAnim = localPlayer.Animations.idle;
        //TODO: change this packet to SendPreviewPacket
        if (this._socket) {
          localPlayer.SendTransformPacket();
        }
        localPlayer.ZoomOutFollowCam();
        if (this._previewScene && this._previewScene.scene) {
          this._previewScene.DisposeResource();
        }
        if (this._mobileScene && this._mobileScene.scene) {
          this._mobileScene.DisposeResource();
        }
        this._currentScene = this._worldScene;
        break;

      case 1: // PreviewScene
        this._previewScene = new PreviewScene(this._engine, this);
        this._engine.BabylonEngine.displayLoadingUI();
        this._previewScene.scene.whenReadyAsync(true).then(() => {
          this._engine.BabylonEngine.hideLoadingUI();
        });
        this._currentScene = this._previewScene;
        break;

      case 2: // MobileScene
        this._mobileScene = new MobileScene(this._engine, this);
        this._engine.BabylonEngine.displayLoadingUI();
        this._mobileScene.scene.whenReadyAsync(true).then(() => {
          this._engine.BabylonEngine.hideLoadingUI();
        });
        this._currentScene = this._mobileScene;
    }
    this._currentScene.scene.attachControl();

    this.FadeScene(0.0);
  }

  get Scene() {
    return this._currentScene.scene;
  }
}

export default SceneStateMachine;
