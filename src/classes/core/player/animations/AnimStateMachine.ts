// module import
import type { PlayerAsset } from "../../../../types/PlayerType";
import { AnimState, EAnimState, IdleState } from "./AnimStates";
import Player from "../Player";
import InputSystem from "../../InputSystem";
// type import
import type {
  IState,
  IStateMachine,
} from "../../../../interfaces/IStateMachine";

/**
 * Animation Finite State Mcahine
 */
export default class AnimStateMachine implements IStateMachine<EAnimState> {
  private _state: AnimState;

  constructor(public player: Player, public inputSys: InputSystem) {
    this._state = new IdleState(player, inputSys);
  }

  //TODO: current state -> next state
  Transition(nextState: EAnimState): void {}

  UpdateMachine(): void {}
}
