/**
 * Share helpers for recommending the MonoStart extension.
 *
 * `buildShareUrl` is a pure function (no DOM) so it can be unit-tested and the
 * modal stays a thin view. If the store listing ever moves, only SHARE_URL changes.
 */

/** Public Chrome Web Store listing for MonoStart. */
export const SHARE_URL =
  'https://chromewebstore.google.com/detail/hhfeihcppmfepeeainafmaifpmdemmlg';

/** Default copy prefilled into social posts / emails (URL is appended separately). */
export const SHARE_TEXT =
  'MonoStart — a clean, private new-tab dashboard for Chrome. Check it out:';

export type ShareChannel =
  | 'x'
  | 'linkedin'
  | 'reddit'
  | 'whatsapp'
  | 'telegram'
  | 'facebook'
  | 'email';

interface ShareOpts {
  url: string;
  text: string;
}

const enc = encodeURIComponent;

/** Builds the share-intent URL for a given channel. All params are URL-encoded. */
export function buildShareUrl(channel: ShareChannel, { url, text }: ShareOpts): string {
  const textWithUrl = enc(`${text} ${url}`);
  switch (channel) {
    case 'x':
      return `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;
    case 'reddit':
      return `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(text)}`;
    case 'whatsapp':
      return `https://wa.me/?text=${textWithUrl}`;
    case 'telegram':
      return `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
    case 'email':
      return `mailto:?subject=${enc(text)}&body=${textWithUrl}`;
  }
}
