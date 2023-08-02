// Module import
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Color4,
  FreeCamera,
  SceneLoader,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";
import Level from "./Level";
import Player from "./player/Player";
// Type import
import { PlayerAsset } from "./types/PlayerType";

/**
 * Environment class
 */
class Environment {
  // private _engine: Engine;
  private _scene: Scene;
  private _hemLight: HemisphericLight;
  private _level: Level;
  private _player: Player;

  constructor(readonly canvas: HTMLCanvasElement, readonly _engine: Engine) {
    // initialize babylon scene and engine
    this._scene = new Scene(this._engine);

    this._hemLight = new HemisphericLight(
      "light1",
      new Vector3(1, 1, 0),
      this._scene
    );
    this._level = new Level(this._scene);
    this._level.Load().then(() => console.log("level generated"));

    //this.LobbySceneSetup();
    // player construct
    this.LoadAsset().then((asset) => {
      this._player = new Player(this._scene, asset);
    });

    window.addEventListener("resize", () => {
      this._engine.resize();
    });
  }

  public async LoadAsset() {
    const result = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "character_with_anim.glb",
      this._scene
    );
    let mesh = result.meshes[0].getChildren()[0];
    mesh.parent = null; // remove parent after extracting
    console.log(result);

    const asset: PlayerAsset = {
      mesh,
      animationGroups: result.animationGroups.slice(14), // TODO: modify animations in blender later
    };

    return asset;
  }

  get Scene() {
    return this._scene;
  }
}

export default Environment;
