import { describe, it, expect } from 'vitest';
import { resolveInitialLanguage } from './detectLanguage';

const SUPPORTED = ['en', 'pt-BR', 'pt-PT', 'hi', 'zh-CN'] as const;

describe('resolveInitialLanguage', () => {
  it('should prefer a valid stored language', () => {
    expect(resolveInitialLanguage('hi', 'en-US', SUPPORTED)).toBe('hi');
  });
  it('should ignore an unsupported stored language and use the UI language', () => {
    expect(resolveInitialLanguage('xx', 'zh-CN', SUPPORTED)).toBe('zh-CN');
  });
  it('should exact-match the UI language when supported', () => {
    expect(resolveInitialLanguage(undefined, 'pt-BR', SUPPORTED)).toBe('pt-BR');
  });
  it('should fall back from region to base language', () => {
    expect(resolveInitialLanguage(undefined, 'hi-IN', SUPPORTED)).toBe('hi');
  });
  it('should fall back to en when nothing matches', () => {
    expect(resolveInitialLanguage(undefined, 'ja', SUPPORTED)).toBe('en');
  });
  it('should fall back to en for empty input', () => {
    expect(resolveInitialLanguage(undefined, '', SUPPORTED)).toBe('en');
  });
});
