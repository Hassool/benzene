/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'ar'], // Add your supported languages
    defaultLocale: 'en',
  },
  images: {
    domains: ["picsum.photos"], // allow this host
  }
};

export default nextConfig;
