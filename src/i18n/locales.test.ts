import { describe, it, expect } from 'vitest';
import en from './locales/en.json';
import { SUPPORTED_CODES } from './languages';

const localeModules = import.meta.glob<{ default: Record<string, unknown> }>('./locales/*.json', { eager: true });

function flatKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? flatKeys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );
}

const enKeys = new Set(flatKeys(en as Record<string, unknown>));

describe('locale completeness', () => {
  it('should have a JSON file for every supported code', () => {
    for (const code of SUPPORTED_CODES) {
      expect(localeModules[`./locales/${code}.json`], `missing locale: ${code}`).toBeDefined();
    }
  });

  for (const code of SUPPORTED_CODES) {
    it(`locale "${code}" should have exactly the en.json key set`, () => {
      const mod = localeModules[`./locales/${code}.json`];
      const keys = new Set(flatKeys((mod?.default ?? {}) as Record<string, unknown>));
      expect([...enKeys].filter((k) => !keys.has(k)), `missing keys in ${code}`).toEqual([]);
      expect([...keys].filter((k) => !enKeys.has(k)), `extra keys in ${code}`).toEqual([]);
    });
  }
});
