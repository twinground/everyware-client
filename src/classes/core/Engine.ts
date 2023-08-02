import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine as BabylonEngine, EngineFactory } from "@babylonjs/core";
import Environment from "./Environment";

class Engine {
  private _environment: Environment;
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
    // initialize environment
    this._engine = await EngineFactory.CreateAsync(this._canvas, undefined);
    this._environment = new Environment(this._canvas, this._engine);

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
