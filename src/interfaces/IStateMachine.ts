import InputSystem from "../classes/core/player/InputSystem";

/**
 * @param T State type
 */
export interface IState {
  Transition(nextState: number): void;
  GetState(): number;
}

export interface IStateMachine {
  Transition(nextState: string): void;
  UpdateMachine(inputSys: InputSystem): void;
}
