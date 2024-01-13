import Engine from "./classes/core/Engine";
import Socket from "./classes/network/SocketClient";

const SERVER_URL = `wss://13.124.153.160:8080`;
//const SERVER_URL = `wss://everyware.site`;
const EXPO_NAME = "capstone";
const isOnline = false;

window.addEventListener("DOMContentLoaded", () => {
  if (isOnline) {
    const socket = new Socket(SERVER_URL);
    new Engine(EXPO_NAME, socket);
  } else {
    new Engine(EXPO_NAME, null);
  }
});
