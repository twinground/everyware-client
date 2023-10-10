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

class RemotePlayer extends TransformNode {
  private _mesh: AbstractMesh;
  private _animations: PlayerAnimations;
  private _curAnim: AnimationGroup;

  constructor(readonly scene: Scene, asset: PlayerAsset) {
    super("player", scene);
    this.scene = scene;

    // socket initialize

    // store loaded assets into member field.
    this._mesh = asset.mesh;
    this._mesh.parent = this;

    // store animation assets
    this.scene.stopAllAnimations();
    asset.animationGroups[0].name = "clap";
    asset.animationGroups[1].name = "idle";
    asset.animationGroups[2].name = "sitDown";
    asset.animationGroups[3].name = "sitting";
    asset.animationGroups[4].name = "standUp";
    asset.animationGroups[5].name = "thumbsUp";
    asset.animationGroups[6].name = "turnBack";
    asset.animationGroups[7].name = "turnLeft";
    asset.animationGroups[8].name = "turnRight";
    asset.animationGroups[9].name = "walkBack";
    asset.animationGroups[10].name = "walkFor";
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

  // animation blending generator
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

  get CurAnim(): AnimationGroup {
    return this._curAnim;
  }

  set CurAnim(anim: AnimationGroup) {
    this._curAnim = anim;
  }
}

export default RemotePlayer;
