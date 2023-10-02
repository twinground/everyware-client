import Engine from "./classes/core/Engine";

const EXPO_NAME = "capstone";
const SERVER_URL = `ws://localhost:8000/${EXPO_NAME}`;

window.addEventListener("DOMContentLoaded", () => {
  new Engine(SERVER_URL, EXPO_NAME);
});
