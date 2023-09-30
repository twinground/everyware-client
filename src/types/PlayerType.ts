import { AnimationGroup, AbstractMesh } from "@babylonjs/core";
import {
  IdleState,
  SitState,
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
  view: boolean;
}

export type StateMap = {
  idle: IdleState;
  walk: WalkState;
  walkBack: WalkBackState;
  sit: SitState;
};

export type PlayerAnimations = {
  clap: AnimationGroup;
  idle: AnimationGroup;
  sitDown: AnimationGroup;
  sitting: AnimationGroup;
  standUp: AnimationGroup;
  thumbsUp: AnimationGroup;
  turnBack: AnimationGroup;
  turnLeft: AnimationGroup;
  turnRight: AnimationGroup;
  walkBack: AnimationGroup;
  walkFor: AnimationGroup;
};
