import {
  MeshBuilder,
  Scene,
  Color3,
  AbstractMesh,
  SceneLoader,
  ActionManager,
  ExecuteCodeAction,
  Mesh,
} from "@babylonjs/core";
import { Button, AdvancedDynamicTexture } from "@babylonjs/gui";

class Level {
  private _outlineCollisionBox: Mesh;
  private _enableButtonArea: Mesh;
  private _outlineColor: Color3;
  private _viewModeButton: Button;

  constructor(
    public scene: Scene,
    public advancedTexture: AdvancedDynamicTexture,
    public playerMesh: AbstractMesh
  ) {
    let level = this.scene.createDefaultEnvironment({
      enableGroundShadow: true,
    });
    level.setMainColor(new Color3(36 / 255, 113 / 255, 214 / 255));
    level.ground.receiveShadows = true;
    this._outlineColor = new Color3(1, 1, 0); // yellow color

    this._outlineCollisionBox = MeshBuilder.CreateBox(
      "CHAIR_COLLISION",
      { width: 0.5, height: 0.5, depth: 0.5 },
      this.scene
    );
    this._outlineCollisionBox.visibility = 0;
    this._outlineCollisionBox.actionManager = new ActionManager(this.scene);

    this._enableButtonArea = MeshBuilder.CreateBox(
      "AVAILABLE_RANGE_TO_VIEW",
      { width: 2, height: 0.2, depth: 2 },
      this.scene
    );
    this._enableButtonArea.visibility = 0;
    this._enableButtonArea.position.set(0, 0, -5);

    // button
    this._viewModeButton = Button.CreateSimpleButton(
      "ViewModeChange",
      "관람하기"
    );
    this._viewModeButton.isVisible = false; // Initially hide the button
    this._viewModeButton.width = "100px";
    this._viewModeButton.height = "40px";
    this._viewModeButton.color = "white";
    this._viewModeButton.background = "grey";
    this.advancedTexture.addControl(this._viewModeButton);
    this._viewModeButton.linkWithMesh(this._outlineCollisionBox);
    this._viewModeButton.linkOffsetY = -70;
    this._viewModeButton.linkOffsetX = 50;

    // // Handle button click
    this._viewModeButton.onPointerClickObservable.add(() => {
      // Handle the action when the button is clicked
      alert("관람시작");
    });

    // // Attach the button to the GUI layer
    this.scene.onBeforeRenderObservable.add(() => {
      if (this._enableButtonArea.intersectsMesh(this.playerMesh, false)) {
        this._viewModeButton.isVisible = true;
      } else {
        this._viewModeButton.isVisible = false;
      }
    });

    this.Load();
  }

  public async Load() {
    const chairGLB = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "chair.glb",
      this.scene
    );

    let chairAsset = chairGLB.meshes[0];
    chairAsset.scaling.setAll(0.8);
    this._outlineCollisionBox.position.set(0, 0.3, -5);

    chairAsset.parent = this._outlineCollisionBox;
    chairAsset.position.set(-9.5, -1.3, -0.2);

    this.SetChairOulineAction();
  }

  public SetChairOulineAction() {
    this._outlineCollisionBox.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        for (let child of this._outlineCollisionBox.getChildMeshes()) {
          child.outlineColor = this._outlineColor;
          child.outlineWidth = 0.05;
          child.renderOutline = true;
        }
      })
    );

    this._outlineCollisionBox.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        for (let child of this._outlineCollisionBox.getChildMeshes()) {
          child.renderOutline = false;
        }
      })
    );
  }

  public PlaySitOnChairSequence() {}
}

export default Level;
