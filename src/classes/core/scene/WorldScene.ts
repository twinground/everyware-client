// Module import
import {
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
import { IConnection, ITransform } from "../../../interfaces/IPacket";
import Socket from "../../network/SocketClient";
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
  private _remotePlayerMap: { [userId: string]: RemotePlayer } = {};
  private _advancedTexture: AdvancedDynamicTexture;
  private _viewButtons: Button[];
  private _isViewing: boolean;

  constructor(
    readonly engine: Engine,
    readonly canvas: HTMLCanvasElement,
    private _socket: Socket,
    private _sceneMachine: ISceneStateMachine,
    public expoName: string
  ) {
    // Initialize Scene
    this._engine = engine;
    this.scene = new Scene(this._engine.BabylonEngine);

    // Socket Event callback definition for "connection" and "transform"
    this._socket.On("connection").Add((data: IConnection) => {
      // Initialize all the users exists in server before this connection
      for (let userData of data.transforms) {
        this.LoadModelAsset().then((asset) => {
          const {
            session_id,
            position: { x, z },
            quaternion: { y, w },
            state,
          } = userData;
          this._remotePlayerMap[session_id] = new RemotePlayer(
            this.scene,
            asset
          );
          const target = this._remotePlayerMap[session_id];
          target.Mesh.position.set(x, 0, z); // update position
          target.Mesh.rotationQuaternion.set(0, y, 0, w); // update quaternion
          target.AnimationBlending(
            // blending animation
            target.CurAnim,
            target.Animations[state],
            0.05
          );
        });
      }
    });
    this._socket.On("transform").Add((data: ITransform) => {
      const {
        session_id,
        data: {
          position: { x, z },
          quaternion: { y, w },
          state,
        },
      } = data; // Destruct Transformation packet
      const target = this._remotePlayerMap[session_id];
      target.Mesh.position.set(x, 0, z); // update position
      target.Mesh.rotationQuaternion.set(0, y, 0, w); // update quaternion
      target.AnimationBlending(
        // blending animation
        target.CurAnim,
        target.Animations[state],
        0.05
      );
    });

    // Busy-waiting for connection establishment.
    // There is no reason to proceed scene if there is an unexpected error on socket connection
    let start = Date.now();
    while (this._socket.WebSock.CONNECTING) {
      let duration = Date.now() - start;
      if (duration > 50000) {
        break; // if suspend time is over 5 seconds, give up service to this client. (fatal error happened in this case).
      }
    }

    const connectionData: IConnection = {
      session_id: this._socket.id,
      expo_name: expoName,
      transforms: [],
    };
    this._socket.Send(1, connectionData);

    // Fullscreen mode GUI
    this._advancedTexture =
      AdvancedDynamicTexture.CreateFullscreenUI("EXPO_GUI");

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
      this._player = new Player(this.scene, this._socket, expoName, asset);
      this._level = new Level(
        this.scene,
        this._advancedTexture,
        this._player,
        this
      );
    });

    this._viewButtons = [];
    this._isViewing = false;
  }

  /**
   * asynchronous load GLB asset from public shared directory
   * @returns asset
   */
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

  /**
   * Create view button UI and enroll events on the button.
   * @param linkMesh a mesh will be linked to button UI
   */
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
}

export default WorldScene;
