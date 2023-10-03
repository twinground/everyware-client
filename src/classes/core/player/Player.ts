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

class Player extends TransformNode {
  private _mesh: AbstractMesh;
  private _arcRotCamera: ArcRotateCamera;
  private _followCamera: FollowCamera;
  private _universalCamera: UniversalCamera;
  private _currentCamera: TargetCamera;
  private _animations: PlayerAnimations;
  private _curAnim: AnimationGroup;
  private _playerController: PlayerController;

  constructor(readonly scene: Scene, asset: PlayerAsset) {
    super("player", scene);
    this.scene = scene;

    /**
     * -----  Mesh initialization -----
     */
    this._mesh = asset.mesh;
    this._mesh.parent = this;

    /**
     * Player controller
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
    this._followCamera.radius = 7;
    this._followCamera.rotationOffset = 180;
    this._followCamera.heightOffset = 5;
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
          console.log("on");
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
    this._animations = {
      clap: asset.animationGroups[0],
      idle: asset.animationGroups[1],
      sitDown: asset.animationGroups[2],
      sitting: asset.animationGroups[3],
      standUp: asset.animationGroups[4],
      thumbsUp: asset.animationGroups[5],
      turnBack: asset.animationGroups[6],
      turnLeft: asset.animationGroups[7],
      turnRight: asset.animationGroups[8],
      walkBack: asset.animationGroups[9],
      walkFor: asset.animationGroups[10],
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
}

export default Player;
