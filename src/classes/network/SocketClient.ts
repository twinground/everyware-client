import { IPacket } from "../../interfaces/IPacket";

class Socket {
  private _webSock;
  private _messageHandlers;
  public id: string;

  constructor(URL: string) {
    this._webSock = new WebSocket(URL);

    this._webSock.addEventListener("open", (ev) => {
      console.log("connected.");
    });

    this._webSock.addEventListener("error", (ev) => {
      console.log("error : ", ev);
    });

    this._webSock.addEventListener("message", (ev) => {
      const packet: IPacket = JSON.parse(ev.data);
      switch (packet.id) {
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

  On(eventName: string) {}

  Send(packetId: number, data: any) {
    const packet: IPacket = {
      id: packetId,
      body: data,
    };
  }
}

export default Socket;
