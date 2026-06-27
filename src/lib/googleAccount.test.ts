import { describe, expect, it } from 'vitest';
import { normalizeGoogleAccountUrl } from './googleAccount';

describe('normalizeGoogleAccountUrl', () => {
  it('should pin mail to the default account when a /u/<n>/ segment selects another', () => {
    expect(normalizeGoogleAccountUrl('https://mail.google.com/mail/u/1/#inbox')).toBe(
      'https://mail.google.com/mail/u/0/#inbox',
    );
  });

  it('should rewrite a mid-path /u/<n>/ segment while keeping the trailing path', () => {
    expect(normalizeGoogleAccountUrl('https://drive.google.com/drive/u/2/home')).toBe(
      'https://drive.google.com/drive/u/0/home',
    );
  });

  it('should rewrite a trailing /u/<n>/ segment', () => {
    expect(normalizeGoogleAccountUrl('https://photos.google.com/u/1/')).toBe(
      'https://photos.google.com/u/0/',
    );
  });

  it('should rewrite the authuser query param to the default account', () => {
    expect(normalizeGoogleAccountUrl('https://www.youtube.com/?authuser=1')).toBe(
      'https://www.youtube.com/?authuser=0',
    );
  });

  it('should rewrite authuser while preserving other query params', () => {
    expect(
      normalizeGoogleAccountUrl('https://meet.google.com/landing?hs=197&authuser=3'),
    ).toBe('https://meet.google.com/landing?hs=197&authuser=0');
  });

  it('should leave a URL with no account selector untouched', () => {
    expect(normalizeGoogleAccountUrl('https://myaccount.google.com/')).toBe(
      'https://myaccount.google.com/',
    );
  });

  it('should leave a URL already on the default account untouched', () => {
    expect(normalizeGoogleAccountUrl('https://mail.google.com/mail/u/0/#inbox')).toBe(
      'https://mail.google.com/mail/u/0/#inbox',
    );
  });

  it('should not touch non-Google hosts even if they use /u/<n>/ or authuser', () => {
    expect(normalizeGoogleAccountUrl('https://example.com/u/1/page?authuser=1')).toBe(
      'https://example.com/u/1/page?authuser=1',
    );
  });

  it('should return malformed input unchanged', () => {
    expect(normalizeGoogleAccountUrl('not a url')).toBe('not a url');
  });
});
