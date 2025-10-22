'use client';

import { TbFlask2, TbCalculator, TbBook, TbLanguage, TbHeart, TbTools, TbBrain, TbWorld } from 'react-icons/tb';
import { useTranslation } from 'react-lite-translation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const { t, isLoading, lang } = useTranslation();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-bg to-bg-secondary dark:from-bg-dark dark:to-bg-dark-secondary">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="w-16 h-16 border-4 border-special dark:border-special-dark border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="text-text-secondary dark:text-text-dark-secondary font-inter text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {t('main.common.loading')}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-bg to-bg-secondary dark:from-bg-dark dark:to-bg-dark-secondary transition-colors duration-300 ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            
            {/* Main Title */}
            <motion.h1 
              className="font-montserrat font-extrabold text-5xl md:text-7xl text-text dark:text-text-dark mb-6"
              variants={fadeInUp}
            >
              {t('main.hero.title')}
              <motion.span 
                className="block text-special dark:text-special"
                variants={fadeInUp}
              >
                {t('main.hero.titleHighlight')} {t('main.hero.ctaIcon')}
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-text-secondary dark:text-text-dark-secondary text-xl md:text-2xl max-w-4xl mx-auto mb-4 font-inter"
              variants={fadeInUp}
            >
              {t('main.hero.subtitle')}
            </motion.p>
            
            <motion.p 
              className="text-text-secondary dark:text-text-dark-secondary text-lg max-w-3xl mx-auto mb-10 font-inter opacity-80"
              variants={fadeInUp}
            >
              {t('main.hero.description')} 📚
            </motion.p>
            
            {/* CTA Button */}
            <motion.div variants={fadeInUp}>
              <Link href={'/Courses'}>
                <motion.button 
                  className="bg-special hover:bg-special-hover dark:bg-special-dark dark:hover:bg-special text-white px-12 py-5 rounded-2xl font-montserrat font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-special/30 mb-16"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('main.hero.cta')} {t('main.hero.ctaIcon')}
                </motion.button>
              </Link>
            </motion.div>

            {/* Educational Tracks Visual */}
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
              variants={staggerContainer}
            >
              {[
                { emoji: '🧪', key: 'sciences' },
                { emoji: '📐', key: 'mathematics' },
                { emoji: '📖', key: 'literature' },
                { emoji: '🌍', key: 'languages' }
              ].map((track, index) => (
                <motion.div 
                  key={index}
                  className="bg-bg-secondary/60 dark:bg-bg-dark-secondary/60 rounded-2xl p-4 border border-border dark:border-border-dark backdrop-blur-sm"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-2xl mb-2">{track.emoji}</div>
                  <p className="text-text dark:text-text-dark font-montserrat font-semibold">
                    {t(`main.tracks.${track.key}`)}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="font-montserrat font-bold text-4xl text-text dark:text-text-dark text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t('main.sections.toolsTitle')} ✨
          </motion.h2>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Science Tools */}
            <motion.div 
              className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 dark:from-blue-400/20 dark:to-blue-500/10 rounded-3xl p-6 border-2 border-blue-400/30 dark:border-blue-400/40 hover:border-blue-400/50 dark:hover:border-blue-400/60 transition-all duration-300 backdrop-blur-sm"
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div 
                className="w-12 h-12 bg-blue-500/30 dark:bg-blue-400/30 rounded-xl flex items-center justify-center mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <TbFlask2 className="w-6 h-6 text-blue-400 dark:text-blue-300" />
              </motion.div>
              <h3 className="font-montserrat font-bold text-xl text-text dark:text-text-dark mb-3">
                🧬 {t('main.tools.science.title')}
              </h3>
              <div className="space-y-2 text-sm">
                {[1,2,3,4].map((item,index) => (
                  <p key={index} className="text-text-secondary dark:text-text-dark-secondary font-inter">
                    • {t(`main.tools.science.items.id${item}.cont`)}
                  </p>
                ))}
              </div>
            </motion.div>

            {/* Math Tools */}
            <motion.div 
              className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 dark:from-purple-400/20 dark:to-purple-500/10 rounded-3xl p-6 border-2 border-purple-400/30 dark:border-purple-400/40 hover:border-purple-400/50 dark:hover:border-purple-400/60 transition-all duration-300 backdrop-blur-sm"
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div 
                className="w-12 h-12 bg-purple-500/30 dark:bg-purple-400/30 rounded-xl flex items-center justify-center mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <TbCalculator className="w-6 h-6 text-purple-400 dark:text-purple-300" />
              </motion.div>
              <h3 className="font-montserrat font-bold text-xl text-text dark:text-text-dark mb-3">
                📐 {t('main.tools.math.title')}
              </h3>
              <div className="space-y-2 text-sm">
                {[1,2,3,4].map((item,index) => (
                  <p key={index} className="text-text-secondary dark:text-text-dark-secondary font-inter">
                    • {t(`main.tools.math.items.id${item}.cont`)}
                  </p>
                ))}
              </div>
            </motion.div>

            {/* Language Tools */}
            <motion.div 
              className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 dark:from-orange-400/20 dark:to-orange-500/10 rounded-3xl p-6 border-2 border-orange-400/30 dark:border-orange-400/40 hover:border-orange-400/50 dark:hover:border-orange-400/60 transition-all duration-300 backdrop-blur-sm"
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div 
                className="w-12 h-12 bg-orange-500/30 dark:bg-orange-400/30 rounded-xl flex items-center justify-center mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <TbLanguage className="w-6 h-6 text-orange-400 dark:text-orange-300" />
              </motion.div>
              <h3 className="font-montserrat font-bold text-xl text-text dark:text-text-dark mb-3">
                🌍 {t('main.tools.language.title')}
              </h3>
              <div className="space-y-2 text-sm">
                {[1,2,3,4].map((item,index) => (
                  <p key={index} className="text-text-secondary dark:text-text-dark-secondary font-inter">
                    • {t(`main.tools.language.items.id${item}.cont`)}
                  </p>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-16 px-6 bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="font-montserrat font-bold text-4xl text-text dark:text-text-dark text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('main.sections.tracksTitle')} 🎓
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* CCS Tracks */}
            <motion.div 
              className="bg-gradient-to-br from-special/10 to-blue-500/10 dark:from-special-dark/10 dark:to-blue-400/10 rounded-2xl p-6 border border-special/30 dark:border-special-dark/30"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-montserrat font-bold text-xl text-text dark:text-text-dark mb-4">
                {t('main.trackDetails.ccs.title')}
              </h3>
              <div className="space-y-2 text-sm">
                {[1,2,3,4].map((item,index) => (
                  <p key={index} className="text-text-secondary dark:text-text-dark-secondary font-inter">
                    {t(`main.trackDetails.ccs.paths.id${item}.cont`)}
                  </p>
                ))}
              </div>
            </motion.div>

            {/* CCL Tracks */}
            <motion.div 
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-400/10 dark:to-pink-400/10 rounded-2xl p-6 border border-purple-400/30 dark:border-purple-400/30"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-montserrat font-bold text-xl text-text dark:text-text-dark mb-4">
                {t('main.trackDetails.ccl.title')}
              </h3>
              <div className="space-y-2 text-sm">
                {[1,2,3].map((item,index) => (
                  <p key={index} className="text-text-secondary dark:text-text-dark-secondary font-inter">
                    {t(`main.trackDetails.ccl.paths.id${item}.cont`)}
                  </p>
                ))}
              </div>
            </motion.div>

            {/* All Students */}
            <motion.div 
              className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-2xl p-6 border border-emerald-400/30 dark:border-emerald-400/30"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-montserrat font-bold text-xl text-text dark:text-text-dark mb-4">
                {t('main.trackDetails.all.title')}
              </h3>
              <div className="space-y-2 text-sm">
                {[1,2].map((item,index) => (
                  <p key={index} className="text-text-secondary dark:text-text-dark-secondary font-inter">
                    {t(`main.trackDetails.all.features.id${item}.cont`)}
                  </p>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Fun Stats */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="font-montserrat font-bold text-3xl text-text dark:text-text-dark mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('main.sections.statsTitle')} 🎯
          </motion.h2>
          <motion.div 
            className="grid md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { emoji: '🆓', value: '100%', key: 'free' },
              { emoji: '🛠️', value: '20+', key: 'tools' },
              { emoji: '📚', value: 'All', key: 'tracks' },
              { emoji: '❤️', value: '∞', key: 'love' }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="group"
                variants={scaleIn}
                whileHover={{ scale: 1.1, y: -10 }}
              >
                <motion.div 
                  className="text-4xl mb-3"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  {stat.emoji}
                </motion.div>
                <div className="font-montserrat font-bold text-2xl text-special dark:text-special mb-2">
                  {stat.value}
                </div>
                <div className="text-text-secondary dark:text-text-dark-secondary font-inter text-sm">
                  {t(`main.stats.${stat.key}`)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Teacher Honor Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-special/5 via-emerald-500/5 to-special/5 dark:from-special-dark/5 dark:via-emerald-400/5 dark:to-special-dark/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            className="bg-gradient-to-r from-special/10 via-emerald-500/10 to-special/10 dark:from-special-dark/10 dark:via-emerald-400/10 dark:to-special-dark/10 rounded-3xl p-8 border-2 border-special/20 dark:border-special-dark/20 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TbHeart className="w-12 h-12 text-special dark:text-special mx-auto mb-4" />
            </motion.div>
            <h2 className="font-montserrat font-bold text-3xl text-text dark:text-text-dark mb-4">
              {t('main.sections.honorTitle')} 🌟
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary text-lg mb-6 font-inter max-w-2xl mx-auto">
              {t('main.honor.subtitle')}
            </p>
            <motion.div 
              className="inline-block bg-special/20 dark:bg-special-dark/20 rounded-xl px-6 py-3"
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-special dark:text-special font-inter font-semibold">
                "{t('main.honor.quote')}" ✨
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Special Thanks Section - NEW */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="relative bg-gradient-to-br from-cyan-500/10 via-special/10 to-blue-500/10 dark:from-cyan-400/10 dark:via-special-dark/10 dark:to-blue-400/10 rounded-3xl p-10 border-2 border-cyan-400/30 dark:border-cyan-400/40 backdrop-blur-sm overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative Elements */}
            <motion.div
              className="absolute -top-10 -left-10 w-40 h-40 bg-special/20 dark:bg-special-dark/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-400/20 dark:bg-cyan-400/20 rounded-full blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            <div className="relative z-10">
              <motion.div
                className="flex items-center justify-center mb-6"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <motion.div
                  className="bg-gradient-to-r from-special to-cyan-400 dark:from-special-dark dark:to-cyan-400 p-4 rounded-2xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <TbHeart className="w-10 h-10 text-white" />
                </motion.div>
              </motion.div>

              <motion.h2 
                className="font-montserrat font-bold text-4xl md:text-5xl text-text dark:text-text-dark text-center mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                {t('main.honor.special.title')} 💝
              </motion.h2>

              <motion.div
                className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-8 backdrop-blur-sm border border-cyan-400/20 dark:border-cyan-400/30"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-text-secondary dark:text-text-dark-secondary text-lg md:text-xl font-inter leading-relaxed text-center whitespace-pre-line">
                  {t('main.honor.special.letter')}
                </p>
              </motion.div>

              <motion.div
                className="mt-8 flex justify-center gap-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                {['✨', '🌟', '💫', '⭐'].map((star, index) => (
                  <motion.span
                    key={index}
                    className="text-3xl"
                    animate={{ 
                      y: [0, -15, 0],
                      rotate: [0, 360, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  >
                    {star}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            className="bg-gradient-to-r from-special/20 via-emerald-500/20 to-special/20 dark:from-special-dark/20 dark:via-emerald-400/20 dark:to-special-dark/20 rounded-3xl p-12 border-2 border-special/30 dark:border-special-dark/40 backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="font-montserrat font-bold text-4xl text-text dark:text-text-dark mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {t('main.sections.ctaTitle')} 🚀
            </motion.h2>
            <motion.p 
              className="text-text-secondary dark:text-text-dark-secondary text-xl mb-8 font-inter"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {t('main.cta.subtitle')}
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link href={'/Courses'}>
                <motion.button 
                  className="bg-special hover:bg-special-hover dark:bg-special-dark dark:hover:bg-special text-white px-10 py-4 rounded-xl font-montserrat font-bold text-lg transition-all duration-300 shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('main.cta.primaryBtn')} 📚
                </motion.button>
              </Link>
              <Link href={'/tools'}>
                <motion.button 
                  className="border-2 border-special/50 dark:border-special-dark/50 hover:border-special dark:hover:border-special text-special dark:text-special hover:text-white dark:hover:text-white px-10 py-4 rounded-xl font-montserrat font-semibold text-lg transition-all duration-300 hover:bg-special/10 dark:hover:bg-special-dark/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('main.cta.secondaryBtn')} 🔬
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}