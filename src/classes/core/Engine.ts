import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import Environment from "./Environment";

class Engine {
  private _environment: Environment;
  private _canvas: HTMLCanvasElement;

  constructor() {
    // initialize environment
    this.CreateCanvas();
    this._environment = new Environment(this._canvas);

    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        if (this._environment.Scene.debugLayer.isVisible()) {
          this._environment.Scene.debugLayer.hide();
        } else {
          this._environment.Scene.debugLayer.show();
        }
      }
    });
  }

  private CreateCanvas() {
    this._canvas = document.createElement("canvas");
    this._canvas.id = "RenderCanvas";
    document.body.appendChild(this._canvas);
    return this._canvas;
  }

  public Run() {
    this._environment.Engine.runRenderLoop(() => {
      this._environment.Scene.render();
    });
  }
}

export default Engine;
