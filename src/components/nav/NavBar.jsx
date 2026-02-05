// src/components/nav/NavBar.jsx
"use client"

import Image from "next/image";
import { TbTools } from "react-icons/tb";
import { MdOutlinePlayLesson, MdOutlineRateReview } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { GoHome } from "react-icons/go";
import NavLink from "./NavLink";
import ThemeSwitcher from "./ThemeSwitcher";
import LangSwitcher from "./LanguageSwitcher";
import { useTranslation } from "l_i18n";



import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const { t,isRTL, isLoading } = useTranslation();
  const NavList = [
    { name: t('nav.home'), icon: <GoHome />, path: '/' },
    { name: t('nav.tools'), icon: <TbTools />, path: '/tools' },
    { name: t('nav.courses'), icon: <MdOutlinePlayLesson />, path: '/Courses' },
    { name: t('nav.exams', 'Exams'), icon: <MdOutlinePlayLesson />, path: '/exams' },
    { name: t('nav.review'), icon: <MdOutlineRateReview />, path: '/review' }
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <nav className={`hidden md:flex bg-bg dark:bg-bg-dark ${isRTL ? "border-l" : "border-r"} border-border dark:border-border-dark fixed ${isRTL ? "right-0" : "left-0"} top-0 h-screen w-64 flex-col px-3 py-8 z-50 transition-colors duration-300`}>
        {/* Logo/Brand */}
        <div className="mb-10 px-3 flex gap-4 items-center">
          <Image
            className="rounded-lg"
            src="/benzen.png"
            alt="benzen logo"
            width={50}
            height={50}
            priority
          />
          <h1 className="text-2xl font-semibold text-text dark:text-text-dark font-montserrat">
            {t('nav.title')}
          </h1>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-2">
          <div className="mb-4 flex justify-around">
            <ThemeSwitcher />
            <LangSwitcher />
          </div>

          {NavList.map((item) => (
            <NavLink key={item.name} item={item} rr={isRTL} />
          ))}
        </div>
      </nav>

      {/* Mobile dropdown */}
      {/* Mobile Header */}
      <div className="md:hidden bg-bg dark:bg-bg-dark border-b border-border dark:border-border-dark z-50 relative flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Image
            className="rounded-lg"
            src="/benzen.png"
            alt="benzen logo"
            width={40}
            height={40}
            priority
          />
          <span className="font-semibold text-text dark:text-text-dark font-montserrat">
            {t('nav.title')}
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-text dark:text-text-dark hover:bg-bg-secondary dark:hover:bg-bg-dark-secondary rounded-lg transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer */}
          <div className={`absolute top-[65px] ${isRTL ? 'right-0' : 'left-0'} w-full bg-bg dark:bg-bg-dark border-b border-border dark:border-border-dark shadow-xl transition-transform duration-300 ease-in-out`}>
            <div className="flex flex-col p-4 space-y-4">
              <div className="flex justify-around pb-4 border-b border-border dark:border-border-dark">
                <ThemeSwitcher />
                <LangSwitcher />
              </div>

              {NavList.map((item) => (
                <div key={item.name} onClick={() => setIsOpen(false)}>
                  <NavLink item={item} rr={isRTL} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
