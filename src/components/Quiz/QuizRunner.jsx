"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, CheckCircle, XCircle, Award } from "lucide-react";

export default function QuizRunner({ quizzes }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [verified, setVerified] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shake, setShake] = useState(false);
  const [answers, setAnswers] = useState([]); // Track all answers

  const total = quizzes.length;
  const currentQuiz = quizzes[currentIndex];

  if (!currentQuiz || total === 0) {
    return (
      <div className="w-full p-6 text-center bg-bg dark:bg-bg-dark rounded-xl border border-border dark:border-border-dark">
        <p className="text-text-secondary dark:text-text-dark-secondary">
          No quiz questions available.
        </p>
      </div>
    );
  }

  const handleVerify = () => {
    if (!verified && selected !== null) {
      const isCorrect = selected === currentQuiz.answer;
      
      // Store the answer
      setAnswers(prev => [...prev, {
        question: currentQuiz.Question,
        selected,
        correct: currentQuiz.answer,
        isCorrect
      }]);

      if (isCorrect) {
        setProgress((p) => p + 1);
      } else {
        // Trigger shake animation for wrong answer
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      setVerified(true);
    } else if (verified) {
      // Move to next question
      setVerified(false);
      setSelected(null);
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleRedo = () => {
    setCurrentIndex(0);
    setSelected(null);
    setVerified(false);
    setProgress(0);
    setShake(false);
    setAnswers([]);
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreMessage = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return "Excellent work! 🌟";
    if (percentage >= 80) return "Great job! 👏";
    if (percentage >= 70) return "Good effort! 👍";
    if (percentage >= 60) return "Not bad! Keep practicing 📚";
    return "Keep studying and try again! 💪";
  };

  // Quiz completed
  if (currentIndex >= total) {
    return (
      <div className="w-full bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-special/10 dark:bg-special/20 p-6 text-center border-b border-border dark:border-border-dark">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Award className="h-8 w-8 text-special" />
            <h3 className="text-2xl font-bold text-special font-montserrat">
              Quiz Completed!
            </h3>
          </div>
          <p className={`text-lg font-semibold ${getScoreColor(progress, total)}`}>
            Score: {progress} / {total} ({Math.round((progress / total) * 100)}%)
          </p>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
            {getScoreMessage(progress, total)}
          </p>
        </div>

        {/* Results Summary */}
        <div className="p-6">
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {answers.map((answer, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  answer.isCorrect 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {answer.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text dark:text-text-dark mb-2 text-sm">
                      Q{index + 1}: {answer.question}
                    </p>
                    <div className="text-xs space-y-1">
                      <p className={answer.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                        Your answer: {answer.selected}
                      </p>
                      {!answer.isCorrect && (
                        <p className="text-green-700 dark:text-green-300">
                          Correct answer: {answer.correct}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={handleRedo}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-special text-white font-semibold hover:bg-special-hover transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded-xl shadow-lg overflow-hidden font-inter">
      {/* Progress Header */}
      <div className="bg-bg-secondary dark:bg-bg-dark-secondary p-4 border-b border-border dark:border-border-dark">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-text dark:text-text-dark">
            Question {currentIndex + 1} of {total}
          </span>
          <span className="text-sm font-medium text-special">
            Score: {progress}/{total}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-border dark:bg-border-dark rounded-full overflow-hidden">
          <motion.div
            className="h-2 bg-special"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + (verified ? 1 : 0)) / total) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        <div className="relative min-h-[250px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`absolute inset-0 flex flex-col ${
                shake ? "animate-pulse" : ""
              }`}
            >
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                  Question {currentQuiz.order || currentIndex + 1}
                </h4>
                <p className="text-xl font-medium text-text dark:text-text-dark leading-relaxed">
                  {currentQuiz.Question}
                </p>
              </div>
              
              <div className="space-y-3 flex-1">
                {currentQuiz.answers && currentQuiz.answers.map((option, i) => {
                  const isCorrect = option === currentQuiz.answer;
                  const isSelected = option === selected;

                  return (
                    <motion.button
                      key={i}
                      whileHover={!verified ? { scale: 1.02 } : {}}
                      whileTap={!verified ? { scale: 0.98 } : {}}
                      onClick={() => !verified && setSelected(option)}
                      className={`w-full px-6 py-4 rounded-lg border text-left transition-all duration-200 ${
                        verified
                          ? isCorrect
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700"
                            : isSelected
                            ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700"
                            : "bg-bg-secondary dark:bg-bg-dark-secondary text-text-secondary dark:text-text-dark-secondary border-border dark:border-border-dark"
                          : isSelected
                          ? "bg-special/10 text-special border-special ring-2 ring-special/20"
                          : "bg-bg-secondary dark:bg-bg-dark-secondary text-text dark:text-text-dark border-border dark:border-border-dark hover:border-special/50 hover:bg-special/5"
                      }`}
                      disabled={verified}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                          verified && isCorrect
                            ? "border-green-500 bg-green-500 text-white"
                            : verified && isSelected && !isCorrect
                            ? "border-red-500 bg-red-500 text-white"
                            : isSelected
                            ? "border-special bg-special text-white"
                            : "border-border dark:border-border-dark"
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="flex-1">{option}</span>
                        {verified && isCorrect && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
                        {verified && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleVerify}
            disabled={selected === null && !verified}
            className="px-8 py-3 rounded-lg bg-special text-white font-semibold hover:bg-special-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {!verified
              ? "Check Answer"
              : currentIndex < total - 1
              ? "Next Question →"
              : "Finish Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}