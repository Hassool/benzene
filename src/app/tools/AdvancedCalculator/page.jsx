"use client"

import React, { useState, useCallback } from 'react';
import { Calculator, Sigma, TrendingUp, Hash, Pi, Infinity, X, Delete, History } from 'lucide-react';
import * as math from 'mathjs';

const page = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [mode, setMode] = useState('basic');
  const [history, setHistory] = useState([]);
  const [dataSet, setDataSet] = useState([]);
  const [modBase, setModBase] = useState(12);
  const [showHistory, setShowHistory] = useState(false);

  // Basic calculator functions
  const handleNumber = (num) => {
    setDisplay(display === '0' ? num.toString() : display + num);
  };

  const handleOperator = (op) => {
    if (display === 'Error') setDisplay('0');
    setDisplay(display + op);
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleEquals = () => {
    try {
      const result = math.evaluate(display);
      setHistory(prev => [...prev, { expression: display, result: result.toString() }]);
      setDisplay(result.toString());
    } catch (error) {
      setDisplay('Error');
    }
  };

  // Equation solver for polynomials up to degree 3
  const solveEquation = () => {
    try {
      if (!equation.includes('=')) {
        setDisplay('Enter equation with =');
        return;
      }

      const [left, right] = equation.split('=');
      const expr = `(${left}) - (${right})`;
      
      // Try different values to find roots (numerical method)
      const roots = [];
      for (let x = -100; x <= 100; x += 0.1) {
        try {
          const value = math.evaluate(expr, { x });
          if (Math.abs(value) < 0.001) {
            const rounded = Math.round(x * 1000) / 1000;
            if (!roots.some(root => Math.abs(root - rounded) < 0.01)) {
              roots.push(rounded);
            }
          }
        } catch (e) {
          continue;
        }
      }

      if (roots.length > 0) {
        setDisplay(`x = ${roots.join(', ')}`);
        setHistory(prev => [...prev, { expression: equation, result: `x = ${roots.join(', ')}` }]);
      } else {
        setDisplay('No solutions found');
      }
    } catch (error) {
      setDisplay('Invalid equation');
    }
  };

  // Statistical functions
  const calculateExpectedValue = () => {
    if (dataSet.length === 0) {
      setDisplay('Enter data first');
      return;
    }
    const mean = dataSet.reduce((sum, val) => sum + val, 0) / dataSet.length;
    setDisplay(`E(X) = ${mean.toFixed(4)}`);
    setHistory(prev => [...prev, { expression: `E(X) for [${dataSet.join(', ')}]`, result: mean.toFixed(4) }]);
  };

  const calculateVariance = () => {
    if (dataSet.length === 0) {
      setDisplay('Enter data first');
      return;
    }
    const mean = dataSet.reduce((sum, val) => sum + val, 0) / dataSet.length;
    const variance = dataSet.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dataSet.length;
    setDisplay(`V(X) = ${variance.toFixed(4)}`);
    setHistory(prev => [...prev, { expression: `V(X) for [${dataSet.join(', ')}]`, result: variance.toFixed(4) }]);
  };

  const calculateStandardDeviation = () => {
    if (dataSet.length === 0) {
      setDisplay('Enter data first');
      return;
    }
    const mean = dataSet.reduce((sum, val) => sum + val, 0) / dataSet.length;
    const variance = dataSet.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dataSet.length;
    const stdDev = Math.sqrt(variance);
    setDisplay(`σ = ${stdDev.toFixed(4)}`);
    setHistory(prev => [...prev, { expression: `σ for [${dataSet.join(', ')}]`, result: stdDev.toFixed(4) }]);
  };

  // Modular arithmetic
  const calculateMod = () => {
    try {
      const num = parseFloat(display);
      if (isNaN(num)) {
        setDisplay('Invalid number');
        return;
      }
      const result = ((num % modBase) + modBase) % modBase;
      setDisplay(`${num} ≡ ${result} (mod ${modBase})`);
      setHistory(prev => [...prev, { expression: `${num} mod ${modBase}`, result: result.toString() }]);
    } catch (error) {
      setDisplay('Error');
    }
  };

  // Add data point for statistics
  const addDataPoint = () => {
    try {
      const num = parseFloat(display);
      if (!isNaN(num)) {
        setDataSet(prev => [...prev, num]);
        setDisplay('0');
      }
    } catch (error) {
      setDisplay('Invalid number');
    }
  };

  const clearDataSet = () => {
    setDataSet([]);
    setDisplay('Data cleared');
  };

  // Advanced mathematical functions
  const handleAdvancedFunction = (func) => {
    try {
      const num = parseFloat(display);
      if (isNaN(num)) return;
      
      let result;
      switch (func) {
        case 'sin':
          result = Math.sin(num);
          break;
        case 'cos':
          result = Math.cos(num);
          break;
        case 'tan':
          result = Math.tan(num);
          break;
        case 'ln':
          result = Math.log(num);
          break;
        case 'log':
          result = Math.log10(num);
          break;
        case 'sqrt':
          result = Math.sqrt(num);
          break;
        case 'factorial':
          result = math.factorial(Math.floor(num));
          break;
        default:
          return;
      }
      
      setDisplay(result.toString());
      setHistory(prev => [...prev, { expression: `${func}(${num})`, result: result.toString() }]);
    } catch (error) {
      setDisplay('Error');
    }
  };

  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark transition-colors duration-300">
      <div className="container mx-auto p-4 max-w-6xl">
        <h1 className="text-3xl font-montserrat font-bold text-text dark:text-text-dark mb-6 text-center">
          Advanced Mathematical Calculator
        </h1>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Calculator */}
          <div className="lg:col-span-2">
            <div className="bg-bg-secondary dark:bg-bg-dark-secondary rounded-lg p-6 shadow-lg border border-border dark:border-border-dark">
              {/* Mode Selection */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { key: 'basic', label: 'Basic', icon: Calculator },
                  { key: 'equations', label: 'Equations', icon: X },
                  { key: 'statistics', label: 'Statistics', icon: Sigma },
                  { key: 'modular', label: 'Modular', icon: Hash },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setMode(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-inter text-sm transition-all ${
                      mode === key
                        ? 'bg-special text-white shadow-lg'
                        : 'bg-bg dark:bg-bg-dark text-text dark:text-text-dark hover:bg-special-light dark:hover:bg-special-dark'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Display */}
              <div className="mb-4">
                <div className="bg-bg dark:bg-bg-dark rounded-lg p-4 border-2 border-border dark:border-border-dark">
                  <div className="text-right text-2xl font-mono text-text dark:text-text-dark min-h-[40px] overflow-hidden">
                    {display}
                  </div>
                  {mode === 'equations' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={equation}
                        onChange={(e) => setEquation(e.target.value)}
                        placeholder="Enter equation (e.g., x^2 - 5*x + 6 = 0)"
                        className="w-full p-2 bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded text-text dark:text-text-dark font-mono"
                      />
                    </div>
                  )}
                  {mode === 'statistics' && dataSet.length > 0 && (
                    <div className="mt-2 text-sm text-text-secondary dark:text-text-dark-secondary">
                      Data: [{dataSet.join(', ')}]
                    </div>
                  )}
                  {mode === 'modular' && (
                    <div className="mt-2">
                      <label className="text-sm text-text-secondary dark:text-text-dark-secondary">
                        Modulus: 
                        <input
                          type="number"
                          value={modBase}
                          onChange={(e) => setModBase(parseInt(e.target.value) || 12)}
                          className="ml-2 w-20 p-1 bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded text-text dark:text-text-dark"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Button Grid */}
              <div className="grid grid-cols-5 gap-2">
                {mode === 'basic' && (
                  <>
                    {/* Row 1 - Functions */}
                    <button onClick={handleClear} className="btn-secondary col-span-2">Clear</button>
                    <button onClick={handleBackspace} className="btn-secondary"><Delete size={16} /></button>
                    <button onClick={() => handleOperator('/')} className="btn-operator">÷</button>
                    <button onClick={() => handleAdvancedFunction('sqrt')} className="btn-function">√</button>

                    {/* Row 2 */}
                    <button onClick={() => handleNumber(7)} className="btn-number">7</button>
                    <button onClick={() => handleNumber(8)} className="btn-number">8</button>
                    <button onClick={() => handleNumber(9)} className="btn-number">9</button>
                    <button onClick={() => handleOperator('*')} className="btn-operator">×</button>
                    <button onClick={() => handleOperator('^')} className="btn-function">x^y</button>

                    {/* Row 3 */}
                    <button onClick={() => handleNumber(4)} className="btn-number">4</button>
                    <button onClick={() => handleNumber(5)} className="btn-number">5</button>
                    <button onClick={() => handleNumber(6)} className="btn-number">6</button>
                    <button onClick={() => handleOperator('-')} className="btn-operator">−</button>
                    <button onClick={() => handleAdvancedFunction('sin')} className="btn-function">sin</button>

                    {/* Row 4 */}
                    <button onClick={() => handleNumber(1)} className="btn-number">1</button>
                    <button onClick={() => handleNumber(2)} className="btn-number">2</button>
                    <button onClick={() => handleNumber(3)} className="btn-number">3</button>
                    <button onClick={() => handleOperator('+')} className="btn-operator">+</button>
                    <button onClick={() => handleAdvancedFunction('cos')} className="btn-function">cos</button>

                    {/* Row 5 */}
                    <button onClick={() => handleNumber(0)} className="btn-number col-span-2">0</button>
                    <button onClick={() => handleOperator('.')} className="btn-number">.</button>
                    <button onClick={handleEquals} className="btn-special">=</button>
                    <button onClick={() => handleAdvancedFunction('tan')} className="btn-function">tan</button>
                  </>
                )}

                {mode === 'equations' && (
                  <>
                    <button onClick={solveEquation} className="btn-special col-span-3">Solve Equation</button>
                    <button onClick={() => setEquation('')} className="btn-secondary col-span-2">Clear Eq</button>
                    
                    {/* Common equation templates */}
                    <button onClick={() => setEquation('x^2 + x - 6 = 0')} className="btn-function col-span-5">Quadratic Template</button>
                    <button onClick={() => setEquation('x^3 - 6*x^2 + 11*x - 6 = 0')} className="btn-function col-span-5">Cubic Template</button>
                  </>
                )}

                {mode === 'statistics' && (
                  <>
                    <button onClick={addDataPoint} className="btn-function col-span-2">Add Data</button>
                    <button onClick={clearDataSet} className="btn-secondary col-span-2">Clear Data</button>
                    <button onClick={() => setDataSet([1,2,3,4,5])} className="btn-function">Sample</button>
                    
                    <button onClick={calculateExpectedValue} className="btn-special col-span-2">E(X)</button>
                    <button onClick={calculateVariance} className="btn-special">V(X)</button>
                    <button onClick={calculateStandardDeviation} className="btn-special col-span-2">σ</button>
                  </>
                )}

                {mode === 'modular' && (
                  <>
                    <button onClick={calculateMod} className="btn-special col-span-3">Calculate mod</button>
                    <button onClick={() => setDisplay('15')} className="btn-function">15</button>
                    <button onClick={() => setModBase(12)} className="btn-function">mod 12</button>
                    
                    <button onClick={() => setDisplay('23')} className="btn-function">23</button>
                    <button onClick={() => setDisplay('47')} className="btn-function">47</button>
                    <button onClick={() => setDisplay('100')} className="btn-function">100</button>
                    <button onClick={() => setModBase(7)} className="btn-function">mod 7</button>
                    <button onClick={() => setModBase(13)} className="btn-function">mod 13</button>
                  </>
                )}

                {/* Universal number pad for non-basic modes */}
                {mode !== 'basic' && (
                  <div className="col-span-5 mt-4">
                    <div className="grid grid-cols-4 gap-2">
                      {[7,8,9,'C',4,5,6,'⌫',1,2,3,'.',0,'00','+','-'].map((btn, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (btn === 'C') handleClear();
                            else if (btn === '⌫') handleBackspace();
                            else if (['+', '-', '*', '/', '.'].includes(btn)) handleOperator(btn);
                            else handleNumber(btn);
                          }}
                          className="btn-number"
                        >
                          {btn}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* History Panel */}
          <div className="lg:col-span-1">
            <div className="bg-bg-secondary dark:bg-bg-dark-secondary rounded-lg p-4 shadow-lg border border-border dark:border-border-dark">
              <div className="flex items-center gap-2 mb-4">
                <History size={20} className="text-special" />
                <h3 className="font-montserrat font-semibold text-text dark:text-text-dark">History</h3>
                <button 
                  onClick={() => setHistory([])} 
                  className="ml-auto text-xs btn-secondary px-2 py-1"
                >
                  Clear
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {history.length === 0 ? (
                  <p className="text-text-secondary dark:text-text-dark-secondary text-sm">No calculations yet</p>
                ) : (
                  history.slice(-20).reverse().map((item, idx) => (
                    <div 
                      key={idx} 
                      className="p-2 bg-bg dark:bg-bg-dark rounded border border-border dark:border-border-dark cursor-pointer hover:bg-special-light dark:hover:bg-special-dark/20 transition-colors"
                      onClick={() => setDisplay(item.result)}
                    >
                      <div className="text-xs text-text-secondary dark:text-text-dark-secondary font-mono break-all">
                        {item.expression}
                      </div>
                      <div className="text-sm font-mono text-text dark:text-text-dark font-semibold break-all">
                        = {item.result}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .btn-number {
          @apply bg-bg dark:bg-bg-dark text-text dark:text-text-dark border border-border dark:border-border-dark rounded-lg p-3 font-mono text-lg hover:bg-bg-secondary dark:hover:bg-bg-dark-secondary transition-colors;
        }
        .btn-operator {
          @apply bg-special text-white rounded-lg p-3 font-mono text-lg hover:bg-special-hover transition-colors shadow-md;
        }
        .btn-function {
          @apply bg-text dark:bg-text-dark text-bg dark:text-bg-dark rounded-lg p-3 font-inter text-sm hover:bg-text-secondary dark:hover:bg-text-dark-secondary transition-colors;
        }
        .btn-special {
          @apply bg-special text-white rounded-lg p-3 font-inter font-semibold hover:bg-special-hover transition-colors shadow-lg;
        }
        .btn-secondary {
          @apply bg-border dark:bg-border-dark text-text dark:text-text-dark rounded-lg p-3 font-inter text-sm hover:bg-text-secondary dark:hover:bg-text-dark-secondary hover:text-bg dark:hover:text-bg-dark transition-colors;
        }
      `}</style>
    </div>
  );
};

export default page;