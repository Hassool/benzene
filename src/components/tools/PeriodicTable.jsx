import { useState, useEffect } from 'react';
import { useTranslation } from 'l_i18n';
import { X, Atom, Thermometer, Zap, Calendar, Weight, Layers, Beaker, Gauge } from 'lucide-react';

// Element groups for color coding
const getElementClass = (groupBlock) => {
  const baseClass = "w-12 h-12 lg:w-14 lg:h-14 rounded text-xs lg:text-sm font-medium transition-all duration-200 hover:scale-105 cursor-pointer flex flex-col items-center justify-center";
  
  const colorClasses = {
    'alkali metal': 'bg-red-200/60 dark:bg-red-900/60 hover:bg-red-300/40 dark:hover:bg-red-800/40 border border-red-500',
    'alkaline earth metal': 'bg-orange-200/60 dark:bg-orange-900/60 hover:bg-orange-300/40 dark:hover:bg-orange-800/40 border border-orange-500',
    'transition metal': 'bg-yellow-200/60 dark:bg-yellow-900/60 hover:bg-yellow-300/40 dark:hover:bg-yellow-800/40 border border-yellow-500' ,
    'metal': 'bg-blue-200/60 dark:bg-blue-900/60 hover:bg-blue-300/40 dark:hover:bg-blue-800/40 border border-blue-500',
    'metalloid': 'bg-green-200/60 dark:bg-green-900/60 hover:bg-green-300/40 dark:hover:bg-green-800/40 border border-green-500',
    'nonmetal': 'bg-purple-200/60 dark:bg-purple-900/60 hover:bg-purple-300/40 dark:hover:bg-purple-800/40 border border-purple-500',
    'halogen': 'bg-pink-200/60 dark:bg-pink-900/60 hover:bg-pink-300/40 dark:hover:bg-pink-800/40 border border-pink-500',
    'noble gas': 'bg-cyan-200/60 dark:bg-cyan-900/60 hover:bg-cyan-300/40 dark:hover:bg-cyan-800/40 border border-cyan-500',
    'lanthanoid': 'bg-indigo-200/60 dark:bg-indigo-900/60 hover:bg-indigo-300/40 dark:hover:bg-indigo-800/40 border border-indigo-500',
    'actinoid': 'bg-teal-200/60 dark:bg-teal-900/60 hover:bg-teal-300/40 dark:hover:bg-teal-800/40 border border-teal-500',
    'post-transition metal': 'bg-gray-200/60 dark:bg-gray-700/60 hover:bg-gray-300/40 dark:hover:bg-gray-600/40 border border-gray-500'
  };
  
  return `${baseClass} ${colorClasses[groupBlock] || 'bg-gray-100/60 dark:bg-gray-800/60 hover:bg-gray-200/40 dark:hover:bg-gray-700/40  border border-gray-500'}`;
};

