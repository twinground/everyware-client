import Engine from "./classes/core/Engine";
import SocketClient from "./classes/network/Client";

const SERVER_URL = `ws://localhost:8000/`;
const EXPO_NAME = "capstone"; // ui should give this to here.
const client = new SocketClient(SERVER_URL, EXPO_NAME);

window.addEventListener("DOMContentLoaded", () => {
  new Engine(SERVER_URL, EXPO_NAME, client);
});
