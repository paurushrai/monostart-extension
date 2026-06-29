/**
 * Build a Google Forms prefilled-link URL for the post-uninstall feedback form.
 * Pure (no chrome.* / DOM) so it is unit-testable; the background worker injects
 * the live version and locale. `usp=pp_url` marks the link as a prefill link.
 * Field IDs (entry.<id>) are used as literal query keys; only values are encoded.
 */
export function buildFeedbackUrl(
  base: string,
  versionField: string,
  localeField: string,
  version: string,
  locale: string,
): string {
  return `${base}?usp=pp_url`
    + `&${versionField}=${encodeURIComponent(version)}`
    + `&${localeField}=${encodeURIComponent(locale)}`;
}
