import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Language = 'en' | 'es';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getBrowserLanguage(): Language {
  return navigator.languages?.some((language) => language.toLowerCase().startsWith('es')) ||
    navigator.language.toLowerCase().startsWith('es')
    ? 'es'
    : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const savedLanguage = localStorage.getItem('ja-pools-language');
      if (savedLanguage === 'en' || savedLanguage === 'es') return savedLanguage;
    } catch {
      // Fall back to the browser language if storage is unavailable.
    }
    return typeof navigator === 'undefined' ? 'en' : getBrowserLanguage();
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (nextLanguage: Language) => {
    try {
      localStorage.setItem('ja-pools-language', nextLanguage);
    } catch {
      // Keep the selected language for this session if storage is unavailable.
    }
    setLanguageState(nextLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
