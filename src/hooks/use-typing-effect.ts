'use client';

import { useEffect, useState } from 'react';

/**
 * Type out `text` one character at a time when `active` is true.
 * Returns `{ typed, isDone }`.
 */
export function useTypingEffect(text: string, active: boolean, intervalMs = 20) {
  const [typed, setTyped] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setTyped('');
      setIsDone(false);
      return;
    }

    setTyped('');
    setIsDone(false);
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setTyped(text.slice(0, index));
      if (index >= text.length) {
        setIsDone(true);
        clearInterval(timer);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [text, active, intervalMs]);

  return { typed, isDone };
}
