// library
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
  Vector3,
  FreeCamera,
  Engine as BabylonEngine,
  EngineFactory,
  Scene,
  Effect,
  Color4,
  TargetCamera,
  TouchCamera,
  PostProcess,
} from "@babylonjs/core";
// class
import World from "./World";
import Client from "../network/Client";
// interface
import ICustomScene from "../../interfaces/ICustomScene";
import WorldScene from "./scene/WorldScene";

class Engine {
  private _currentScene: ICustomScene;
  private _canvas: HTMLCanvasElement;
  private _babylonEngine: BabylonEngine;
  private _client: Client;

  constructor(brokerURL: string, expoName: string) {
    this.Init(brokerURL, expoName);
  }

  /**
   * private methods
   */
  private CreateCanvas() {
    this._canvas = document.createElement("canvas");
    this._canvas.id = "RenderCanvas";
    document.body.appendChild(this._canvas);
  }

  // TODO : remember last player's position when a user finishs preview
  private async Init(brokerURL: string, expoName: string) {
    // initialize client
    this._client = new Client(brokerURL);
    // TODO : uncomment below
    //this._client.Socket.activate();
    // const connectionPkt: IConnection = {
    //   user_id: this._client.id,
    //   data: "hi",
    // };
    // // publish existence to other users
    // this._client.Socket.publish({
    //   destination: `/${expoName}`,
    //   body: JSON.stringify(connectionPkt),
    // });

    this.CreateCanvas();

    // initialize babylon scene and engine
    this._babylonEngine = await EngineFactory.CreateAsync(
      this._canvas,
      undefined
    );
    this._babylonEngine.displayLoadingUI();
    this._currentScene = new WorldScene(
      this,
      this._canvas,
      this._client,
      expoName
    );

    // define shaders
    this.DefineCustomShader();

    // resize window
    window.addEventListener("resize", () => {
      this._babylonEngine.resize();
    });

    await this.main();
    this._babylonEngine.hideLoadingUI();
  }

  // Custom Shader definitions (custom shader only can be defined as PixelShader type)
  private DefineCustomShader() {
    /**
     * name : fadeOutPixelShader
     * fragment url : fadeOut
     */
    Effect.ShadersStore["fadeOutPixelShader"] =
      "precision highp float;" +
      "varying vec2 vUV;" +
      "uniform sampler2D textureSampler; " +
      "uniform float fadeLevel; " +
      "void main(void){" +
      "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
      "baseColor.a = 1.0;" +
      "gl_FragColor = baseColor;" +
      "}";
  }

  private IncrementAlpha(params: any) {
    params.fadeLevel = Math.abs(Math.cos(params.alpha));
    params.alpha += 0.015;
  }

  public FadeOutScene(camera: TargetCamera | TouchCamera) {
    const postProcess = new PostProcess(
      "Fade",
      "fadeOut",
      ["fadeLevel"],
      null,
      1.0,
      camera
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
      postProcess.dispose();
    }, 2617); // 60 frames per second * 0.01 => 0.6 per second
    // cos(0) = 1, cos(pi/2) = 0, pi/2 = 1.517 -> need 2617ms for fade out
  }

  public TransitScene(sceneType: number) {
    // world scene : 0
    // preview scene : 1
  }

  // asynchronous main runtime for client service
  private async main() {
    this._babylonEngine.runRenderLoop(() => {
      if (this._currentScene.scene.activeCamera) {
        this._currentScene.scene.render();
      }
    });
  }

  get BabylonEngine() {
    return this._babylonEngine;
  }
}

export default Engine;
