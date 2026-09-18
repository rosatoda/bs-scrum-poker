'use client';

import { useCallback, useEffect, useState } from 'react';
import { getRememberedName, rememberName } from '@/shared/lib/rememberedName';

/** Name-entry state for the room join gate: remembers the last-used name and confirms it. */
export function useJoinTable() {
  const [name, setName] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState('');

  useEffect(() => {
    const saved = getRememberedName();
    if (saved) setName(saved);
    setNameDraft(saved ?? '');
  }, []);

  const submitName = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = nameDraft.trim();
      if (!trimmed) return;
      rememberName(trimmed);
      setName(trimmed);
    },
    [nameDraft],
  );

  return { name, nameDraft, setNameDraft, submitName };
}
