type EventCallback = (data: any) => void;

/**
 *  ----- SocketEvent class -----
 *  This class is actual event handler which define
 */
export class SocketEventHandler {
  public name: string;
  private _eventQueue: EventCallback[];

  constructor(name: string) {
    this.name = name;
    this._eventQueue = [];
  }

  /**
   *
   * @param callback register an EventCallback to event queue.
   * a given callback will be used in SocketClient class to handle specific event.
   */
  Add(callback: EventCallback) {
    this._eventQueue.push(callback);
  }

  /**
   *
   * @param data data given by socket message handler in SocketClient class. Check addEventListener("message")
   * This function execute all the callbacks in _eventQueue;
   */
  Execute(data: any) {
    for (let callback of this._eventQueue) {
      callback(data);
    }
  }
}

/**
 * ----- SocketEventHandler class -----
 * This class stores event keys and provides access into those events to get/set new callbacks.
 */

export class SocketEventMap {
  private _eventMap: { [eventName: string]: SocketEventHandler };

  constructor() {
    this._eventMap = {};
  }

  /**
   *
   * @param name get an event name exists in eventMap field
   * @returns target event name which is value of key. If not exists, return null.
   */
  GetEvent(name: string): SocketEventHandler {
    return this._eventMap[name];
  }

  /**
   *
   * @param name Initialize an SocketEventHandler. If the event name already exists, deny request.
   */
  InitEvent(name: string) {
    if (!this._eventMap[name]) {
      this._eventMap[name] = new SocketEventHandler(name);
    }
    console.log("event already exists"); // TODO : debug
  }
}
