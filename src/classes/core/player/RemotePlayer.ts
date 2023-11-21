// Module import
import {
  Scene,
  AnimationGroup,
  AbstractMesh,
  TransformNode,
  AsyncCoroutine,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
// class
import NicknameUI from "../ui/NicknameUI";
// Type import
import { PlayerAsset, PlayerAnimations } from "../../../types/PlayerType";

class RemotePlayer extends TransformNode {
  private _mesh: AbstractMesh;
  private _headMesh: AbstractMesh;
  private _animations: PlayerAnimations;
  private _curAnim: AnimationGroup;
  private _nicknameTag: NicknameUI;

  constructor(
    readonly scene: Scene,
    asset: PlayerAsset,
    name: string,
    advancedTexture: AdvancedDynamicTexture
  ) {
    super("player", scene);
    this.scene = scene;

    // socket initialize

    // store loaded assets into member field.
    this._mesh = asset.mesh;
    this._mesh.parent = this;
    this._headMesh = new AbstractMesh("player-head-abstract-mesh", this.scene);
    this._headMesh.parent = this._mesh;
    this._headMesh.position.y += 1.5;

    // store animation assets
    this.scene.stopAllAnimations();
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
    // nickname
    this._nicknameTag = new NicknameUI(this._headMesh, name, advancedTexture);

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
