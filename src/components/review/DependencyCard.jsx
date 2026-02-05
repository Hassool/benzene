"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";

const DependencyCard = ({ icon: Icon, name, description, link }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="p-6 bg-white dark:bg-bg-dark-secondary rounded-xl border border-border dark:border-border-dark hover:border-blue-500 dark:hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
          <Icon className="text-3xl text-blue-500 dark:text-blue-400" />
        </div>
        {link && (
          <Link 
            href={link} 
            target="_blank" 
            className="text-text-secondary dark:text-text-dark-secondary hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            <FiExternalLink className="text-xl" />
          </Link>
        )}
      </div>
      
      <h3 className="text-lg font-bold text-text dark:text-text-dark mb-2 font-rajdhani">
        {name}
      </h3>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed font-inter">
        {description}
      </p>
    </motion.div>
  );
};

export default DependencyCard;
