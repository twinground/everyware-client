export interface IConnection {
  user_id: string;
  data: any;
}

export interface ITransform {
  user_id: string;
  data: {
    position: { x: number; z: number };
    quaternion: { y: number; w: number };
    state: string;
  };
}

export interface IPacket {
  id: string;
  body: IConnection | ITransform;
}
