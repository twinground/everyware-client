import { Scene } from "@babylonjs/core";
import InputSystem from "../classes/core/player/InputSystem";

/**
 * @param T State type
 */
export interface IAnimState {
  Transition(nextState: number): void;
  GetState(): number;
}

export interface IAnimStateMachine {
  Transition(nextState: string): void;
  UpdateMachine(inputSys: InputSystem): void;
  get State(): string;
}

export interface ISceneStateMachine {
  Transition(nextScene: number): void;
  UpdateMachine(nextSceneType: number): void;

  get Scene(): Scene;
}
