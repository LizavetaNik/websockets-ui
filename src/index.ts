import 'dotenv/config';
import WebSocket, { WebSocketServer } from 'ws';
import { httpServer } from './http_server/index';
import { AppWebSocket, SocketMsg } from './data/interface';
import { App } from './websoket/App';
import { IncomingMessage } from 'http';

const HTTP_PORT = +(process.env.HTTP_PORT || 3000);
export const wsServer = new WebSocketServer({ server: httpServer });
const serverApp = new App(wsServer);

httpServer.listen(HTTP_PORT, () =>
  console.log(`Start static http server on the ${HTTP_PORT} port!`),
);

wsServer.on('connection', function connection(ws: AppWebSocket, req) {
  ws.isActive = true;

  identification(req);

  ws.on('error', console.error);

  ws.on('pong', () => {
    ws.isActive = true;
  });

  ws.on('close', () => {
    serverApp.cleanWS(ws);
  });

  ws.on('message', (rawMessage: WebSocket.RawData) => {
    const message: SocketMsg = JSON.parse(rawMessage.toString());

    switch (message.type) {
      case 'reg': {
        serverApp.regWS(ws, message);
        break;
      }

      case 'create_room': {
        serverApp.createRoomWS(ws);
        break;
      }

      case 'add_user_to_room': {
        serverApp.addUserToRoomWS(ws, message);
        break;
      }

      case 'add_ships': {
        serverApp.addShipsWS(message);
        break;
      }

      case 'attack': {
        serverApp.attackWS(message);
        break;
      }

      case 'randomAttack': {
        serverApp.randomAttackWS(message);
        break;
      }

      case 'single_play': {
        serverApp.singlePlayWS(ws);
        break;
      }
    }
  });
});

process.on('SIGINT', () => {
  clearInterval(intervalSessions);

  wsServer.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.close();
    }
  });

  wsServer.close();
  httpServer.close();
  process.exit();
});

function identification({ headers }: IncomingMessage) {
  if (headers.upgrade === 'websocket' && headers.connection === 'Upgrade') {
    const webSocketKey = headers['sec-websocket-key'];
    return console.log('WebSocket connection, key:', webSocketKey);
  }
}

const intervalSessions = setInterval(function ping() {
  wsServer.clients.forEach(function each(wsClient: WebSocket) {
    const ws = wsClient as AppWebSocket;
    if (ws.isActive === false) {
      return ws.terminate();
    }
    ws.isActive = false;
    ws.ping();
  });
}, 15000);