// Get element color classes for modal
const getElementModalColors = (groupBlock) => {
  const colorClasses = {
    'alkali metal': {
      bg: 'bg-red-100 dark:bg-red-950',
      border: 'border-red-300 dark:border-red-700',
      accent: 'bg-red-500',
      icon: 'text-red-600 dark:text-red-400'
    },
    'alkaline earth metal': {
      bg: 'bg-orange-100 dark:bg-orange-950',
      border: 'border-orange-300 dark:border-orange-700',
      accent: 'bg-orange-500',
      icon: 'text-orange-600 dark:text-orange-400'
    },
    'transition metal': {
      bg: 'bg-yellow-100 dark:bg-yellow-950',
      border: 'border-yellow-300 dark:border-yellow-700',
      accent: 'bg-yellow-500',
      icon: 'text-yellow-600 dark:text-yellow-400'
    },
    'metal': {
      bg: 'bg-blue-100 dark:bg-blue-950',
      border: 'border-blue-300 dark:border-blue-700',
      accent: 'bg-blue-500',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    'metalloid': {
      bg: 'bg-green-100 dark:bg-green-950',
      border: 'border-green-300 dark:border-green-700',
      accent: 'bg-green-500',
      icon: 'text-green-600 dark:text-green-400'
    },
    'nonmetal': {
      bg: 'bg-purple-100 dark:bg-purple-950',
      border: 'border-purple-300 dark:border-purple-700',
      accent: 'bg-purple-500',
      icon: 'text-purple-600 dark:text-purple-400'
    },
    'halogen': {
      bg: 'bg-pink-100 dark:bg-pink-950',
      border: 'border-pink-300 dark:border-pink-700',
      accent: 'bg-pink-500',
      icon: 'text-pink-600 dark:text-pink-400'
    },
    'noble gas': {
      bg: 'bg-cyan-100 dark:bg-cyan-950',
      border: 'border-cyan-300 dark:border-cyan-700',
      accent: 'bg-cyan-500',
      icon: 'text-cyan-600 dark:text-cyan-400'
    },
    'lanthanoid': {
      bg: 'bg-indigo-100 dark:bg-indigo-950',
      border: 'border-indigo-300 dark:border-indigo-700',
      accent: 'bg-indigo-500',
      icon: 'text-indigo-600 dark:text-indigo-400'
    },
    'actinoid': {
      bg: 'bg-teal-100 dark:bg-teal-950',
      border: 'border-teal-300 dark:border-teal-700',
      accent: 'bg-teal-500',
      icon: 'text-teal-600 dark:text-teal-400'
    },
    'post-transition metal': {
      bg: 'bg-gray-100 dark:bg-gray-900',
      border: 'border-gray-300 dark:border-gray-700',
      accent: 'bg-gray-500',
      icon: 'text-gray-600 dark:text-gray-400'
    }
  };
  
  return colorClasses[groupBlock] || {
    bg: 'bg-gray-100 dark:bg-gray-900',
    border: 'border-gray-300 dark:border-gray-700',
    accent: 'bg-gray-500',
    icon: 'text-gray-600 dark:text-gray-400'
  };
};

// Traditional periodic table layout - position mapping
const getElementPosition = (atomicNumber) => {
  const positions = {
    1: [1, 1], 2: [1, 18],
    3: [2, 1], 4: [2, 2], 5: [2, 13], 6: [2, 14], 7: [2, 15], 8: [2, 16], 9: [2, 17], 10: [2, 18],
    11: [3, 1], 12: [3, 2], 13: [3, 13], 14: [3, 14], 15: [3, 15], 16: [3, 16], 17: [3, 17], 18: [3, 18],
    19: [4, 1], 20: [4, 2], 21: [4, 3], 22: [4, 4], 23: [4, 5], 24: [4, 6], 25: [4, 7], 26: [4, 8], 27: [4, 9], 28: [4, 10], 29: [4, 11], 30: [4, 12], 31: [4, 13], 32: [4, 14], 33: [4, 15], 34: [4, 16], 35: [4, 17], 36: [4, 18],
    37: [5, 1], 38: [5, 2], 39: [5, 3], 40: [5, 4], 41: [5, 5], 42: [5, 6], 43: [5, 7], 44: [5, 8], 45: [5, 9], 46: [5, 10], 47: [5, 11], 48: [5, 12], 49: [5, 13], 50: [5, 14], 51: [5, 15], 52: [5, 16], 53: [5, 17], 54: [5, 18],
    55: [6, 1], 56: [6, 2], 72: [6, 4], 73: [6, 5], 74: [6, 6], 75: [6, 7], 76: [6, 8], 77: [6, 9], 78: [6, 10], 79: [6, 11], 80: [6, 12], 81: [6, 13], 82: [6, 14], 83: [6, 15], 84: [6, 16], 85: [6, 17], 86: [6, 18],
    87: [7, 1], 88: [7, 2], 104: [7, 4], 105: [7, 5], 106: [7, 6], 107: [7, 7], 108: [7, 8], 109: [7, 9], 110: [7, 10], 111: [7, 11], 112: [7, 12], 113: [7, 13], 114: [7, 14], 115: [7, 15], 116: [7, 16], 117: [7, 17], 118: [7, 18],
    // Lanthanoids
    57: [9, 3], 58: [9, 4], 59: [9, 5], 60: [9, 6], 61: [9, 7], 62: [9, 8], 63: [9, 9], 64: [9, 10], 65: [9, 11], 66: [9, 12], 67: [9, 13], 68: [9, 14], 69: [9, 15], 70: [9, 16], 71: [9, 17],
    // Actinoids
    89: [10, 3], 90: [10, 4], 91: [10, 5], 92: [10, 6], 93: [10, 7], 94: [10, 8], 95: [10, 9], 96: [10, 10], 97: [10, 11], 98: [10, 12], 99: [10, 13], 100: [10, 14], 101: [10, 15], 102: [10, 16], 103: [10, 17]
  };
  return positions[atomicNumber] || [1, 1];
};

// Mobile layout - organize elements in groups of 4 per row by periods
const getMobileRows = (elements) => {
  const periods = {
    1: [1, 2],
    2: [3, 4, 5, 6, 7, 8, 9, 10],
    3: [11, 12, 13, 14, 15, 16, 17, 18],
    4: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    5: [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
    6: [55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
    7: [87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118]
  };
  
  const rows = [];
  Object.entries(periods).forEach(([period, atomicNumbers]) => {
    const periodElements = elements.filter(el => atomicNumbers.includes(el.atomicNumber));
    
    // Split into groups of 4
    for (let i = 0; i < periodElements.length; i += 4) {
      const chunk = periodElements.slice(i, i + 4);
      rows.push({
        period: parseInt(period),
        elements: chunk,
        isNewPeriod: i === 0,
        chunkIndex: Math.floor(i / 4)
      });
    }
  });
  
  return rows;
};

export default function PeriodicTable() {
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState(null);
  const { t, isLoading: translationLoading } = useTranslation();

  useEffect(() => {
    const fetchElements = async () => {
      try {
        const response = await fetch('/api/periodic-table');
        const data = await response.json();
        if (data.success) {
          setElements(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch elements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchElements();
  }, []);

  const ElementBox = ({ element }) => (
    <div
      className={getElementClass(element.groupBlock)}
      onClick={() => setSelectedElement(element)}
      title={`${element.name} (${element.symbol})`}
    >
      <div className="text-xs font-normal leading-none">{element.atomicNumber}</div>
      <div className="font-bold leading-none">{element.symbol}</div>
    </div>
  );

  if (loading || translationLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-text dark:text-text-dark">{t('loading', 'Loading...')}</div>
      </div>
    );
  }

  const mobileRows = getMobileRows(elements);

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Title */}
      <h1 className="text-3xl font-bold text-text dark:text-text-dark mb-6 text-center">
        {t('periodic_table.title', 'Periodic Table of Elements')}
      </h1>

      {/* Desktop Layout - Traditional Grid */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Main periodic table */}
          <div className="inline-block min-w-max">
            {/* Period 1 */}
            <div className="flex gap-1 mb-1">
              <ElementBox element={elements.find(el => el.atomicNumber === 1)} />
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="w-14 h-14"></div>
              ))}
              <ElementBox element={elements.find(el => el.atomicNumber === 2)} />
            </div>
            
            {/* Period 2 */}
            <div className="flex gap-1 mb-1">
              {[3, 4].map(num => <ElementBox key={num} element={elements.find(el => el.atomicNumber === num)} />)}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-14 h-14"></div>
              ))}
              {[5, 6, 7, 8, 9, 10].map(num => <ElementBox key={num} element={elements.find(el => el.atomicNumber === num)} />)}
            </div>
            
            {/* Period 3 */}
            <div className="flex gap-1 mb-1">
              {[11, 12].map(num => <ElementBox key={num} element={elements.find(el => el.atomicNumber === num)} />)}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-14 h-14"></div>
              ))}
              {[13, 14, 15, 16, 17, 18].map(num => <ElementBox key={num} element={elements.find(el => el.atomicNumber === num)} />)}
            </div>
            
            {/* Period 4 */}
            <div className="flex gap-1 mb-1">
              {Array.from({ length: 18 }, (_, i) => {
                const atomicNumber = 19 + i;
                return <ElementBox key={atomicNumber} element={elements.find(el => el.atomicNumber === atomicNumber)} />;
              })}
            </div>
            
            {/* Period 5 */}
            <div className="flex gap-1 mb-1">
              {Array.from({ length: 18 }, (_, i) => {
                const atomicNumber = 37 + i;
                return <ElementBox key={atomicNumber} element={elements.find(el => el.atomicNumber === atomicNumber)} />;
              })}
            </div>
            
            {/* Period 6 */}
            <div className="flex gap-1 mb-1">
              {[55, 56].map(num => <ElementBox key={num} element={elements.find(el => el.atomicNumber === num)} />)}
              <div className="w-14 h-14 flex items-center justify-center text-lg font-bold text-text dark:text-text-dark">*</div>
              {[72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86].map(num => 
                <ElementBox key={num} element={elements.find(el => el.atomicNumber === num)} />
              )}
            </div>
            
            {/* Period 7 */}
            <div className="flex gap-1 mb-4">
              {[87, 88].map(num => <ElementBox key={num} element={elements.find(el => el.atomicNumber === num)} />)}
              <div className="w-14 h-14 flex items-center justify-center text-lg font-bold text-text dark:text-text-dark">**</div>
              {[104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118].map(num => 
                <ElementBox key={num} element={elements.find(el => el.atomicNumber === num)} />
              )}
            </div>
            
            {/* Lanthanoids */}
            <div className="flex gap-1 mb-1 ml-12">
              <div className="w-14 h-14 flex items-center justify-center text-sm font-bold text-text dark:text-text-dark">*</div>
              {Array.from({ length: 15 }, (_, i) => {
                const atomicNumber = 57 + i;
                return <ElementBox key={atomicNumber} element={elements.find(el => el.atomicNumber === atomicNumber)} />;
              })}
            </div>
            
            {/* Actinoids */}
            <div className="flex gap-1 ml-12">
              <div className="w-14 h-14 flex items-center justify-center text-sm font-bold text-text dark:text-text-dark">**</div>
              {Array.from({ length: 15 }, (_, i) => {
                const atomicNumber = 89 + i;
                return <ElementBox key={atomicNumber} element={elements.find(el => el.atomicNumber === atomicNumber)} />;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Rows of 4 */}
      <div className="lg:hidden">
        {mobileRows.map((row, index) => (
          <div key={index}>
            {row.isNewPeriod && row.chunkIndex > 0 && (
              <div className="h-4"></div>
            )}
            <div className="flex justify-center gap-1 mb-2">
              {row.elements.map(element => (
                <ElementBox key={element.atomicNumber} element={element} />
              ))}
              {/* Fill empty spots in the row */}
              {row.elements.length < 4 && Array.from({ length: 4 - row.elements.length }).map((_, i) => (
                <div key={`empty-${i}`} className="w-12 h-12"></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 dark:bg-red-900 border border-border dark:border-border-dark"></div>
          <span className="text-text dark:text-text-dark">{t('periodic_table.alkali_metals', 'Alkali Metals')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-200 dark:bg-orange-900 border border-border dark:border-border-dark"></div>
          <span className="text-text dark:text-text-dark">{t('periodic_table.alkaline_earth', 'Alkaline Earth')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900 border border-border dark:border-border-dark"></div>
          <span className="text-text dark:text-text-dark">{t('periodic_table.transition_metals', 'Transition Metals')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-200 dark:bg-purple-900 border border-border dark:border-border-dark"></div>
          <span className="text-text dark:text-text-dark">{t('periodic_table.nonmetals', 'Nonmetals')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 dark:bg-green-900 border border-border dark:border-border-dark"></div>
          <span className="text-text dark:text-text-dark">{t('periodic_table.metalloids', 'Metalloids')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-200 dark:bg-pink-900 border border-border dark:border-border-dark"></div>
          <span className="text-text dark:text-text-dark">{t('periodic_table.halogens', 'Halogens')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyan-200 dark:bg-cyan-900 border border-border dark:border-border-dark"></div>
          <span className="text-text dark:text-text-dark">{t('periodic_table.noble_gases', 'Noble Gases')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-200 dark:bg-indigo-900 border border-border dark:border-border-dark"></div>
          <span className="text-text dark:text-text-dark">{t('periodic_table.lanthanoids', 'Lanthanoids')}</span>
        </div>
      </div>

      {/* Element Details Modal */}
      {selectedElement && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
          onClick={() => setSelectedElement(null)}
        >
          <div 
            className={`${getElementModalColors(selectedElement.groupBlock).bg} ${getElementModalColors(selectedElement.groupBlock).border} border-2 rounded-xl p-4 md:p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100 hover:scale-[1.02]`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with element symbol and close button */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`${getElementModalColors(selectedElement.groupBlock).accent} w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                  {selectedElement.symbol}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text dark:text-text-dark">
                    {selectedElement.name}
                  </h2>
                  <p className={`text-sm font-medium ${getElementModalColors(selectedElement.groupBlock).icon}`}>
                    {selectedElement.groupBlock}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedElement(null)}
                className="text-text-secondary dark:text-text-dark-secondary hover:text-text dark:hover:text-text-dark transition-colors duration-200 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {/* Accent line */}
            <div className={`${getElementModalColors(selectedElement.groupBlock).accent} h-1 w-full rounded-full mb-6`}></div>

            {/* Properties Grid */}
            <div className="grid gap-4">
              {/* Basic Properties */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Atom className={`w-5 h-5 ${getElementModalColors(selectedElement.groupBlock).icon}`} />
                    <span className="font-semibold text-text dark:text-text-dark">
                      {t('periodic_table.atomic_number', 'Atomic Number')}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-text dark:text-text-dark">{selectedElement.atomicNumber}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Weight className={`w-5 h-5 ${getElementModalColors(selectedElement.groupBlock).icon}`} />
                    <span className="font-semibold text-text dark:text-text-dark">
                      {t('periodic_table.atomic_mass', 'Atomic Mass')}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-text dark:text-text-dark">{selectedElement.atomicMass}</p>
                </div>
              </div>

              {/* Electron Configuration */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className={`w-5 h-5 ${getElementModalColors(selectedElement.groupBlock).icon}`} />
                  <span className="font-semibold text-text dark:text-text-dark">
                    {t('periodic_table.electron_config', 'Electronic Configuration')}
                  </span>
                </div>
                <p className="text-lg font-mono text-text dark:text-text-dark bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  {selectedElement.electronicConfiguration}
                </p>
              </div>

              {/* Physical Properties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedElement.electronegativity && (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className={`w-5 h-5 ${getElementModalColors(selectedElement.groupBlock).icon}`} />
                      <span className="font-semibold text-text dark:text-text-dark">
                        {t('periodic_table.electronegativity', 'Electronegativity')}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-text dark:text-text-dark">{selectedElement.electronegativity}</p>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Beaker className={`w-5 h-5 ${getElementModalColors(selectedElement.groupBlock).icon}`} />
                    <span className="font-semibold text-text dark:text-text-dark">
                      {t('periodic_table.state', 'Standard State')}
                    </span>
                  </div>
                  <p className="text-lg capitalize text-text dark:text-text-dark">{selectedElement.standardState}</p>
                </div>
              </div>

              {/* Temperature Properties */}
              {(selectedElement.meltingPoint || selectedElement.boilingPoint) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedElement.meltingPoint && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer className={`w-5 h-5 ${getElementModalColors(selectedElement.groupBlock).icon}`} />
                        <span className="font-semibold text-text dark:text-text-dark">
                          {t('periodic_table.melting_point', 'Melting Point')}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-text dark:text-text-dark">
                        {selectedElement.meltingPoint}K
                        <span className="text-sm text-text-secondary dark:text-text-dark-secondary ml-2">
                          ({(selectedElement.meltingPoint - 273.15).toFixed(1)}°C)
                        </span>
                      </p>
                    </div>
                  )}

                  {selectedElement.boilingPoint && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Gauge className={`w-5 h-5 ${getElementModalColors(selectedElement.groupBlock).icon}`} />
                        <span className="font-semibold text-text dark:text-text-dark">
                          {t('periodic_table.boiling_point', 'Boiling Point')}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-text dark:text-text-dark">
                        {selectedElement.boilingPoint}K
                        <span className="text-sm text-text-secondary dark:text-text-dark-secondary ml-2">
                          ({(selectedElement.boilingPoint - 273.15).toFixed(1)}°C)
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Discovery */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className={`w-5 h-5 ${getElementModalColors(selectedElement.groupBlock).icon}`} />
                  <span className="font-semibold text-text dark:text-text-dark">
                    {t('periodic_table.discovered', 'Year Discovered')}
                  </span>
                </div>
                <p className="text-lg font-bold text-text dark:text-text-dark">{selectedElement.yearDiscovered}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}