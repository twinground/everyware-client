// module import
import {
  AnimState,
  IdleState,
  SitState,
  WalkBackState,
  WalkState,
} from "./AnimStates";
import Player from "../Player";
import InputSystem from "../InputSystem";
// type import
import type { StateMap } from "../../../../types/PlayerType";
import type { IAnimStateMachine } from "../../../../interfaces/IStateMachine";

/**
 * Animation Finite State Mcahine
 */
export default class AnimStateMachine implements IAnimStateMachine {
  private _stateMap: StateMap;
  private _curState: AnimState;

  constructor(public player: Player) {
    this._stateMap = {
      idle: new IdleState(player),
      walk: new WalkState(player),
      walkBack: new WalkBackState(player),
      sit: new SitState(player),
    };

    this._curState = this._stateMap.idle;
  }

  //TODO: current state -> next state
  Transition(nextState: string): void {
    if (this._curState.State == nextState) {
      return;
    }

    this._curState.Transition(nextState); // transition current state to next state
    this._curState = this._stateMap[nextState]; // set next state to current
  }

  UpdateMachine(inputSys: InputSystem): void {
    switch (this._curState.State) {
      case "idle": {
        if (inputSys.inputs.w || inputSys.inputs.ㅈ) {
          this.Transition("walk");
        } else if (inputSys.inputs.s || inputSys.inputs.ㄴ) {
          this.Transition("walkBack");
        } else if (inputSys.inputs.view) {
          this.Transition("sit");
        }
        break;
      }
      case "walk": {
        if (
          !inputSys.inputs.w &&
          !inputSys.inputs.s &&
          !inputSys.inputs.ㅈ &&
          !inputSys.inputs.ㄴ
        ) {
          this.Transition("idle");
        }
        break;
      }
      case "walkBack": {
        if (
          !inputSys.inputs.w &&
          !inputSys.inputs.s &&
          !inputSys.inputs.ㅈ &&
          !inputSys.inputs.ㄴ
        ) {
          this.Transition("idle");
        }
        break;
      }
      case "sit": {
        if (inputSys.inputs.w || inputSys.inputs.s) {
          this.Transition("idle");
        }
        break;
      }
    }
  }
}
