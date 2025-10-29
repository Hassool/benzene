"use client";

import { useTranslation } from "react-lite-translation";


export default function LangSwitcher() {
  const { language, setLanguage, loading } = useTranslation()

  const toggleLang = () => {
    if (loading) return; // Prevent switching while loading
    const newLang = language === "en" ? "ar" : "en";
    setLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLang}
      disabled={loading}
      className={`relative flex items-center justify-between w-20 h-10 rounded-xl
                 border-2 border-special bg-special/10 dark:border-text dark:bg-text/10
                 overflow-hidden transition-colors duration-300
                 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-special/20"}`}
      aria-label={`Switch to ${language === "en" ? "Arabic" : "English"}`}
    >
      {/* Highlight slider */}
      <div
        className={`absolute top-0 h-full w-1/2 rounded-lg bg-special dark:bg-text 
                    transition-all duration-300 
                    ${language === "ar" ? "left-1/2" : "left-0"}`}
      />

      {/* Labels on top */}
      <div className="relative z-10 flex justify-between items-center w-full px-3 text-sm font-semibold">
        <span className="text-text dark:text-bg">EN</span>
        <span className="text-text dark:text-bg">ع</span>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/20 dark:bg-black/20">
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
}
