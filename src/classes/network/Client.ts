// lib
import { Client as StompClient } from "@stomp/stompjs";
// interface
import { IConnection } from "../../interfaces/IPacket";
// type
import type { StompSubscription } from "@stomp/stompjs";

/**
 * Socket Client class
 */
class Client {
    private _socket: StompClient;
    private _subscriptionList: { [key: string]: StompSubscription } = {};
    public id: string | null = null;

    constructor(brokerURL: string, expoName: string) {
        this._socket = new StompClient({
            brokerURL,
            reconnectDelay: 5000, // try reconnect for every 5000 seconds
            heartbeatIncoming: 10000, // heartbeat used for checking connection
            heartbeatOutgoing: 10000,
            onConnect: (frame) => {
                // const subscription = this._socket.subscribe(
                //     `/sub/expo/${expoName}`,
                //     (message) => {
                //         const connectionPkt: IConnection = JSON.parse(message.body);
                //         this.id = connectionPkt.user_id;
                //         console.log("Session id assigned from server : " + this.id);
                //     }
                // );
                console.log(frame)
                const initSub = this._socket.subscribe(`/sub/expo/${expoName}`,
                    (message) => {
                        const connectionPkt: IConnection = JSON.parse(message.body);
                        if (!this.id) {
                            this.id = connectionPkt.user_id;
                            console.log("Hi from server, your id is " + this.id);
                        }
                        console.log("test");
                    });

                this._socket.publish({
                    destination: `/pub/expo/${expoName}`,
                    body: JSON.stringify({
                        expoName,
                    }),
                });

                this._subscriptionList['init'] = initSub;
                // console.log(subscription);
                // console.log(frame);
                // this._subscriptionList.push(subscription);
            },
        });
    }

    get Socket() {
        return this._socket;
    }

    get SubscriptionList() {
        return this._subscriptionList;
    }
}

export default Client;
