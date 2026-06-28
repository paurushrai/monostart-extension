import i18n from './config';

// Eagerly-globbed locale modules; Vite emits one lazy chunk per file.
const localeLoaders = import.meta.glob<{ default: Record<string, unknown> }>('./locales/*.json');

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
