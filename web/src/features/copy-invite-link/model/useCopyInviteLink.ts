'use client';

import { useCallback, useState } from 'react';

const COPIED_TOAST_MS = 1800;

export function useCopyInviteLink() {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_TOAST_MS);
    } catch {
      // clipboard unavailable — the visible code still lets people join manually
    }
  }, []);

  return { copied, copyLink };
}
