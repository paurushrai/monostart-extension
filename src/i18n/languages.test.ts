import { describe, it, expect } from 'vitest';
import { SUPPORTED_LANGUAGES, SUPPORTED_CODES } from './languages';

describe('SUPPORTED_LANGUAGES', () => {
  it('should include English and a representative spread of locales', () => {
    expect(SUPPORTED_CODES).toContain('en');
    expect(SUPPORTED_CODES).toContain('hi');
    expect(SUPPORTED_CODES).toContain('zh-CN');
    expect(SUPPORTED_CODES).toContain('ar');
  });
  it('should have a non-empty native name for every entry', () => {
    for (const l of SUPPORTED_LANGUAGES) {
      expect(l.code.length).toBeGreaterThan(0);
      expect(l.name.trim().length).toBeGreaterThan(0);
    }
  });
  it('should have unique codes', () => {
    expect(new Set(SUPPORTED_CODES).size).toBe(SUPPORTED_CODES.length);
  });
});
