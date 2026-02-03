"use client";

import { useTranslation } from "l_i18n";


export default function LangSwitcher() {
  const { language, setLanguage, loading } = useTranslation()

  const toggleLang = () => {
    if (loading) return; // Prevent switching while loading
    // Cycle: en -> fr -> ar -> en
    let newLang = "en";
    if (language === "en") newLang = "fr";
    else if (language === "fr") newLang = "ar";
    else if (language === "ar") newLang = "en";
    
    setLanguage(newLang);
  };

  const getLabel = () => {
    switch(language) {
      case 'en': return 'EN';
      case 'fr': return 'FR';
      case 'ar': return 'ع';
      default: return 'EN';
    }
  }

  return (
    <button
      onClick={toggleLang}
      disabled={loading}
      className={`relative flex items-center justify-center w-12 h-10 rounded-xl
                 border-2 border-special bg-special/10 dark:border-text dark:bg-text/10
                 overflow-hidden transition-colors duration-300
                 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-special/20"}`}
      aria-label={`Current language: ${language}`}
    >
      <span className="text-text dark:text-bg font-bold z-10">
        {getLabel()}
      </span>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/20 dark:bg-black/20 z-20">
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
}
