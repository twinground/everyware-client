import {
  IConnection,
  ITransform,
  IPacket,
  IInit,
} from "../../interfaces/IPacket";
import { SocketEventMap } from "./SocketEventHandler";

const NAME_MAP = {
  0: "init",
  1: "connection",
  2: "transform",
};

class Socket {
  private _webSock: WebSocket;
  private _eventMap: SocketEventMap;
  public id: string;

  constructor(URL: string) {
    this._webSock = new WebSocket(URL);
    this._eventMap = new SocketEventMap();

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
      switch (packet.type) {
        case 0: {
          // initialize client
          const body: IInit = packet.body;
          this._eventMap.GetEvent(NAME_MAP[packet.type]).Execute(body);
        }
        case 1: {
          // connection
          const body: IConnection = packet.body;
          this._eventMap.GetEvent(NAME_MAP[packet.type]).Execute(body);
          break;
        }

        case 2: {
          // transform
          const body: ITransform = packet.body;
          this._eventMap.GetEvent(NAME_MAP[packet.type]).Execute(body);
          break;
        }

        default:
          console.log("Unsupported packet type");
          break;
      }
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
