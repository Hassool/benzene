'use client';

import Link from 'next/link';
import { FaAngleRight } from "react-icons/fa";
import { usePathname } from 'next/navigation';

export default function NavLink({ item ,r,rr}) {
  const pathname = usePathname();
  const isActive = pathname === item.path;

  return (
    <Link 
      href={item.path}
      className={`relative  flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group ${
        isActive 
          ? "bg-special/10 dark:bg-special-dark/20 text-special dark:text-special border border-special/20 dark:border-special-dark/30" 
          : "text-text-secondary dark:text-text-dark-secondary hover:bg-bg-secondary dark:hover:bg-bg-dark-secondary hover:text-text dark:hover:text-text-dark"
      }`}
    >
      <div className={`text-2xl transition-all duration-200 ${
        isActive 
          ? "text-special dark:text-special transform scale-110" 
          : "group-hover:text-special dark:group-hover:text-special group-hover:scale-105"
      }`}>
        {item.icon}
      </div>
      <span className='text-base font-medium font-inter'>
        {item.name}
      </span>
      {isActive && 
      <span className={`text-text dark:text-text-dark  right-1 ${r ? "rotate-90" : ""} ${rr ? "rotate-180" : ""}`}><FaAngleRight/></span>
      }
      
    </Link>
  );
}