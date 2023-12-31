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
      case "preview": {
        this.player.Animations.idle.stop();

        this.player.scene.onBeforeRenderObservable.runCoroutineAsync(
          this.player.AnimationBlending(
            this.player.Animations.thumbsUp,
            this.player.Animations.idle,
            0.1
          )
        );
        break;
      }
      case "walk": {
        this.player.Animations.idle.stop();

        this.player.scene.onBeforeRenderObservable.runCoroutineAsync(
          this.player.AnimationBlending(
            this.player.Animations.walkFor,
            this.player.Animations.idle,
            0.05
          )
        );

        break;
      }
      case "walkBack": {
        this.player.Animations.idle.stop();

        this.player.scene.onBeforeRenderObservable.runCoroutineAsync(
          this.player.AnimationBlending(
            this.player.Animations.walkBack,
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
        this.player.Animations.walkFor.stop();
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

export class WalkBackState extends AnimState {
  constructor(public player: Player) {
    super(player);

    this._state = "walkBack";
  }

  Transition(nextState: string): void {
    switch (nextState) {
      case "idle": {
        this.player.Animations.walkBack.stop();
        this.player.scene.onBeforeRenderObservable.runCoroutineAsync(
          this.player.AnimationBlending(
            this.player.Animations.idle,
            this.player.Animations.walkBack,
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

export class PreviewState extends AnimState {
  constructor(public player: Player) {
    super(player);

    this._state = "preview";
  }

  Transition(nextState: string): void {
    switch (nextState) {
      case "idle":
        this.player.Animations.thumbsUp.stop();
        this.player.scene.onBeforeRenderObservable.runCoroutineAsync(
          this.player.AnimationBlending(
            this.player.Animations.idle,
            this.player.Animations.thumbsUp,
            0.05
          )
        );
        break;

      default:
        console.log("impossible anim state transition");
        break;
    }
  }
}

// TODO : less important. implement later
export class Talking extends AnimState {
  constructor(public player: Player) {
    super(player);

    this._state = "talk";
  }

  Transition(_nextState: string): void {}
}
