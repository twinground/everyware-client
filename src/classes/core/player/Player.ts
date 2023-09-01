// Module import
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  AnimationGroup,
  AbstractMesh,
  TransformNode,
  AsyncCoroutine,
} from "@babylonjs/core";
// Type import
import { PlayerAsset, PlayerAnimations } from "../../../types/PlayerType";
import PlayerController from "./PlayerController";

class Player extends TransformNode {
  private _mesh: AbstractMesh;
  private _camera: ArcRotateCamera;
  private _animations: PlayerAnimations;
  private _curAnim: AnimationGroup;
  private _playerController: PlayerController;

  constructor(readonly scene: Scene, asset: PlayerAsset) {
    super("player", scene);
    this.scene = scene;

    // store loaded assets into member field.
    this._mesh = asset.mesh;
    this._mesh.parent = this;

    // player camera setup and configuration
    this._camera = new ArcRotateCamera(
      "player-cam",
      Math.PI / 2,
      Math.PI / 4,
      20,
      new Vector3(0, 0, 0),
      this.scene
    );
    this._camera.lowerBetaLimit = 0.1;
    this._camera.upperBetaLimit = (Math.PI / 2) * 0.9;
    this._camera.lowerRadiusLimit = 1;
    this._camera.upperRadiusLimit = 150;
    this._camera.setPosition(new Vector3(0, 0, -10));
    this._camera.attachControl(true);
    this._camera.setTarget(this._mesh);

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

    this._playerController = new PlayerController(this, this._scene);
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

  get Mesh(): AbstractMesh {
    return this._mesh;
  }

  get Animations(): PlayerAnimations {
    return this._animations;
  }
}

export default Player;
