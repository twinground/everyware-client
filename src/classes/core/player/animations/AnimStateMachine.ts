// module import
import { AnimState, IdleState, SitState, WalkState } from "./AnimStates";
import Player from "../Player";
import InputSystem from "../../InputSystem";
// type import
import type { PlayerAsset, StateMap } from "../../../../types/PlayerType";
import type { IStateMachine } from "../../../../interfaces/IStateMachine";

/**
 * Animation Finite State Mcahine
 */
export default class AnimStateMachine implements IStateMachine {
  private _stateMap: StateMap;
  private _curState: AnimState;

  constructor(public player: Player) {
    this._stateMap = {
      idle: new IdleState(player),
      walk: new WalkState(player),
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
        if (inputSys.inputs.w || inputSys.inputs.d) {
          this.Transition("walk");
        } else if (inputSys.inputs.c) {
          this.Transition("sit");
        }
        break;
      }
      case "walk": {
        if (!inputSys.inputs.w && !inputSys.inputs.d) {
          this.Transition("idle");
        }
        break;
      }
      case "sit": {
        if (inputSys.inputs.w || inputSys.inputs.d) {
          this.Transition("idle");
        }
        break;
      }
    }
  }
}
