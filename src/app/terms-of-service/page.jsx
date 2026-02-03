// src/app/terms-of-service/page.jsx
"use client";

import { useTranslation } from "l_i18n";

export default function TermsOfServicePage() {
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
            {t("terms.title", lang === "en" ? "Terms of Service" : "شروط الخدمة")}
          </h1>
          <p className="mb-4">
            {t("terms.lastUpdated", lang === "en" ? "Last Updated: [Insert Date]" : "آخر تحديث: [ضع التاريخ]")}
          </p>

          {/* Introduction */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("terms.introTitle", lang === "en" ? "Introduction" : "المقدمة")}
          </h2>
          <p className="mb-4">
            {t(
              "terms.introText",
              lang === "en"
                ? "Benzene is a charity-based platform where teachers share lessons in multiple modules of high school education for students. Students and visitors can access content for free without accounts. Only teachers may request accounts, which are approved by administrators."
                : "بنزين هو منصة خيرية حيث يشارك المعلمون دروساً في عدة مواد من التعليم الثانوي للطلاب. يمكن للطلاب والزوار الوصول إلى المحتوى مجاناً دون حسابات. فقط المعلمون يمكنهم طلب إنشاء حسابات، ويقوم المسؤولون بالموافقة عليها."
            )}
          </p>

          {/* Accounts */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("terms.accountsTitle", lang === "en" ? "Accounts" : "الحسابات")}
          </h2>
          <ul className="list-disc pl-6 pr-6 space-y-2">
            <li>
              {t(
                "terms.accounts1",
                lang === "en"
                  ? "Only teachers may request accounts."
                  : "فقط المعلمون يمكنهم طلب إنشاء حسابات."
              )}
            </li>
            <li>
              {t(
                "terms.accounts2",
                lang === "en"
                  ? "Accounts are created only after administrator approval."
                  : "يتم إنشاء الحسابات فقط بعد موافقة المسؤولين."
              )}
            </li>
            <li>
              {t(
                "terms.accounts3",
                lang === "en"
                  ? "Students and visitors can access all content without accounts."
                  : "يمكن للطلاب والزوار الوصول إلى كل المحتوى بدون حساب."
              )}
            </li>
            <li>
              {t(
                "terms.accounts4",
                lang === "en"
                  ? "Teachers are responsible for keeping their login details private."
                  : "المعلمون مسؤولون عن الحفاظ على سرية بيانات الدخول الخاصة بهم."
              )}
            </li>
          </ul>

          {/* Use of Service */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("terms.useTitle", lang === "en" ? "Use of the Service" : "استخدام الخدمة")}
          </h2>
          <ul className="list-disc pl-6 pr-6 space-y-2">
            <li>
              {t(
                "terms.use1",
                lang === "en"
                  ? "Visitors may freely access and learn from lessons."
                  : "يمكن للزوار الوصول بحرية إلى الدروس والتعلم منها."
              )}
            </li>
            <li>
              {t(
                "terms.use2",
                lang === "en"
                  ? "Teachers may upload, update, and delete their own lessons."
                  : "يمكن للمعلمين رفع وتحديث وحذف الدروس الخاصة بهم."
              )}
            </li>
            <li>
              {t(
                "terms.use3",
                lang === "en"
                  ? "Administrators may delete or modify any content, and manage accounts."
                  : "يمكن للمسؤولين حذف أو تعديل أي محتوى، وإدارة الحسابات."
              )}
            </li>
          </ul>

          {/* Content Ownership */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("terms.ownershipTitle", lang === "en" ? "Content Ownership" : "ملكية المحتوى")}
          </h2>
          <p className="mb-4">
            {t(
              "terms.ownershipText",
              lang === "en"
                ? "Lessons, videos, and resources uploaded by teachers remain credited to them. By uploading, teachers agree their content can be freely viewed, downloaded, and reused by students and others."
                : "الدروس والفيديوهات والموارد التي يرفعها المعلمون تبقى منسوبة إليهم. من خلال رفع المحتوى، يوافق المعلمون على أن يكون محتواهم متاحاً للمشاهدة والتنزيل وإعادة الاستخدام بحرية من قبل الطلاب والآخرين."
            )}
          </p>

          {/* Prohibited Behavior */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("terms.prohibitedTitle", lang === "en" ? "Prohibited Behavior" : "السلوكيات الممنوعة")}
          </h2>
          <p className="mb-4">
            {t(
              "terms.prohibitedText",
              lang === "en"
                ? "Users may not upload harmful, offensive, or unrelated content. Administrators may remove any content to protect the platform."
                : "لا يجوز للمستخدمين رفع محتوى ضار أو مسيء أو غير متعلق. يمكن للمسؤولين إزالة أي محتوى لحماية المنصة."
            )}
          </p>

          {/* Service Availability */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("terms.availabilityTitle", lang === "en" ? "Service Availability" : "توفر الخدمة")}
          </h2>
          <p className="mb-4">
            {t(
              "terms.availabilityText",
              lang === "en"
                ? "Benzene may be unavailable or change at any time, especially since it relies on free third-party services."
                : "قد تصبح منصة بنزين غير متاحة أو تتغير في أي وقت، خاصةً لأنها تعتمد على خدمات مجانية من أطراف ثالثة."
            )}
          </p>

          {/* Liability */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("terms.liabilityTitle", lang === "en" ? "Liability" : "المسؤولية")}
          </h2>
          <p className="mb-4">
            {t(
              "terms.liabilityText",
              lang === "en"
                ? "Benzene provides educational content as a helper platform only. Benzene and its administrators are not responsible for errors in content or any damages caused by use of the service."
                : "توفر بنزين المحتوى التعليمي كمنصة مساعدة فقط. بنزين ومسؤولوها غير مسؤولين عن الأخطاء في المحتوى أو أي أضرار ناتجة عن استخدام الخدمة."
            )}
          </p>

          {/* Termination */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("terms.terminationTitle", lang === "en" ? "Termination" : "إنهاء الخدمة")}
          </h2>
          <p className="mb-4">
            {t(
              "terms.terminationText",
              lang === "en"
                ? "Administrators may suspend or delete accounts or content at any time if rules are broken."
                : "يمكن للمسؤولين تعليق أو حذف الحسابات أو المحتوى في أي وقت إذا تم خرق القواعد."
            )}
          </p>

          {/* Changes */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("terms.changesTitle", lang === "en" ? "Changes to Terms" : "تغييرات على الشروط")}
          </h2>
          <p className="mb-4">
            {t(
              "terms.changesText",
              lang === "en"
                ? "Terms of Service may be updated. Users will be notified of changes."
                : "قد يتم تحديث شروط الخدمة. سيتم إخطار المستخدمين بأي تغييرات."
            )}
          </p>

          {/* Contact */}
          <h2 className="text-xl font-semibold mt-6 mb-2">
            {t("terms.contactTitle", lang === "en" ? "Contact" : "التواصل")}
          </h2>
          <p className="mb-4">
            {t(
              "terms.contactText",
              lang === "en"
                ? "For questions or issues, contact:"
                : "للاستفسارات أو المشاكل، تواصل معنا:"
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
