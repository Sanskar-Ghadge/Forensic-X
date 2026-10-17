import { useEffect } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

interface ShortcutMap {
  [keyCombo: string]: KeyHandler;
}

/**
 * useHotkeys - Global keyboard shortcut listener.
 * Handles Cmd/Ctrl+K, I (inspector), M (motion), etc.
 */
export function useHotkeys(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        if (e.key !== 'Escape') {
          return;
        }
      }

      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      for (const [combo, handler] of Object.entries(shortcuts)) {
        const parts = combo.toLowerCase().split('+');
        const key = parts[parts.length - 1];
        const needsMod = parts.includes('mod') || parts.includes('ctrl') || parts.includes('cmd');
        const needsShift = parts.includes('shift');
        const needsAlt = parts.includes('alt');

        const modMatches = needsMod ? modifier : !modifier;
        const shiftMatches = needsShift ? e.shiftKey : !e.shiftKey;
        const altMatches = needsAlt ? e.altKey : !e.altKey;
        const keyMatches = e.key.toLowerCase() === key;

        if (modMatches && shiftMatches && altMatches && keyMatches) {
          e.preventDefault();
          handler(e);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
