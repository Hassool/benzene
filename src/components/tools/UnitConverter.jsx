// src/components/UnitConverter.jsx

"use client"

import { useState, useEffect } from 'react';
import { SiConvertio } from "react-icons/si";

const UnitConverter = () => {
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
        setError('Failed to load conversion categories');
      }
    };

    loadCategories();
  }, []);

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
      setError('Please fill in all fields');
      return;
    }

    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
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
        setError(data.error || 'Conversion failed');
        setResult(null);
      }
    } catch (err) {
      setError('Network error during conversion');
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
    <div className="min-h-screen bg-gradient-to-br from-bg to-bg-secondary dark:from-bg-dark dark:to-bg-dark-secondary p-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="p-4 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full">
              <SiConvertio className="text-5xl text-emerald-400 dark:text-emerald-300" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-text dark:text-text-dark mb-3 font-montserrat">
            Universal Unit Converter
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary text-lg max-w-2xl mx-auto font-inter">
            Convert between different units of measurement including mass, volume, temperature, 
            pressure, and concentration for all your chemistry calculations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Converter Section */}
          <div className="lg:col-span-2">
            <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm border border-border dark:border-border-dark rounded-2xl p-8 shadow-2xl">
              {/* Category Selection */}
              <div className="mb-8">
                <label className="block text-emerald-400 dark:text-emerald-300 font-semibold text-lg mb-3 font-montserrat">
                  Conversion Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 bg-bg dark:bg-bg-dark-secondary border-2 border-border dark:border-border-dark rounded-xl text-text dark:text-text-dark focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-emerald-300/30 transition-all duration-200 font-inter"
                >
                  {categories.map(category => (
                    <option key={category.category} value={category.category} className="bg-bg dark:bg-bg-dark text-text dark:text-text-dark">
                      {category.category.charAt(0).toUpperCase() + category.category.slice(1)} 
                      ({category.units.length} units)
                    </option>
                  ))}
                </select>
              </div>

              {/* Conversion Form */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                {/* Input Value */}
                <div className="md:col-span-2">
                  <label className="block text-emerald-400 dark:text-emerald-300 font-medium mb-2 font-montserrat">
                    Value
                  </label>
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full px-4 py-3 bg-bg dark:bg-bg-dark-secondary border-2 border-border dark:border-border-dark rounded-xl text-text dark:text-text-dark focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-emerald-300/30 transition-all duration-200 placeholder:text-text-secondary dark:placeholder:text-text-dark-secondary font-mono"
                    placeholder="Enter value"
                    step="any"
                    disabled={loading}
                  />
                </div>

                {/* From Unit */}
                <div>
                  <label className="block text-emerald-400 dark:text-emerald-300 font-medium mb-2 font-montserrat">
                    From
                  </label>
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full px-3 py-3 bg-bg dark:bg-bg-dark-secondary border-2 border-border dark:border-border-dark rounded-xl text-text dark:text-text-dark focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-emerald-300/30 transition-all duration-200 font-inter"
                    disabled={loading}
                  >
                    {currentUnits.map(unit => (
                      <option key={unit} className="bg-bg dark:bg-bg-dark text-text dark:text-text-dark" value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                {/* To Unit */}
                <div>
                  <label className="block text-emerald-400 dark:text-emerald-300 font-medium mb-2 font-montserrat">
                    To
                  </label>
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full px-3 py-3 bg-bg dark:bg-bg-dark-secondary border-2 border-border dark:border-border-dark rounded-xl text-text dark:text-text-dark focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-emerald-300/30 transition-all duration-200 font-inter"
                    disabled={loading}
                  >
                    {currentUnits.map(unit => (
                      <option key={unit} className="bg-bg dark:bg-bg-dark text-text dark:text-text-dark" value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleSwapUnits}
                  className="px-6 py-3 bg-bg-secondary dark:bg-bg-dark hover:bg-border dark:hover:bg-border-dark text-emerald-400 dark:text-emerald-300 rounded-xl transition-all duration-200 font-medium flex items-center gap-2 hover:scale-105 border border-border dark:border-border-dark font-montserrat"
                  title="Swap units"
                  disabled={loading}
                >
                  <span className="text-lg">⇄</span>
                  Swap
                </button>
                <button
                  onClick={handleConvert}
                  disabled={loading || !inputValue.trim()}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-emerald-500 dark:hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/25 dark:hover:shadow-emerald-400/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 font-montserrat"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Converting...
                    </>
                  ) : (
                    <>
                      <SiConvertio className="text-xl" />
                      Convert Units
                    </>
                  )}
                </button>
              </div>

              {/* Result Display */}
              {result && !loading && (
                <div className="bg-emerald-900/30 dark:bg-emerald-800/20 border-l-4 border-emerald-400 dark:border-emerald-300 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 dark:text-emerald-300 text-xl mt-0.5 flex-shrink-0">✓</span>
                    <div className="w-full">
                      <h3 className="text-emerald-400 dark:text-emerald-300 font-semibold text-lg mb-3 font-montserrat">Conversion Result</h3>
                      <div className="bg-bg dark:bg-bg-dark-secondary p-4 rounded-lg border border-border dark:border-border-dark">
                        <div className="text-2xl font-bold text-text dark:text-text-dark mb-2 font-mono">
                          {formatResult(result.result)} {result.to}
                        </div>
                        <div className="text-emerald-600 dark:text-emerald-400 font-mono">
                          {result.originalValue} {result.from} = {formatResult(result.result)} {result.to}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-900/30 dark:bg-red-800/20 border-l-4 border-red-500 dark:border-red-400 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 dark:text-red-300 text-xl mt-0.5 flex-shrink-0">⚠</span>
                    <div>
                      <h3 className="text-red-400 dark:text-red-300 font-semibold text-lg mb-1 font-montserrat">Error</h3>
                      <p className="text-red-300 dark:text-red-200 font-inter">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Conversion History */}
            {history.length > 0 && (
              <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm border border-border dark:border-border-dark rounded-2xl my-6 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-emerald-400 dark:text-emerald-300 font-semibold text-lg flex items-center gap-2 font-montserrat">
                    <span className="text-xl">🕒</span>
                    Recent Conversions
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="text-red-400 dark:text-red-300 hover:text-red-300 dark:hover:text-red-200 transition-colors p-2 hover:bg-red-900/20 dark:hover:bg-red-800/20 rounded-lg"
                    title="Clear history"
                  >
                    <span className="text-lg">🗑</span>
                  </button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {history.map(item => (
                    <button
                      key={item.id}
                      onClick={() => applyHistoryItem(item)}
                      className="w-full text-left p-3 bg-bg dark:bg-bg-dark-secondary hover:bg-emerald-900/30 dark:hover:bg-emerald-800/20 border border-border dark:border-border-dark hover:border-emerald-500 dark:hover:border-emerald-400 rounded-lg transition-all duration-200 text-text-secondary dark:text-text-dark-secondary hover:text-emerald-600 dark:hover:text-emerald-300"
                    >
                      <div className="font-mono text-sm mb-1">
                        {item.inputValue} {item.from} → {formatResult(item.result)} {item.to}
                      </div>
                      <div className="text-xs text-text-secondary dark:text-text-dark-secondary flex justify-between">
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
              <h3 className="text-emerald-400 dark:text-emerald-300 font-semibold text-lg mb-4 flex items-center gap-2 font-montserrat">
                <SiConvertio className="text-xl" />
                Quick Categories
              </h3>
              <div className="space-y-2">
                {categories.slice(0, 6).map(category => (
                  <button
                    key={category.category}
                    onClick={() => handleCategoryChange(category.category)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                      selectedCategory === category.category
                        ? 'bg-emerald-900/50 dark:bg-emerald-800/30 border border-emerald-500 dark:border-emerald-400 text-emerald-600 dark:text-emerald-300'
                        : 'bg-bg dark:bg-bg-dark-secondary hover:bg-emerald-900/30 dark:hover:bg-emerald-800/20 border border-border dark:border-border-dark hover:border-emerald-500 dark:hover:border-emerald-400 text-text-secondary dark:text-text-dark-secondary hover:text-emerald-600 dark:hover:text-emerald-300'
                    }`}
                  >
                    <div className="font-medium capitalize font-montserrat">{category.category}</div>
                    <div className="text-xs text-text-secondary dark:text-text-dark-secondary font-inter">{category.units.length} units available</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm border border-border dark:border-border-dark rounded-2xl p-6">
              <h3 className="text-emerald-400 dark:text-emerald-300 font-semibold text-lg mb-4 font-montserrat">Tips</h3>
              <ul className="text-text-secondary dark:text-text-dark-secondary text-sm space-y-2 font-inter">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 dark:text-emerald-300 mt-1">•</span>
                  Select the appropriate category first
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 dark:text-emerald-300 mt-1">•</span>
                  Use the swap button to reverse conversion
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 dark:text-emerald-300 mt-1">•</span>
                  Click history items to reuse conversions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 dark:text-emerald-300 mt-1">•</span>
                  Scientific notation for very large/small values
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