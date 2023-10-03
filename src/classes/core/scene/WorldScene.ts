// Module import
import {
  Engine as BabylonEngine,
  Scene,
  SceneLoader,
  ShadowGenerator,
  Color3,
  Vector3,
  DirectionalLight,
  Mesh,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import ICustomScene from "../../../interfaces/ICustomScene";
// class
import Level from "../level/Level";
import Player from "../player/Player";
import Engine from "../Engine";
// type
import { PlayerAsset } from "../../../types/PlayerType";
import { IConnection, IPacket, ITransform } from "../../../interfaces/IPacket";
import Client from "../../network/Client";
import RemotePlayer from "../player/RemotePlayer";
import { createButton } from "../ui/ViewButton";
import { ISceneStateMachine } from "../../../interfaces/IStateMachine";

const OUTLINE_COLOR = new Color3(1, 1, 0);

/**
 * World Scene
 * In this scene, user should subscribe "/{expo_name}/lobby" endpoint
 */
class WorldScene implements ICustomScene {
  public scene: Scene;
  private _engine: Engine;
  private _level: Level;
  private _light: DirectionalLight;
  private _shadowGenerator: ShadowGenerator;
  private _player: Player;
  private _remotePlayerMap: { [userId: string]: RemotePlayer };
  private _advancedTexture: AdvancedDynamicTexture;
  private _viewButtons: Button[];
  private _isViewing: boolean;

  constructor(
    readonly engine: Engine,
    readonly canvas: HTMLCanvasElement,
    private _client: Client,
    private _sceneMachine: ISceneStateMachine,
    public expoName: string
  ) {
    // Initialize Scene
    this._engine = engine;
    this.scene = new Scene(this._engine.BabylonEngine);

    // start subscribe to other user's connection
    this._client.SubscriptionList["init"].unsubscribe();
    delete this._client.SubscriptionList["init"];
    this._client.SubscriptionList["connect"] = this._client.Socket.subscribe(
      `/sub/expo/${expoName}`,
      (message) => {
        const connectionPkt: IConnection = JSON.parse(message.body);
        this.LoadModelAsset().then((asset) => {
          this._remotePlayerMap[connectionPkt.user_id] = new RemotePlayer(
            this.scene,
            asset
          );
        });
      }
    );

    // Fullscreen mode GUI
    this._advancedTexture =
      AdvancedDynamicTexture.CreateFullscreenUI("EXPO_UI");

    // Light Setup
    this._light = new DirectionalLight(
      "main-light",
      new Vector3(0, -1, -1),
      this.scene
    );
    this._light.shadowMaxZ = 130;
    this._light.shadowMinZ = 10;
    this._shadowGenerator = new ShadowGenerator(1024, this._light);

    // player construct
    this.LoadModelAsset().then((asset) => {
      this._player = new Player(this.scene, this._client, expoName, asset);
      this._level = new Level(
        this.scene,
        this._advancedTexture,
        this._player,
        this
      );
    });

    this._viewButtons = [];
    this._isViewing = false;

    this._client.Socket.subscribe(
      `/sub/expo/${expoName}/transform`,
      (message) => {
        const {
          user_id,
          data: {
            position: { x, z },
            quaternion: { y, w },
            state,
          },
        } = JSON.parse(message.body) as ITransform; // Destruct Transformation packet
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
      }
    );
  }

  public async LoadModelAsset() {
    const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "player.glb",
      this.scene
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

  public CreateViewButton(linkMesh: Mesh) {
    const viewButton = createButton(linkMesh, this._advancedTexture);

    viewButton.onPointerClickObservable.add(() => {
      this._isViewing = true;
      this._player.Mesh.position = linkMesh.position
        .clone()
        .addInPlace(new Vector3(0, -0.3, 0));
      this._player.Mesh.rotationQuaternion = linkMesh
        .getChildMeshes()[0]
        .rotationQuaternion.clone();

      // fade out scene
      this._sceneMachine.UpdateMachine(1); // 1 : PreviewScene
      // player camera zoom in
      this._player.ZoomInFollowCam();
      // start animation and change anim state.
      this._player.Controller.UpdateViewMode();

      viewButton.isVisible = false;
    });

    this.scene.onBeforeRenderObservable.add(() => {
      if (
        !this._isViewing &&
        linkMesh.intersectsMesh(this._player.Mesh, false)
      ) {
        viewButton.isVisible = true;

        for (let child of linkMesh.getChildMeshes()) {
          child.outlineColor = OUTLINE_COLOR;
          child.outlineWidth = 0.08;
          child.renderOutline = true;
        }
      } else {
        viewButton.isVisible = false;

        for (let child of linkMesh.getChildMeshes()) {
          child.renderOutline = false;
        }
      }
    });

    this._viewButtons.push(viewButton);
  }

  // get Camera() {
  //   return this._player.CurrentCam;
  // }
}

export default WorldScene;
