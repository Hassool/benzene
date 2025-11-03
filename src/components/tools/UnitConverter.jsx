// src/components/tools.UnitConverter.jsx

"use client"

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-lite-translation';
import { SiConvertio } from "react-icons/si";

const UnitConverter = () => {
  const { t, isRTL } = useTranslation();
  
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [inputValue, setInputValue] = useState('1');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // Load available categories and units on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/convert?list=true');
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
          // Set default category and units
          if (data.categories.length > 0) {
            const firstCategory = data.categories[0];
            setSelectedCategory(firstCategory.category);
            if (firstCategory.units.length >= 2) {
              setFromUnit(firstCategory.units[0]);
              setToUnit(firstCategory.units[1]);
            }
          }
        }
      } catch (err) {
        setError(t('tools.unitConverter.error.loadCategoriesFailed'));
      }
    };

    loadCategories();
  }, [t]);

  // Get units for selected category
  const getCurrentUnits = () => {
    const category = categories.find(cat => cat.category === selectedCategory);
    return category ? category.units : [];
  };

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    const category = categories.find(cat => cat.category === newCategory);
    if (category && category.units.length >= 2) {
      setFromUnit(category.units[0]);
      setToUnit(category.units[1]);
    }
    setResult(null);
    setError(null);
  };

  // Perform conversion
  const handleConvert = async () => {
    if (!fromUnit || !toUnit || !inputValue) {
      setError(t('tools.unitConverter.error.fillAllFields'));
      return;
    }

    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) {
      setError(t('tools.unitConverter.error.invalidNumber'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/convert?from=${fromUnit}&to=${toUnit}&value=${numValue}`
      );
      const data = await response.json();

      if (data.success) {
        setResult(data);
        
        // Add to history
        const historyItem = {
          id: Date.now(),
          from: fromUnit,
          to: toUnit,
          inputValue: numValue,
          result: data.result,
          category: selectedCategory,
          timestamp: new Date()
        };
        setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10
      } else {
        setError(data.error || t('tools.unitConverter.error.conversionFailed'));
        setResult(null);
      }
    } catch (err) {
      setError(t('tools.unitConverter.error.networkError'));
      setResult(null);
    }

    setLoading(false);
  };

  // Swap from and to units
  const handleSwapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    setResult(null);
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };

  // Apply conversion from history
  const applyHistoryItem = (item) => {
    setSelectedCategory(item.category);
    setFromUnit(item.from);
    setToUnit(item.to);
    setInputValue(item.inputValue.toString());
    setResult({
      result: item.result,
      from: item.from,
      to: item.to,
      originalValue: item.inputValue,
      category: item.category
    });
  };

  // Format result with appropriate decimal places
  const formatResult = (value) => {
    if (typeof value !== 'number') return value;
    
    // For very small or very large numbers, use scientific notation
    if (Math.abs(value) < 0.001 || Math.abs(value) > 1000000) {
      return value.toExponential(6);
    }
    
    // For normal numbers, limit decimal places
    return parseFloat(value.toFixed(8));
  };

  const currentUnits = getCurrentUnits();

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-bg to-bg-secondary dark:from-bg-dark dark:to-bg-dark-secondary p-6 transition-colors duration-300 ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`flex justify-center items-center gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="p-4 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full">
              <SiConvertio className="text-5xl text-emerald-400 dark:text-emerald-300" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-text dark:text-text-dark mb-3 font-montserrat">
            {t('tools.unitConverter.header.title')}
          </h1>
          <p className={`text-text-secondary dark:text-text-dark-secondary text-lg max-w-2xl mx-auto font-inter ${isRTL ? 'text-center' : ''}`}>
            {t('tools.unitConverter.header.description')}
          </p>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${isRTL ? 'rtl' : ''}`}>
          {/* Main Converter Section */}
          <div className="lg:col-span-2">
            <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm border border-border dark:border-border-dark rounded-2xl p-8 shadow-2xl">
              {/* Category Selection */}
              <div className="mb-8">
                <label className={`block text-emerald-400 dark:text-emerald-300 font-semibold text-lg mb-3 font-montserrat ${isRTL ? 'text-right' : ''}`}>
                  {t('tools.unitConverter.form.categoryLabel')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={`w-full px-4 py-3 bg-bg dark:bg-bg-dark-secondary border-2 border-border dark:border-border-dark rounded-xl text-text dark:text-text-dark focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-emerald-300/30 transition-all duration-200 font-inter ${isRTL ? 'text-right' : ''}`}
                >
                  {categories.map(category => (
                    <option key={category.category} value={category.category} className="bg-bg dark:bg-bg-dark text-text dark:text-text-dark">
                      {category.category.charAt(0).toUpperCase() + category.category.slice(1)} 
                      ({category.units.length} {t('tools.unitConverter.form.unitsAvailable')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Conversion Form */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                {/* Input Value */}
                <div className="md:col-span-2">
                  <label className={`block text-emerald-400 dark:text-emerald-300 font-medium mb-2 font-montserrat ${isRTL ? 'text-right' : ''}`}>
                    {t('tools.unitConverter.form.valueLabel')}
                  </label>
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className={`w-full px-4 py-3 bg-bg dark:bg-bg-dark-secondary border-2 border-border dark:border-border-dark rounded-xl text-text dark:text-text-dark focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-emerald-300/30 transition-all duration-200 placeholder:text-text-secondary dark:placeholder:text-text-dark-secondary font-mono ${isRTL ? 'text-right' : ''}`}
                    placeholder={t('tools.unitConverter.form.valuePlaceholder')}
                    step="any"
                    disabled={loading}
                  />
                </div>

                {/* From Unit */}
                <div>
                  <label className={`block text-emerald-400 dark:text-emerald-300 font-medium mb-2 font-montserrat ${isRTL ? 'text-right' : ''}`}>
                    {t('tools.unitConverter.form.fromLabel')}
                  </label>
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className={`w-full px-3 py-3 bg-bg dark:bg-bg-dark-secondary border-2 border-border dark:border-border-dark rounded-xl text-text dark:text-text-dark focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-emerald-300/30 transition-all duration-200 font-inter ${isRTL ? 'text-right' : ''}`}
                    disabled={loading}
                  >
                    {currentUnits.map(unit => (
                      <option key={unit} className="bg-bg dark:bg-bg-dark text-text dark:text-text-dark" value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                {/* To Unit */}
                <div>
                  <label className={`block text-emerald-400 dark:text-emerald-300 font-medium mb-2 font-montserrat ${isRTL ? 'text-right' : ''}`}>
                    {t('tools.unitConverter.form.toLabel')}
                  </label>
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className={`w-full px-3 py-3 bg-bg dark:bg-bg-dark-secondary border-2 border-border dark:border-border-dark rounded-xl text-text dark:text-text-dark focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-emerald-300/30 transition-all duration-200 font-inter ${isRTL ? 'text-right' : ''}`}
                    disabled={loading}
                  >
                    {currentUnits.map(unit => (
                      <option key={unit} className="bg-bg dark:bg-bg-dark text-text dark:text-text-dark" value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={handleSwapUnits}
                  className={`px-6 py-3 bg-bg-secondary dark:bg-bg-dark hover:bg-border dark:hover:bg-border-dark text-emerald-400 dark:text-emerald-300 rounded-xl transition-all duration-200 font-medium flex items-center gap-2 hover:scale-105 border border-border dark:border-border-dark font-montserrat ${isRTL ? 'flex-row-reverse' : ''}`}
                  title={t('tools.unitConverter.actions.swapButton')}
                  disabled={loading}
                >
                  <span className="text-lg">{isRTL ? '⇆' : '⇄'}</span>
                  {t('tools.unitConverter.actions.swapButton')}
                </button>
                <button
                  onClick={handleConvert}
                  disabled={loading || !inputValue.trim()}
                  className={`flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-emerald-500 dark:hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/25 dark:hover:shadow-emerald-400/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 font-montserrat ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      {t('tools.unitConverter.actions.converting')}
                    </>
                  ) : (
                    <>
                      <SiConvertio className="text-xl" />
                      {t('tools.unitConverter.actions.convertButton')}
                    </>
                  )}
                </button>
              </div>

              {/* Result Display */}
              {result && !loading && (
                <div className={`bg-emerald-900/30 dark:bg-emerald-800/20 ${isRTL ? 'border-r-4' : 'border-l-4'} border-emerald-400 dark:border-emerald-300 p-6 rounded-lg`}>
                  <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-emerald-400 dark:text-emerald-300 text-xl mt-0.5 flex-shrink-0">✓</span>
                    <div className="w-full">
                      <h3 className={`text-emerald-400 dark:text-emerald-300 font-semibold text-lg mb-3 font-montserrat ${isRTL ? 'text-right' : ''}`}>
                        {t('tools.unitConverter.result.title')}
                      </h3>
                      <div className="bg-bg dark:bg-bg-dark-secondary p-4 rounded-lg border border-border dark:border-border-dark">
                        <div className={`text-2xl font-bold text-text dark:text-text-dark mb-2 font-mono ${isRTL ? 'text-right' : ''}`}>
                          {formatResult(result.result)} {result.to}
                        </div>
                        <div className={`text-emerald-600 dark:text-emerald-400 font-mono ${isRTL ? 'text-right' : ''}`}>
                          {result.originalValue} {result.from} = {formatResult(result.result)} {result.to}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className={`bg-red-900/30 dark:bg-red-800/20 ${isRTL ? 'border-r-4' : 'border-l-4'} border-red-500 dark:border-red-400 p-6 rounded-lg`}>
                  <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-red-400 dark:text-red-300 text-xl mt-0.5 flex-shrink-0">⚠</span>
                    <div>
                      <h3 className={`text-red-400 dark:text-red-300 font-semibold text-lg mb-1 font-montserrat ${isRTL ? 'text-right' : ''}`}>
                        {t('tools.unitConverter.error.title')}
                      </h3>
                      <p className={`text-red-300 dark:text-red-200 font-inter ${isRTL ? 'text-right' : ''}`}>{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Conversion History */}
            {history.length > 0 && (
              <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm border border-border dark:border-border-dark rounded-2xl my-6 p-6">
                <div className={`flex justify-between items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className={`text-emerald-400 dark:text-emerald-300 font-semibold text-lg flex items-center gap-2 font-montserrat ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xl">🕒</span>
                    {t('tools.unitConverter.history.title')}
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="text-red-400 dark:text-red-300 hover:text-red-300 dark:hover:text-red-200 transition-colors p-2 hover:bg-red-900/20 dark:hover:bg-red-800/20 rounded-lg"
                    title={t('tools.unitConverter.actions.clearHistory')}
                  >
                    <span className="text-lg">🗑</span>
                  </button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {history.map(item => (
                    <button
                      key={item.id}
                      onClick={() => applyHistoryItem(item)}
                      className={`w-full text-left p-3 bg-bg dark:bg-bg-dark-secondary hover:bg-emerald-900/30 dark:hover:bg-emerald-800/20 border border-border dark:border-border-dark hover:border-emerald-500 dark:hover:border-emerald-400 rounded-lg transition-all duration-200 text-text-secondary dark:text-text-dark-secondary hover:text-emerald-600 dark:hover:text-emerald-300 ${isRTL ? 'text-right' : ''}`}
                    >
                      <div className={`font-mono text-sm mb-1 ${isRTL ? 'text-right' : ''}`}>
                        {item.inputValue} {item.from} → {formatResult(item.result)} {item.to}
                      </div>
                      <div className={`text-xs text-text-secondary dark:text-text-dark-secondary flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="capitalize">{item.category}</span>
                        <span>{item.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Categories */}
            <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm border border-border dark:border-border-dark rounded-2xl p-6">
              <h3 className={`text-emerald-400 dark:text-emerald-300 font-semibold text-lg mb-4 flex items-center gap-2 font-montserrat ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <SiConvertio className="text-xl" />
                {t('tools.unitConverter.sidebar.quickCategories')}
              </h3>
              <div className="space-y-2">
                {categories.slice(0, 6).map(category => (
                  <button
                    key={category.category}
                    onClick={() => handleCategoryChange(category.category)}
                    className={`w-full p-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                      selectedCategory === category.category
                        ? 'bg-emerald-900/50 dark:bg-emerald-800/30 border border-emerald-500 dark:border-emerald-400 text-emerald-600 dark:text-emerald-300'
                        : 'bg-bg dark:bg-bg-dark-secondary hover:bg-emerald-900/30 dark:hover:bg-emerald-800/20 border border-border dark:border-border-dark hover:border-emerald-500 dark:hover:border-emerald-400 text-text-secondary dark:text-text-dark-secondary hover:text-emerald-600 dark:hover:text-emerald-300'
                    } ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <div className={`font-medium capitalize font-montserrat ${isRTL ? 'text-right' : ''}`}>{category.category}</div>
                    <div className={`text-xs text-text-secondary dark:text-text-dark-secondary font-inter ${isRTL ? 'text-right' : ''}`}>
                      {category.units.length} {t('tools.unitConverter.form.unitsAvailable')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm border border-border dark:border-border-dark rounded-2xl p-6">
              <h3 className={`text-emerald-400 dark:text-emerald-300 font-semibold text-lg mb-4 font-montserrat ${isRTL ? 'text-right' : ''}`}>
                {t('tools.unitConverter.sidebar.tipsTitle')}
              </h3>
              <ul className={`text-text-secondary dark:text-text-dark-secondary text-sm space-y-2 font-inter ${isRTL ? 'text-right' : ''}`}>
                <li className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-emerald-400 dark:text-emerald-300 mt-1 ${isRTL ? 'mr-0 ml-2' : ''}`}>•</span>
                  {t('tools.unitConverter.sidebar.tip1')}
                </li>
                <li className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-emerald-400 dark:text-emerald-300 mt-1 ${isRTL ? 'mr-0 ml-2' : ''}`}>•</span>
                  {t('tools.unitConverter.sidebar.tip2')}
                </li>
                <li className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-emerald-400 dark:text-emerald-300 mt-1 ${isRTL ? 'mr-0 ml-2' : ''}`}>•</span>
                  {t('tools.unitConverter.sidebar.tip3')}
                </li>
                <li className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-emerald-400 dark:text-emerald-300 mt-1 ${isRTL ? 'mr-0 ml-2' : ''}`}>•</span>
                  {t('tools.unitConverter.sidebar.tip4')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;