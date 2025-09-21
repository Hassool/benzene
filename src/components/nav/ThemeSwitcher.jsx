"use client";

import { useEffect, useState } from "react";
import { BsMoonStars, BsSun } from "react-icons/bs";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-between w-20 h-10 rounded-xl
                 border-2 border-special bg-special/10 dark:border-text dark:bg-text/10 
                 overflow-hidden transition-colors duration-300"
    >
      {/* Highlight slider (runs under icons) */}
      <div
        className={`absolute top-0 h-full w-1/2 rounded-lg bg-special dark:bg-text 
                    transition-all duration-300
                    ${theme === "dark" ? "left-1/2" : "left-0"}`}
      />

      {/* Icons on top */}
      <div className="relative z-10 flex justify-between items-center w-full px-2">
        <BsSun size={16} className="text-yellow-400" />
        <BsMoonStars size={16} className="text-blue-400" />
      </div>
    </button>
  );
}
