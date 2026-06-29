import { describe, it, expect } from 'vitest';
import { buildFeedbackUrl } from './feedbackUrl';

const BASE = 'https://docs.google.com/forms/d/e/ABC/viewform';

describe('buildFeedbackUrl', () => {
  it('should append usp=pp_url and both prefill fields', () => {
    expect(buildFeedbackUrl(BASE, 'entry.111', 'entry.222', '1.2.1', 'en-US')).toBe(
      `${BASE}?usp=pp_url&entry.111=1.2.1&entry.222=en-US`,
    );
  });

  it('should url-encode version and locale values', () => {
    const out = buildFeedbackUrl(BASE, 'entry.1', 'entry.2', '1.0 beta', 'pt-BR&x');
    expect(out).toContain('entry.1=1.0%20beta');
    expect(out).toContain(`entry.2=${encodeURIComponent('pt-BR&x')}`);
  });

  it('should produce a parseable URL', () => {
    expect(() => new URL(buildFeedbackUrl(BASE, 'entry.1', 'entry.2', '1.2.1', 'de'))).not.toThrow();
  });
});
