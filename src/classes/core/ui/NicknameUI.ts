import { AbstractMesh, Mesh } from "@babylonjs/core";
import { TextBlock } from "@babylonjs/gui";

class NicknameUI {
  constructor(linkedPlayer: AbstractMesh, name: string, advancedTexture) {
    const nameTag = new TextBlock("player-tag", name);
    advancedTexture.addControl(nameTag);
    nameTag.linkWithMesh(linkedPlayer);
    nameTag.linkOffsetY = -50;
  }
}

export default NicknameUI;
