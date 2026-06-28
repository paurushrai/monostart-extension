import { describe, it, expect } from 'vitest';
import { computeRemainingMs, selectExpiredTimerIds, anyTimerRunning } from './timer';
import type { TimerEntry } from '../types';

const make = (over: Partial<TimerEntry>): TimerEntry => ({
  id: 1,
  label: 't',
  durationMs: 60_000,
  remainingMs: 60_000,
  isRunning: false,
  endTime: null,
  ...over,
});

describe('computeRemainingMs', () => {
  it('should return stored remainder when paused', () => {
    expect(computeRemainingMs(make({ isRunning: false, remainingMs: 42_000 }), 1_000)).toBe(42_000);
  });

  it('should return endTime minus now when running', () => {
    expect(computeRemainingMs(make({ isRunning: true, endTime: 5_000 }), 2_000)).toBe(3_000);
  });

  it('should clamp to zero when running past end time', () => {
    expect(computeRemainingMs(make({ isRunning: true, endTime: 5_000 }), 9_000)).toBe(0);
  });

  it('should fall back to remainder when running but endTime is null', () => {
    expect(computeRemainingMs(make({ isRunning: true, endTime: null, remainingMs: 7_000 }), 1_000)).toBe(7_000);
  });
});

describe('selectExpiredTimerIds', () => {
  it('should return ids of running timers at or past their end time', () => {
    const timers = [
      make({ id: 1, isRunning: true, endTime: 1_000 }),
      make({ id: 2, isRunning: true, endTime: 5_000 }),
      make({ id: 3, isRunning: false, endTime: 1_000 }),
    ];
    expect(selectExpiredTimerIds(timers, 2_000)).toEqual([1]);
  });

  it('should treat exact end time as expired', () => {
    expect(selectExpiredTimerIds([make({ id: 9, isRunning: true, endTime: 3_000 })], 3_000)).toEqual([9]);
  });

  it('should ignore running timers with no end time', () => {
    expect(selectExpiredTimerIds([make({ isRunning: true, endTime: null })], 9_999)).toEqual([]);
  });

  it('should return empty when nothing is running', () => {
    expect(selectExpiredTimerIds([make({ isRunning: false, endTime: 1 })], 9_999)).toEqual([]);
  });
});

describe('anyTimerRunning', () => {
  it('should be true when at least one timer runs', () => {
    expect(anyTimerRunning([make({ isRunning: false }), make({ id: 2, isRunning: true })])).toBe(true);
  });

  it('should be false when none run', () => {
    expect(anyTimerRunning([make({ isRunning: false })])).toBe(false);
    expect(anyTimerRunning([])).toBe(false);
  });
});
