import { Mesh } from "@babylonjs/core";
import { Button, AdvancedDynamicTexture } from "@babylonjs/gui";

export function createButton(
  linkMesh: Mesh,
  advancedTexture: AdvancedDynamicTexture
): Button {
  const viewButton = Button.CreateSimpleButton("view-button", "관람하기");
  advancedTexture.addControl(viewButton);

  viewButton.isVisible = false;
  viewButton.width = "100px";
  viewButton.height = "40px";
  viewButton.color = "white";
  viewButton.background = "grey";
  viewButton.linkWithMesh(linkMesh);
  viewButton.linkOffsetY = -85;
  viewButton.linkOffsetX = 55;

  return viewButton;
}
