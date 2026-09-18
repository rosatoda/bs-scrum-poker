'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { rememberName } from '@/shared/lib/rememberedName';

export function useJoinRoom() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');

  function joinRoom(e: React.FormEvent, name: string) {
    e.preventDefault();
    const code = joinCode.replace(/\D/g, '');
    if (code.length !== 8) return;
    if (name.trim()) rememberName(name.trim());
    router.push(`/room/${code}`);
  }

  return { joinCode, setJoinCode, joinRoom };
}
