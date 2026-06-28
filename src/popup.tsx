import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './i18n/config';
import i18n from './i18n/config';
import { loadLocale } from './i18n/loadLocale';
import { SUPPORTED_CODES } from './i18n/languages';
import { resolveInitialLanguage } from './i18n/detectLanguage';
import { readMirroredLanguage } from './hooks/useLanguage';
import PopupApp from './popup/PopupApp'

async function bootstrap(): Promise<void> {
  const uiLanguage = typeof chrome !== 'undefined' && chrome.i18n
    ? chrome.i18n.getUILanguage()
    : navigator.language;
  const lang = resolveInitialLanguage(readMirroredLanguage(), uiLanguage, SUPPORTED_CODES);
  await loadLocale(lang);
  await i18n.changeLanguage(lang);
  document.documentElement.lang = lang;

  const rootEl = document.getElementById('root')
  if (!rootEl) throw new Error('Root element #root not found')

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <PopupApp />
    </React.StrictMode>,
  )
}

void bootstrap();
