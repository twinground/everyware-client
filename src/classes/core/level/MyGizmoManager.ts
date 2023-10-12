import { GizmoManager, Scene } from "@babylonjs/core";

class MyGizmoManager extends GizmoManager {
  constructor(scene: Scene) {
    super(scene);

    this.positionGizmoEnabled = true;
    this.rotationGizmoEnabled = true;
    this.scaleGizmoEnabled = true;
    this.boundingBoxGizmoEnabled = true;
    console.log(this);
    this.gizmos.positionGizmo.xGizmo.dragBehavior.onDragStartObservable.add(
      () => {
        console.log("Position gizmo's x axis started to be dragged");
      }
    );
    this.gizmos.positionGizmo.xGizmo.dragBehavior.onDragEndObservable.add(
      () => {
        console.log("Position gizmo's x axis drag was ended");
      }
    );

    //for debug
    this.gizmos.rotationGizmo.xGizmo.dragBehavior.onDragObservable.add(() => {
      console.log(this._attachedMesh.rotationQuaternion);
    });

    this.gizmos.rotationGizmo.yGizmo.dragBehavior.onDragObservable.add(() => {
      console.log(this._attachedMesh.rotationQuaternion);
    });

    this.gizmos.rotationGizmo.zGizmo.dragBehavior.onDragObservable.add(() => {
      console.log(this._attachedMesh.rotationQuaternion);
    });
  }
}

export default MyGizmoManager;
