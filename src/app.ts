import Engine from "./classes/core/Engine";
import Socket from "./classes/network/SocketClient";

const SERVER_URL = `ws://13.124.153.160:8080/`;
const EXPO_NAME = "capstone";
const isOnline = true;

window.addEventListener("DOMContentLoaded", () => {
  if (isOnline) {
    const socket = new Socket(SERVER_URL);
    new Engine(EXPO_NAME, socket);
  } else {
    new Engine(EXPO_NAME, null);
  }
});
