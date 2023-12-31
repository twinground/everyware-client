import InputSystem from "./InputSystem";
import { Vector3, Quaternion, Scene } from "@babylonjs/core";
import Player from "./Player";
import AnimStateMachine from "./animations/AnimStateMachine";
import { IAnimStateMachine } from "../../../interfaces/IStateMachine";

export default class PlayerController {
  private _inputSystem: InputSystem;
  private _velocity: Vector3;
  private _acceleration: Vector3;
  private _decceleration: Vector3;
  private _animStateMachine: IAnimStateMachine;
  private _isTransformUpdated: boolean;

  constructor(private _player: Player, public scene: Scene) {
    this._player = _player;
    this._inputSystem = new InputSystem(this.scene, this._player);
    this._velocity = new Vector3(0, 0, 0);
    this._acceleration = new Vector3(1.0, 0.25, 2000.0);
    this._decceleration = new Vector3(-0.0005, -0.0001, -10.0);
    this._animStateMachine = new AnimStateMachine(this._player);
    this._isTransformUpdated = false;

    scene.registerBeforeRender(() => {
      let deltaTime = this.scene.getEngine().getDeltaTime();
      deltaTime *= 0.001;
      this.UpdatePosition(deltaTime);
    });
  }

  UpdateViewMode(value: boolean) {
    if (!this._player) {
      return;
    }

    /**
     * State Machine update
     */
    this._inputSystem.inputs.view = value;
    this._animStateMachine.UpdateMachine(this._inputSystem);
  }

  UpdatePosition(deltaTime: number) {
    if (!this._player) {
      return;
    }

    /**
     * State Machine Update
     */
    this._animStateMachine.UpdateMachine(this._inputSystem);

    /**
     * Position and Direction Update
     */
    const velocity = this._velocity;
    const frameDecceleration = new Vector3(
      //multiply decceleration ratio by velocity component in each axes
      velocity.x * this._decceleration.x,
      velocity.y * this._decceleration.y,
      velocity.z * this._decceleration.z
    );

    frameDecceleration.scaleInPlace(deltaTime);
    frameDecceleration.z =
      Math.sign(frameDecceleration.z) *
      Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));
    velocity.addInPlace(frameDecceleration);

    const player = this._player.Mesh;
    const axis = new Vector3(0, 1, 0);
    const acc = this._acceleration.clone();

    //product deltaTime to move character according to device frame rate
    if (this._inputSystem.inputs.w || this._inputSystem.inputs.ㅈ) {
      this._isTransformUpdated = true;
      velocity.z += acc.z * deltaTime;
    }
    if (this._inputSystem.inputs.s || this._inputSystem.inputs.ㄴ) {
      this._isTransformUpdated = true;
      velocity.z -= acc.z * deltaTime;
    }
    if (this._inputSystem.inputs.a || this._inputSystem.inputs.ㅁ) {
      this._isTransformUpdated = true;
      player.rotationQuaternion?.multiplyInPlace(
        Quaternion.RotationAxis(
          axis,
          4.0 * -Math.PI * deltaTime * this._acceleration.y
        )
      );
    }
    if (this._inputSystem.inputs.d || this._inputSystem.inputs.ㅇ) {
      this._isTransformUpdated = true;
      player.rotationQuaternion?.multiplyInPlace(
        Quaternion.RotationAxis(
          axis,
          4.0 * Math.PI * deltaTime * this._acceleration.y
        )
      );
    }

    const forward = new Vector3(0, 0, 1);
    forward.applyRotationQuaternionInPlace(
      (player.rotationQuaternion as Quaternion).normalize()
    );

    const sideways = new Vector3(1, 0, 0);
    sideways.applyRotationQuaternionInPlace(
      (player.rotationQuaternion as Quaternion).normalize()
    );

    sideways.scaleInPlace(velocity.x * deltaTime);
    forward.scaleInPlace(velocity.z * deltaTime);

    forward.y = -9.81;
    sideways.y = -9.81;

    this._player.RigidBody.setLinearVelocity(forward.addInPlace(sideways));

    if (this._player.isOnline && this._isTransformUpdated) {
      this._player.SendTransformPacket();
    }

    this._isTransformUpdated = false;
  }
}
