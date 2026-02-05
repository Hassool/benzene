'use client'

import React, { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { modulesIn } from '@/components/modulesIn'
import { ArrowLeft, Book, FolderOpen, ChevronRight } from 'lucide-react'
import { useTranslation } from "l_i18n"

const StreamSection = ({ title, modules, year, color = 'blue' }) => {
  const { t } = useTranslation()
  
  // Checking if modules is an array (flat list) or object (nested streams)
  const isList = Array.isArray(modules)

  if (isList) {
    return (
      <div className="mb-8">
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 text-${color}-600 dark:text-${color}-400 capitalize`}>
          <FolderOpen className="w-5 h-5" />
          {t(`exams.streams.${title}`, title)}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {modules.map((module, idx) => (
            <Link
              key={idx}
              href={`/exams/${year}/${title}/${module}`}
              className="group relative p-4 bg-bg dark:bg-bg-dark rounded-xl border border-border dark:border-border-dark hover:border-special hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-text dark:text-text-dark capitalize group-hover:text-special transition-colors">
                  {module}
                </span>
                <ChevronRight className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  // Recursive render for nested streams
  return (
    <div className="mb-10 space-y-6">
       <div className="flex items-center gap-3 pb-2 border-b border-border dark:border-border-dark">
        <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-600`}>
          <LayersIcon title={title} />
        </div>
        <h2 className="text-2xl font-bold text-text dark:text-text-dark capitalize">
           {t(`exams.categories.${title}`, title)}
        </h2>
       </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Object.entries(modules).map(([subStream, subModules]) => (
           <div key={subStream} className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/30 rounded-2xl p-6">
             <h4 className="text-lg font-semibold mb-4 text-text dark:text-text-dark capitalize flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-special"></span>
               {t(`exams.streams.${subStream}`, subStream)}
             </h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {Array.isArray(subModules) && subModules.map((module, idx) => (
                 <Link
                   key={idx}
                   href={`/exams/${year}/${subStream}/${module}`}
                   className="flex items-center gap-3 p-3 rounded-lg bg-bg dark:bg-bg-dark hover:bg-special/5 transition-colors group"
                 >
                   <Book className="w-4 h-4 text-text-secondary group-hover:text-special" />
                   <span className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary group-hover:text-text dark:group-hover:text-text-dark capitalize">
                     {module}
                   </span>
                 </Link>
               ))}
             </div>
           </div>
        ))}
      </div>
    </div>
  )
}

// Helper icon component
const LayersIcon = ({ title }) => {
    // Simple mapping or generic return
    return <FolderOpen className="w-6 h-6" />
}

export default function YearPage({ params }) {
  const router = useRouter()
  const { t } = useTranslation()
  
  // Unwrap params using React.use()
  const resolvedParams = use(params)
  const { year } = resolvedParams

  const yearData = modulesIn[year]

  if (!yearData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Year not found</h1>
            <button 
                onClick={() => router.back()}
                className="text-special hover:underline"
            >
                Go Back
            </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-text-secondary hover:text-special mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('common.back', 'Back')}</span>
        </button>

        {/* Header */}
        <div className="mb-12">
            <h1 className="text-4xl font-bold font-montserrat text-text dark:text-text-dark mb-4 capitalize">
                {year.replace(/([A-Z])/g, ' $1').trim()} {t('exams.title_suffix', 'Exams')}
            </h1>
            <p className="text-text-secondary dark:text-text-dark-secondary">
                {t('exams.instruction', 'Select a module to view available exams and resources.')}
            </p>
        </div>

        {/* Content */}
        <div className="space-y-12">
          {Object.entries(yearData).map(([streamName, content]) => (
            <StreamSection 
                key={streamName} 
                title={streamName} 
                modules={content}
                year={year}
                color="blue" // You could map colors to streams if desired
            />
          ))}
        </div>
      </div>
    </div>
  )
}
