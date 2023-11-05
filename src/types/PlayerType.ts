import { AnimationGroup, AbstractMesh, Skeleton } from "@babylonjs/core";
import {
  IdleState,
  PreviewState,
  WalkBackState,
  WalkState,
} from "../classes/core/player/animations/AnimStates";

export type PlayerAsset = {
  mesh: AbstractMesh;
  animationGroups: AnimationGroup[];
};

export interface InputMap {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  // korean keyboard support
  ㅈ: boolean;
  ㅁ: boolean;
  ㄴ: boolean;
  ㅇ: boolean;
  // enter view mode
  view: boolean;
}

export type StateMap = {
  idle: IdleState;
  walk: WalkState;
  walkBack: WalkBackState;
  preview: PreviewState;
};

export type PlayerAnimations = {
  idle: AnimationGroup;
  thumbsUp: AnimationGroup;
  walkBack: AnimationGroup;
  walkFor: AnimationGroup;
};
