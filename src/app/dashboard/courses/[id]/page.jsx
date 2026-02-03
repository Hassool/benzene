"use client"

import CourseResources from '@/components/Dashboard/courses/CourseResources'
import { useFetchData } from '@/lib/UseFetch'
import { Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { useTranslation } from 'l_i18n'

function CoursePage() {
  const {t, isRTL} = useTranslation()
  const { id } = useParams()
  const courseId = id
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false); 
  
  const { data: course, error } = useFetchData(`/api/course?id=${courseId}`, setLoading)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://benzene-beta.vercel.app/Courses/${id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Loading states and early returns come AFTER all hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-bg dark:bg-bg-dark bg-gradient-light dark:bg-gradient-dark">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Loading skeleton */}
            <div className="animate-pulse">
              <div className={`flex justify-between items-center mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="h-8 bg-border dark:bg-border-dark rounded-lg w-1/3"></div>
                <div className={`flex space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className="h-10 bg-border dark:bg-border-dark rounded-lg w-24"></div>
                  <div className="h-10 bg-border dark:bg-border-dark rounded-lg w-20"></div>
                </div>
              </div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 bg-border dark:bg-border-dark rounded-xl"></div>
                  <div className="h-32 bg-border dark:bg-border-dark rounded-xl"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-48 bg-border dark:bg-border-dark rounded-xl"></div>
                  <div className="h-32 bg-border dark:bg-border-dark rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
     )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg dark:bg-bg-dark bg-gradient-light dark:bg-gradient-dark flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-montserrat font-semibold text-red-800 dark:text-red-200 mb-2">
              {t("coursePage.errors.loadingCourseTitle")}
            </h3>
            <p className="text-red-600 dark:text-red-400 font-inter">
              {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-bg dark:bg-bg-dark bg-gradient-light dark:bg-gradient-dark flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-6">
          <div className="bg-bg-secondary dark:bg-bg-dark-secondary border border-border dark:border-border-dark rounded-xl p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-border dark:bg-border-dark rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-text-secondary dark:text-text-dark-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-montserrat font-semibold text-text dark:text-text-dark mb-2">
              {t("coursePage.errors.courseNotFoundTitle")}
            </h3>
            <p className="text-text-secondary dark:text-text-dark-secondary font-inter">
              {t("coursePage.errors.courseNotFoundMessage")}
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`min-h-screen bg-bg dark:bg-bg-dark bg-gradient-light dark:bg-gradient-dark ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header with Actions */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <h1 className="text-3xl font-montserrat font-bold text-text dark:text-text-dark mb-2">
                {course.title}
              </h1>
              <p className="text-text-secondary dark:text-text-dark-secondary font-inter">
                {t("coursePage.header.subtitle")}
              </p>
            </div>
            
            <div className={`flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Link href={`/Courses/${id}`} className={`inline-flex items-center px-4 py-2 bg-special/10 dark:bg-special-dark/10 text-special dark:text-special-dark border border-special/20 dark:border-special-dark/20 rounded-lg hover:bg-special/20 dark:hover:bg-special-dark/20 transition-colors font-inter font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
                <svg className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t("coursePage.header.previewButton")}
              </Link>
              <Link href={`edit/${id}`} className={`inline-flex items-center px-4 py-2 bg-special hover:bg-special-hover dark:bg-special-dark dark:hover:bg-special text-white rounded-lg transition-colors font-inter font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
                <svg className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t("coursePage.header.editCourseButton")}
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Course Overview Card */}
              <div className="bg-bg-secondary dark:bg-bg-dark-secondary border border-border dark:border-border-dark rounded-xl p-6">
                <h2 className={`font-montserrat font-semibold text-xl text-text dark:text-text-dark mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {t("coursePage.overview.title")}
                </h2>
                
                <div className="relative group mb-6">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg border border-border dark:border-border-dark"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-inter font-medium text-text dark:text-text-dark mb-2 ${isRTL ? 'text-right' : ''}`}>
                      {t("coursePage.overview.descriptionLabel")}
                    </label>
                    <p className={`text-text-secondary dark:text-text-dark-secondary font-inter leading-relaxed p-4 bg-bg dark:bg-bg-dark rounded-lg border border-border dark:border-border-dark ${isRTL ? 'text-right' : ''}`}>
                      {course.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Content Management (New) */}
              <div className="bg-bg-secondary dark:bg-bg-dark-secondary border border-border dark:border-border-dark rounded-xl p-6">
                <CourseResources courseId={courseId} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Course Details */}
              <div className="bg-bg-secondary dark:bg-bg-dark-secondary border border-border dark:border-border-dark rounded-xl p-6">
                <h3 className={`font-montserrat font-semibold text-lg text-text dark:text-text-dark mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {t("coursePage.details.title")}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-inter font-medium text-text-secondary dark:text-text-dark-secondary mb-1 ${isRTL ? 'text-right' : ''}`}>
                      {t("coursePage.details.categoryLabel")}
                    </label>
                    <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <span className="inline-flex items-center px-3 py-1 bg-special/10 dark:bg-special-dark/10 text-special dark:text-special-dark rounded-full text-sm font-inter">
                        {course.category}
                      </span>
                      <button className="p-1 text-text-secondary dark:text-text-dark-secondary hover:text-special dark:hover:text-special-dark transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-inter font-medium text-text-secondary dark:text-text-dark-secondary mb-1 ${isRTL ? 'text-right' : ''}`}>
                      {t("coursePage.details.moduleLabel")}
                    </label>
                    <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <span className="inline-flex items-center px-3 py-1 bg-special-light/20 dark:bg-special-dark/20 text-special-light dark:text-special-dark rounded-full text-sm font-inter">
                        {t("coursePage.details.module")} {course.module}
                      </span>
                      <button className="p-1 text-text-secondary dark:text-text-dark-secondary hover:text-special dark:hover:text-special-dark transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border dark:border-border-dark">
                    <p className={`text-xs font-inter text-text-secondary dark:text-text-dark-secondary ${isRTL ? 'text-right' : ''}`}>
                      {t("coursePage.details.createdOn")}
                    </p>
                    <p className={`text-xs font-inter text-text-secondary dark:text-text-dark-secondary ${isRTL ? 'text-right' : ''}`}>
                      {t("coursePage.details.lastUpdated")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-bg-secondary dark:bg-bg-dark-secondary border border-border dark:border-border-dark rounded-xl p-6">
                <h3 className={`font-montserrat font-semibold text-lg text-text dark:text-text-dark mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {t("coursePage.quickActions.title")}
                </h3>
                
                <div className="space-y-3">
                  <button onClick={handleCopy} className={`w-full flex items-center space-x-3 p-3 bg-bg dark:bg-bg-dark rounded-lg border border-border dark:border-border-dark hover:border-special dark:hover:border-special-dark transition-colors ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {copied ? (
                      <>
                        <Check size={18} />
                        <span className="font-inter text-text dark:text-text-dark">{t("coursePage.quickActions.copied")}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        <span className="font-inter text-text dark:text-text-dark">{t("coursePage.quickActions.copyUrl")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursePage