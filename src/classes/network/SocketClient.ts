/**
 * Socket Client class
 */
class SocketClient {
  readonly SERVER_URI: string = "ws://127.0.0.1:8080";
  private socket: WebSocket;
  public connected: boolean;

  constructor() {
    this.socket = new WebSocket(this.SERVER_URI);

    this.socket.addEventListener("open", (_ev) => {
      this.connected = true;
      this.Ping();
      console.log("connected");
    });

    this.socket.addEventListener("error", (ev) => {
      console.log("error : ", ev);
    });

    this.socket.addEventListener("message", (ev) => {
      console.log("message from server " + ev.data);
    });

    this.socket.addEventListener("close", (ev) => {
      if (ev.wasClean) {
        alert(
          `[close] connection was terminated appropriately (code=${ev.code} reason=${ev.reason})`
        );
      } else {
        // 예시: 프로세스가 죽거나 네트워크에 장애가 있는 경우
        // event.code가 1006이 됩니다.
        alert("[close] Deadly disconnected");
      }
    });
  }

  Send() {
    setTimeout(() => {
      this.socket.send("Test data");
    }, 1000);
  }

  Ping() {
    setInterval(() => {
      if (this.socket.readyState == WebSocket.OPEN) {
        this.socket.send("ping");
      } else {
        console.log("connection dead");
      }
    }, 30000);
  }
}

export default SocketClient;
