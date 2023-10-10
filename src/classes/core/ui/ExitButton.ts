import { Button, AdvancedDynamicTexture } from "@babylonjs/gui";

export function createExitButton(advancedTexture: AdvancedDynamicTexture) {
  const exitButton = Button.CreateSimpleButton("view-button", "X");
  advancedTexture.addControl(exitButton);

  exitButton.cornerRadius = 100;
  exitButton.width = "50px";
  exitButton.height = "50px";
  exitButton.color = "white";
  exitButton.background = "grey";
  exitButton.fontSize = "30px";
  exitButton.alpha = 0.5;
  exitButton.top = 200;

  return exitButton;
}
