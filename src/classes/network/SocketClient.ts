import { IPacket, IInit } from "../../interfaces/IPacket";
import { SocketEventMap } from "./SocketEventHandler";

const NAME_MAP = {
  0: "init",
  1: "connection",
  2: "transform",
  3: "disconnection",
  4: "chatMessage",
};

class Socket {
  private _webSock: WebSocket;
  private _eventMap: SocketEventMap;
  public name: string;
  public id: string;

  constructor(URL: string) {
    const nickname = localStorage.getItem("nickname");
    if (nickname) {
      this.name = nickname;
    } else {
      //random guest index
      this.name = `guest-${Math.floor(Math.random() * 1000)}`;
    }
    this._webSock = new WebSocket(URL);
    this._eventMap = new SocketEventMap();

    window.onbeforeunload = () => {
      this.Send(3, {
        session_id: this.id,
      });
    };

    // websocket handshake point
    this._webSock.addEventListener("open", (_ev) => {
      console.log("Successful Handshake!");
      this.On("init").Add((data: IInit) => {
        this.id = data.session_id;
      });
    });

    this._webSock.addEventListener("error", (ev) => {
      console.log("websocket error : ", ev);
    });

    this._webSock.addEventListener("message", (ev) => {
      const packet: IPacket = JSON.parse(ev.data);
      this._eventMap.GetEvent(NAME_MAP[packet.type]).Execute(packet.body);
    });

    this._webSock.addEventListener("close", (ev) => {
      if (ev.wasClean) {
        alert(
          `[close] connection was terminated appropriately (code=${ev.code} reason=${ev.reason})`
        );
      } else {
        alert("[close] Deadly disconnected");
      }
    });
  }

  /**
   *
   * @param eventName define an event handler for certain eventName
   * @returns target Socket event to add additional callback on the event
   */
  On(eventName: string) {
    if (!this._eventMap.GetEvent(eventName)) {
      this._eventMap.InitEvent(eventName);
    }

    return this._eventMap.GetEvent(eventName);
  }

  /**
   *
   * @param packetType type to define specific packet
   * @param data actual data to send
   */
  Send(packetType: number, data: any) {
    const packet: IPacket = {
      type: packetType,
      body: data,
    };

    this._webSock.send(JSON.stringify(packet));
  }

  /**
   * getter for web socket instance
   */
  get WebSock() {
    return this._webSock;
  }
}

export default Socket;
