// Module import
import {
  Engine as BabylonEngine,
  Scene,
  SceneLoader,
  ShadowGenerator,
  AnimationPropertiesOverride,
  Color3,
  Vector3,
  DirectionalLight,
  AnimationGroup,
  NodeMaterial,
  Constants,
  Effect,
  PostProcess,
  Mesh,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import ICustomScene from "../../../interfaces/ICustomScene";
// class
import Level from "../level/Level";
import Player from "../player/Player";
import Engine from "../Engine";
// type
import { PlayerAsset } from "../../../types/PlayerType";
import { IConnection, IPacket, ITransform } from "../../../interfaces/IPacket";
import type Client from "../../network/Client";
import RemotePlayer from "../player/RemotePlayer";
import { createButton } from "../ui/ViewButton";

const OUTLINE_COLOR = new Color3(1, 1, 0);

/**
 * World Scene
 * In this scene, user should subscribe "/{expo_name}/lobby" endpoint
 */
class WorldScene implements ICustomScene {
  public scene: Scene;
  private _engine: Engine;
  private _level: Level;
  private _light: DirectionalLight;
  private _shadowGenerator: ShadowGenerator;
  private _player: Player;
  private _remotePlayerMap: { [userId: number]: RemotePlayer };
  private _advancedTexture: AdvancedDynamicTexture;
  private _viewButtons: Button[];
  private _isViewing: boolean;

  constructor(
    readonly engine: Engine,
    readonly canvas: HTMLCanvasElement,
    private _client: Client,
    public expoName: string // TODO : should subsribe this expo
  ) {
    // Initialize Scene
    this._engine = engine;
    this.scene = new Scene(this._engine.BabylonEngine);

    // Fullscreen mode GUI
    this._advancedTexture =
      AdvancedDynamicTexture.CreateFullscreenUI("EXPO_UI");

    // Light Setup
    this._light = new DirectionalLight(
      "main-light",
      new Vector3(0, -1, -1),
      this.scene
    );
    this._light.shadowMaxZ = 130;
    this._light.shadowMinZ = 10;
    this._shadowGenerator = new ShadowGenerator(1024, this._light);

    // player construct
    this.LoadModelAsset().then((asset) => {
      this._player = new Player(this.scene, asset);
      this._level = new Level(
        this.scene,
        this._advancedTexture,
        this._player,
        this
      );
    });

    this._viewButtons = [];
    this._isViewing = false;
  }

  public async LoadModelAsset() {
    const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "player.glb",
      this.scene
    );

    let mesh = meshes[0]; // root mesh
    mesh.scaling.setAll(0.8); // scale mesh
    mesh.parent = null; // remove parent after extracting

    this._shadowGenerator.addShadowCaster(mesh, true);
    for (let i = 0; i < meshes.length; i++) {
      meshes[i].receiveShadows = false;
    }

    const asset: PlayerAsset = {
      mesh,
      animationGroups: animationGroups.slice(1),
    };

    return asset;
  }

  public CreateViewButton(linkMesh: Mesh) {
    const viewButton = createButton(linkMesh, this._advancedTexture);

    viewButton.onPointerClickObservable.add(() => {
      this._isViewing = true;
      this._player.Mesh.position = linkMesh.position
        .clone()
        .addInPlace(new Vector3(0, -0.3, 0));
      this._player.Mesh.rotationQuaternion = linkMesh
        .getChildMeshes()[0]
        .rotationQuaternion.clone();

      // fade out scene
      this._engine.FadeOutScene(this._player.CurrentCam);
      // player camera zoom in
      this._player.ZoomInFollowCam();
      // start animation and change anim state.
      this._player.Controller.UpdateViewMode();

      viewButton.isVisible = false;
    });

    this.scene.onBeforeRenderObservable.add(() => {
      if (
        !this._isViewing &&
        linkMesh.intersectsMesh(this._player.Mesh, false)
      ) {
        viewButton.isVisible = true;

        for (let child of linkMesh.getChildMeshes()) {
          child.outlineColor = OUTLINE_COLOR;
          child.outlineWidth = 0.08;
          child.renderOutline = true;
        }
      } else {
        viewButton.isVisible = false;

        for (let child of linkMesh.getChildMeshes()) {
          child.renderOutline = false;
        }
      }
    });

    this._viewButtons.push(viewButton);
  }
}

export default WorldScene;