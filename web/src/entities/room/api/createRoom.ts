import { SOCKET_URL } from '@/shared/config/env';

/** Asks the server to pre-create a room and returns its id, or null if the server is unreachable. */
export async function createRoomOnServer(): Promise<string | null> {
  try {
    const res = await fetch(`${SOCKET_URL}/rooms`, { method: 'POST' });
    if (!res.ok) return null;
    const data = (await res.json()) as { roomId: string };
    return data.roomId;
  } catch {
    return null;
  }
}
