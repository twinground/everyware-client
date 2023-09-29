import Engine from "./classes/core/Engine";

const SERVER_URL = "ws://localhost:8000/";
const EXPO_NAME = "capstone";

window.addEventListener("DOMContentLoaded", () => {
  new Engine(SERVER_URL, EXPO_NAME);
});
