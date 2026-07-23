import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CardValue, RoomsService } from './rooms.service';

interface JoinPayload {
  roomId: string;
  name: string;
  spectator?: boolean;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL?.split(',') ?? '*',
    methods: ['GET', 'POST'],
  },
})
export class RoomsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly rooms: RoomsService) {}

  private roomOf(client: Socket): string | undefined {
    return client.data.roomId as string | undefined;
  }

  private broadcast(roomId: string): void {
    const room = this.rooms.getRoom(roomId);
    if (!room) return;
    this.server.to(roomId).emit('room:state', this.rooms.toPublicState(room));
  }

  @SubscribeMessage('room:join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() payload: JoinPayload): void {
    const roomId = String(payload?.roomId ?? '').replace(/\D/g, '').slice(0, 8);
    if (roomId.length !== 8) {
      client.emit('room:error', { message: 'Room codes are 8 digits.' });
      return;
    }
    // Leave a previous room if the client switches rooms on the same socket
    const previous = this.roomOf(client);
    if (previous && previous !== roomId) {
      client.leave(previous);
      this.rooms.leave(previous, client.id);
      this.broadcast(previous);
    }
    this.rooms.join(roomId, client.id, payload?.name, Boolean(payload?.spectator));
    client.data.roomId = roomId;
    client.join(roomId);
    this.broadcast(roomId);
  }

  @SubscribeMessage('room:vote')
  handleVote(@ConnectedSocket() client: Socket, @MessageBody() payload: { value: CardValue }): void {
    const roomId = this.roomOf(client);
    if (!roomId) return;
    const room = this.rooms.getRoom(roomId);
    if (!room || room.revealed) return; // no vote changes after reveal
    this.rooms.vote(roomId, client.id, payload?.value ?? null);
    this.broadcast(roomId);
  }

  @SubscribeMessage('room:reveal')
  handleReveal(@ConnectedSocket() client: Socket): void {
    const roomId = this.roomOf(client);
    if (!roomId) return;
    if (!this.rooms.isAdmin(roomId, client.id)) {
      client.emit('room:error', { message: 'Only the room admin can reveal cards.' });
      return;
    }
    this.rooms.reveal(roomId);
    this.broadcast(roomId);
  }

  @SubscribeMessage('room:reset')
  handleReset(@ConnectedSocket() client: Socket): void {
    const roomId = this.roomOf(client);
    if (!roomId) return;
    if (!this.rooms.isAdmin(roomId, client.id)) {
      client.emit('room:error', { message: 'Only the room admin can start the next round.' });
      return;
    }
    this.rooms.reset(roomId);
    this.broadcast(roomId);
  }

  @SubscribeMessage('room:transfer-admin')
  handleTransferAdmin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { targetId: string },
  ): void {
    const roomId = this.roomOf(client);
    if (!roomId) return;
    if (!this.rooms.isAdmin(roomId, client.id)) {
      client.emit('room:error', { message: 'Only the room admin can pass on that role.' });
      return;
    }
    this.rooms.transferAdmin(roomId, client.id, String(payload?.targetId ?? ''));
    this.broadcast(roomId);
  }

  @SubscribeMessage('room:spectator')
  handleSpectator(@ConnectedSocket() client: Socket, @MessageBody() payload: { spectator: boolean }): void {
    const roomId = this.roomOf(client);
    if (!roomId) return;
    this.rooms.setSpectator(roomId, client.id, Boolean(payload?.spectator));
    this.broadcast(roomId);
  }

  @SubscribeMessage('room:rename')
  handleRename(@ConnectedSocket() client: Socket, @MessageBody() payload: { name: string }): void {
    const roomId = this.roomOf(client);
    if (!roomId) return;
    this.rooms.rename(roomId, client.id, payload?.name ?? '');
    this.broadcast(roomId);
  }

  handleDisconnect(client: Socket): void {
    const roomId = this.roomOf(client);
    if (!roomId) return;
    this.rooms.leave(roomId, client.id);
    this.broadcast(roomId);
  }
}
