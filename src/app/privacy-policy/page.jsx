// src/app/privacy-policy/page.jsx
"use client";

import { useTranslation } from "react-lite-translation";

export default function PrivacyPolicyPage() {
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
            {t("privacy.title", lang === "en" ? "Privacy Policy" : "سياسة الخصوصية")}
          </h1>
          <p className="mb-4">
            {t("privacy.lastUpdated", lang === "en" ? "Last Updated: [Insert Date]" : "آخر تحديث: [ضع التاريخ]")}
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("privacy.introTitle", lang === "en" ? "Introduction" : "المقدمة")}
          </h2>
          <p className="mb-4">
            {t(
              "privacy.introText",
              lang === "en"
                ? "Benzene is a charity-based educational platform that helps students access science lessons. This Privacy Policy explains how we collect, use, and protect your information."
                : "بنزين هو تطبيق خيري للتعليم يساعد الطلاب على الوصول إلى دروس العلوم. توضح سياسة الخصوصية هذه كيفية جمع معلوماتك واستخدامها وحمايتها."
            )}
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("privacy.infoTitle", lang === "en" ? "Information We Collect" : "المعلومات التي نجمعها")}
          </h2>
          <ul className="list-disc pl-6 pr-6 space-y-2">
            <li>
              {t(
                "privacy.info1",
                lang === "en"
                  ? "Phone number, username, and password (encrypted)."
                  : "رقم الهاتف، اسم المستخدم، وكلمة المرور (مشفرة)."
              )}
            </li>
            <li>
              {t(
                "privacy.info2",
                lang === "en"
                  ? "Course content uploaded by teachers (images, videos, resources)."
                  : "محتوى الدروس الذي يرفعه المعلمون (صور، فيديوهات، موارد)."
              )}
            </li>
            <li>
              {t(
                "privacy.info3",
                lang === "en"
                  ? "Basic technical info like browser or OS for security purposes."
                  : "معلومات تقنية أساسية مثل نوع المتصفح أو نظام التشغيل لأغراض الأمان."
              )}
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("privacy.storageTitle", lang === "en" ? "How We Store Data" : "تخزين البيانات")}
          </h2>
          <p className="mb-4">
            {t(
              "privacy.storageText",
              lang === "en"
                ? "Account data is stored in MongoDB. Course materials are stored in Cloudinary. We rely on their security measures but they have their own policies as well."
                : "يتم تخزين بيانات الحساب في MongoDB. يتم تخزين مواد الدروس في Cloudinary. نعتمد على معايير الأمان الخاصة بهم، لكن لديهم سياسات خاصة أيضًا."
            )}
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("privacy.rightsTitle", lang === "en" ? "Your Rights" : "حقوقك")}
          </h2>
          <p className="mb-4">
            {t(
              "privacy.rightsText",
              lang === "en"
                ? "You may request deletion or correction of your data anytime by contacting us at:"
                : "يمكنك طلب حذف بياناتك أو تصحيحها في أي وقت عبر التواصل معنا على:"
            )}{" "}
            <a
              href="mailto:me@hassool.com"
              className="text-special hover:underline"
            >
              me@hassool.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
