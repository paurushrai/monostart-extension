import { useCallback, useEffect, useRef, useState } from 'react';
import { getStoredValue, setStoredValue } from '../lib/storage';
import {
  RATE_PROMPT_KEY,
  RATE_URL,
  defaultRatePromptState,
  shouldShowRatePrompt,
  snooze,
  type RatePromptState,
} from '../lib/ratePrompt';

interface UseRatePrompt {
  visible: boolean;
  rate: () => void;
  later: () => void;
  dismiss: () => void;
}

export function useRatePrompt(): UseRatePrompt {
  const stateRef = useRef<RatePromptState | null>(null);
  const [visible, setVisible] = useState(false);
  const bumpedRef = useRef(false);

  useEffect(() => {
    if (bumpedRef.current) return;
    bumpedRef.current = true;
    let cancelled = false;
    getStoredValue<RatePromptState | null>(RATE_PROMPT_KEY, null).then((stored) => {
      if (cancelled) return;
      const initial = stored ?? defaultRatePromptState(Date.now());
      const next: RatePromptState = { ...initial, openCount: initial.openCount + 1 };
      stateRef.current = next;
      setVisible(shouldShowRatePrompt(next, Date.now()));
      void setStoredValue(RATE_PROMPT_KEY, next);
    });
    return () => { cancelled = true; };
  }, []);

  const persist = useCallback((next: RatePromptState): void => {
    stateRef.current = next;
    setVisible(shouldShowRatePrompt(next, Date.now()));
    void setStoredValue(RATE_PROMPT_KEY, next);
  }, []);

  const rate = useCallback((): void => {
    window.open(RATE_URL, '_blank', 'noopener,noreferrer');
    const s = stateRef.current;
    if (s) persist({ ...s, status: 'rated' });
  }, [persist]);

  const later = useCallback((): void => {
    const s = stateRef.current;
    if (s) persist(snooze(s, Date.now()));
  }, [persist]);

  const dismiss = useCallback((): void => {
    const s = stateRef.current;
    if (s) persist({ ...s, status: 'dismissed' });
  }, [persist]);

  return { visible, rate, later, dismiss };
}
