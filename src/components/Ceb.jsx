// src/components/Ceb.js

"use client";

import { useEffect, useState } from "react";
import { GiChemicalDrop } from "react-icons/gi";
import { FiRefreshCw, FiCheck, FiAlertCircle } from "react-icons/fi";

function Ceb() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [equation, setEquation] = useState("H2O2=H2O+O2");
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchBalance = async (eq) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/balance?equation=${encodeURIComponent(eq)}`);
      const data = await res.json();
      
      if (data.success) {
        const bbData = fixing(data.balanced)
        setResult(bbData);
        // Add to history
        setHistory(prev => [
          { original: eq, balanced: data.balanced, timestamp: Date.now() },
          ...prev.slice(0, 4) // Keep only last 5 entries
        ]);
      } else {
        setError(data.error);
        setResult(null);
      }
    } catch (err) {
      setError("Network error: " + err.message);
      setResult(null);
    }
    setLoading(false);
  };

  const fixing = (data)=>{
    const text = data;
    const word = "Reaction";

    // Find the position of the word
    const position = text.indexOf(word);

    // Extract text before the word
    if (position !== -1) {
        const result = text.substring(0, position).trim();
        return result;
    } else {
        return text;
    }
  }

  useEffect(() => {
    fetchBalance(equation);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (equation.trim()) {
      fetchBalance(equation);
    }
  };

  const exampleEquations = [
    "C2H6+O2=CO2+H2O",
    "Fe+O2=Fe2O3",
    "NH3+O2=NO+H2O",
    "Ca(OH)2+H3PO4=Ca3(PO4)2+H2O"
  ];

  const handleExampleClick = (exampleEq) => {
    setEquation(exampleEq);
    fetchBalance(exampleEq);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-blue-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="p-4 bg-blue-500/20 rounded-full">
              <GiChemicalDrop className="text-5xl text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Chemical Equation Balancer
          </h1>
          <h3 className="text-s font-thin text-white mb-3">
            Powered by webqc.org
          </h3>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Balance chemical equations instantly with our intelligent algorithm. 
            Enter your unbalanced equation and get accurate stoichiometric coefficients.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="equation" className="block text-blue-400 font-semibold text-lg mb-3">
                    Enter Chemical Equation:
                  </label>
                  <div className="relative">
                    <input
                      id="equation"
                      type="text"
                      value={equation}
                      onChange={(e) => setEquation(e.target.value)}
                      className="w-full px-4 py-4 bg-gray-900/70 border-2 border-gray-600 rounded-xl text-white text-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200 placeholder:text-gray-500"
                      placeholder="e.g., H2O2=H2O+O2"
                      disabled={loading}
                    />
                    {loading && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <FiRefreshCw className="text-blue-400 animate-spin text-xl" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !equation.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="animate-spin text-xl" />
                      Balancing...
                    </>
                  ) : (
                    <>
                      <GiChemicalDrop className="text-xl" />
                      Balance Equation
                    </>
                  )}
                </button>
              </form>

              {/* Result Section */}
              <div className="mt-8">
                {error && (
                  <div className="bg-red-900/30 border-l-4 border-red-500 p-6 rounded-lg">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="text-red-400 text-xl mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-red-400 font-semibold text-lg mb-1">Error</h3>
                        <p className="text-red-300">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {result && !loading && (
                  <div className="bg-blue-900/30 border-l-4 border-blue-400 p-6 rounded-lg">
                    <div className="flex items-start gap-3">
                      <FiCheck className="text-blue-400 text-xl mt-0.5 flex-shrink-0" />
                      <div className="w-full">
                        <h3 className="text-blue-400 font-semibold text-lg mb-3">Balanced Equation</h3>
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                          <div className="font-mono text-xl text-white break-all">{result}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl my-6 p-6">
                <h3 className="text-blue-400 font-semibold text-lg mb-4">Recent History</h3>
                <div className="space-y-3">
                  {history.map((item) => (
                    <button
                      key={item.timestamp}
                      className="p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                    >
                      <div className="text-gray-400 text-xs mb-1">Original:</div>
                      <div className="font-mono text-sm text-gray-300 mb-2">{item.original}</div>
                      <div className="text-blue-400 text-xs mb-1">Balanced:</div>
                      <div className="font-mono text-sm text-blue-300">{item.balanced}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">



            {/* Tips */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h3 className="text-blue-400 font-semibold text-lg mb-4">Tips</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Use = to separate reactants and products</li>
                <li>• Write chemical formulas clearly (e.g., H2SO4)</li>
                <li>• Use parentheses for complex compounds</li>
                <li>• Try the examples to get started</li>
              </ul>
            </div>  

            {/* Example Equations */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h3 className="text-blue-400 font-semibold text-lg mb-4 flex items-center gap-2">
                <GiChemicalDrop className="text-xl" />
                Example Equations
              </h3>
              <div className="space-y-3">
                {exampleEquations.map((eq, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(eq)}
                    className="w-full text-left p-3 bg-gray-900/50 hover:bg-blue-900/30 border border-gray-600 hover:border-blue-500 rounded-lg transition-all duration-200 text-gray-300 hover:text-blue-300 font-mono text-sm"
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ceb;