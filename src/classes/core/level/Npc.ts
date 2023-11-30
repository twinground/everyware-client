import {
  AbstractMesh,
  AnimationGroup,
  AsyncCoroutine,
  Mesh,
  Scene,
  SceneLoader,
  TransformNode,
} from "@babylonjs/core";

type NpcAnimations = {
  idle: AnimationGroup;
  waving: AnimationGroup;
  thanks: AnimationGroup;
};

const ANIM_NAME_MAP = {
  0: "idle",
  1: "thanks",
  2: "waving",
};

class Npc {
  mesh: AbstractMesh | null = null;
  animations: NpcAnimations = { idle: null, waving: null, thanks: null };
  curAnim: AnimationGroup;

  constructor(readonly scene: Scene) {}

  public async LoadModelAsset() {
    const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "npc.glb",
      this.scene
    );
    let mesh = meshes[0];
    mesh.parent = null;

    this.mesh = mesh;
    this.mesh.scaling.setAll(1.23);
    const anims = animationGroups.slice(3);
    this.animations.idle = anims[0];
    this.animations.thanks = anims[1];
    this.animations.waving = anims[2];
    this.animations.waving.loopAnimation = false;

    this.animations.idle.play(true);
    this.curAnim = this.animations.idle;

    setInterval(() => {
      this.PlayRandomAnimation();
    }, 3000);

    return this.mesh;
  }

  //generator
  public *AnimationBlending(
    to: AnimationGroup,
    from: AnimationGroup,
    ratio: number
  ): AsyncCoroutine<void> {
    let curWeight = 1;
    let nextWeight = 0;

    to.play(); // play next animation first
    this.curAnim = to;

    while (nextWeight < 1) {
      curWeight -= ratio; // decrement current animation weight by given ratio
      nextWeight += ratio; // increment
      to.setWeightForAllAnimatables(nextWeight);
      from.setWeightForAllAnimatables(curWeight);
      yield; // this makes that routine wait for one frame.
    }
  }

  public PlayRandomAnimation() {
    const idx = Math.floor(Math.random() * 3);

    // if (idx == 1) return;

    const newAnim = this.animations[ANIM_NAME_MAP[idx]];
    // if (newAnim === this.curAnim) {
    //   console.log("same");
    //   return;
    // }
    this.curAnim.stop();
    this.curAnim = newAnim;
    this.curAnim.play();
    // this.scene.onBeforeRenderObservable.runCoroutineAsync(
    //   this.AnimationBlending(
    //     this.animations[ANIM_NAME_MAP[idx]],
    //     this.curAnim,
    //     0.05
    //   )
    // );
  }

  public SetParentMesh(parent: TransformNode) {
    this.mesh.parent = parent;
  }
}

export default Npc;
