import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LANGUAGE_STORAGE_KEY, readMirroredLanguage } from './useLanguage';

// Provide a minimal localStorage mock since vitest runs in node environment.
const store: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => { delete store[k]; }); },
  get length() { return Object.keys(store).length; },
  key: (index: number) => Object.keys(store)[index] ?? null,
};
vi.stubGlobal('localStorage', localStorageMock);

describe('language localStorage mirror', () => {
  beforeEach(() => localStorage.clear());

  it('should expose a stable storage key', () => {
    expect(LANGUAGE_STORAGE_KEY).toBe('monostart-language');
  });
  it('should read undefined when nothing is mirrored', () => {
    expect(readMirroredLanguage()).toBeUndefined();
  });
  it('should read back a mirrored value', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'hi');
    expect(readMirroredLanguage()).toBe('hi');
  });
});
