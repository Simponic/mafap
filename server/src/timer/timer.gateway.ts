import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TimerService } from './timer.service';
import { AuthService } from '../auth/auth.service';
import { Timer, Friend } from '@prisma/client';

@WebSocketGateway({
  transports: ['websocket'],
  namespace: '/events/timers',
})
export class TimerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(forwardRef(() => TimerService))
    private timerService: TimerService,
    private authService: AuthService,
  ) {}

  @WebSocketServer()
  server: Server;

  private roomsClientsConnected: Map<string, Set<string>> = new Map<
    string,
    Set<string>
  >();

  private clientRoomsConnected: Map<string, Set<string>> = new Map<
    string,
    Set<string>
  >();

  private addClientToRoom(roomName: string, clientId: string) {
    if (!this.roomsClientsConnected.has(roomName)) {
      this.roomsClientsConnected.set(roomName, new Set<string>([clientId]));
    } else {
      this.roomsClientsConnected.get(roomName).add(clientId);
    }

    if (!this.clientRoomsConnected.has(clientId)) {
      this.clientRoomsConnected.set(clientId, new Set([roomName]));
    } else {
      this.clientRoomsConnected.get(clientId).add(roomName);
    }
  }

  private removeClientFromRoom(roomName: string, clientId: string) {
    if (this.roomsClientsConnected.has(roomName)) {
      const clients = this.roomsClientsConnected.get(roomName);

      if (clients.size === 1) {
        this.roomsClientsConnected.delete(roomName);
      } else {
        clients.delete(clientId);
      }
    }

    if (this.clientRoomsConnected.has(clientId)) {
      const clientRooms = this.clientRoomsConnected.get(clientId);
      clientRooms.delete(roomName);

      if (clientRooms.size === 0) this.clientRoomsConnected.delete(clientId);
    }
  }

  private friendRoom = ({ id }: { id: number }) => `friend-${id}`;

  public async handleConnection(client: Socket) {
    let roomName = 'all';

    const { friend } = client.handshake?.query;
    if (friend) {
      const listenFriend = isNaN(Number(friend))
        ? await this.authService.findFriendByName(friend as string)
        : await this.authService.findFriendByNameOrId('', Number(friend));
      roomName = this.friendRoom(listenFriend);
    }

    client.join(roomName);
    this.addClientToRoom(roomName, client.id);
  }

  public handleDisconnect(client: Socket) {
    for (const room of this.clientRoomsConnected.get(client.id))
      this.removeClientFromRoom(room, client.id);
  }

  public timerCreated(timer: Timer & { referenced_friends: Friend[] }) {
    this.server.to('all').emit('created', timer);
    timer.referenced_friends.map((friend) =>
      this.server.to(this.friendRoom(friend)).emit('created', timer),
    );
  }

  public timerRefreshed(
    timer: Partial<Timer> & { referenced_friends: Partial<Friend>[] },
  ) {
    this.server.to('all').emit('refreshed', timer);
    timer.referenced_friends.map((friend) =>
      this.server
        .to(this.friendRoom(friend as Friend))
        .emit('refreshed', timer),
    );
  }
}
