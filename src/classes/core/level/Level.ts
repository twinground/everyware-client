import {
  MeshBuilder,
  Scene,
  Color3,
  SceneLoader,
  ActionManager,
  Mesh,
  Texture,
  Quaternion,
  StandardMaterial,
  Vector3,
  ExecuteCodeAction,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
// class
import Player from "../player/Player";
import WorldScene from "../scene/WorldScene";

// level-data json file
import data from "../../../../public/data/level-data.json";

// gizmo manager
import WorldGizmoManager from "./WorldGizmoManager";
class Level {
  private _collisionArea: Mesh;
  private _gizmoManager: WorldGizmoManager;
  private _levelData: any[];

  constructor(
    public scene: Scene,
    public advancedTexture: AdvancedDynamicTexture,
    public player: Player,
    readonly worldScene: WorldScene
  ) {
    this.scene = scene;
    this.player = player;
    //TODO : check for PR
    this._gizmoManager = new WorldGizmoManager(scene);
    this._levelData = JSON.parse(JSON.stringify(data));

    let level = this.scene.createDefaultEnvironment({
      enableGroundShadow: true,
    });
    level.setMainColor(new Color3(36 / 255, 113 / 255, 214 / 255));
    level.ground.receiveShadows = true;

    this._collisionArea = MeshBuilder.CreateBox(
      "AVAILABLE_RANGE_TO_VIEW",
      { width: 2, height: 2, depth: 2 },
      this.scene
    );
    this._collisionArea.actionManager = new ActionManager(this.scene);
    this._collisionArea.visibility = 0;
    this._collisionArea.position.set(0, 0.3, -5);

    this.Load().then(() => {
      // create view mode button (async)
      this.worldScene.CreateViewButton(this._collisionArea);
    });
  }

  public async Load() {
    const chairGLB = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "chair.glb",
      this.scene
    );

    const chairMesh = chairGLB.meshes[0];
    const monalisaMaterial = new StandardMaterial("test mat", this.scene);
    const monalisaTexture = new Texture("/images/monalisa.png", this.scene);
    monalisaMaterial.diffuseTexture = monalisaTexture;
    const panel = MeshBuilder.CreateBox(
      "test exhibit",
      { width: 1.5, height: 1.5, depth: 0.3 },
      this.scene
    );
    const background = MeshBuilder.CreateBox(
      "test background",
      {
        width: 1.5,
        height: 2.5,
        depth: 0.29,
      },
      this.scene
    );
    panel.material = monalisaMaterial;
    panel.rotate(new Vector3(0, 0, 1), Math.PI);
    background.position.set(0, 1.5, -7.5);
    panel.parent = background;
    chairMesh.parent = this._collisionArea;

    //TODO : mesh 들을 관리하는 양식에 따르면 name, quaternion속성이 필요함
    // 디폴트의 경우 메쉬 객체의 quaternion속성이 null로 되어있음
    // 어쨋든 기즈모를 통해서 커스터 마이징을 하면 quaternion속성이 생성됨
    // name 리스트를 만들어서 관리해도 좋을것 같기도 하고...?
    // 따라서 아래와 같은 코드들이 함께 수반 되어야 함!! 다른 의견들도 제시 바람
    // 이런 코드들을 어디서 관리할지 고민필요
    this._collisionArea.name = "test_chairMeshCol";
    this._collisionArea.rotationQuaternion = new Quaternion(0, 0, 0, 0);
    background.name = "test_background";
    background.rotationQuaternion = new Quaternion(0, 0, 0, 0);

    //아래 코드가 데이터 로드하는 메소드 / 내보내는 키 액션 메소드
    this.LoadDBData();
    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
        if (evt.sourceEvent.key == "v" || evt.sourceEvent.key == "ㅍ") {
          console.log(evt.sourceEvent.key);
          this.SaveDBData();
        }
      })
    );
  }

  private LoadDBData() {
    for (let i = 0; i < this._levelData.length; i++) {
      let temp = this.scene.getMeshByName(this._levelData[i]["name"]);
      console.log(i);
      console.log(temp);
      if (temp) {
        temp.rotationQuaternion.set(
          this._levelData[i]["rotationQuaternion"]["x"],
          this._levelData[i]["rotationQuaternion"]["y"],
          this._levelData[i]["rotationQuaternion"]["z"],
          this._levelData[i]["rotationQuaternion"]["w"]
        );
        temp.position.set(
          this._levelData[i]["position"]["x"],
          this._levelData[i]["position"]["y"],
          this._levelData[i]["position"]["z"]
        );

        temp.scaling.set(
          this._levelData[i]["scaling"]["x"],
          this._levelData[i]["scaling"]["y"],
          this._levelData[i]["scaling"]["z"]
        );
      }
    }
  }

  private SaveDBData() {
    console.log("------------------");
    console.log(this._levelData);
    let saveBuffer = [];
    for (let i = 0; i < this._levelData.length; i++) {
      let temp = this.scene.getMeshByName(this._levelData[i]["name"]);
      console.log("여기");
      console.log(temp);
      if (temp) {
        console.log(this._levelData[i]["name"]);
        console.log(temp);
        console.log(temp.name);
        let a = Object();

        a.name = temp.name;
        a.rotationQuaternion = {
          x: temp.rotationQuaternion._x,
          y: temp.rotationQuaternion._y,
          z: temp.rotationQuaternion._z,
          w: temp.rotationQuaternion._w,
        };
        a.scaling = {
          x: temp.scaling._x,
          y: temp.scaling._y,
          z: temp.scaling._z,
        };
        a.position = {
          x: temp.position._x,
          y: temp.position._y,
          z: temp.position._z,
        };
        console.log(i);
        console.log(a);
        saveBuffer.push(a);
      }
    }
    console.log(saveBuffer);
    console.log("------------------");
    console.log(JSON.stringify(saveBuffer));
  }
}

export default Level;
