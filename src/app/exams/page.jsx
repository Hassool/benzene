'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, BookOpen, Layers } from 'lucide-react'
import { useTranslation } from "l_i18n"

export default function ExamsPage() {
  const router = useRouter()
  const { t } = useTranslation()

  const years = [
    {
      id: 'firstAs',
      title: '1as',
      label: 'exams.years.1as.title',
      description: 'exams.years.1as.desc',
      icon: BookOpen,
      color: 'blue'
    },
    {
      id: 'secondAs',
      title: '2as',
      label: 'exams.years.2as.title',
      description: 'exams.years.2as.desc',
      icon: Layers,
      color: 'green'
    },
    {
      id: 'thirdAs',
      title: '3as',
      label: 'exams.years.3as.title',
      description: 'exams.years.3as.desc',
      icon: GraduationCap,
      color: 'purple'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-montserrat text-text dark:text-text-dark mb-6">
            {t('exams.header.title', 'Exams & Subjects')}
          </h1>
          <p className="text-lg text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto">
            {t('exams.header.subtitle', 'Select your academic year to access exam resources and study materials.')}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {years.map((year) => (
            <button
              key={year.id}
              onClick={() => router.push(`/exams/${year.id}`)}
              className={`
                relative group flex flex-col items-center text-center p-8 rounded-2xl
                bg-bg dark:bg-bg-dark border-2 border-transparent transition-all duration-300
                hover:border-${year.color}-500 hover:shadow-2xl hover:shadow-${year.color}-500/20
                hover:-translate-y-2
              `}
            >
              {/* Icon Bubble */}
              <div className={`
                w-24 h-24 mb-6 rounded-full flex items-center justify-center
                bg-${year.color}-500/10 text-${year.color}-600 dark:text-${year.color}-400
                group-hover:scale-110 transition-transform duration-300
              `}>
                <year.icon className="w-10 h-10" />
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold font-montserrat text-text dark:text-text-dark mb-4">
                {year.title}
              </h2>
              
              {/* Divider */}
              <div className={`w-16 h-1 bg-${year.color}-500 rounded-full mb-4 opacity-50 group-hover:opacity-100 transition-opacity`} />

              {/* Description */}
              <p className="text-text-secondary dark:text-text-dark-secondary">
                {t(year.description, `Access courses and exams for ${year.title}`)}
              </p>

              {/* Hover Effect Background */}
              <div className={`
                absolute inset-0 rounded-2xl bg-${year.color}-500/5 opacity-0 
                group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
              `} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
