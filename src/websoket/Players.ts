import { AppWebSocket, SocketMsg } from '../data/interface';
import { usersAll } from './App';

export class Players {
  count = 1;

  private sendMessage(ws: AppWebSocket, type: string, data: any) {
    ws.send(JSON.stringify({ type, data: JSON.stringify(data), id: 0 }));
  }

  registerPlayer({ data, type }: SocketMsg, ws: AppWebSocket) {
    const userData = JSON.parse(data);
    const { name, password } = userData;
    const user = usersAll.get(name);

    if (!user) {
      const idUser = this.count++;
      usersAll.set(name, { ...userData, ws, wins: 0, idUser });

      ws.namePlayer = name;

      this.sendMessage(ws, type, {
        name,
        idUser,
        error: false,
        errorText: '',
      });
    } else {
      if (user.ws.isActive) {
        return this.sendMessage(ws, type, {
          name,
          id: -1,
          error: true,
          errorText: 'This name is exists',
        });
      }

      if (user.password !== password) {
        return this.sendMessage(ws, type, {
          name,
          id: -1,
          error: true,
          errorText: 'Password is incorrect',
        });
      }

      ws.namePlayer = name;
      user.ws = ws;

      this.sendMessage(ws, type, {
        name,
        id: user.id,
        error: false,
        errorText: '',
      });
    }
  }
}
