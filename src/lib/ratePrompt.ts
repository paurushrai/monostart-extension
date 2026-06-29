export const RATE_PROMPT_KEY = 'monostart-rate-prompt';
export const RATE_URL =
  'https://chromewebstore.google.com/detail/hhfeihcppmfepeeainafmaifpmdemmlg/reviews';

const DAY_MS = 86_400_000;
const MIN_DAYS = 5;
const MIN_OPENS = 10;
const SNOOZE_DAYS = 3;
const SNOOZE_OPENS = 10;

export interface RatePromptState {
  firstSeenAt: number;
  openCount: number;
  status: 'pending' | 'snoozed' | 'rated' | 'dismissed';
  snoozeUntilOpenCount: number;
  snoozeUntilAt: number;
}

export const defaultRatePromptState = (now: number): RatePromptState => ({
  firstSeenAt: now,
  openCount: 0,
  status: 'pending',
  snoozeUntilOpenCount: 0,
  snoozeUntilAt: 0,
});

/** Whether the prompt is eligible to show at instant `now`. */
export const shouldShowRatePrompt = (state: RatePromptState, now: number): boolean => {
  if (state.status === 'rated' || state.status === 'dismissed') return false;
  if (now - state.firstSeenAt < MIN_DAYS * DAY_MS) return false;
  if (state.openCount < MIN_OPENS) return false;
  if (state.openCount < state.snoozeUntilOpenCount) return false;
  if (now < state.snoozeUntilAt) return false;
  return true;
};

/** Snooze: re-eligible only after both +SNOOZE_OPENS opens and +SNOOZE_DAYS days. */
export const snooze = (state: RatePromptState, now: number): RatePromptState => ({
  ...state,
  status: 'snoozed',
  snoozeUntilOpenCount: state.openCount + SNOOZE_OPENS,
  snoozeUntilAt: now + SNOOZE_DAYS * DAY_MS,
});
