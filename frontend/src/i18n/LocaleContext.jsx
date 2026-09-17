import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, STRINGS } from './strings.js';

const LOCALE_STORAGE_KEY = 'diagramcode.locale';
const LocaleContext = createContext(null);

function readStoredLocale() {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored === 'ru' || stored === 'en' ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function writeStoredLocale(locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {}
}

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => readStoredLocale());

  const toggleLocale = useCallback(() => {
    setLocale((current) => {
      const next = current === 'ru' ? 'en' : 'ru';
      writeStoredLocale(next);
      return next;
    });
  }, []);

  const t = useCallback((key) => STRINGS[locale][key] ?? key, [locale]);

  const value = useMemo(() => ({ locale, toggleLocale, t }), [locale, toggleLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale должен вызываться внутри LocaleProvider');
  }
  return ctx;
}
