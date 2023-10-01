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
  private _engine: BabylonEngine;
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
    // create temporary camera for setup
    //let camera = new FreeCamera("temp", new Vector3(0, 0, 0));
    this._engine = await EngineFactory.CreateAsync(this._canvas, undefined);
    this._currentScene = new WorldScene(
      this._engine,
      this._canvas,
      this._client,
      expoName
    );

    // define shaders
    this.DefineCustomShader();

    // resize window
    window.addEventListener("resize", () => {
      this._engine.resize();
    });

    await this.main();
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

  // asynchronous main runtime for client service
  private async main() {
    this._engine.runRenderLoop(() => {
      if (this._currentScene.scene.activeCamera) {
        this._currentScene.scene.render();
      }
    });
  }

  /**
   * public field
   */
}

export default Engine;
