/**
 * @param T State type
 */
export interface IState {
  Transition(nextState: number): void;
  GetState(): number;
}

export interface IStateMachine<T> {
  Transition(nextState: T): void;
  UpdateMachine(): void;
}
