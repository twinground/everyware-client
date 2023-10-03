//module
import { Engine as BabylonEngine, PostProcess } from "@babylonjs/core";
// class
import Client from "../../network/Client";
import Engine from "../Engine";
import WorldScene from "./WorldScene";
//interface
import ICustomScene from "../../../interfaces/ICustomScene";
import { ISceneStateMachine } from "../../../interfaces/IStateMachine";
import PreviewScene from "./PreviewScene";

class SceneStateMachine implements ISceneStateMachine {
  private _currentScene: ICustomScene;
  private _engine: Engine;
  private _canvas: HTMLCanvasElement;
  private _client: Client;
  private _expoName: string;

  constructor(
    engine: Engine,
    canvas: HTMLCanvasElement,
    client: Client,
    expoName: string
  ) {
    //initial scene
    this._engine = engine;
    this._canvas = canvas;
    this._expoName = expoName;
    this._currentScene = new WorldScene(
      this._engine,
      canvas,
      client,
      this,
      expoName
    );
  }

  private IncrementAlpha(params: any) {
    params.fadeLevel = Math.abs(Math.cos(params.alpha));
    params.alpha += 0.015;
  }

  public FadeOutScene() {
    const postProcess = new PostProcess(
      "FadeOut",
      "fadeOut",
      ["fadeLevel"],
      null,
      1.0,
      this._currentScene.scene.activeCamera
    );

    const params = {
      fadeLevel: 1.0,
      alpha: 0.0,
    };

    const boundedIncremetAlpha = this.IncrementAlpha.bind(this, params);
    postProcess.onApply = (effect) => {
      effect.setFloat("fadeLevel", params.fadeLevel);
    };

    this._currentScene.scene.onBeforeRenderObservable.add(boundedIncremetAlpha);

    // dispose postProcess after 2617ms
    setTimeout(() => {
      this._currentScene.scene.onBeforeRenderObservable.removeCallback(
        boundedIncremetAlpha
      );
      console.log("dispose post process & render callback");
      postProcess.dispose();
    }, 1701); // 60 frames per second * 0.015 => 0.6 per second
    // cos(0) = 1, cos(pi/2) = 0, pi/2 = 1.517 -> need 1685ms for fade out
  }

  UpdateMachine(nextSceneType: number): void {
    this.FadeOutScene();
    setTimeout(() => {
      console.log("transition to preview");
      this.Transition(nextSceneType);
    }, 1700); // transition first before dispose effect resource
  }

  Transition(nextSceneType: number): void {
    this._engine.BabylonEngine.displayLoadingUI();
    this._currentScene.scene.detachControl();

    let nextScene: ICustomScene = null;
    switch (nextSceneType) {
      case 0: // WorldScene
        nextScene = new WorldScene(
          this._engine,
          this._canvas,
          this._client,
          this,
          this._expoName
        );
        break;

      case 1: // PreviewScene
        nextScene = new PreviewScene(this._engine, this._canvas);
        break;
    }
  }

  get Scene() {
    return this._currentScene.scene;
  }
}

export default SceneStateMachine;
