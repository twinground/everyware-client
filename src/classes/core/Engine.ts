// library
import "@babylonjs/core/Debug/debugLayer";
import HavokPhysics from "@babylonjs/havok";
//import havokWasmUrl from "./physics/HavokPhysics.wasm?url"; // postinstalled wasm file, ignore error

import "@babylonjs/inspector";
import {
  Engine as BabylonEngine,
  EngineFactory,
  Effect,
  HavokPlugin,
} from "@babylonjs/core";
// class
import Socket from "../network/SocketClient";
// interface
import SceneStateMachine from "./scene/SceneStateMachine";
import { ISceneStateMachine } from "../../interfaces/IStateMachine";

class Engine {
  private _sceneStateMachine: ISceneStateMachine;
  private _canvas: HTMLCanvasElement;
  private _babylonEngine: BabylonEngine;
  private _physicsEngine: HavokPlugin;
  private _socket: Socket | null;

  constructor(expoName: string, socket?: Socket) {
    if (socket) {
      console.log("server connected"); // TODO : debug purpose
      this._socket = socket;
    }
    this.Init(expoName);
  }

  /**
   * private methods
   */
  private CreateCanvas() {
    const canvasZone = document.getElementById("CanvasZone");
    this._canvas = document.createElement("canvas");
    this._canvas.id = "RenderCanvas";
    canvasZone?.appendChild(this._canvas);
  }

  // TODO : remember last player's position when a user finishs preview
  private async Init(expoName: string) {
    // initialize client
    this.CreateCanvas();

    // initialize babylon scene and engine
    this._babylonEngine = await EngineFactory.CreateAsync(
      this._canvas,
      undefined
    );

    const havok = await HavokPhysics({
      locateFile: () => "./scripts/HavokPhysics.wasm?url",
    });
    this._physicsEngine = new HavokPlugin(true, havok);

    //this._babylonEngine.displayLoadingUI();
    if (this._socket) {
      this._sceneStateMachine = new SceneStateMachine(
        this,
        this._canvas,
        expoName,
        this._socket
      );
    } else {
      this._sceneStateMachine = new SceneStateMachine(
        this,
        this._canvas,
        expoName
      );
    }

    // define shaders
    this.DefineCustomShader();

    // resize window
    window.addEventListener("resize", () => {
      this._babylonEngine.resize();
    });

    await this.main();
  }

  // Custom Shader definitions (custom shader only can be defined as PixelShader type)
  private DefineCustomShader() {
    /**
     * name : fadeOutPixelShader
     * fragment url : fadeOut
     */
    Effect.RegisterShader(
      "fadeOut",
      "precision highp float;" +
        "varying vec2 vUV;" +
        "uniform sampler2D textureSampler; " +
        "uniform float fadeLevel; " +
        "void main(void){" +
        "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
        "baseColor.a = 1.0;" +
        "gl_FragColor = baseColor;" +
        "}"
    );

    Effect.RegisterShader(
      "fadeIn",
      "precision highp float;" +
        "varying vec2 vUV;" +
        "uniform sampler2D textureSampler; " +
        "uniform float fadeLevel; " +
        "void main(void){" +
        "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
        "baseColor.a = 1.0;" +
        "gl_FragColor = baseColor;" +
        "}"
    );
  }

  // asynchronous main runtime for client service
  private async main() {
    this._babylonEngine.runRenderLoop(() => {
      if (
        this._sceneStateMachine.Scene &&
        this._sceneStateMachine.Scene.activeCamera
      ) {
        this._sceneStateMachine.Scene.render();
      }
    });
  }

  get BabylonEngine() {
    return this._babylonEngine;
  }

  get HavokPlugin() {
    return this._physicsEngine;
  }
}

export default Engine;
