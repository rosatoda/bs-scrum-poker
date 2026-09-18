'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoomOnServer } from '@/entities/room';
import { randomRoomId } from '@/shared/lib/randomRoomId';
import { rememberName } from '@/shared/lib/rememberedName';

export function useCreateRoom() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function createRoom(name: string) {
    setCreating(true);
    if (name.trim()) rememberName(name.trim());
    const roomId = (await createRoomOnServer()) ?? randomRoomId();
    router.push(`/room/${roomId}`);
  }

  return { creating, createRoom };
}
