import { Injectable } from '@nestjs/common';

export type CardValue = string; // '0' | '½' | '1' ... '?' | '☕'

export interface Participant {
  /** socket id */
  id: string;
  name: string;
  vote: CardValue | null;
  spectator: boolean;
  joinedAt: number;
}

export interface Room {
  id: string;
  participants: Map<string, Participant>;
  revealed: boolean;
  round: number;
  createdAt: number;
}

/** State as broadcast to clients. Votes are masked until reveal. */
export interface PublicParticipant {
  id: string;
  name: string;
  hasVoted: boolean;
  /** only present when room is revealed */
  vote?: CardValue | null;
  spectator: boolean;
}

export interface PublicRoomState {
  id: string;
  revealed: boolean;
  round: number;
  participants: PublicParticipant[];
}

const ROOM_TTL_MS = 1000 * 60 * 60 * 6; // purge empty rooms after 6h
const MAX_NAME_LENGTH = 24;

@Injectable()
export class RoomsService {
  private rooms = new Map<string, Room>();

  constructor() {
    // Periodically purge stale/empty rooms so memory doesn't grow forever.
    setInterval(() => this.purge(), 1000 * 60 * 15).unref?.();
  }

  private purge(): void {
    const now = Date.now();
    for (const [id, room] of this.rooms) {
      if (room.participants.size === 0 && now - room.createdAt > ROOM_TTL_MS) {
        this.rooms.delete(id);
      }
    }
  }

  /** 8-digit numeric room code, e.g. 56201720 */
  generateRoomId(): string {
    let id: string;
    do {
      id = String(Math.floor(10000000 + Math.random() * 90000000));
    } while (this.rooms.has(id));
    return id;
  }

  createRoom(id?: string): Room {
    const roomId = id && /^\d{8}$/.test(id) ? id : this.generateRoomId();
    const existing = this.rooms.get(roomId);
    if (existing) return existing;
    const room: Room = {
      id: roomId,
      participants: new Map(),
      revealed: false,
      round: 1,
      createdAt: Date.now(),
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  join(roomId: string, socketId: string, name: string, spectator = false): Room {
    const room = this.createRoom(roomId);
    const safeName = (name || 'Guest').trim().slice(0, MAX_NAME_LENGTH) || 'Guest';
    room.participants.set(socketId, {
      id: socketId,
      name: safeName,
      vote: null,
      spectator,
      joinedAt: Date.now(),
    });
    return room;
  }

  leave(roomId: string, socketId: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    room.participants.delete(socketId);
    if (room.participants.size === 0) {
      // keep the room around briefly (purge handles cleanup) so refreshes rejoin seamlessly
      room.revealed = false;
    }
    return room;
  }

  vote(roomId: string, socketId: string, value: CardValue | null): Room | undefined {
    const room = this.rooms.get(roomId);
    const participant = room?.participants.get(socketId);
    if (!room || !participant || participant.spectator) return room;
    // Toggling the same card removes the vote
    participant.vote = participant.vote === value ? null : value;
    return room;
  }

  reveal(roomId: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    room.revealed = true;
    return room;
  }

  reset(roomId: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    room.revealed = false;
    room.round += 1;
    for (const p of room.participants.values()) p.vote = null;
    return room;
  }

  setSpectator(roomId: string, socketId: string, spectator: boolean): Room | undefined {
    const room = this.rooms.get(roomId);
    const participant = room?.participants.get(socketId);
    if (!room || !participant) return room;
    participant.spectator = spectator;
    if (spectator) participant.vote = null;
    return room;
  }

  rename(roomId: string, socketId: string, name: string): Room | undefined {
    const room = this.rooms.get(roomId);
    const participant = room?.participants.get(socketId);
    if (!room || !participant) return room;
    participant.name = (name || participant.name).trim().slice(0, MAX_NAME_LENGTH) || participant.name;
    return room;
  }

  toPublicState(room: Room): PublicRoomState {
    const participants = [...room.participants.values()]
      .sort((a, b) => a.joinedAt - b.joinedAt)
      .map((p) => {
        const base: PublicParticipant = {
          id: p.id,
          name: p.name,
          hasVoted: p.vote !== null,
          spectator: p.spectator,
        };
        if (room.revealed) base.vote = p.vote;
        return base;
      });
    return {
      id: room.id,
      revealed: room.revealed,
      round: room.round,
      participants,
    };
  }
}
