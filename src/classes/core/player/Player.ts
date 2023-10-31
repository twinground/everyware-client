// Module import
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  AnimationGroup,
  AbstractMesh,
  TransformNode,
  AsyncCoroutine,
  FollowCamera,
  UniversalCamera,
  TargetCamera,
  ExecuteCodeAction,
  ActionManager,
} from "@babylonjs/core";
// Type import
import { PlayerAsset, PlayerAnimations } from "../../../types/PlayerType";
import PlayerController from "./PlayerController";
import Socket from "../../network/SocketClient";
import { ITransform } from "../../../interfaces/IPacket";

class Player extends TransformNode {
  private _socket: Socket;
  private _mesh: AbstractMesh;
  private _arcRotCamera: ArcRotateCamera;
  private _followCamera: FollowCamera;
  private _universalCamera: UniversalCamera;
  private _currentCamera: TargetCamera;
  private _animations: PlayerAnimations;
  private _curAnim: AnimationGroup;
  private _playerController: PlayerController;
  public expoName: string;

  constructor(
    readonly scene: Scene,
    socket: Socket,
    expoName: string,
    asset: PlayerAsset
  ) {
    super("player", scene);
    this.scene = scene;
    this._socket = socket;
    this.expoName = expoName;

    /**
     * -----  Mesh initialization -----
     */
    this._mesh = asset.mesh;
    this._mesh.parent = this;

    /**
     * ----- Player controller -----
     */
    this._playerController = new PlayerController(this, this._scene);

    /**
     * ----- Camera configuration -----
     */

    // Arc rotation camera configuration
    this._arcRotCamera = new ArcRotateCamera(
      "arc-rotate-cam",
      Math.PI / 2,
      Math.PI / 4,
      20,
      new Vector3(0, 0, 0),
      this.scene
    );
    this._arcRotCamera.lowerBetaLimit = 0.1;
    this._arcRotCamera.upperBetaLimit = (Math.PI / 2) * 0.9;
    this._arcRotCamera.lowerRadiusLimit = 1;
    this._arcRotCamera.upperRadiusLimit = 150;
    this._arcRotCamera.setPosition(new Vector3(0, 0, -10));
    this._arcRotCamera.attachControl(true);
    this._arcRotCamera.setTarget(this._mesh);

    // Follow camera configuration
    this._followCamera = new FollowCamera(
      "follow-cam",
      new Vector3(0, -2, 0),
      this.scene,
      this._mesh
    );
    this._followCamera.radius = 5.5;
    this._followCamera.rotationOffset = 180;
    this._followCamera.heightOffset = 2.0;
    this._followCamera.cameraAcceleration = 0.05; // control camera rotation speed

    // Universal camera configuration
    // Parameters : name, position, scene
    this._universalCamera = new UniversalCamera(
      "univeral-cam",
      this._mesh.position,
      this.scene
    );
    this._universalCamera.setTarget(this._mesh.position);

    // Initial camera setup
    this.scene.activeCamera = this._followCamera;
    this._currentCamera = this._followCamera;
    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
        if (evt.sourceEvent.key == "Control") {
          this.scene.activeCamera = this._arcRotCamera;
          this._arcRotCamera.attachControl(
            this.scene.getEngine().getRenderingCanvas(),
            true
          );
        }
      })
    );
    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
        if (evt.sourceEvent.key == "Control") {
          this.scene.activeCamera = this._followCamera;
        }
      })
    );

    /**
     * ----- Animation asset initialization -----
     */
    // store animation assets
    this.scene.stopAllAnimations();
    // re-assign animation names by its key
    asset.animationGroups[0].name = "idle";
    asset.animationGroups[1].name = "thumbsUp";
    asset.animationGroups[2].name = "walkBack";
    asset.animationGroups[3].name = "walkFor";
    // store animation asset by key
    this._animations = {
      idle: asset.animationGroups[0],
      thumbsUp: asset.animationGroups[1],
      walkBack: asset.animationGroups[2],
      walkFor: asset.animationGroups[3],
    };
    // play idle animation as an initial animation
    this._animations.idle.play(true);
    this._curAnim = this._animations.idle;
  }

  //generator
  public *AnimationBlending(
    to: AnimationGroup,
    from: AnimationGroup,
    ratio: number
  ): AsyncCoroutine<void> {
    let curWeight = 1;
    let nextWeight = 0;

    to.play(true); // play next animation first
    this._curAnim = to;

    while (nextWeight < 1) {
      curWeight -= ratio; // decrement current animation weight by given ratio
      nextWeight += ratio; // increment
      to.setWeightForAllAnimatables(nextWeight);
      from.setWeightForAllAnimatables(curWeight);
      yield; // this makes that routine wait for one frame.
    }
  }

  // Camera type change
  public ConvertCameraTo(type: number) {
    switch (type) {
      case 0: // arc rotate cam
        this.scene.activeCamera = this._arcRotCamera;
        this.scene.activeCamera.attachControl();
        break;
      case 1: // follow cam
        this.scene.activeCamera = this._followCamera;
        break;
      case 2: // universal cam
        this.scene.activeCamera = this._universalCamera;
        this._universalCamera.attachControl();
        break;
    }
  }

  // Zoom in
  public ZoomInFollowCam() {
    const newTargetPosition = this._mesh.position.clone();
    newTargetPosition.y += 2;
    this._followCamera.cameraAcceleration = 0.012;
    this._followCamera.setTarget(newTargetPosition);
    this._followCamera.heightOffset = 0.5;
    this._followCamera.radius = 0;
  }

  // Zoom out
  public ZoomOutFollowCam() {
    this._followCamera.radius = 7;
    this._followCamera.rotationOffset = 180;
    this._followCamera.heightOffset = 5;
    this._followCamera.cameraAcceleration = 0.05;
    this._followCamera.lockedTarget = this._mesh;
  }

  // publish Transform Packet
  // TODO : uncomment below
  public SendTransformPacket() {
    const transformData: ITransform = {
      session_id: this._socket.id,
      expo_name: this.expoName,
      data: {
        position: { x: this._mesh.position.x, z: this._mesh.position.z },
        quaternion: {
          y: this._mesh.rotationQuaternion.y,
          w: this._mesh.rotationQuaternion.w,
        },
        state: this._curAnim.name,
      },
    };

    this._socket.Send(2, transformData);
  }

  /**
   * Getter / Setter for member fields
   */
  get Mesh(): AbstractMesh {
    return this._mesh;
  }

  get Animations(): PlayerAnimations {
    return this._animations;
  }

  get CurAnim(): AnimationGroup {
    return this._curAnim;
  }

  set CurAnim(anim: AnimationGroup) {
    this._curAnim = anim;
  }

  get Controller(): PlayerController {
    return this._playerController;
  }

  get FollowCam(): FollowCamera {
    return this._followCamera;
  }

  get CurrentCam(): TargetCamera {
    return this._currentCamera;
  }

  get Socket(): Socket {
    return this._socket;
  }
}

export default Player;
