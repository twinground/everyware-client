export interface IConnection {
  user_id: number;
  data: any;
}

export interface ITransform {
  user_id: number;
  data: {
    position: { x: number; z: number };
    quaternion: { y: number; w: number };
    state: string;
  };
}

export interface IPacket {
  id: number;
  body: IConnection | ITransform;
}
