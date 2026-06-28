import { useCallback, useSyncExternalStore } from 'react';
import i18n from '../i18n/config';
import { loadLocale } from '../i18n/loadLocale';
import { getSettings, saveSettings } from '../lib/storage';

export const LANGUAGE_STORAGE_KEY = 'monostart-language';

/** Synchronously read the mirrored language (used at startup, before React). */
export function readMirroredLanguage(): string | undefined {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function subscribe(cb: () => void): () => void {
  i18n.on('languageChanged', cb);
  return () => i18n.off('languageChanged', cb);
}

export function useLanguage(): { language: string; setLanguage: (code: string) => Promise<void> } {
  const language = useSyncExternalStore(subscribe, () => i18n.language, () => 'en');

  const setLanguage = useCallback(async (code: string): Promise<void> => {
    await loadLocale(code);
    await i18n.changeLanguage(code);
    document.documentElement.lang = code;
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, code); } catch { /* mirror best-effort */ }
    const settings = await getSettings();
    await saveSettings({ ...settings, language: code });
  }, []);

  return { language, setLanguage };
}
