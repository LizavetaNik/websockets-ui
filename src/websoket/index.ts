import { WebSocketServer } from 'ws';

export const connectionHandler = (ws: WebSocketServer) => {
  console.log(ws);
};
