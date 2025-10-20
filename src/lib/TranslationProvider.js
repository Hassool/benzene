'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const TranslationContext = createContext();

export function TranslationProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const loadTranslations = async (language) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/translations?lang=${language}`);
      if (!response.ok) {
        throw new Error('Failed to fetch translations');
      }
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error('Failed to load translations:', error);
      if (language !== 'en') {
        loadTranslations('en');
        return;
      }
      setTranslations({});
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = (newLang) => {
    if (newLang === lang) return; 
    
    setLang(newLang);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', newLang);
    }
    
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    loadTranslations(newLang);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('lang') || 'en';
      setLang(storedLang);
      document.documentElement.lang = storedLang;
      document.documentElement.dir = storedLang === 'ar' ? 'rtl' : 'ltr';
      loadTranslations(storedLang);
    } else {
      loadTranslations('en');
    }
  }, []);

  const value = {
    lang,
    translations,
    isLoading,
    changeLanguage,
    isRTL: lang === 'ar'
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }

  const { translations, isLoading, ...rest } = context;

  const t = (key, defaultValue = key) => {
    if (isLoading) return defaultValue;
    
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return typeof value === 'string' ? value : defaultValue;
  };

  return { t, isLoading, ...rest };
}