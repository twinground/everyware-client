import {
  Color4,
  Scene,
  Vector3,
  UniversalCamera,
  ShadowGenerator,
  EnvironmentHelper,
  ArcRotateCamera,
  HemisphericLight,
  MeshBuilder,
  ActionManager,
  ExecuteCodeAction,
  StandardMaterial,
  Engine as BabylonEngine,
  Quaternion,
  SceneLoader,
  Color3,
  Plane,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import ICustomScene from "../../../interfaces/ICustomScene";
import Engine from "../Engine";
import { ISceneStateMachine } from "../../../interfaces/IStateMachine";
// function
import { createExitButton } from "../ui/ExitButton";
import CSS3DObject from "../renderer/CSS3DObject.js";
import CSS3DRenderer from "../renderer/CSSRenderer.js";

const width = 2000;
const height = 1080;

class MobileScene implements ICustomScene {
  public scene: Scene;
  private _camera: ArcRotateCamera;
  private _level: EnvironmentHelper;
  private _advancedTexture: AdvancedDynamicTexture;
  private _exitButton: Button;

  constructor(
    private engine: Engine,
    private _sceneMachine: ISceneStateMachine
  ) {
    this.scene = new Scene(engine.BabylonEngine);
    this.scene.clearColor = new Color4(0, 0.1, 0.1, 0);

    this._level = this.scene.createDefaultEnvironment({
      skyboxSize: 50,
      rootPosition: new Vector3(0, -7, 0),
    }) as EnvironmentHelper;
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

    SceneLoader.ImportMesh(
      "",
      "./models/",
      "galaxy_s8.glb",
      this.scene,
      (meshes) => {
        let mesh = meshes[0];
        mesh.rotationQuaternion = Quaternion.FromEulerAngles(0, 2 * Math.PI, 0);
        mesh.position.z -= 0.02;
        mesh.position.y -= 3.2;
        mesh.scaling.setAll(0.7);
        mesh.parent = null;
      }
    );

    let screenMesh = MeshBuilder.CreatePlane(
      "screenMesh",
      { width: 1, height: 1 },
      this.scene
    );
    screenMesh.scaling.x = 3;
    screenMesh.scaling.y = 6.5;
    screenMesh.position.z += 0.2;
    screenMesh.position.y += 0.25;
    screenMesh.rotation.addInPlace(new Vector3(0, Math.PI, 0));

    // Setup the CSS css3DRenderer and Youtube object
    let [css3DRenderer, container] = this.SetupRenderer(screenMesh, this.scene);
    screenMesh.actionManager = new ActionManager(this.scene);
    screenMesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, function (_event) {
        (container as HTMLDivElement).style.zIndex = "1";
      })
    );
    document.addEventListener("click", (e: any) => {
      if (e.target.id === "CSS3DRendererDom") {
        (container as HTMLDivElement).style.zIndex = "-1";
      }
    });

    window.addEventListener("resize", (_e) => {
      this.engine.BabylonEngine.resize();
    });
    //------------EVENTS--------------------------------
    this.scene.onBeforeRenderObservable.add(() => {
      (css3DRenderer as CSS3DRenderer).render(
        this.scene,
        this.scene.activeCamera
      );
    });
  }

  RemoveDomNode(id: string) {
    let node = document.getElementById(id);
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  SetupRenderer(mesh, scene) {
    const canvasZone = document.getElementById("CanvasZone");
    this.RemoveDomNode("CSSContainer");
    this.RemoveDomNode("CSS3DRendererDom");

    let css3DContainer = document.createElement("div");
    css3DContainer.id = "CSSContainer";
    css3DContainer.style.position = "absolute";
    css3DContainer.style.width = "100%";
    css3DContainer.style.height = "100%";
    css3DContainer.style.zIndex = "-1";

    canvasZone?.insertBefore(css3DContainer, canvasZone.firstChild);

    let css3DRenderer = new CSS3DRenderer();
    css3DContainer.appendChild(css3DRenderer.domElement);

    //Set CSS container size same as WebGL Container Size
    css3DRenderer.setSize(canvasZone?.offsetWidth, canvasZone?.offsetHeight);

    let iframeContainer = document.createElement("div");
    iframeContainer.style.position = "absolute";
    iframeContainer.style.width = width + "px";
    iframeContainer.style.height = height + "px";
    iframeContainer.style.backgroundColor = "#000";
    iframeContainer.id = "iframeContainer";

    let CSSobject = new CSS3DObject(iframeContainer);
    CSSobject.position.copyFrom(mesh.getAbsolutePosition());
    CSSobject.position.y -= 1.4;
    CSSobject.position.x += 3.75;
    CSSobject.rotation.y = -mesh.rotation.y;
    CSSobject.scaling.copyFrom(mesh.scaling);

    let iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.right = "300px";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0px";
    iframe.src =
      "http://14.36.205.233:5645/#!action=stream&udid=emulator-5554&player=mse&ws=ws%3A%2F%2F14.36.205.233%3A5645%2F%3Faction%3Dproxy-adb%26remote%3Dtcp%253A8886%26udid%3Demulator-5554";
    iframe.style.scale = "6 1.5";
    iframe.style.translate = "-100%";
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

export default MobileScene;
