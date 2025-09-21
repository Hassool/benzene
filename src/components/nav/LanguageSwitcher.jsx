"use client";

import { useTranslation } from '@/lib/TranslationProvider'

export default function LangSwitcher() {
  const { lang, changeLanguage, isLoading } = useTranslation();

  const toggleLang = () => {
    if (isLoading) return; // Prevent switching while loading
    const newLang = lang === "en" ? "ar" : "en";
    changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLang}
      disabled={isLoading}
      className={`relative flex items-center justify-between w-20 h-10 rounded-xl
                 border-2 border-special bg-special/10 dark:border-text dark:bg-text/10
                 overflow-hidden transition-colors duration-300
                 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-special/20'}`}
      aria-label={`Switch to ${lang === "en" ? "Arabic" : "English"}`}
    >
      {/* Highlight slider */}
      <div
        className={`absolute top-0 h-full w-1/2 rounded-lg bg-special dark:bg-text 
                    transition-all duration-300 left-0`}
      />

      {/* Labels on top */}
      <div className="relative z-10 flex justify-between items-center w-full px-3 text-sm font-semibold">
        <span className="text-text dark:text-bg">EN</span>
        <span className="text-text dark:text-bg">ع</span>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/20 dark:bg-black/20">
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
}