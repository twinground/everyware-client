import { ActionManager, Scene, ExecuteCodeAction } from "@babylonjs/core";
// type
import { InputMap } from "../../types/PlayerType";

class InputSystem {
  private _actionManager: ActionManager;
  private _inputMap: InputMap;

  constructor(public scene: Scene) {
    this._actionManager = new ActionManager(this.scene); // bind action manager to current scene.
    this.scene.actionManager = this._actionManager; // action manager to handle actions on scene
    this._inputMap = {
      w: false,
      a: false,
      s: false,
      d: false,
      c: false,
    };

    //register keydown trigger
    this._actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
        let key = evt.sourceEvent.key;
        if (key in this._inputMap) {
          this._inputMap[key] = true;
        }
      })
    );

    //register keyup trigger
    this._actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
        let key = evt.sourceEvent.key;
        if (key in this._inputMap) {
          this._inputMap[key] = false;
        }
      })
    );
  }

  get inputs() {
    return this._inputMap;
  }
}

export default InputSystem;
