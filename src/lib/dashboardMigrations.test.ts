import { describe, it, expect } from 'vitest';
import {
  migrateGoogleSearchHeight,
  migrateLegacySectionType,
  dedupeById,
  normalize,
} from './dashboardMigrations';
import type { WidgetItem } from '../types';

const item = (over: { id: string; type: string } & Record<string, unknown>): WidgetItem =>
  ({ title: '', url: '', ...over } as unknown as WidgetItem);

describe('migrateGoogleSearchHeight', () => {
  it('should clamp an oversized google-search row to height 1', () => {
    const out = migrateGoogleSearchHeight([item({ id: 'g', type: 'google-search', h: 4 })]);
    expect(out[0]?.h).toBe(1);
  });

  it('should leave a height-1 google-search untouched', () => {
    const input = [item({ id: 'g', type: 'google-search', h: 1 })];
    expect(migrateGoogleSearchHeight(input)[0]?.h).toBe(1);
  });

  it('should not touch other widget types with large heights', () => {
    const out = migrateGoogleSearchHeight([item({ id: 'n', type: 'note', h: 5 })]);
    expect(out[0]?.h).toBe(5);
  });
});

describe('migrateLegacySectionType', () => {
  it('should rename legacy section type to group', () => {
    const out = migrateLegacySectionType([item({ id: 's', type: 'section' })]);
    expect(out[0]?.type).toBe('group');
  });

  it('should leave current types unchanged', () => {
    const out = migrateLegacySectionType([item({ id: 'l', type: 'link' })]);
    expect(out[0]?.type).toBe('link');
  });
});

describe('dedupeById', () => {
  it('should keep the first occurrence of a duplicated id', () => {
    const out = dedupeById([
      item({ id: 'a', type: 'link', title: 'first' }),
      item({ id: 'a', type: 'link', title: 'second' }),
      item({ id: 'b', type: 'link' }),
    ]);
    expect(out).toHaveLength(2);
    expect((out[0] as { title: string }).title).toBe('first');
    expect(out[1]?.id).toBe('b');
  });

  it('should return an empty array unchanged', () => {
    expect(dedupeById([])).toEqual([]);
  });
});

describe('normalize', () => {
  it('should apply both migrations and dedupe in one pass', () => {
    const out = normalize([
      item({ id: 's', type: 'section' }),
      item({ id: 'g', type: 'google-search', h: 3 }),
      item({ id: 'g', type: 'google-search', h: 3 }),
    ]);
    expect(out).toHaveLength(2);
    expect(out[0]?.type).toBe('group');
    expect(out[1]?.h).toBe(1);
  });
});
