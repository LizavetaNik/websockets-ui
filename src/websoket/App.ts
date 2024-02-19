import { WebSocketServer } from 'ws';
import { AppWebSocket, SocketMsg, IRoom, IUser } from 'data/interface';
import { Players } from './Players';
import { Game } from './Game';
import { Room } from './Room';

export const usersAll: Map<string, IUser> = new Map();

export const roomsAll: Map<number, IRoom> = new Map();

export class App {
  players = new Players();
  game = new Game();
  room = new Room();

  constructor(public wsServer: WebSocketServer) {}

  regWS(ws: AppWebSocket, message: SocketMsg) {
    this.players.registerPlayer(message, ws);
    this.sendUpdate();
  }

  createRoomWS(ws: AppWebSocket) {
    const roomId = this.game.createRoomForGame(ws);

    if (roomId) {
      this.sendUpdate();
    }
  }

  addUserToRoomWS(ws: AppWebSocket, message: SocketMsg) {
    const roomId = this.room.addUserToRoom(message.data, ws);

    if (roomId) {
      this.sendUpdate();
      this.game.createGame(roomId);
    }
  }

  addShipsWS(message: SocketMsg) {
    this.game.addShips(message.data);
  }

  attackWS(message: SocketMsg) {
    const winnerUserName = this.game.attack(message.data);

    if (winnerUserName) {
      this.addWinner(winnerUserName);
      this.sendUpdate();
    }
  }

  randomAttackWS(message: SocketMsg) {
    this.game.attackRandom(message.data);
  }

  singlePlayWS(ws: AppWebSocket) {
    this.game.createSinglePlay(ws);
  }

  cleanWS(ws: AppWebSocket) {
    const winnerUserName = this.game.closeRoom(ws);
    if (winnerUserName) {
      this.addWinner(winnerUserName);
      this.sendUpdate();
    }
    ws.isActive = false;
    ws.terminate();
  }

  private addWinner(namePlayer: string) {
    const user = usersAll.get(namePlayer);
    if (user) {
      user.wins += 1;
    }
  }

  private sendUpdate() {
    this.room.sendFreeRooms(this.wsServer);

    const winnersList = Array.from(usersAll.values())
      .filter((user) => user.wins > 0)
      .map((user) => ({ name: user.name, wins: user.wins }));

    this.wsServer.clients.forEach((client) =>
      client.send(
        JSON.stringify({
          type: 'update_winners',
          data: JSON.stringify(winnersList),
          id: 0,
        }),
      ),
    );
  }
}
