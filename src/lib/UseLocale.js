import { useRouter } from 'next/router';

export function useLocale() {
  const router = useRouter();
  
  return {
    locale: router.locale,
    locales: router.locales,
    defaultLocale: router.defaultLocale,
    isRTL: router.locale === 'ar',
    changeLocale: (locale) => {
      router.push(router.pathname, router.asPath, { locale });
    },
  };
}