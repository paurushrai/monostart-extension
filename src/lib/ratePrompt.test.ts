import { describe, it, expect } from 'vitest';
import {
  defaultRatePromptState,
  shouldShowRatePrompt,
  snooze,
  type RatePromptState,
} from './ratePrompt';

const DAY = 86_400_000;
const base = (over: Partial<RatePromptState> = {}): RatePromptState => ({
  ...defaultRatePromptState(0),
  ...over,
});

describe('shouldShowRatePrompt', () => {
  it('should be false before both thresholds are met', () => {
    expect(shouldShowRatePrompt(base({ openCount: 10 }), 1 * DAY)).toBe(false); // enough opens, too few days
    expect(shouldShowRatePrompt(base({ openCount: 3 }), 6 * DAY)).toBe(false);  // enough days, too few opens
  });

  it('should be true once both days and opens thresholds are met', () => {
    expect(shouldShowRatePrompt(base({ openCount: 10 }), 5 * DAY)).toBe(true);
  });

  it('should be false when rated or dismissed', () => {
    expect(shouldShowRatePrompt(base({ openCount: 99, status: 'rated' }), 99 * DAY)).toBe(false);
    expect(shouldShowRatePrompt(base({ openCount: 99, status: 'dismissed' }), 99 * DAY)).toBe(false);
  });

  it('should be hidden while snoozed and re-eligible after the snooze passes', () => {
    const snoozed = snooze(base({ openCount: 10 }), 5 * DAY);
    expect(shouldShowRatePrompt(snoozed, 5 * DAY)).toBe(false);
    // still snoozed: opens not yet past baseline even though time has
    expect(shouldShowRatePrompt(snoozed, 9 * DAY)).toBe(false);
    // past both snooze baselines (+3 days, +10 opens)
    expect(shouldShowRatePrompt({ ...snoozed, openCount: 20 }, 9 * DAY)).toBe(true);
  });
});

describe('snooze', () => {
  it('should set status and both snooze baselines', () => {
    const s = snooze(base({ openCount: 12 }), 5 * DAY);
    expect(s.status).toBe('snoozed');
    expect(s.snoozeUntilOpenCount).toBe(22);
    expect(s.snoozeUntilAt).toBe(5 * DAY + 3 * DAY);
  });
});
