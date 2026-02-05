'use client';

import { useTranslation } from 'l_i18n';
import Loading from '@/components/ui/Loading';

export default function DynamicMain({ children }) {
  const { isRTL, isLoading } = useTranslation();

  // Show a loading state while translations are loading
  if (isLoading) {
    return (
      <main className="md:ml-64 flex items-center justify-center min-h-screen">
        <Loading />
      </main>
    );
  }

  return (
    <main className={`${isRTL ? "md:mr-64" : "md:ml-64"} transition-all duration-300`}>
      {children}
    </main>
  );
}