import { describe, it, expect } from 'vitest';
import { buildShareUrl, SHARE_URL, SHARE_TEXT, type ShareChannel } from './share';

const opts = { url: SHARE_URL, text: SHARE_TEXT };
const encodedUrl = encodeURIComponent(SHARE_URL);
const encodedText = encodeURIComponent(SHARE_TEXT);
const textSpaceUrl = `${SHARE_TEXT} ${SHARE_URL}`;
const encodedTextUrl = encodeURIComponent(textSpaceUrl);

describe('buildShareUrl', () => {
  it('should build an X intent url when channel is x', () => {
    expect(buildShareUrl('x', opts)).toBe(
      `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    );
  });

  it('should build a LinkedIn share url when channel is linkedin', () => {
    expect(buildShareUrl('linkedin', opts)).toBe(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    );
  });

  it('should build a Reddit submit url with title and url when channel is reddit', () => {
    expect(buildShareUrl('reddit', opts)).toBe(
      `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
    );
  });

  it('should build a WhatsApp url embedding text and url when channel is whatsapp', () => {
    expect(buildShareUrl('whatsapp', opts)).toBe(
      `https://wa.me/?text=${encodedTextUrl}`,
    );
  });

  it('should build a Telegram share url with url and text when channel is telegram', () => {
    expect(buildShareUrl('telegram', opts)).toBe(
      `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    );
  });

  it('should build a Facebook sharer url when channel is facebook', () => {
    expect(buildShareUrl('facebook', opts)).toBe(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    );
  });

  it('should build a mailto url with subject and body when channel is email', () => {
    expect(buildShareUrl('email', opts)).toBe(
      `mailto:?subject=${encodedText}&body=${encodedTextUrl}`,
    );
  });

  it('should url-encode text and url params containing spaces and special chars', () => {
    const tricky = { url: 'https://e.x/?a=1&b=2', text: 'hi there & more=stuff' };
    const out = buildShareUrl('x', tricky);
    expect(out).toContain(encodeURIComponent(tricky.text));
    expect(out).toContain(encodeURIComponent(tricky.url));
    expect(out).not.toContain('hi there');
  });

  it('should produce a parseable URL for every social channel', () => {
    const socials: ShareChannel[] = ['x', 'linkedin', 'reddit', 'whatsapp', 'telegram', 'facebook'];
    for (const c of socials) {
      expect(() => new URL(buildShareUrl(c, opts))).not.toThrow();
    }
  });
});
