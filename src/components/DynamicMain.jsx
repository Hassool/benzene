'use client';

import { useTranslation } from '@/lib/TranslationProvider';

export default function DynamicMain({ children }) {
  const { isRTL, isLoading } = useTranslation();

  // Show a loading state while translations are loading
  if (isLoading) {
    return (
      <main className="md:ml-64 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={`${isRTL ? "md:mr-64" : "md:ml-64"} transition-all duration-300`}>
      {children}
    </main>
  );
}