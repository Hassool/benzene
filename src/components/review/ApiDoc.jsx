"use client";

import { motion } from "framer-motion";
import { FiServer, FiArrowRight } from "react-icons/fi";
import { useTranslation } from "l_i18n";

const ApiDoc = ({ method, route, description, input, output, inputLabel, outputLabel }) => {
  const { t } = useTranslation();
  
  const finalInputLabel = inputLabel || t("review.api.input", "Input");
  const finalOutputLabel = outputLabel || t("review.api.output", "Output");
  return (
    <div className="mb-8 p-6 bg-white dark:bg-bg-dark-secondary rounded-xl border border-border dark:border-border-dark shadow-sm">
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <span className={`px-3 py-1 rounded-md text-sm font-bold font-mono ${
          method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
          method === 'POST' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
          method === 'DELETE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }`}>
          {method}
        </span>
        <code className="text-lg font-mono text-text dark:text-text-dark bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded">
          {route}
        </code>
      </div>
      
      <p className="text-text-secondary dark:text-text-dark-secondary mb-6 font-inter">
        {description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {input && (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-border dark:border-border-dark">
            <h4 className="text-xs font-bold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-2 font-mono">{finalInputLabel}</h4>
            <pre className="text-sm text-text dark:text-text-dark font-mono overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(input, null, 2)}
            </pre>
          </div>
        )}
        
        {output && (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-border dark:border-border-dark">
            <h4 className="text-xs font-bold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-2 font-mono">{finalOutputLabel}</h4>
            <pre className="text-sm text-text dark:text-text-dark font-mono overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(output, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDoc;
