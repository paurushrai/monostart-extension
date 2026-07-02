// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { sanitizeEmbed, extractEmbedSrc, rewriteToEmbedUrl, isEmbedCode } from '../embedSanitizer';

const YOUTUBE_EMBED =
  '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" ' +
  'title="YouTube video player" frameborder="0" ' +
  'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
  'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';

const SPOTIFY_EMBED =
  '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT" ' +
  'width="100%" height="352" frameBorder="0" allowfullscreen="" ' +
  'allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';

describe('sanitizeEmbed', () => {
  it('should_preserve_provider_iframe_src_and_allow_attributes_when_given_real_embed_codes', () => {
    for (const embed of [YOUTUBE_EMBED, SPOTIFY_EMBED]) {
      const out = sanitizeEmbed(embed);
      expect(out).toContain('<iframe');
      expect(extractEmbedSrc(out)).toBe(extractEmbedSrc(embed));
      expect(out).toContain('allow=');
      expect(out).toContain('allowfullscreen');
    }
  });

  it('should_strip_srcdoc_when_embed_supplies_one', () => {
    const out = sanitizeEmbed(
      '<iframe srcdoc="&lt;script&gt;chrome.storage.local.get(null)&lt;/script&gt;" src="https://example.com"></iframe>',
    );
    expect(out).not.toContain('srcdoc');
    expect(out).toContain('src="https://example.com"');
  });

  it('should_strip_script_tags_and_event_handlers_when_present', () => {
    const out = sanitizeEmbed(
      '<iframe src="https://example.com" onload="alert(1)"></iframe><script>alert(2)</script>',
    );
    expect(out).not.toContain('onload');
    expect(out).not.toContain('<script');
  });

  it('should_strip_javascript_urls_when_used_as_iframe_src', () => {
    const out = sanitizeEmbed('<iframe src="javascript:alert(1)"></iframe>');
    expect(out).not.toContain('javascript:');
  });

  it('should_force_the_fixed_sandbox_when_iframe_has_none', () => {
    const out = sanitizeEmbed(YOUTUBE_EMBED);
    expect(out).toMatch(/sandbox="[^"]*allow-scripts[^"]*"/);
    expect(out).toMatch(/sandbox="[^"]*allow-same-origin[^"]*"/);
    expect(out).not.toContain('allow-top-navigation');
  });

  it('should_overwrite_an_attacker_supplied_sandbox_when_it_grants_top_navigation', () => {
    const out = sanitizeEmbed(
      '<iframe src="https://evil.example" sandbox="allow-top-navigation allow-scripts"></iframe>',
    );
    expect(out).not.toContain('allow-top-navigation');
    expect(out).toMatch(/sandbox="[^"]*allow-scripts[^"]*"/);
  });

  it('should_return_empty_string_when_input_is_null_or_empty', () => {
    expect(sanitizeEmbed(null)).toBe('');
    expect(sanitizeEmbed('')).toBe('');
    expect(sanitizeEmbed(undefined)).toBe('');
  });
});

describe('extractEmbedSrc', () => {
  it('should_return_iframe_src_when_present', () => {
    expect(extractEmbedSrc(YOUTUBE_EMBED)).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('should_return_empty_string_when_no_iframe', () => {
    expect(extractEmbedSrc('<div>nope</div>')).toBe('');
  });
});

describe('rewriteToEmbedUrl', () => {
  it('should_rewrite_watch_urls_to_embed_urls_when_given_youtube_links', () => {
    expect(rewriteToEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    );
  });

  it('should_pass_through_unknown_urls_when_no_provider_matches', () => {
    expect(rewriteToEmbedUrl('https://example.com/page')).toBe('https://example.com/page');
  });
});

describe('isEmbedCode', () => {
  it('should_detect_html_when_input_starts_with_a_tag', () => {
    expect(isEmbedCode('  <iframe src="x">')).toBe(true);
    expect(isEmbedCode('https://youtube.com/watch?v=x')).toBe(false);
  });
});
