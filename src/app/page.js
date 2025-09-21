'use client';

import { TbFlask2, TbCalculator, TbBook, TbLanguage, TbHeart, TbTools, TbBrain, TbWorld } from 'react-icons/tb';
import { useTranslation } from "@/lib/TranslationProvider";
import Link from 'next/link';

export default function Home() {
  const { t, isLoading, lang } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-bg to-bg-secondary dark:from-bg-dark dark:to-bg-dark-secondary">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-special border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary dark:text-text-dark-secondary font-inter">{t('main.common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-bg to-bg-secondary dark:from-bg-dark dark:to-bg-dark-secondary transition-colors duration-300 ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            
            {/* Main Title */}
            <h1 className="font-montserrat font-extrabold text-5xl md:text-7xl text-text dark:text-text-dark mb-6">
              {t('main.hero.title')}
              <span className="block text-special dark:text-special">
                {t('main.hero.titleHighlight')} {t('main.hero.ctaIcon')}
              </span>
            </h1>
            
            <p className="text-text-secondary dark:text-text-dark-secondary text-xl md:text-2xl max-w-4xl mx-auto mb-4 font-inter">
              {t('main.hero.subtitle')}
            </p>
            
            <p className="text-text-secondary dark:text-text-dark-secondary text-lg max-w-3xl mx-auto mb-10 font-inter opacity-80">
              {t('main.hero.description')} 📚
            </p>
            
            {/* CTA Button */}
            <Link href={'/Courses'} >
              <button className="bg-special hover:bg-special-hover dark:bg-special-dark dark:hover:bg-special text-white px-12 py-5 rounded-2xl font-montserrat font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-special/30 mb-16">
                {t('main.hero.cta')} {t('main.hero.ctaIcon')}
              </button>
              
            </Link>

            {/* Educational Tracks Visual */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-bg-secondary/60 dark:bg-bg-dark-secondary/60 rounded-2xl p-4 border border-border dark:border-border-dark backdrop-blur-sm">
                <div className="text-2xl mb-2">🧪</div>
                <p className="text-text dark:text-text-dark font-montserrat font-semibold">{t('main.tracks.sciences')}</p>
              </div>
              <div className="bg-bg-secondary/60 dark:bg-bg-dark-secondary/60 rounded-2xl p-4 border border-border dark:border-border-dark backdrop-blur-sm">
                <div className="text-2xl mb-2">📐</div>
                <p className="text-text dark:text-text-dark font-montserrat font-semibold">{t('main.tracks.mathematics')}</p>
              </div>
              <div className="bg-bg-secondary/60 dark:bg-bg-dark-secondary/60 rounded-2xl p-4 border border-border dark:border-border-dark backdrop-blur-sm">
                <div className="text-2xl mb-2">📖</div>
                <p className="text-text dark:text-text-dark font-montserrat font-semibold">{t('main.tracks.literature')}</p>
              </div>
              <div className="bg-bg-secondary/60 dark:bg-bg-dark-secondary/60 rounded-2xl p-4 border border-border dark:border-border-dark backdrop-blur-sm">
                <div className="text-2xl mb-2">🌍</div>
                <p className="text-text dark:text-text-dark font-montserrat font-semibold">{t('main.tracks.languages')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-montserrat font-bold text-4xl text-text dark:text-text-dark text-center mb-12">
            {t('main.sections.toolsTitle')} ✨
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Science Tools */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 dark:from-blue-400/20 dark:to-blue-500/10 rounded-3xl p-6 border-2 border-blue-400/30 dark:border-blue-400/40 hover:border-blue-400/50 dark:hover:border-blue-400/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <div className="w-12 h-12 bg-blue-500/30 dark:bg-blue-400/30 rounded-xl flex items-center justify-center mb-4">
                <TbFlask2 className="w-6 h-6 text-blue-400 dark:text-blue-300" />
              </div>
              <h3 className="font-montserrat font-bold text-xl text-text dark:text-text-dark mb-3">
                🧬 {t('main.tools.science.title')}
              </h3>
              <div className="space-y-2 text-sm">
                {
                [1,2,3,4].map((item,index) => (
                  <p key={index} className="text-text-secondary dark:text-text-dark-secondary font-inter">• {t(`main.tools.science.items.id${item}.cont`)}</p>
                ))
                }
              </div>
            </div>

            {/* Math Tools */}
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 dark:from-purple-400/20 dark:to-purple-500/10 rounded-3xl p-6 border-2 border-purple-400/30 dark:border-purple-400/40 hover:border-purple-400/50 dark:hover:border-purple-400/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <div className="w-12 h-12 bg-purple-500/30 dark:bg-purple-400/30 rounded-xl flex items-center justify-center mb-4">
                <TbCalculator className="w-6 h-6 text-purple-400 dark:text-purple-300" />
              </div>
              <h3 className="font-montserrat font-bold text-xl text-text dark:text-text-dark mb-3">
                📐 {t('main.tools.math.title')}
              </h3>
              <div className="space-y-2 text-sm">
                {
                [1,2,3,4].map((item,index) => (
                  <p key={index} className="text-text-secondary dark:text-text-dark-secondary font-inter">• {t(`main.tools.math.items.id${item}.cont`)}</p>
                ))
                }
              </div>
            </div>


            {/* Language Tools */}
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 dark:from-orange-400/20 dark:to-orange-500/10 rounded-3xl p-6 border-2 border-orange-400/30 dark:border-orange-400/40 hover:border-orange-400/50 dark:hover:border-orange-400/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <div className="w-12 h-12 bg-orange-500/30 dark:bg-orange-400/30 rounded-xl flex items-center justify-center mb-4">
                <TbLanguage className="w-6 h-6 text-orange-400 dark:text-orange-300" />
              </div>
              <h3 className="font-montserrat font-bold text-xl text-text dark:text-text-dark mb-3">
                🌐 {t('main.tools.language.title')}
              </h3>
              <div className="space-y-2 text-sm">
                {
                [1,2,3,4].map((item,index) => (
                  <p key={index} className="text-text-secondary dark:text-text-dark-secondary font-inter">• {t(`main.tools.language.items.id${item}.cont`)}</p>
                ))
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-16 px-6 bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-montserrat font-bold text-4xl text-text dark:text-text-dark text-center mb-12">
            {t('main.sections.tracksTitle')} 🎓
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* CCS Tracks */}
            <div className="bg-gradient-to-br from-special/10 to-blue-500/10 dark:from-special-dark/10 dark:to-blue-400/10 rounded-2xl p-6 border border-special/30 dark:border-special-dark/30">
              <h3 className="font-montserrat font-bold text-xl text-text dark:text-text-dark mb-4">{t('main.trackDetails.ccs.title')}</h3>
              <div className="space-y-2 text-sm">
                {
                [1,2,3,4].map((item,index) => (
                  <p key={index} className="text-text-secondary dark:text-text-dark-secondary font-inter">
                    {t(`main.trackDetails.ccs.paths.id${item}.cont`)}
                  </p>
                ))
                }
              </div>
            </div>

            {/* CCL Tracks */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-400/10 dark:to-pink-400/10 rounded-2xl p-6 border border-purple-400/30 dark:border-purple-400/30">
              <h3 className="font-montserrat font-bold text-xl text-text dark:text-text-dark mb-4">{t('main.trackDetails.ccl.title')}</h3>
              <div className="space-y-2 text-sm">
                {
                [1,2,3].map((item,index) => (
                  <p key={index} className="text-text-secondary dark:text-text-dark-secondary font-inter">
                    {t(`main.trackDetails.ccl.paths.id${item}.cont`)}
                  </p>
                ))
                }
              </div>
            </div>

            {/* All Students */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-2xl p-6 border border-emerald-400/30 dark:border-emerald-400/30">
              <h3 className="font-montserrat font-bold text-xl text-text dark:text-text-dark mb-4">{t('main.trackDetails.all.title')}</h3>
              <div className="space-y-2 text-sm">
                {
                [1,2].map((item,index) => (
                  <p key={index} className="text-text-secondary dark:text-text-dark-secondary font-inter">
                    {t(`main.trackDetails.all.features.id${item}.cont`)}
                  </p>
                ))
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fun Stats */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-montserrat font-bold text-3xl text-text dark:text-text-dark mb-12">
            {t('main.sections.statsTitle')} 🎯
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="group">
              <div className="text-4xl mb-3">🆓</div>
              <div className="font-montserrat font-bold text-2xl text-special dark:text-special mb-2">
                100%
              </div>
              <div className="text-text-secondary dark:text-text-dark-secondary font-inter text-sm">
                {t('main.stats.free')}
              </div>
            </div>
            <div className="group">
              <div className="text-4xl mb-3">🛠️</div>
              <div className="font-montserrat font-bold text-2xl text-special dark:text-special mb-2">
                20+
              </div>
              <div className="text-text-secondary dark:text-text-dark-secondary font-inter text-sm">
                {t('main.stats.tools')}
              </div>
            </div>
            <div className="group">
              <div className="text-4xl mb-3">📚</div>
              <div className="font-montserrat font-bold text-2xl text-special dark:text-special mb-2">
                All
              </div>
              <div className="text-text-secondary dark:text-text-dark-secondary font-inter text-sm">
                {t('main.stats.tracks')}
              </div>
            </div>
            <div className="group">
              <div className="text-4xl mb-3">❤️</div>
              <div className="font-montserrat font-bold text-2xl text-special dark:text-special mb-2">
                ∞
              </div>
              <div className="text-text-secondary dark:text-text-dark-secondary font-inter text-sm">
                {t('main.stats.love')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teacher Honor Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-special/5 via-emerald-500/5 to-special/5 dark:from-special-dark/5 dark:via-emerald-400/5 dark:to-special-dark/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-special/10 via-emerald-500/10 to-special/10 dark:from-special-dark/10 dark:via-emerald-400/10 dark:to-special-dark/10 rounded-3xl p-8 border-2 border-special/20 dark:border-special-dark/20 backdrop-blur-sm">
            <TbHeart className="w-12 h-12 text-special dark:text-special mx-auto mb-4" />
            <h2 className="font-montserrat font-bold text-3xl text-text dark:text-text-dark mb-4">
              {t('main.sections.honorTitle')} 🌟
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary text-lg mb-6 font-inter max-w-2xl mx-auto">
              {t('main.honor.subtitle')}
            </p>
            <div className="inline-block bg-special/20 dark:bg-special-dark/20 rounded-xl px-6 py-3">
              <p className="text-special dark:text-special font-inter font-semibold">
                "{t('main.honor.quote')}" ✨
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-special/20 via-emerald-500/20 to-special/20 dark:from-special-dark/20 dark:via-emerald-400/20 dark:to-special-dark/20 rounded-3xl p-12 border-2 border-special/30 dark:border-special-dark/40 backdrop-blur-sm">
            <h2 className="font-montserrat font-bold text-4xl text-text dark:text-text-dark mb-6">
              {t('main.sections.ctaTitle')} 🚀
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary text-xl mb-8 font-inter">
              {t('main.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={'/Courses'}>
                <button className="bg-special hover:bg-special-hover dark:bg-special-dark dark:hover:bg-special text-white px-10 py-4 rounded-xl font-montserrat font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl">
                  {t('main.cta.primaryBtn')} 📚
                </button>
              </Link>
              <Link href={'/tools'}>
                <button className="border-2 border-special/50 dark:border-special-dark/50 hover:border-special dark:hover:border-special text-special dark:text-special hover:text-white dark:hover:text-white px-10 py-4 rounded-xl font-montserrat font-semibold text-lg transition-all duration-300 hover:bg-special/10 dark:hover:bg-special-dark/20">
                  {t('main.cta.secondaryBtn')} 🔬
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}