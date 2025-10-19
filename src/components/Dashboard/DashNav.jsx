'use client'

import { Book, User, UserRoundCheck, Menu, X, Shield, ChevronDown, LogOut, Settings, Mail } from 'lucide-react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import NavLink from '../nav/NavLink'
import { GoHome } from 'react-icons/go'
import { useTranslation } from "@/lib/TranslationProvider"

function DashNav() {
  const { t, isLoading: translationLoading, lang } = useTranslation()
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Navigation items with translations
  const NavList = [
    { name: t('dashNav.nav.home'), icon: <GoHome className="h-5 w-5" />, path: "/" },
    { name: t('dashNav.nav.profile'), path: "/dashboard", icon: <User className="h-5 w-5" /> },
    { name: t('dashNav.nav.courses'), path: "/dashboard/courses", icon: <Book className="h-5 w-5" /> }
  ]

  const AdminCheck = { 
    name: t('dashNav.nav.checkDemands'), 
    path: "/dashboard/check", 
    icon: <UserRoundCheck className="h-5 w-5" />,
    adminOnly: true
  }

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [pathname])

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-nav-container')) {
        setIsMobileMenuOpen(false)
      }
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobileMenuOpen, isUserMenuOpen])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  if (status === 'loading' || translationLoading) {
    return (
      <nav className="bg-gradient-light dark:bg-gradient-dark p-4 shadow-lg fixed top-0 w-full z-50 transition-all duration-300 border-b border-border/10 dark:border-border-dark/10">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="animate-pulse bg-border/30 dark:bg-border-dark/30 h-8 w-32 rounded-xl"></div>
          <div className="animate-pulse bg-border/30 dark:bg-border-dark/30 h-10 w-40 rounded-xl"></div>
        </div>
      </nav>
    )
  }

  // Build navigation items based on user permissions
  const allNavItems = [
    ...NavList,
    ...(session?.user?.isAdmin ? [AdminCheck] : [])
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`
        bg-gradient-light dark:bg-gradient-dark backdrop-blur-xl p-4 shadow-lg fixed top-0 w-full z-50 
        transition-all duration-300 border-b
        ${isScrolled 
          ? 'shadow-2xl shadow-special/5 dark:shadow-special-dark/10 border-border/30 dark:border-border-dark/30' 
          : 'border-border/10 dark:border-border-dark/10'
        }
        ${lang === 'ar' ? 'rtl' : 'ltr'}
      `}>
        <div className="max-w-7xl mx-auto">
          {/* Mobile Menu Button */}
          <div className="lg:hidden flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-special/20 dark:bg-special-dark/30 rounded-xl flex items-center justify-center">
                <Book className="h-4 w-4 text-special dark:text-special-light" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-text dark:text-text-dark">{t('dashNav.nav.dashboard')}</h1>
                {session?.user?.isAdmin && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-special/10 dark:bg-special-dark/20 text-special dark:text-special-light text-xs rounded-full">
                    <Shield className="h-3 w-3" />
                    <span>{t('dashNav.user.admin')}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={toggleMobileMenu}
              className="p-2.5 text-text dark:text-text-dark hover:bg-special/10 dark:hover:bg-special-dark/20 rounded-xl transition-all duration-200 hover:scale-105"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-special/20 dark:bg-special-dark/30 rounded-xl flex items-center justify-center">
                <Book className="h-5 w-5 text-special dark:text-special-light" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text dark:text-text-dark">{t('dashNav.nav.dashboard')}</h1>
                <p className="text-xs text-text-secondary dark:text-text-dark-secondary">{t('dashNav.nav.subtitle')}</p>
              </div>
            </div>

            <ul className="flex items-center gap-2">
              {allNavItems.map((item, i) => (
                <li key={i} className="relative group">
                  <NavLink 
                    item={item} 
                    className="relative px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-105" 
                  />
                  {item.adminOnly && (
                    <div className="absolute -top-1 -right-1 bg-special dark:bg-special-dark text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                      <Shield className="h-2.5 w-2.5" />
                    </div>
                  )}
                  {item.yacineOnly && (
                    <div className="absolute -top-1 -right-1 bg-purple-500 dark:bg-purple-400 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                      <Mail className="h-2.5 w-2.5" />
                    </div>
                  )}
                  {/* Hover tooltip */}
                  <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-text dark:bg-text-dark text-bg dark:text-bg-dark px-3 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {item.name}
                    {item.adminOnly && <span className="text-blue-300"> ({t('dashNav.user.adminOnly')})</span>}
                  </span>
                </li>
              ))}
            </ul>

            {/* User Menu for Desktop */}
            <div className="relative user-menu-container">
              <button
                onClick={toggleUserMenu}
                className="flex items-center gap-3 px-4 py-2.5 bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 hover:bg-bg-secondary/70 dark:hover:bg-bg-dark-secondary/70 rounded-xl transition-all duration-200 hover:scale-105 group"
              >
                <div className={`text-${lang === 'ar' ? 'left' : 'right'}`}>
                  <p className="text-sm font-medium text-text dark:text-text-dark truncate max-w-32">
                    {session?.user?.fullName || t('dashNav.user.user')}
                  </p>
                  {session?.user?.isAdmin && (
                    <p className="text-xs text-special dark:text-special-light font-medium">{t('dashNav.user.administrator')}</p>
                  )}
                </div>
                <div className="h-10 w-10 bg-special/20 dark:bg-special-dark/30 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-special dark:text-special-light" />
                </div>
                <ChevronDown className={`h-4 w-4 text-text-secondary dark:text-text-dark-secondary transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className={`absolute ${lang === 'ar' ? 'left-0' : 'right-0'} top-full mt-2 w-64 bg-bg dark:bg-bg-dark border border-border/30 dark:border-border-dark/30 rounded-2xl shadow-2xl shadow-special/10 dark:shadow-special-dark/20 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}>
                  <div className="p-4 border-b border-border/20 dark:border-border-dark/20">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-special/20 dark:bg-special-dark/30 rounded-xl flex items-center justify-center">
                        <User className="h-6 w-6 text-special dark:text-special-light" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-text dark:text-text-dark truncate">
                          {session?.user?.fullName || t('dashNav.user.user')}
                        </p>
                        <p className="text-sm text-text-secondary dark:text-text-dark-secondary truncate">
                          {session?.user?.phoneNumber}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {session?.user?.isAdmin && (
                            <div className="flex items-center gap-1">
                              <Shield className="h-3 w-3 text-special dark:text-special-light" />
                              <span className="text-xs text-special dark:text-special-light font-medium">{t('dashNav.user.admin')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-special/10 dark:hover:bg-special-dark/20 text-text dark:text-text-dark hover:text-special dark:hover:text-special-light transition-all duration-200"
                    >
                      <Settings className="h-4 w-4" />
                      <span>{t('dashNav.user.settings')}</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-text dark:text-text-dark hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t('dashNav.user.signOut')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300">
          <div className={`fixed top-0 ${lang === 'ar' ? 'left-0 border-r' : 'right-0 border-l'} h-full w-80 max-w-[90vw] bg-gradient-light dark:bg-gradient-dark shadow-2xl transform transition-transform duration-300 mobile-nav-container border-border/30 dark:border-border-dark/30`}>
            <div className="p-6 h-full overflow-y-auto">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-special/20 dark:bg-special-dark/30 rounded-xl flex items-center justify-center">
                    <Book className="h-4 w-4 text-special dark:text-special-light" />
                  </div>
                  <h2 className="text-lg font-bold text-text dark:text-text-dark">{t('dashNav.nav.navigation')}</h2>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-text dark:text-text-dark hover:bg-special/10 dark:hover:bg-special-dark/20 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Info for Mobile */}
              <div className="mb-8 p-4 bg-bg-secondary/30 dark:bg-bg-dark-secondary/30 rounded-2xl border border-border/20 dark:border-border-dark/20">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-special/20 dark:bg-special-dark/30 rounded-2xl flex items-center justify-center">
                    <User className="h-7 w-7 text-special dark:text-special-light" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text dark:text-text-dark">
                      {session?.user?.fullName || t('dashNav.user.user')}
                    </p>
                    <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                      {session?.user?.phoneNumber}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {session?.user?.isAdmin && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-special/10 dark:bg-special-dark/20 rounded-full">
                          <Shield className="h-3 w-3 text-special dark:text-special-light" />
                          <span className="text-xs text-special dark:text-special-light font-medium">{t('dashNav.user.admin')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Items */}
              <nav className="space-y-2 mb-6">
                {allNavItems.map((item, i) => (
                  <div key={i} className="relative">
                    <Link
                      href={item.path}
                      className={`
                        flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group
                        hover:bg-special/10 dark:hover:bg-special-dark/20 hover:text-special dark:hover:text-special-light
                        ${pathname === item.path 
                          ? 'bg-special dark:bg-special-dark text-white shadow-xl shadow-special/20 dark:shadow-special-dark/30' 
                          : 'text-text dark:text-text-dark'
                        }
                        ${item.adminOnly ? 'border border-special/30 dark:border-special-dark/40' : ''}
                      `}
                    >
                      <div className={`p-2 rounded-xl ${pathname === item.path ? 'bg-white/20' : 'bg-special/10 dark:bg-special-dark/20'}`}>
                        {item.icon}
                      </div>
                      <span className="font-medium flex-1">{item.name}</span>
                      {item.adminOnly && (
                        <div className="bg-special/20 dark:bg-special-dark/30 px-2 py-1 rounded-full">
                          <Shield className="h-3 w-3 text-special dark:text-special-light" />
                        </div>
                      )}
                    </Link>
                  </div>
                ))}
              </nav>

              {/* Mobile Menu Footer Actions */}
              <div className="space-y-2 pt-4 border-t border-border/20 dark:border-border-dark/20">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-special/10 dark:hover:bg-special-dark/20 text-text dark:text-text-dark hover:text-special dark:hover:text-special-light transition-all duration-200"
                >
                  <div className="p-2 rounded-xl bg-special/10 dark:bg-special-dark/20">
                    <Settings className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{t('dashNav.user.settings')}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-500/10 text-text dark:text-text-dark hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                >
                  <div className="p-2 rounded-xl bg-red-500/10">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{t('dashNav.user.signOut')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DashNav