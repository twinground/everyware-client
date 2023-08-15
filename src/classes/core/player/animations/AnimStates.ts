import type { IState } from "../../../../interfaces/IStateMachine";
import type InputSystem from "../../InputSystem";
import Player from "../Player";

export enum EAnimState {
  Idle,
  Walking,
  Sitting,
  Talking,
}

export class AnimState {
  private _state: EAnimState;

  constructor(public player: Player, public inputSys: InputSystem) {
    this._state = EAnimState.Idle;
  }

  GetState() {
    return this._state;
  }
  SetState(state: EAnimState) {
    this._state = state;
  }
  Transition(_state: EAnimState) {}
  Update() {}
}

export class IdleState extends AnimState {
  readonly STATE = EAnimState.Idle;

  GetState(): EAnimState {
    return this.STATE;
  }

  Transition(nextState: EAnimState): void {
    switch (nextState) {
      case EAnimState.Sitting: {
        this.player.Animations;
        break;
      }
      case EAnimState.Walking: {
        break;
      }
    }
  }
}

export class WalkState extends AnimState {
  readonly STATE = EAnimState.Walking;

  GetState(): number {
    return this.STATE;
  }

  Transition(nextState: EAnimState): void {}
}

export class SitState extends AnimState {
  readonly STATE = EAnimState.Sitting;

  GetState(): EAnimState {
    return this.STATE;
  }

  Transition(nextState: EAnimState): void {}
}

// TODO : less important. implement later
export class Talking extends AnimState {
  readonly STATE = EAnimState.Idle;

  GetState(): EAnimState {
    return this.STATE;
  }

  Transition(nextState: EAnimState): void {}
}
