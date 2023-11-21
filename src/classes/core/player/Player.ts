// Module import
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  AnimationGroup,
  AbstractMesh,
  AsyncCoroutine,
  FollowCamera,
  UniversalCamera,
  TargetCamera,
  ExecuteCodeAction,
  ActionManager,
  Quaternion,
  PhysicsMotionType,
  Mesh,
  PhysicsAggregate,
  PhysicsShapeType,
  MeshBuilder,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
// Type import
import { PlayerAsset, PlayerAnimations } from "../../../types/PlayerType";
import PlayerController from "./PlayerController";
import Socket from "../../network/SocketClient";
import { ITransform } from "../../../interfaces/IPacket";
import Engine from "../Engine";
import NicknameUI from "../ui/NicknameUI";

class Player {
  private _socket: Socket;
  private _parentMesh: Mesh;
  private _mesh: AbstractMesh;
  private _headMesh: AbstractMesh;
  private _arcRotCamera: ArcRotateCamera;
  private _followCamera: FollowCamera;
  private _universalCamera: UniversalCamera;
  private _currentCamera: TargetCamera;
  private _animations: PlayerAnimations;
  private _curAnim: AnimationGroup;
  private _playerController: PlayerController;
  private _capsuleAggregate: PhysicsAggregate;
  private _nicknameTag: NicknameUI;

  //public
  public expoName: string;
  public isOnline: boolean = false;

  constructor(
    readonly engine: Engine,
    readonly scene: Scene,
    expoName: string,
    asset: PlayerAsset,
    advancedTexture: AdvancedDynamicTexture,
    socket?: Socket
  ) {
    this.scene = scene;
    this.engine = engine;
    if (socket) {
      this._socket = socket;
      this.isOnline = true;
    }
    this.expoName = expoName;

    /**
     * -----  Mesh initialization -----
     */
    this._mesh = asset.mesh;
    this._mesh.checkCollisions = true;
    this._mesh.rotationQuaternion = Quaternion.FromEulerAngles(
      0,
      -2 * Math.PI,
      0
    );

    this._headMesh = new AbstractMesh("player-head-abstract-mesh", this.scene);
    this._headMesh.parent = this._mesh;
    this._headMesh.position.y += 1.5;

    /**
     * -----  player collision body -----
     */
    this._parentMesh = MeshBuilder.CreateCapsule(
      "player-capsule",
      { height: 1.75, radius: 0.3 },
      this.scene
    );
    this._parentMesh.position.y += 0.9;
    this._parentMesh.bakeCurrentTransformIntoVertices();
    this._parentMesh.addChild(this._mesh);
    this._parentMesh.visibility = 0;
    this._parentMesh.position.set(0, 0, -30);

    // Set rigid body to character
    this._capsuleAggregate = new PhysicsAggregate(
      this._parentMesh,
      PhysicsShapeType.CAPSULE,
      { mass: 1, restitution: 0, friction: 0 },
      scene
    );
    this._capsuleAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);

    this._capsuleAggregate.body.setMassProperties({
      inertia: new Vector3(0, 0, 0),
    });
    /**
     * ----- Player controller -----
     */
    this._playerController = new PlayerController(this, this.scene);

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
    this._arcRotCamera.lowerRadiusLimit = 3;
    this._arcRotCamera.upperRadiusLimit = 10;
    this._arcRotCamera.setPosition(new Vector3(0, 0, -10));
    this._arcRotCamera.attachControl(true);
    this._arcRotCamera.setTarget(this._headMesh);

    // Follow camera configuration
    this._followCamera = new FollowCamera(
      "follow-cam",
      new Vector3(0, -2, 0),
      this.scene,
      this._mesh
    );
    this._followCamera.radius = 5.5;
    this._followCamera.rotationOffset = 180;
    this._followCamera.heightOffset = 1.0;
    this._followCamera.cameraAcceleration = 0.05;

    // Initial camera setup
    this.scene.activeCamera = this._followCamera;
    this._currentCamera = this._followCamera;
    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
        if (evt.sourceEvent.key == "Control") {
          switch (this.scene.activeCamera?.name) {
            case "arc-rotate-cam": {
              this.scene.activeCamera = this._followCamera;
              break;
            }
            case "follow-cam": {
              this.scene.activeCamera = this._arcRotCamera;
              break;
            }
          }
        }
      })
    );

    /**
     * character nickname tag
     */
    this._nicknameTag = new NicknameUI(
      this._headMesh,
      this._socket.name,
      advancedTexture
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
        break;
      case 1: // follow cam
        this.scene.activeCamera = this._followCamera;
        this.scene.activeCamera.detachControl();
        break;
    }
  }

  // Zoom in
  public ZoomInFollowCam() {
    const newTargetPosition = this._mesh.position.clone();
    newTargetPosition.y += 2;
    this._followCamera.cameraAcceleration = 0.012;
    this._followCamera.setTarget(newTargetPosition);
    this._followCamera.heightOffset = 3.0;
    this._followCamera.radius = 0;
  }

  // Zoom out
  public ZoomOutFollowCam() {
    this._followCamera.radius = 2.5;
    this._followCamera.rotationOffset = 180;
    this._followCamera.heightOffset = 0;
    this._followCamera.cameraAcceleration = 0.02;
    this._followCamera.lockedTarget = this._mesh;
  }

  // publish Transform Packet
  // TODO : uncomment below
  public SendTransformPacket() {
    const transformData: ITransform = {
      session_id: this._socket.id,
      expo_name: this.expoName,
      data: {
        position: {
          x: this._parentMesh.position.x,
          z: this._parentMesh.position.z,
        },
        quaternion: {
          y: this._mesh.rotationQuaternion?.y as number,
          w: this._mesh.rotationQuaternion?.w as number,
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

  get HeadMesh(): AbstractMesh {
    return this._headMesh;
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

  get ParentMesh(): Mesh {
    return this._parentMesh;
  }

  get RigidBody() {
    return this._capsuleAggregate.body;
  }
}

export default Player;
