interface IPacket {
  header: number; // information for packet
  body: {
    user_id: number;
    data: any;
  };
}
