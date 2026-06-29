import i18n from './config';

// Lazily-globbed locale modules; Vite emits one chunk per file. en.json is
// excluded because it is statically bundled as the fallback in config.ts —
// globbing it too triggers Vite's INEFFECTIVE_DYNAMIC_IMPORT warning.
const localeLoaders = import.meta.glob<{ default: Record<string, unknown> }>([
  './locales/*.json',
  '!./locales/en.json',
]);

const loaded = new Set<string>(['en']);

/** Load and register a locale's resources. No-op for en/already-loaded; silent on failure. */
export async function loadLocale(code: string): Promise<void> {
  if (loaded.has(code)) return;
  const loader = localeLoaders[`./locales/${code}.json`];
  if (!loader) return;
  try {
    const mod = await loader();
    i18n.addResourceBundle(code, 'translation', mod.default, true, true);
    loaded.add(code);
  } catch {
    // Keep the English fallback if a locale chunk fails to load.
  }
}
