import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig(({ command, mode }) => {
  return {
    resolve: {
      plugins: [wasm(), topLevelAwait()],
      alias: {
        babylonjs:
          mode === "development" ? "babylonjs/babylon.max" : "babylonjs",
      },
    },
  };
});
