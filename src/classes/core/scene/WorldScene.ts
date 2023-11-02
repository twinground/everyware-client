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

const OUTLINE_COLOR = new Color3(1, 1, 0);

/**
 * World Scene
 * In this scene, user should subscribe "/{expo_name}/lobby" endpoint
 */
class WorldScene implements ICustomScene {
  public scene: Scene;
  private _engine: Engine;
  private _level: Level;
  private _light: HemisphericLight;
  private _shadowGenerator: ShadowGenerator;
  private _player: Player;
  private _remotePlayerMap: { [userId: string]: RemotePlayer } = {};
  private _advancedTexture: AdvancedDynamicTexture;
  private _viewButtons: Button[];
  private _isViewing: boolean;
  private _gizman: GizmoManager;
  private _gizmode: number;

  constructor(
    private engine: Engine,
    private _socket: Socket,
    private _sceneMachine: ISceneStateMachine,
    public expoName: string
  ) {
    this.TutorialOnboarding();
    // Initialize Scene
    this.scene = new Scene(engine.BabylonEngine);
    this.scene.actionManager = new ActionManager();
    this._gizman = new GizmoManager(this.scene);
    this._gizmode = 0;

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

    // Fullscreen mode GUI
    this._advancedTexture =
      AdvancedDynamicTexture.CreateFullscreenUI("EXPO_GUI");

    // Light Setup
    this._light = new HemisphericLight(
      "hemi",
      new Vector3(0, 50, 0),
      this.scene
    );
    this._light.intensity = 0.6;

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

    // this._shadowGenerator.addShadowCaster(mesh, true);
    // for (let i = 0; i < meshes.length; i++) {
    //   meshes[i].receiveShadows = false;
    // }

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
  public CreateViewButton(linkMesh: Mesh) {
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
      this._player.SendTransformPacket();

      viewButton.isVisible = false;
    });

    this.scene.onBeforeRenderObservable.add(() => {
      if (
        !this._isViewing &&
        linkMesh.intersectsMesh(this._player.Mesh, false)
      ) {
        viewButton.isVisible = true;

        for (let child of linkMesh.getChildMeshes().slice(1)) {
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

  /**
   * Simple tutorial secene function
   */
  private TutorialOnboarding() {
    const imgSources = [
      "/images/monalisa.png",
      "/images/night-mode.png",
      "/images/monalisa.png",
    ];

    let textList = ["NEXT", "SKIP"];

    const bodyElement = document.body;
    const imgElement = document.createElement("img");
    const switchElement = document.getElementsByClassName("switch");
    const tutorialButton = [
      document.createElement("div"),
      document.createElement("div"),
    ];

    // Create nest, skip button
    for (let i = 0; i < tutorialButton.length; i++) {
      tutorialButton[i].classList.add("tutorial-button");
      tutorialButton[i].textContent = textList[i];
      tutorialButton[i].style.right = `${130 - i * 100}px`;
      bodyElement.appendChild(tutorialButton[i]);
    }

    switchElement[0].classList.add("hidden");

    // set img source
    imgElement.src = imgSources[0]; // 이미지 파일 경로를 지정
    imgElement.style.width = "100%";
    imgElement.style.height = "100%";
    imgElement.style.zIndex = "10";
    imgElement.style.position = "relative";

    // append img to body
    bodyElement.appendChild(imgElement);
    bodyElement.prepend(imgElement);

    //add event listener
    let flag = 1;
    tutorialButton[0].addEventListener("click", () => {
      if (flag < 3) {
        this.ChangeImageSource(imgElement, imgSources[flag]);
        flag += 1;
      } else if (flag >= 3) {
        this.SkipTutorialImg(switchElement, tutorialButton, imgElement);
      }
    });

    tutorialButton[1].addEventListener("click", () => {
      this.SkipTutorialImg(switchElement, tutorialButton, imgElement);
    });
  }

  private ChangeImageSource(
    imgElement: HTMLImageElement,
    newSrc: string
  ): void {
    imgElement.style.transition = "opacity 0.5s";
    imgElement.style.opacity = "0";
    setTimeout(function () {
      imgElement.src = newSrc;
      imgElement.style.transition = "opacity 0.5s";
      imgElement.style.opacity = "1";
    }, 500);
  }

  private SkipTutorialImg(switchElement, tutorialButton, imgElement) {
    switchElement[0].classList.remove("hidden");
    imgElement.style.transition = "opacity 0.5s";
    imgElement.style.opacity = "0";
    setTimeout(function () {
      imgElement.remove();
      tutorialButton[0].remove();
      tutorialButton[1].remove();
    }, 500);
  }
}

export default WorldScene;
