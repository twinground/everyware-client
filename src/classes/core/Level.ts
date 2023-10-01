import {
  MeshBuilder,
  Scene,
  Color3,
  AbstractMesh,
  SceneLoader,
  ActionManager,
  ExecuteCodeAction,
  Mesh,
  Vector3,
  Quaternion,
  StandardMaterial,
} from "@babylonjs/core";
import { RecastJSPlugin } from "@babylonjs/core/Navigation/Plugins/recastJSPlugin";
import { Button, AdvancedDynamicTexture } from "@babylonjs/gui";
// class
import Player from "./player/Player";

const NAV_PARAMETERS = {
  cs: 0.2,
  ch: 0.2,
  walkableSlopeAngle: 35,
  walkableHeight: 1,
  walkableClimb: 1,
  walkableRadius: 1,
  maxEdgeLen: 12,
  maxSimplificationError: 1.3,
  minRegionArea: 8,
  mergeRegionArea: 20,
  maxVertsPerPoly: 6,
  detailSampleDist: 6,
  detailSampleMaxError: 1,
};

class Level {
  private _outlineCollisionBox: Mesh;
  private _enableButtonArea: Mesh;
  private _outlineColor: Color3;
  private _viewModeButton: Button;
  private _isViewing: boolean;

  constructor(
    public scene: Scene,
    public advancedTexture: AdvancedDynamicTexture,
    public player: Player
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
    this._isViewing = false;

    // Handle View mode button click
    this._viewModeButton.onPointerClickObservable.add(() => {
      let chairNode = this._outlineCollisionBox.getChildTransformNodes()[0]; // chair mesh
      // TODO : How to refactor this hardcoded position and rotation adjustment between chair and character?
      // Position and Rotation update
      player.Mesh.position = this._outlineCollisionBox.position
        .clone()
        .addInPlace(new Vector3(0.09, -0.5, 0));
      player.Mesh.rotationQuaternion = chairNode.rotationQuaternion.clone();

      // Player state update
      this._isViewing = true;
      player.Controller.UpdateMode(this._isViewing);

      // Hide view mode button
      this._viewModeButton.isVisible = false;
    });

    // Attach the button to the GUI layer
    this.scene.onBeforeRenderObservable.add(() => {
      if (
        !this._isViewing &&
        this._enableButtonArea.intersectsMesh(this.player.Mesh, false)
      ) {
        this._viewModeButton.isVisible = true;

        for (let child of this._outlineCollisionBox.getChildMeshes()) {
          child.outlineColor = this._outlineColor;
          child.outlineWidth = 0.05;
          child.renderOutline = true;
        }
      } else {
        this._viewModeButton.isVisible = false;

        for (let child of this._outlineCollisionBox.getChildMeshes()) {
          child.renderOutline = false;
        }
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
    chairGLB.transformNodes[0].rotationQuaternion.multiplyInPlace(
      Quaternion.FromEulerAngles(0, Math.PI, 0)
    );
    let chairAsset = chairGLB.meshes[0];
    chairAsset.scaling.setAll(0.8);

    this._outlineCollisionBox.position.set(0, 0.3, -5);
    chairAsset.parent = this._outlineCollisionBox;
    chairAsset.position.set(-9.5, -1.3, -0.2);
  }

  // clickable outline effect on pointer over/off
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
