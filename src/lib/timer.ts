import type { TimerEntry } from '../types';

/**
 * Pure timer math, extracted so the countdown logic is unit-testable and the
 * widget can drive every timer from a single ticker (one interval per widget
 * instead of one per running timer).
 */

/** Milliseconds left on a timer at instant `now`. Paused timers report their stored remainder. */
export const computeRemainingMs = (timer: TimerEntry, now: number): number => {
  if (!timer.isRunning || timer.endTime == null) return timer.remainingMs;
  return Math.max(0, timer.endTime - now);
};

/** IDs of timers that are running and have reached or passed their end time at `now`. */
export const selectExpiredTimerIds = (timers: readonly TimerEntry[], now: number): number[] =>
  timers
    .filter((t) => t.isRunning && t.endTime != null && t.endTime <= now)
    .map((t) => t.id);

/** Whether any timer is currently counting down (gates the ticker interval). */
export const anyTimerRunning = (timers: readonly TimerEntry[]): boolean =>
  timers.some((t) => t.isRunning);
