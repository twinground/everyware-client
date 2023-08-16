import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
  Vector3,
  FreeCamera,
  Engine as BabylonEngine,
  EngineFactory,
  Scene,
  Color3,
  Color4,
} from "@babylonjs/core";
import Environment from "./Environment";

class Engine {
  private _environment: Environment;
  private _scene: Scene;
  private _canvas: HTMLCanvasElement;
  private _engine: BabylonEngine;

  constructor() {
    this.Init();
  }

  /**
   * private methods
   */
  private CreateCanvas() {
    this._canvas = document.createElement("canvas");
    this._canvas.id = "RenderCanvas";
    document.body.appendChild(this._canvas);
  }

  private async Init() {
    this.CreateCanvas();
    // initialize babylon scene and engine
    this._engine = await EngineFactory.CreateAsync(this._canvas, undefined);
    this._scene = new Scene(this._engine);
    this._scene.clearColor = new Color4(36 / 255, 113 / 255, 214 / 255);

    // create temporary camera for setup
    let camera = new FreeCamera("temp", new Vector3(0, 0, 0));

    // initialize environment
    this._environment = new Environment(this._canvas, this._scene, () => {
      camera.dispose(); // dispose camera after player is ready
    });

    // resize window
    window.addEventListener("resize", () => {
      this._engine.resize();
    });

    await this.main();
  }

  // asynchronous main runtime for client service
  private async main() {
    this._engine.runRenderLoop(() => {
      this._environment.Scene.render();
    });
  }

  /**
   * public field
   */
}

export default Engine;
