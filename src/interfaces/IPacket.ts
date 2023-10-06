type TransformData = {
  session_id: string;
  position: { x: number; z: number };
  quaternion: { y: number; w: number };
  state: string;
};

export interface IConnection {
  session_id: string;
  data: TransformData[];
}

export interface ITransform {
  session_id: string;
  data: {
    position: { x: number; z: number };
    quaternion: { y: number; w: number };
    state: string;
  };
}

export interface IPacket {
  type: number;
  body: any;
}
