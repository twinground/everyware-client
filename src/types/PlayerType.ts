import { AnimationGroup, AbstractMesh } from "@babylonjs/core";

export type PlayerAsset = {
  mesh: AbstractMesh;
  animationGroups: AnimationGroup[];
};

export interface InputMap {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
}

export type PlayerAnimations = {
  clapping: AnimationGroup;
  idle: AnimationGroup;
  turnLeft: AnimationGroup;
  turnRight: AnimationGroup;
  sitDown: AnimationGroup;
  standUp: AnimationGroup;
  talk: AnimationGroup;
  thumbsUp: AnimationGroup;
  turnBack: AnimationGroup;
  walk: AnimationGroup;
};
