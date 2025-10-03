// src/app/cookie-policy/page.jsx
"use client";

import { useTranslation } from "@/lib/TranslationProvider";

export default function CookiePolicyPage() {
  const { lang, changeLanguage, t } = useTranslation();

  return (
    <div className="min-h-screen bg-bg text-text dark:bg-bg-dark dark:text-text-dark font-inter px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Language toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => changeLanguage(lang === "en" ? "ar" : "en")}
            className="px-4 py-2 rounded-xl bg-special text-white hover:bg-special-hover transition"
          >
            {lang === "en" ? "العربية" : "English"}
          </button>
        </div>

        <div>
          <h1 className="text-3xl font-montserrat font-bold mb-4">
            {t("cookies.title", lang === "en" ? "Cookie Policy" : "سياسة الكوكيز")}
          </h1>
          <p className="mb-4">
            {t("cookies.lastUpdated", lang === "en" ? "Last Updated: [Insert Date]" : "آخر تحديث: [ضع التاريخ]")}
          </p>

          {/* Intro */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("cookies.introTitle", lang === "en" ? "Introduction" : "المقدمة")}
          </h2>
          <p className="mb-4">
            {t(
              "cookies.introText",
              lang === "en"
                ? "This Cookie Policy explains how Benzene uses cookies and similar technologies when you use our platform."
                : "توضح سياسة الكوكيز كيف تستخدم منصة بنزين الكوكيز والتقنيات المشابهة عند استخدامك للخدمة."
            )}
          </p>

          {/* What are cookies */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("cookies.whatTitle", lang === "en" ? "What Are Cookies?" : "ما هي الكوكيز؟")}
          </h2>
          <p className="mb-4">
            {t(
              "cookies.whatText",
              lang === "en"
                ? "Cookies are small text files stored on your device when you visit websites. They help remember your preferences, improve functionality, and enhance security."
                : "الكوكيز هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة المواقع. تساعد على تذكر تفضيلاتك، تحسين الأداء، وتعزيز الأمان."
            )}
          </p>

          {/* Usage */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("cookies.useTitle", lang === "en" ? "How We Use Cookies" : "كيف نستخدم الكوكيز")}
          </h2>
          <ul className="list-disc pl-6 pr-6 space-y-2">
            <li>
              {t(
                "cookies.use1",
                lang === "en"
                  ? "Essential cookies: used for login sessions and basic security."
                  : "كوكيز أساسية: تُستخدم لجلسات تسجيل الدخول وللأمان الأساسي."
              )}
            </li>
            <li>
              {t(
                "cookies.use2",
                lang === "en"
                  ? "Functional cookies: may remember your language preference."
                  : "كوكيز وظيفية: قد تحفظ تفضيل اللغة."
              )}
            </li>
            <li>
              {t(
                "cookies.use3",
                lang === "en"
                  ? "No advertising cookies: we do not use tracking or ad cookies."
                  : "لا كوكيز إعلانية: لا نستخدم كوكيز للتتبع أو للإعلانات."
              )}
            </li>
          </ul>

          {/* Third-Party */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("cookies.thirdTitle", lang === "en" ? "Third-Party Services" : "خدمات الطرف الثالث")}
          </h2>
          <p className="mb-4">
            {t(
              "cookies.thirdText",
              lang === "en"
                ? "Some third-party services (like Cloudinary) may set their own cookies. If we add analytics (like Google Analytics) in the future, cookies may be used to track usage, and this policy will be updated."
                : "قد تقوم بعض خدمات الطرف الثالث (مثل Cloudinary) بتعيين كوكيز خاصة بها. إذا أضفنا أدوات إحصائية (مثل Google Analytics) في المستقبل، فقد يتم استخدام الكوكيز لتتبع الاستخدام، وسيتم تحديث هذه السياسة."
            )}
          </p>

          {/* Managing cookies */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("cookies.manageTitle", lang === "en" ? "Managing Cookies" : "إدارة الكوكيز")}
          </h2>
          <p className="mb-4">
            {t(
              "cookies.manageText",
              lang === "en"
                ? "You can disable cookies in your browser settings, but this may affect functionality (e.g., staying logged in as a teacher)."
                : "يمكنك تعطيل الكوكيز من إعدادات متصفحك، ولكن هذا قد يؤثر على بعض الوظائف (مثل البقاء مسجلاً كمعلم)."
            )}
          </p>

          {/* Changes */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("cookies.changesTitle", lang === "en" ? "Changes to Policy" : "تغييرات على السياسة")}
          </h2>
          <p className="mb-4">
            {t(
              "cookies.changesText",
              lang === "en"
                ? "This Cookie Policy may be updated as Benzene grows."
                : "قد يتم تحديث سياسة الكوكيز مع تطور منصة بنزين."
            )}
          </p>

          {/* Contact */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("cookies.contactTitle", lang === "en" ? "Contact" : "التواصل")}
          </h2>
          <p className="mb-4">
            {t(
              "cookies.contactText",
              lang === "en"
                ? "For questions, contact:"
                : "للاستفسارات، راسلنا عبر:"
            )}{" "}
            <a href="mailto:me@hassool.com" className="text-special hover:underline">
              me@hassool.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
