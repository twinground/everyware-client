// Module import
import {
  Scene,
  SceneLoader,
  ShadowGenerator,
  AnimationPropertiesOverride,
  Color3,
  Vector3,
  DirectionalLight,
  AnimationGroup,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";
// class
import Level from "./Level";
import Player from "./player/Player";
// type
import { PlayerAsset } from "../../types/PlayerType";
import { IConnection } from "../../interfaces/IPacket";
import type Client from "../network/Client";

/**
 * World class
 */
class World {
  // private _engine: Engine;
  private _level: Level;
  private _light: DirectionalLight;
  private _shadowGenerator: ShadowGenerator;
  private _player: Player;
  constructor(
    readonly canvas: HTMLCanvasElement,
    readonly _scene: Scene,
    private _client: Client,
    public expoName: string,
    callback: () => void
  ) {
    this._light = new DirectionalLight(
      "main_light",
      new Vector3(0, -1, -1),
      this._scene
    );
    this._light.shadowMaxZ = 130;
    this._light.shadowMinZ = 10;
    this._shadowGenerator = new ShadowGenerator(1024, this._light);
    this._level = new Level(this._scene);

    // player construct
    this.LoadModelAsset().then((asset) => {
      this._player = new Player(this._scene, asset);
      callback();
    });
    this.LoadLevelAsset();

    // listening on the connections from other users.
    this._client.Socket.subscribe(`/${expoName}`, (message) => {
      const connectionPkt: IConnection = JSON.parse(message.body);
      const newUserId = connectionPkt.user_id;
    });
  }

  public async LoadLevelAsset() {
    const res = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "house.glb",
      this._scene
    );
    res.meshes[0].scaling.setAll(0.8);
  }

  public async LoadModelAsset() {
    const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "player.glb",
      this._scene
    );

    let mesh = meshes[0]; // root mesh
    mesh.scaling.setAll(0.8); // scale mesh
    mesh.parent = null; // remove parent after extracting
    console.log(animationGroups);

    this._shadowGenerator.addShadowCaster(mesh, true);
    for (let i = 0; i < meshes.length; i++) {
      meshes[i].receiveShadows = false;
    }

    const asset: PlayerAsset = {
      mesh,
      animationGroups: animationGroups.slice(1),
    };

    return asset;
  }

  get Scene() {
    return this._scene;
  }
}

export default World;
