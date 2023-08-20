import type { IState } from "../../../../interfaces/IStateMachine";
import type InputSystem from "../../InputSystem";
import Player from "../Player";

export class AnimState {
  protected _state: string;

  constructor(public player: Player) {
    this._state = "";
  }

  get State() {
    return this._state;
  }

  SetState(state: string) {
    this._state = state;
  }
  Transition(_state: string): void {}
}

export class IdleState extends AnimState {
  constructor(public player: Player) {
    super(player);

    this._state = "idle";
  }

  Transition(nextState: string): void {
    switch (nextState) {
      case "sit": {
        break;
      }
      case "walk": {
        break;
      }
    }
  }
}

export class WalkState extends AnimState {
  constructor(public player: Player) {
    super(player);

    this._state = "walk";
  }

  Transition(nextState: string): void {}
}

export class SitState extends AnimState {
  constructor(public player: Player) {
    super(player);

    this._state = "set";
  }

  Transition(nextState: string): void {}
}

// TODO : less important. implement later
export class Talking extends AnimState {
  constructor(public player: Player) {
    super(player);

    this._state = "talk";
  }

  Transition(nextState: string): void {}
}
