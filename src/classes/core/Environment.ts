// Module import
import {
  Scene,
  SceneLoader,
  ShadowGenerator,
  AnimationPropertiesOverride,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";
import Level from "./Level";
import Player from "./player/Player";
// Type import
import { PlayerAsset } from "../../types/PlayerType";

/**
 * Environment class
 */
class Environment {
  // private _engine: Engine;
  private _level: Level;
  private _player: Player;
  private _shadowGenerator: ShadowGenerator;

  constructor(
    readonly canvas: HTMLCanvasElement,
    readonly _scene: Scene,
    callback: () => void
  ) {
    this._level = new Level(this._scene);
    this._shadowGenerator = new ShadowGenerator(1024, this._level.Light);
    this._level.Load().then(() => console.log("level generated"));

    // player construct
    this.LoadModelAsset().then((asset) => {
      this._player = new Player(this._scene, asset);
      callback();
    });
  }

  public async LoadModelAsset() {
    const result = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "character_with_anim.glb",
      this._scene
    );
    let skeleton = result.skeletons[0];
    let mesh = result.meshes[0]; // root mesh
    this._shadowGenerator.addShadowCaster(this._scene.meshes[0], true);
    for (let i = 0; i < result.meshes.length; i++) {
      result.meshes[i].receiveShadows = false;
    }
    mesh.scaling.setAll(0.8); // scale mesh
    mesh.parent = null; // remove parent after extracting

    skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
    skeleton.animationPropertiesOverride.enableBlending = true;
    skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
    skeleton.animationPropertiesOverride.loopMode = 1;

    console.log(skeleton);

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
