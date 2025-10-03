'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Translation Context
const TranslationContext = createContext();

// Translation Provider
export function TranslationProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations from API
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
      // Fallback to English if loading fails
      if (language !== 'en') {
        loadTranslations('en');
        return;
      }
      // If English also fails, set empty translations
      setTranslations({});
    } finally {
      setIsLoading(false);
    }
  };

  // Change language
  const changeLanguage = (newLang) => {
    if (newLang === lang) return; // Don't reload if same language
    
    setLang(newLang);
    
    // Only access localStorage in the browser
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', newLang);
    }
    
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    loadTranslations(newLang);
  };

  // Initialize - only runs on client
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('lang') || 'en';
      setLang(storedLang);
      document.documentElement.lang = storedLang;
      document.documentElement.dir = storedLang === 'ar' ? 'rtl' : 'ltr';
      loadTranslations(storedLang);
    } else {
      // Server-side: just load English
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

// Translation Hook
export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }

  const { translations, isLoading, ...rest } = context;

  // Translation function with nested key support
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