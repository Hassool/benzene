"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  useTranslation } from 'react-lite-translation';

const Popup = () => {
  const [showFact, setShowFact] = useState(false);
  const [currentFact, setCurrentFact] = useState('');
  const {isRTL} = useTranslation()

  const funFacts = [
    "لَا إِلَهَ إِلَّا أنْـت سُـبْحانَكَ إِنِّي كُنْـتُ مِنَ الظّـالِميـن",
    "قَالَ ﷺ: مَنْ قَالَ (سُبْحَانَ اللَّهِ وَبِحَمْدِهِ) فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ وَلَوْ كَانَتْ مِثْلَ زَبَدِ الْبَحْر",
    "قَالَ ﷺ: كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: (سُبْحَانَ اللَّهِ وَبِحَمْدِهِ)، (سُبْحانَ اللَّهِ الْعَظِيمِ).",
    "مَنْ قَالَ (سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ) غُرِسَتْ لَهُ نَخْلَةٌ فِي الْجَنَّةِ",
    "إِنَّ أَفْضَلَ الدُّعَاءِ (الْحَمْدُ لِلَّهِ)، وَأَفْضَلَ الذِّكْرِ (لاَ إِلَهَ إِلاَّ اللَّهُ)",
    `عَنْ أَنَسٍ، عَنِ النَّبِيِّ ﷺ قَالَ  "يَسِّرُوا وَلاَ تُعَسِّرُوا، وَبَشِّرُوا وَلاَ تُنَفِّرُوا "`,
   ` قَالَ النَّبِيُّ ﷺ  " لاَ حَسَدَ إِلاَّ فِي اثْنَتَيْنِ رَجُلٌ آتَاهُ اللَّهُ مَالاً فَسُلِّطَ عَلَى هَلَكَتِهِ فِي الْحَقِّ، وَرَجُلٌ آتَاهُ اللَّهُ الْحِكْمَةَ، فَهْوَ يَقْضِي بِهَا وَيُعَلِّمُهَا "`,
    ` عَنْ جَرِيرِ بْنِ عَبْدِ اللَّهِ، قَالَ قَالَ رَسُولُ اللَّهِ ﷺ  " لاَ يَرْحَمُ اللَّهُ مَنْ لاَ يَرْحَمُ النَّاسَ "`,
    `قَالَ رَسُولُ اللَّهِ ﷺ  " لاَ يَتَمَنَّيَنَّ أَحَدُكُمُ الْمَوْتَ لِضُرٍّ نَزَلَ بِهِ فَإِنْ كَانَ لاَ بُدَّ مُتَمَنِّيًا فَلْيَقُلِ اللَّهُمَّ أَحْيِنِي مَا كَانَتِ الْحَيَاةُ خَيْرًا لِي وَتَوَفَّنِي إِذَا كَانَتِ الْوَفَاةُ خَيْرًا لِي "`,
    `عَنِ النَّبِيِّ ﷺ قَالَ  " مَنْ أَحَبَّ لِقَاءَ اللَّهِ أَحَبَّ اللَّهُ لِقَاءَهُ وَمَنْ كَرِهَ لِقَاءَ اللَّهِ كَرِهَ اللَّهُ لِقَاءَهُ " `,
    ` قَالَ رَسُولُ اللَّهِ ﷺ  " إِنَّ اللَّهَ يَقُولُ أَنَا عِنْدَ ظَنِّ عَبْدِي بِي وَأَنَا مَعَهُ إِذَا دَعَانِي "`
  ];

  useEffect(() => {
    // First popup after 3 minutes
    const firstTimeout = setTimeout(() => {
      const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
      setCurrentFact(randomFact);
      setShowFact(true);

      setTimeout(() => {
        setShowFact(false);
      }, 10000);

      // Then every 15 minutes
      const interval = setInterval(() => {
        const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
        setCurrentFact(randomFact);
        setShowFact(true);

        setTimeout(() => {
          setShowFact(false);
        }, 5000);
      }, 900000); // 15 min

      return () => clearInterval(interval);
    }, 180000); // 3 min

    return () => clearTimeout(firstTimeout);
  }, []);

  return (
    <div>
      <AnimatePresence>
        {showFact && (
          <motion.div
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -200, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 20,
              duration: 0.5 
            }}
            className={`fixed top-4 ${isRTL ? "right-1/2 translate-x-1/2" :"left-1/2 -translate-x-1/2"} z-50 w-fit max-w-2xl`}
          >
            <div className="relative bg-bg-secondary dark:bg-bg-dark-secondary 
                          border-2 border-yellow-500
                          rounded-xl shadow-2xl overflow-hidden">
              {/* Gradient accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600" />
              
              <div className="p-5 flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full 
                              bg-yellow-100 dark:bg-yellow-900/40 
                              flex items-center justify-center text-2xl">
                  💡
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-montserrat font-bold text-lg text-rtl text-text dark:text-text-dark mb-1">
                    طهر قلبك
                  </h3>
                  <p className="font-inter text-text-secondary dark:text-text-dark-secondary leading-relaxed">
                    {currentFact}
                  </p>
                </div>
                
                {/* Close button */}
                <button
                  onClick={() => setShowFact(false)}
                  className="flex-shrink-0 w-8 h-8 rounded-lg 
                           hover:bg-yellow-200/40 dark:hover:bg-yellow-800/40
                           transition-colors duration-200
                           flex items-center justify-center
                           text-text-secondary dark:text-text-dark-secondary
                           hover:text-text dark:hover:text-text-dark"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Popup;
