import {
  Scene,
  UniversalCamera,
  Vector3,
  Color4,
  ShadowGenerator,
  EnvironmentHelper,
  ArcRotateCamera,
  HemisphericLight,
  MeshBuilder,
  ActionManager,
  ExecuteCodeAction,
  StandardMaterial,
  Engine as BabylonEngine,
  Axis,
  Quaternion,
  SceneLoader,
  CubeTexture,
  Color3,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
// class
import Engine from "../Engine";
import ICustomScene from "../../../interfaces/ICustomScene";
import { ISceneStateMachine } from "../../../interfaces/IStateMachine";
import { createExitButton } from "../ui/ExitButton";
import CSS3DObject from "../renderer/CSS3DObject.js";
import CSS3DRenderer from "../renderer/CSSRenderer.js";

const width = 1920;
const height = 1080;

class PreviewScene implements ICustomScene {
  public scene: Scene;
  private _level: EnvironmentHelper;
  private _camera: UniversalCamera | ArcRotateCamera;
  private _light: HemisphericLight;
  private _advancedTexture: AdvancedDynamicTexture;
  private _shadowGenerator: ShadowGenerator;
  private _exitButton: Button;

  constructor(
    private engine: Engine,
    private _sceneMachine: ISceneStateMachine
  ) {
    this.scene = new Scene(engine.BabylonEngine);
    // The scene color should be transparent to show iframe render screen
    // alpha value should be zero
    this.scene.clearColor = new Color4(0, 0.1, 0.1, 0);
    // It's okay to use default environment
    this._level = this.scene.createDefaultEnvironment({
      skyboxSize: 50,
      rootPosition: new Vector3(0, -7, 0),
    });
    this._level.setMainColor(new Color3(255 / 255, 240 / 255, 197 / 255));

    // fullscreen gui
    this._advancedTexture = this._advancedTexture =
      AdvancedDynamicTexture.CreateFullscreenUI("PREVIEW_GUI");
    this._exitButton = createExitButton(this._advancedTexture);
    this._exitButton.onPointerClickObservable.add(() => {
      this._sceneMachine.UpdateMachine(0);
    });

    // Arc rotation camera
    this._camera = new ArcRotateCamera(
      "_camera",
      Math.PI / 2,
      Math.PI / 4,
      4,
      Vector3.Zero(),
      this.scene
    );
    this._camera.setPosition(new Vector3(0, 5, 10));
    this._camera.inertia = 0;
    this._camera.angularSensibilityX = 250;
    this._camera.angularSensibilityY = 250;
    this._camera.upperBetaLimit = (Math.PI / 2) * 0.9;
    this._camera.lowerBetaLimit = 0.1;
    this._camera.upperAlphaLimit = Math.PI * 0.9;
    this._camera.lowerAlphaLimit = 0.1;
    this._camera.lowerRadiusLimit = 5;
    this._camera.upperRadiusLimit = 20;
    this._camera.attachControl(true);

    // The CSS object will follow this mesh
    let videoViewMesh = MeshBuilder.CreatePlane(
      "videoViewMesh",
      { width: 1, height: 1 },
      this.scene
    );
    videoViewMesh.scaling.x = 6.3;
    videoViewMesh.scaling.y = 3.5;
    videoViewMesh.rotation.addInPlace(new Vector3(0, Math.PI, 0));

    SceneLoader.ImportMesh(
      "",
      "./models/",
      "monitor.glb",
      this.scene,
      (meshes) => {
        let mesh = meshes[0];
        mesh.rotationQuaternion = Quaternion.FromEulerAngles(
          0,
          -Math.PI / 2,
          0
        );
        mesh.position.z -= 0.02;
        mesh.position.y -= 3.2;
        mesh.scaling.setAll(10.5);
        mesh.parent = null;
      }
    );

    // Setup the CSS css3DRenderer and Youtube object
    let [css3DRenderer, container] = this.SetupRenderer(
      videoViewMesh,
      "4gKQOq7atL8",
      this.scene
    );
    videoViewMesh.actionManager = new ActionManager(this.scene);
    videoViewMesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, function (_event) {
        container.style.zIndex = 10;
      })
    );
    document.addEventListener("click", (e: any) => {
      if (e.target.id === "CSS3DRendererDom") {
        container.style.zIndex = "-1";
      }
    });

    window.addEventListener("resize", (_e) => {
      this.engine.BabylonEngine.resize();
    });
    //------------EVENTS--------------------------------
    this.scene.onBeforeRenderObservable.add(() => {
      css3DRenderer.render(this.scene, this.scene.activeCamera);
    });

    // Light Setup
    this._light = new HemisphericLight(
      "light",
      new Vector3(0, 1, 0),
      this.scene
    );
    this._light.intensity = 0.7;
  }

  RemoveDomNode(id: string) {
    let node = document.getElementById(id);
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  SetupRenderer(mesh, videoID, scene) {
    const canvasZone = document.getElementById("CanvasZone");
    this.RemoveDomNode("CSSContainer");
    this.RemoveDomNode("CSS3DRendererDom");

    let css3DContainer = document.createElement("div");
    css3DContainer.id = "CSSContainer";
    css3DContainer.style.position = "absolute";
    css3DContainer.style.width = "100%";
    css3DContainer.style.height = "100%";
    css3DContainer.style.zIndex = "-1";

    canvasZone.insertBefore(css3DContainer, canvasZone.firstChild);

    let css3DRenderer = new CSS3DRenderer();
    css3DContainer.appendChild(css3DRenderer.domElement);

    //Set CSS container size same as WebGL Container Size
    css3DRenderer.setSize(canvasZone.offsetWidth, canvasZone.offsetHeight);

    let iframeContainer = document.createElement("div");
    iframeContainer.style.width = width + "px";
    iframeContainer.style.height = height + "px";
    iframeContainer.style.backgroundColor = "#000";
    iframeContainer.id = "iframeContainer";

    let CSSobject = new CSS3DObject(iframeContainer, this.scene);
    CSSobject.position.copyFrom(mesh.getAbsolutePosition());
    CSSobject.rotation.y = -mesh.rotation.y;
    CSSobject.scaling.copyFrom(mesh.scaling);

    //append iframe
    let iframe = document.createElement("iframe");
    iframe.id = "video-" + videoID;
    iframe.style.width = width + "px";
    iframe.style.height = height + "px";
    iframe.style.border = "0px";
    iframe.allow = "autoplay";
    // iframe.src = [
    //   "https://www.youtube.com/embed/",
    //   videoID,
    //   "?rel=0&enablejsapi=1&disablekb=1&autoplay=1&controls=0&fs=0&modestbranding=1",
    // ].join("");
    iframe.src = "https://babylonjs.com";
    iframeContainer.appendChild(iframe);

    let depthMask = new StandardMaterial("VideoViewMaterial", scene);
    depthMask.backFaceCulling = true;
    depthMask.alphaMode = BabylonEngine.ALPHA_COMBINE;
    mesh.material = depthMask;

    // Render video mesh
    mesh.onBeforeRenderObservable.add(() =>
      this.engine.BabylonEngine.setColorWrite(false)
    );
    mesh.onAfterRenderObservable.add(() =>
      this.engine.BabylonEngine.setColorWrite(true)
    );

    // plane index
    let videoPlaneIndex = this.scene.meshes.indexOf(mesh);
    this.scene.meshes[videoPlaneIndex] = this.scene.meshes[0];
    this.scene.meshes[0] = mesh;

    return [css3DRenderer, css3DContainer];
  }
}

export default PreviewScene;
