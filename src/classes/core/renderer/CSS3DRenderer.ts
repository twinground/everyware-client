import * as BABYLON from "@babylonjs/core";

class CSS3DObject extends BABYLON.Mesh {
  element: HTMLElement;

  constructor(element: HTMLElement, scene: BABYLON.Scene) {
    super("cssobject", scene);
    this.element = element;
    this.element.style.position = "absolute";
    this.element.style.pointerEvents = "auto";
  }
}

class CSS3DRenderer {
  public cache: any;
  public domElement: any;
  public cameraElement: any;
  public width: number;
  public height: number;
  public widthHalf: number;
  public heightHalf: number;

  constructor() {
    let matrix = new BABYLON.Matrix();

    this.cache = {
      camera: { fov: 0, style: "" },
      objects: new WeakMap(),
    };

    let domElement = document.createElement("div");
    domElement.style.overflow = "hidden";

    this.domElement = domElement;
    this.cameraElement = document.createElement("div");
    this.cameraElement.style.pointerEvents = "none";

    domElement.appendChild(this.cameraElement);
  }

  getSize() {
    return {
      width: this.width,
      height: this.height,
    };
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.widthHalf = this.width / 2;
    this.heightHalf = this.height / 2;

    this.domElement.style.width = width + "px";
    this.domElement.style.height = height + "px";

    this.cameraElement.style.width = width + "px";
    this.cameraElement.style.height = height + "px";
  }

  epsilon(value: number) {
    return Math.abs(value) < 1e-10 ? 0 : value;
  }

  getCameraCSSMatrix(matrix) {
    let elements = matrix.m;

    return (
      "matrix3d(" +
      this.epsilon(elements[0]) +
      "," +
      this.epsilon(-elements[1]) +
      "," +
      this.epsilon(elements[2]) +
      "," +
      this.epsilon(elements[3]) +
      "," +
      this.epsilon(elements[4]) +
      "," +
      this.epsilon(-elements[5]) +
      "," +
      this.epsilon(elements[6]) +
      "," +
      this.epsilon(elements[7]) +
      "," +
      this.epsilon(elements[8]) +
      "," +
      this.epsilon(-elements[9]) +
      "," +
      this.epsilon(elements[10]) +
      "," +
      this.epsilon(elements[11]) +
      "," +
      this.epsilon(elements[12]) +
      "," +
      this.epsilon(-elements[13]) +
      "," +
      this.epsilon(elements[14]) +
      "," +
      this.epsilon(elements[15]) +
      ")"
    );
  }

  getObjectCSSMatrix(matrix) {
    let elements = matrix.m;
    let matrix3d =
      "matrix3d(" +
      this.epsilon(elements[0]) +
      "," +
      this.epsilon(elements[1]) +
      "," +
      this.epsilon(elements[2]) +
      "," +
      this.epsilon(elements[3]) +
      "," +
      this.epsilon(-elements[4]) +
      "," +
      this.epsilon(-elements[5]) +
      "," +
      this.epsilon(-elements[6]) +
      "," +
      this.epsilon(-elements[7]) +
      "," +
      this.epsilon(elements[8]) +
      "," +
      this.epsilon(elements[9]) +
      "," +
      this.epsilon(elements[10]) +
      "," +
      this.epsilon(elements[11]) +
      "," +
      this.epsilon(elements[12]) +
      "," +
      this.epsilon(elements[13]) +
      "," +
      this.epsilon(elements[14]) +
      "," +
      this.epsilon(elements[15]) +
      ")";

    return "translate(-50%,-50%)" + matrix3d;
  }

  renderObject(
    object: BABYLON.AbstractMesh | BABYLON.Scene,
    scene: BABYLON.Scene,
    camera: BABYLON.Camera,
    cameraCSSMatrix: string
  ) {
    if (object instanceof CSS3DObject) {
      let style;
      let objectMatrixWorld = object.getWorldMatrix().clone();
      let camMatrix = camera.getWorldMatrix();
      let innerMatrix = objectMatrixWorld.m;

      // Set scaling
      const youtubeVideoWidth = 4.8;
      const youtubeVideoHeight = 3.6;

      let scalingFactors = [4.8, 0, 4.8, 0, 0, 3.6];
      innerMatrix.map((value, idx) => {
        if (idx == 0 || idx == 2 || idx == 5) {
          return (value * 0.01) / scalingFactors[idx];
        } else if (idx == 12) {
          return -camMatrix.m[12] + object.position.x;
        } else if (idx == 13) {
          return -camMatrix.m[13] + object.position.y;
        } else if (idx == 14) {
          return camMatrix.m[14] - object.position.z;
        } else if (idx == 15) {
          return camMatrix.m[15] * 0.00001;
        } else {
          return value;
        }
      });

      objectMatrixWorld = BABYLON.Matrix.FromArray(innerMatrix);
      style = this.getObjectCSSMatrix(objectMatrixWorld);
      let element = object.element;
      let cachedObject = this.cache.objects.get(object);

      if (cachedObject === undefined || cachedObject.style !== style) {
        element.style.webkitTransform = style;
        element.style.transform = style;

        let objectData = { style: style };

        this.cache.objects.set(object, objectData);
      }
      if (element.parentNode !== this.cameraElement) {
        this.cameraElement.appendChild(element);
      }
    } else if (object instanceof BABYLON.Scene) {
      for (let i = 0, l = object.meshes.length; i < l; i++) {
        this.renderObject(object.meshes[i], scene, camera, cameraCSSMatrix);
      }
    }
  }

