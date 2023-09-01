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
        this.player.scene.stopAllAnimations();
        console.log("1");
        this.player.scene.onBeforeRenderObservable.runCoroutineAsync(
          this.player.AnimationBlending(
            this.player.Animations.walkFor,
            this.player.Animations.idle,
            0.05
          )
        );

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

  Transition(nextState: string): void {
    switch (nextState) {
      case "idle": {
        this.player.scene.stopAllAnimations(); // Stop all animations before blending two animations

        this.player.scene.onBeforeRenderObservable.runCoroutineAsync(
          this.player.AnimationBlending(
            this.player.Animations.idle,
            this.player.Animations.walkFor,
            0.05
          )
        );

        break;
      }
      default: {
        console.log("Unsupported state yet.");
      }
    }
  }
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
