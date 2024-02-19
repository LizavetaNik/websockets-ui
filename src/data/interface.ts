import WebSocket from 'ws';

export type SocketMsg = {
  type: string;
  data: string;
  id: 0;
};

export interface AppWebSocket extends WebSocket {
  namePlayer: string;
  isActive: boolean;
}

export type IShip = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
  hp?: number;
};

export type IPlayer = {
  id: number;
  ws?: AppWebSocket;
  ships?: IShip[];
  isBot: boolean;
  game?: { shipIndex: number; isAttacked: boolean }[][];
};

export type IUser = {
  id: number;
  name: string;
  password: string;
  ws: AppWebSocket;
  wins: number;
};

export type IRoom = {
  idRoom: number;
  idPlayerCurrent: number;
  namePlayer: string;
  players: IPlayer[];
};

export type ICell = {
  shipIndex: number;
  isAttacked: boolean;
};
