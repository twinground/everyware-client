import { AbstractMesh, Mesh } from "@babylonjs/core";
import { TextBlock } from "@babylonjs/gui";

class NicknameUI {
  public textBlock: TextBlock;

  constructor(linkedPlayer: AbstractMesh, name: string, advancedTexture) {
    this.textBlock = new TextBlock("player-tag", name);
    advancedTexture.addControl(this.textBlock);
    this.textBlock.linkWithMesh(linkedPlayer);
    this.textBlock.linkOffsetY = -50;
  }
}

export default NicknameUI;
