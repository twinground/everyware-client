// library
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
  Vector3,
  FreeCamera,
  Engine as BabylonEngine,
  EngineFactory,
  Scene,
  Color4,
} from "@babylonjs/core";
// class
import World from "./World";
import Client from "../network/Client";

class Engine {
  private _world: World;
  private _scene: Scene;
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

  private async Init(brokerURL: string, expoName: string) {
    // initialize client
    this._client = new Client(brokerURL);
    this._client.Socket.activate();

    this.CreateCanvas();

    // initialize babylon scene and engine
    this._engine = await EngineFactory.CreateAsync(this._canvas, undefined);
    this._scene = new Scene(this._engine);
    this._scene.clearColor = new Color4(36 / 255, 113 / 255, 214 / 255);

    // create temporary camera for setup
    let camera = new FreeCamera("temp", new Vector3(0, 0, 0));

    // initialize world
    this._world = new World(
      this._canvas,
      this._scene,
      this._client,
      expoName,
      () => {
        camera.dispose(); // dispose camera after player is ready
      }
    );

    // resize window
    window.addEventListener("resize", () => {
      this._engine.resize();
    });

    await this.main();
  }

  // asynchronous main runtime for client service
  private async main() {
    this._engine.runRenderLoop(() => {
      this._world.Scene.render();
    });
  }

  /**
   * public field
   */
}

export default Engine;
