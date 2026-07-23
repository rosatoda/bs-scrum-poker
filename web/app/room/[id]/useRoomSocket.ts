'use client';

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/lib/game';
import type { RoomState } from '@/lib/types';

export type ConnStatus = 'connecting' | 'connected' | 'error';

const ERROR_TOAST_MS = 3000;

/**
 * Owns the Socket.IO connection lifecycle for a room: connects once a name is
 * known, joins the room, and keeps `room`/`myId`/`status` in sync with server
 * broadcasts. Reconnects whenever `name` or `roomId` changes.
 */
export function useRoomSocket(roomId: string, name: string | null, spectator: boolean) {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnStatus>('connecting');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!name) return;
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setMyId(socket.id ?? null);
      setStatus('connected');
      socket.emit('room:join', { roomId, name, spectator });
    });
    socket.on('room:state', (state: RoomState) => setRoom(state));
    socket.on('room:error', (payload: { message: string }) => {
      setErrorMsg(payload?.message ?? null);
      setTimeout(() => setErrorMsg(null), ERROR_TOAST_MS);
    });
    socket.on('connect_error', () => setStatus('error'));
    socket.on('disconnect', () => setStatus('connecting'));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // spectator changes are sent through their own event, not a reconnect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, roomId]);

  function emit(event: string, payload?: unknown): void {
    socketRef.current?.emit(event, payload);
  }

  return { room, myId, status, errorMsg, emit };
}
