// Module import
import {
  Scene,
  SceneLoader,
  ShadowGenerator,
  Color3,
  Vector3,
  Mesh,
  GizmoManager,
  ExecuteCodeAction,
  ActionManager,
  HemisphericLight,
  FollowCamera,
  TransformNode,
  AbstractMesh,
  DirectionalLight,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import { Inspector } from "@babylonjs/inspector";
// class
import Level from "../level/Level";
import Player from "../player/Player";
import Engine from "../Engine";
import Socket from "../../network/SocketClient";
import RemotePlayer from "../player/RemotePlayer";
import { createButton } from "../ui/ViewButton";
import { ISceneStateMachine } from "../../../interfaces/IStateMachine";
// type
import ICustomScene from "../../../interfaces/ICustomScene";
import { PlayerAsset } from "../../../types/PlayerType";
import {
  IConnection,
  IDisconnection,
  ITransform,
} from "../../../interfaces/IPacket";
import Booth from "../level/Booth";

const OUTLINE_COLOR = new Color3(1, 1, 0);
//type CollisionCallback = (targetMesh: Mesh) => void;

/**
 * World Scene
 * In this scene, user should subscribe "/{expo_name}/lobby" endpoint
 */
class WorldScene implements ICustomScene {
  public scene: Scene;
  private _engine: Engine;
  /* environment */
  private _level: Level;
  private _hemiLight: HemisphericLight;
  private _dirLight: DirectionalLight;
  private _shadowGenerator: ShadowGenerator;
  /* player-related */
  private _player: Player;
  private _remotePlayerMap: { [userId: string]: RemotePlayer } = {};
  /* GUI */
  private _advancedTexture: AdvancedDynamicTexture;
  private _viewButtons: Button[];
  /* boolean states */
  private _isViewing: boolean;
  /* gizmo related */
  private _gizman: GizmoManager;
  private _gizmode: number;

  constructor(
    private engine: Engine,
    private _sceneMachine: ISceneStateMachine,
    public expoName: string,
    private _socket?: Socket
  ) {
    // Initialize Scene
    this.scene = new Scene(engine.BabylonEngine);
    this.scene.collisionsEnabled = true;
    this.scene.actionManager = new ActionManager();

    // Gizmo manager
    this._gizman = new GizmoManager(this.scene);
    this._gizmode = 0;

    // Fullscreen mode GUI
    this._advancedTexture =
      AdvancedDynamicTexture.CreateFullscreenUI("EXPO_GUI");

    // Light Setup
    this._hemiLight = new HemisphericLight(
      "hemi-light",
      new Vector3(0, 50, 0),
      this.scene
    );
    //this._hemiLight.intensity = 1.5;
    this._dirLight = new DirectionalLight(
      "dir-light",
      new Vector3(0, 1, 0),
      this.scene
    );
    //this._shadowGenerator = new ShadowGenerator(1024, this._dirLight);

    // Socket Event callback definition for "connection" and "transform"
    if (this._socket) {
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

        if (target.CurAnim.name != state) {
          this.scene.onBeforeRenderObservable.runCoroutineAsync(
            target.AnimationBlending(
              // blending animation
              target.Animations[state],
              target.Animations[target.CurAnim.name],
              0.05
            )
          );
          target.CurAnim = target.Animations[state];
        }
      });

      this._socket.On("disconnection").Add((data: IDisconnection) => {
        this._remotePlayerMap[data.session_id].dispose(); // delete all resource of this player
        delete this._remotePlayerMap[data.session_id];
      });

      // Promise-based-waiting for connection establishment.
      // There is no reason to proceed scene if there is an unexpected error on socket connection
      this.WaitConnection().then(() => {
        const connectionData: IConnection = {
          session_id: this._socket.id,
          expo_name: expoName,
          transforms: [],
        };
        this._socket.Send(1, connectionData);
      });
    }

    // player construct
    this.LoadModelAsset().then((asset) => {
      if (this._socket) {
        this._player = new Player(this.scene, expoName, asset, this._socket);
      } else {
        this._player = new Player(this.scene, expoName, asset);
      }
      this._level = new Level(
        this.scene,
        this._advancedTexture,
        this._player,
        this
      );
    });

    this._viewButtons = [];
    this._isViewing = false;

    // TODO : Use this debuggers only for development
    this.SetGizmoInteraction();
    this.SetInpsector();
  }

  /**
   * asynchronous load GLB asset from public shared directory
   * @returns asset
   */
  public async LoadModelAsset() {
    //this._gltf2Loader.loadAsync(this.scene, "./models/character2.glb")
    const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "character2.glb",
      this.scene
    );

    let mesh = meshes[0]; // root mesh
    mesh.scaling.setAll(0.8); // scale mesh
    mesh.parent = null; // remove parent after extracting
    //this._shadowGenerator.addShadowCaster(mesh, true);
    const asset: PlayerAsset = {
      mesh,
      animationGroups: animationGroups.slice(2),
    };

    return asset;
  }

  /**
   * This function makes available synchronous initial connection packet send
   * @returns promise object to wait connection
   */
  public async WaitConnection(): Promise<void> {
    return new Promise<void>((resolve) => {
      // Check the WebSocket state in an interval
      const interval = setInterval(() => {
        // If the WebSocket is open, resolve the promise and clear the interval
        if (this._socket.WebSock.readyState === WebSocket.OPEN) {
          resolve();
          clearInterval(interval);
        }
      }, 100); // Check every 100 milliseconds
    });
  }

  /**
   * Create view button UI and enroll events on the button.
   * @param linkMesh a mesh will be linked to button UI
   */
  public CreateDeskCollisionEvent(linkMesh: Mesh) {
    const viewButton = createButton(linkMesh, this._advancedTexture);

    // view mode event
    viewButton.onPointerClickObservable.add(() => {
      this._isViewing = true;

      // fade out scene
      this._sceneMachine.UpdateMachine(1); // 1 : PreviewScene
      // player camera zoom in
      this._player.ZoomInFollowCam();
      // start animation and change anim state.
      this._player.Controller.UpdateViewMode(true);
      this._player.CurAnim = this._player.Animations.thumbsUp;
      if (this._socket) {
        this._player.SendTransformPacket();
      }

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
          child.outlineWidth = 0.02;
          child.renderOutline = true;
        }
      } else {
        viewButton.isVisible = false;

        for (let child of linkMesh.getChildMeshes().slice(1)) {
          child.renderOutline = false;
        }
      }
    });

    this._viewButtons.push(viewButton);
  }
  /**
   * Create collision event and push the callback into callback queue
   * @param targetMesh mesh to check collision from player mesh
   */
  public CreateBoothCollisionEvent(targetBooths: Booth[]) {
    this.scene.onBeforeRenderObservable.add(() => {
      let flag = false;
      for (let booth of targetBooths) {
        if (booth.boothCollision.intersectsMesh(this._player.Mesh, false)) {
          flag = true;
        }
      }

      if (flag) {
        (this._player.CurrentCam as FollowCamera).radius = 2.5;
        (this._player.CurrentCam as FollowCamera).heightOffset = 0;
        (this._player.CurrentCam as FollowCamera).cameraAcceleration = 0.02;
        (this._player.CurrentCam as FollowCamera).lockedTarget =
          this._player.HeadMesh;
      } else {
        (this._player.CurrentCam as FollowCamera).radius = 5.5;
        (this._player.CurrentCam as FollowCamera).cameraAcceleration = 0.02;
        (this._player.CurrentCam as FollowCamera).heightOffset = 1.0;
        (this._player.CurrentCam as FollowCamera).lockedTarget =
          this._player.Mesh;
      }
    });
  }

  /**
   * Mesh debugger with gizmo manager
   */
  public SetGizmoInteraction() {
    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
        let key = evt.sourceEvent.key;
        if (key == "R" || key == "ㄲ") {
          //shift + R
          ++this._gizmode;
          this._gizmode %= 4;

          switch (this._gizmode) {
            case 0:
              this._gizman.rotationGizmoEnabled = false;
              break;
            case 1:
              this._gizman.positionGizmoEnabled = true;
              break;
            case 2:
              this._gizman.positionGizmoEnabled = false;
              this._gizman.scaleGizmoEnabled = true;
              break;
            case 3:
              this._gizman.scaleGizmoEnabled = false;
              this._gizman.rotationGizmoEnabled = true;
              break;
          }
        }
      })
    );
  }

  /**
   * set babylon inspector
   */
  public SetInpsector() {
    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
        let key = evt.sourceEvent.key;
        if (key == "D") {
          Inspector.Show(this.scene, { embedMode: true });
        }
      })
    );
  }

  /**
   * Getter / Setter
   */
  get LocalPlayer() {
    return this._player;
  }

  get GizmoManager() {
    return this._gizman;
  }

  set isViewing(v: boolean) {
    this._isViewing = v;
  }
}

export default WorldScene;
