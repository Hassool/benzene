// src/components/tools.Ceb.jsx

"use client";

import { useEffect, useState } from "react";
import { GiChemicalDrop } from "react-icons/gi";
import { FiRefreshCw, FiCheck, FiAlertCircle } from "react-icons/fi";
import { useTranslation } from 'l_i18n';

function Ceb() {
  const { t, isRTL } = useTranslation();
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
        // Try to use the error code if available, otherwise fallback message or unknown
        const errCode = data.errorCode;
        if (errCode && t(`tools.ceb.errors.${errCode}`) !== `tools.ceb.errors.${errCode}`) {
             setError(t(`tools.ceb.errors.${errCode}`));
        } else {
             setError(data.error || t("tools.ceb.errors.unknown"));
        }
        setResult(null);
      }
    } catch (err) {
      setError(t("tools.ceb.errors.network") + " (" + err.message + ")");
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
    <div 
      className={`min-h-screen bg-gradient-to-br from-bg to-bg-secondary dark:from-bg-dark dark:to-bg-dark-secondary p-6 transition-colors duration-300 ${isRTL ? 'rtl' : 'text-left'}`}
      dir={isRTL ? 'rtl' : 'text-left'}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="p-4 bg-blue-500/20 dark:bg-blue-400/20 rounded-full">
              <GiChemicalDrop className="text-5xl text-blue-400 dark:text-blue-300" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-text dark:text-text-dark mb-3 font-montserrat">
            {t("tools.ceb.header.title")}
          </h1>
          <h3 className="text-sm font-thin text-text-secondary dark:text-text-dark-secondary mb-3 font-inter">
            {t("tools.ceb.header.poweredBy")}
          </h3>
          <p className="text-text-secondary dark:text-text-dark-secondary text-lg max-w-2xl mx-auto font-inter">
            {t("tools.ceb.header.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm border border-border dark:border-border-dark rounded-2xl p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label 
                    htmlFor="equation" 
                    className={`block text-blue-400 dark:text-blue-300 font-semibold text-lg mb-3 font-montserrat ${isRTL ? 'text-right' : ''}`}
                  >
                    {t("tools.ceb.form.label")}
                  </label>
                  <div className="relative">
                    <input
                      id="equation"
                      type="text"
                      value={equation}
                      onChange={(e) => setEquation(e.target.value)}
                      className={`w-full px-4 py-4 bg-bg dark:bg-bg-dark-secondary border-2 border-border dark:border-border-dark rounded-xl text-text dark:text-text-dark text-lg focus:outline-none focus:border-blue-400 dark:focus:border-blue-300 focus:ring-2 focus:ring-blue-400/30 dark:focus:ring-blue-300/30 transition-all duration-200 placeholder:text-text-secondary dark:placeholder:text-text-dark-secondary font-mono text-left`}
                      placeholder={t("tools.ceb.form.placeholder")}
                      disabled={loading}
                    />
                    {loading && (
                      <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'}`}>
                        <FiRefreshCw className="text-blue-400 dark:text-blue-300 animate-spin text-xl" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !equation.trim()}
                  className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 dark:hover:shadow-blue-400/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 font-montserrat ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="animate-spin text-xl" />
                      {t("tools.ceb.form.buttonBalancing")}
                    </>
                  ) : (
                    <>
                      <GiChemicalDrop className="text-xl" />
                      {t("tools.ceb.form.buttonBalance")}
                    </>
                  )}
                </button>
              </form>

              {/* Result Section */}
              <div className="mt-8">
                {error && (
                  <div className={`bg-red-900/30 dark:bg-red-800/20 border-l-4 border-red-500 dark:border-red-400 p-6 rounded-lg ${isRTL ? 'border-l-0 border-r-4' : ''}`}>
                    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <FiAlertCircle className="text-red-400 dark:text-red-300 text-xl mt-0.5 flex-shrink-0" />
                      <div className={isRTL ? 'text-right' : ''}>
                        <h3 className="text-red-400 dark:text-red-300 font-semibold text-lg mb-1 font-montserrat">
                          {t("tools.ceb.result.errorTitle")}
                        </h3>
                        <p className="text-red-300 dark:text-red-200 font-inter">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {result && !loading && (
                  <div className={`bg-blue-900/30 dark:bg-blue-800/20 border-l-4 border-blue-400 dark:border-blue-300 p-6 rounded-lg text-left`}>
                    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <FiCheck className="text-blue-400 dark:text-blue-300 text-xl mt-0.5 flex-shrink-0" />
                      <div className={`w-full ${isRTL ? 'text-right' : ''}`}>
                        <h3 className="text-blue-400 dark:text-blue-300 font-semibold text-lg mb-3 font-montserrat">
                          {t("tools.ceb.result.successTitle")}
                        </h3>
                        <div className="bg-bg dark:bg-bg-dark-secondary p-4 rounded-lg border border-border dark:border-border-dark">
                          <div className={`font-mono text-xl text-text dark:text-text-dark break-all ${isRTL ? 'text-right' : ''}`}>
                            {result}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm border border-border dark:border-border-dark rounded-2xl my-6 p-6">
                <h3 className={`text-blue-400 dark:text-blue-300 font-semibold text-lg mb-4 font-montserrat ${isRTL ? 'text-right' : ''}`}>
                  {t("tools.ceb.history.title")}
                </h3>
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.timestamp}
                      className="p-3 bg-bg dark:bg-bg-dark-secondary rounded-lg border border-border dark:border-border-dark"
                    >
                      <div className={`text-text-secondary dark:text-text-dark-secondary text-xs mb-1 font-inter ${isRTL ? 'text-right' : ''}`}>
                        {t("tools.ceb.history.original")}
                      </div>
                      <div className={`text-left font-mono text-sm text-text dark:text-text-dark mb-2 ${isRTL ? 'text-right' : ''}`}>
                        {item.original}
                      </div>
                      <div className={`text-blue-400 dark:text-blue-300 text-xs mb-1 font-inter ${isRTL ? 'text-right' : ''}`}>
                        {t("tools.ceb.history.balanced")}
                      </div>
                      <div className={`text-left font-mono text-sm text-blue-300 dark:text-blue-200 ${isRTL ? 'text-right' : ''}`}>
                        {item.balanced}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips */}
            <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm border border-border dark:border-border-dark rounded-2xl p-6">
              <h3 className={`text-blue-400 dark:text-blue-300 font-semibold text-lg mb-4 font-montserrat ${isRTL ? 'text-right' : ''}`}>
                {t("tools.ceb.tips.title")}
              </h3>
              <ul className={`text-text-secondary dark:text-text-dark-secondary text-sm space-y-2 font-inter ${isRTL ? 'text-right' : ''}`}>
                <li>{isRTL ? '•' : '•'} {t("tools.ceb.tips.tip1")}</li>
                <li>{isRTL ? '•' : '•'} {t("tools.ceb.tips.tip2")}</li>
                <li>{isRTL ? '•' : '•'} {t("tools.ceb.tips.tip3")}</li>
                <li>{isRTL ? '•' : '•'} {t("tools.ceb.tips.tip4")}</li>
              </ul>
            </div>  

            {/* Example Equations */}
            <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm border border-border dark:border-border-dark rounded-2xl p-6">
              <h3 className={`text-blue-400 dark:text-blue-300 font-semibold text-lg mb-4 flex items-center gap-2 font-montserrat ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <GiChemicalDrop className="text-xl" />
                {t("tools.ceb.examples.title")}
              </h3>
              <div className="space-y-3">
                {exampleEquations.map((eq, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(eq)}
                    className={`w-full p-3 bg-bg dark:bg-bg-dark-secondary hover:bg-blue-900/30 dark:hover:bg-blue-800/20 border border-border dark:border-border-dark hover:border-blue-500 dark:hover:border-blue-400 rounded-lg transition-all duration-200 text-text-secondary dark:text-text-dark-secondary hover:text-blue-300 dark:hover:text-blue-200 font-mono text-sm text-left`}
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