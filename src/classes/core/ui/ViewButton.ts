import { Mesh } from "@babylonjs/core";
import { Button, AdvancedDynamicTexture } from "@babylonjs/gui";

export function createButton(
  linkMesh: Mesh,
  advancedTexture: AdvancedDynamicTexture
): Button {
  const viewButton = Button.CreateSimpleButton("view-button", "체험하기");
  advancedTexture.addControl(viewButton);

  viewButton.isVisible = false;
  viewButton.width = "100px";
  viewButton.height = "40px";
  viewButton.color = "white";
  viewButton.background = "grey";
  viewButton.alpha = 0.7;
  viewButton.linkWithMesh(linkMesh);
  viewButton.linkOffsetY = -85;
  viewButton.linkOffsetX = 90;

  return viewButton;
}
