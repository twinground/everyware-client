import {
  ActionManager,
  Scene,
  ExecuteCodeAction,
  AbstractActionManager,
} from "@babylonjs/core";
// type
import type { InputMap } from "../../../types/PlayerType";
import Player from "./Player";

class InputSystem {
  private _actionManager: AbstractActionManager;
  private _inputMap: InputMap;
  public isUpdating: boolean;

  constructor(public scene: Scene, public player: Player) {
    this._actionManager = this.scene.actionManager; // action manager to handle actions on scene
    this._inputMap = {
      w: false,
      a: false,
      s: false,
      d: false,
      ㅈ: false,
      ㅁ: false,
      ㄴ: false,
      ㅇ: false,
      view: false,
    };

    //register keydown trigger
    this._actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
        let key = evt.sourceEvent.key;
        if (key in this._inputMap) {
          this._inputMap[key] = true;
          this.isUpdating = true;
        }
      })
    );

    //register keyup trigger
    this._actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
        let key = evt.sourceEvent.key;
        if (key in this._inputMap) {
          this._inputMap[key] = false;
          this.isUpdating = false;
        }

        if (key == "w" || key == "s" || key == "ㅈ" || key == "ㄴ") {
          this.player.CurAnim = this.player.Animations.idle;
          if (this.player.isOnline) {
            this.player.SendTransformPacket();
          }
        }
      })
    );
  }

  get inputs() {
    return this._inputMap;
  }
}

export default InputSystem;
