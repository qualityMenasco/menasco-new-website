import { useEffect } from 'react';

/** Locks background scroll while `locked` is true — used by the mobile menu overlay. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}
