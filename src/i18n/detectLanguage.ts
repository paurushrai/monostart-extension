const FALLBACK = 'en';

/**
 * Resolve the startup language: a valid stored choice wins; otherwise the browser
 * UI language by exact match, then by base language (pt-BR -> pt); else English.
 */
export function resolveInitialLanguage(
  stored: string | undefined,
  uiLanguage: string,
  supported: readonly string[],
): string {
  if (stored && supported.includes(stored)) return stored;
  if (uiLanguage && supported.includes(uiLanguage)) return uiLanguage;
  const base = uiLanguage.split('-')[0];
  if (base && supported.includes(base)) return base;
  const regionOf = supported.find((c) => c.split('-')[0] === base);
  return regionOf ?? FALLBACK;
}