  render(scene, camera) {
    let projectionMatrix = camera.getProjectionMatrix();
    let fov = projectionMatrix.m[5] * this.heightHalf;

    if (this.cache.camera.fov !== fov) {
      if (camera.mode == BABYLON.Camera.PERSPECTIVE_CAMERA) {
        this.domElement.style.webkitPerspective = fov + "px";
        this.domElement.style.perspective = fov + "px";
      } else {
        this.domElement.style.webkitPerspective = "";
        this.domElement.style.perspective = "";
      }
      this.cache.camera.fov = fov;
    }

    if (camera.parent === null) camera.computeWorldMatrix();

    let matrixWorld = camera.getWorldMatrix().clone();
    let rotation = matrixWorld.clone().getRotationMatrix().transpose();
    let innerMatrix = matrixWorld.m;

    innerMatrix[1] = rotation.m[1];
    innerMatrix[2] = -rotation.m[2];
    innerMatrix[4] = -rotation.m[4];
    innerMatrix[6] = -rotation.m[6];
    innerMatrix[8] = -rotation.m[8];
    innerMatrix[9] = -rotation.m[9];

    matrixWorld = BABYLON.Matrix.FromArray(innerMatrix);

    let cameraCSSMatrix =
      "translateZ(" + fov + "px)" + this.getCameraCSSMatrix(matrixWorld);

    let style =
      cameraCSSMatrix +
      "translate(" +
      this.widthHalf +
      "px," +
      this.heightHalf +
      "px)";

    if (this.cache.camera.style !== style) {
      // && !this.isIE
      this.cameraElement.style.webkitTransform = style;
      this.cameraElement.style.transform = style;
      this.cache.camera.style = style;
    }

    this.renderObject(scene, scene, camera, cameraCSSMatrix);
  }
}
function refreshRotation(CSSobject: CSS3DObject, plane: BABYLON.Mesh) {
  CSSobject.rotation.y = -plane.rotation.y;
  CSSobject.rotation.x = -plane.rotation.x;
  CSSobject.rotation.z = plane.rotation.z;
}

function refreshPosition(CSSobject: CSS3DObject, plane: BABYLON.Mesh) {
  CSSobject.position.copyFrom(plane.getAbsolutePosition());
  CSSobject.scaling.copyFrom(plane.scaling);
  refreshRotation(CSSobject, plane);
}

function createCSSobject(
  mesh: BABYLON.Mesh,
  scene: BABYLON.Scene,
  videoID: string,
  renderer: CSS3DRenderer,
  iframeFocused: boolean
) {
  let CSSobject = null;
  let width = 480;
  let height = 360;
  scene.onBeforeRenderObservable.add(() => {
    renderer.render(scene, scene.activeCamera);
  });
  const div = document.createElement("div");
  div.style.width = width + "px";
  div.style.height = height + "px";
  div.style.backgroundColor = "#000";
  div.style.zIndex = "1";
  CSSobject = new CSS3DObject(div, scene);
  refreshPosition(CSSobject, mesh);

  const iframe = document.createElement("iframe");
  iframe.id = "video-" + videoID;
  iframe.style.width = width + "px";
  iframe.style.height = height + "px";
  iframe.style.border = "0px";
  iframe.allow = "autoplay";
  iframe.src = [
    "https://www.youtube.com/embed/",
    videoID,
    "?rel=0&enablejsapi=1&disablekb=1&autoplay=1&controls=0&fs=0&modestbranding=1",
  ].join("");
  div.appendChild(iframe);

  // Another new bit that toggles on/off pointer events to body
  div.addEventListener("mouseout", () => {
    iframeFocused = false;
    console.log("CANVAS");
    document.getElementsByTagName("body")[0].style.pointerEvents = "auto";
  });

  return CSSobject;
}

function createMaskingScreen(engine, maskMesh, scene) {
  let depthMask = new BABYLON.StandardMaterial("matDepthMask", scene);
  depthMask.backFaceCulling = false;

  maskMesh.material = depthMask;

  maskMesh.onBeforeRenderObservable.add(() => engine.setColorWrite(false));
  maskMesh.onAfterRenderObservable.add(() => engine.setColorWrite(true));

  // swap meshes to put mask first
  var mask_index = scene.meshes.indexOf(maskMesh);
  scene.meshes[mask_index] = scene.meshes[0];
  scene.meshes[0] = maskMesh;
}

const setupRenderer = function () {
  let container = document.createElement("div");
  container.id = "css-container";
  container.style.position = "absolute";
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.zIndex = "-1";
  container.style.pointerEvents = "none";

  let canvasZone = document.getElementById("CanvasZone");
  canvasZone.insertBefore(container, canvasZone.firstChild);

  let renderer = new CSS3DRenderer();
  container.appendChild(renderer.domElement);
  renderer.setSize(canvasZone.offsetWidth, canvasZone.offsetHeight);

  window.addEventListener("resize", (e) => {
    renderer.setSize(canvasZone.offsetWidth, canvasZone.offsetHeight);
  });
  return renderer;
};

export {
  CSS3DObject,
  CSS3DRenderer,
  setupRenderer,
  createCSSobject,
  createMaskingScreen,
};
