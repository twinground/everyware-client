import Engine from "./classes/core/Engine";
import Socket from "./classes/network/SocketClient";

const SERVER_URL = `ws://13.124.153.160:8080/`;
const EXPO_NAME = "capstone";
const socket = new Socket(SERVER_URL);

window.addEventListener("DOMContentLoaded", () => {
  new Engine(EXPO_NAME, socket);
});
