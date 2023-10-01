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
  NodeMaterial,
  Constants,
  Effect,
  PostProcess,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
// class
import Level from "./Level";
import Player from "./player/Player";
// type
import { PlayerAsset } from "../../types/PlayerType";
import { IConnection, IPacket, ITransform } from "../../interfaces/IPacket";
import type Client from "../network/Client";
import RemotePlayer from "./player/RemotePlayer";

/**
 * World class
 */
class World {
  // private _engine: Engine;
  private _level: Level;
  private _light: DirectionalLight;
  private _shadowGenerator: ShadowGenerator;
  private _player: Player;
  private _remotePlayerMap: { [userId: number]: RemotePlayer };
  private _advancedTexture: AdvancedDynamicTexture;

  constructor(
    readonly canvas: HTMLCanvasElement,
    readonly _scene: Scene,
    private _client: Client,
    public expoName: string,
    disposeCamera: () => void
  ) {
    // fullscreen mode GUI
    this._advancedTexture =
      AdvancedDynamicTexture.CreateFullscreenUI("EXPO_UI");

    this._light = new DirectionalLight(
      "main_light",
      new Vector3(0, -1, -1),
      this._scene
    );
    this._light.shadowMaxZ = 130;
    this._light.shadowMinZ = 10;
    this._shadowGenerator = new ShadowGenerator(1024, this._light);

    // player construct
    this.LoadModelAsset().then((asset) => {
      this._player = new Player(this._scene, asset);
      this._level = new Level(
        this._scene,
        this._advancedTexture,
        this._player,
        this
      );
      disposeCamera();
    });

    // listening on the connections from other users.
    // TODO : Uncomment below after spring server implemented
    /*
    this._client.Socket.subscribe(`/${expoName}`, (message) => {
      const packet: IPacket = JSON.parse(message.body);
      switch (packet.id) {
        case 0:
          this.LoadModelAsset().then((asset) => {
            const connectionPkt = packet.body as IConnection;
            this._remotePlayerMap[connectionPkt.user_id] = new RemotePlayer(
              this._scene,
              asset
            );
          });
          break;

        case 1:
          const {
            user_id,
            data: {
              position: { x, z },
              quaternion: { y, w },
              state,
            },
          } = packet.body as ITransform; // Destruct Transformation packet
          let target = this._remotePlayerMap[user_id];
          target.Mesh.position.set(x, 0, z); // update position
          target.Mesh.rotationQuaternion.set(0, y, 0, w); // update quaternion
          target.AnimationBlending(
            // blending animation
            target.CurAnim,
            target.Animations[state],
            0.05
          );
          target.CurAnim = target.Animations[state];
          break;
      }
    });
    */
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

  public FadeOutScene() {
    Effect.ShadersStore["fadePixelShader"] =
      "precision highp float;" +
      "varying vec2 vUV;" +
      "uniform sampler2D textureSampler; " +
      "uniform float fadeLevel; " +
      "void main(void){" +
      "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
      "baseColor.a = 1.0;" +
      "gl_FragColor = baseColor;" +
      "}";

    let fadeLevel = 1.0;
    const postProcess = new PostProcess(
      "Fade",
      "fade",
      ["fadeLevel"],
      null,
      1.0,
      this._player.CurrentCam
    );
    postProcess.onApply = (effect) => {
      effect.setFloat("fadeLevel", fadeLevel);
    };
    let alpha = 0;

    this._scene.onBeforeRenderObservable.add(() => {
      fadeLevel = Math.abs(Math.cos(alpha));
      alpha += 0.01;
    });

    setTimeout(() => {
      postProcess.dispose();
    }, 2617);
  }

  get Scene() {
    return this._scene;
  }
}

export default World;
