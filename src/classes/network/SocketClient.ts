import { IConnection, ITransform, IPacket } from "../../interfaces/IPacket";
import { SocketEventMap, SocketEventHandler } from "./SocketEventHandler";

const NAME_MAP = {
  0: "connection",
  1: "transform",
};

class Socket {
  private _webSock: WebSocket;
  private _eventMap: SocketEventMap;
  public id: string;

  constructor(URL: string) {
    this._webSock = new WebSocket(URL);
    this._eventMap = new SocketEventMap();

    this._webSock.addEventListener("open", (ev) => {
      console.log("Successful Handshake!");
      //   this.On("connection").Add((data) => {
      //     // const connectionPkt :
      //   });
    });

    this._webSock.addEventListener("error", (ev) => {
      console.log("websocket error : ", ev);
    });

    this._webSock.addEventListener("message", (ev) => {
      const packet: IPacket = JSON.parse(ev.data);
      switch (packet.type) {
        case 0: {
          // connection
          const body: IConnection = packet.body;
          this._eventMap.GetEvent(NAME_MAP[packet.type]).Execute(body);
          break;
        }

        case 1: {
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
}

export default Socket;
