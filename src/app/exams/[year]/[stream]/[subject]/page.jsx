'use client'

import React, { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Download, ExternalLink, User, Calendar, Clock, Loader2, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { useTranslation } from "l_i18n"

export default function ExamListingPage({ params }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { t, isRTL } = useTranslation()
  
  const resolvedParams = use(params)
  const { year, stream, subject } = resolvedParams

  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchExams = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/exams?year=${year}&stream=${stream}&subject=${subject}`)
      const data = await res.json()
      
      if (data.success) {
        setExams(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch exams')
      }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [year, stream, subject])

  const handleDelete = async (id, title) => {
    if (!window.confirm(t('exams.manage.delete_confirm', { title }))) return
    
    try {
      setDeletingId(id)
      const res = await fetch(`/api/exams?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(t('exams.manage.delete_success', 'Deleted successfully'))
        setExams(exams.filter(e => e._id !== id))
      } else {
        toast.error(data.error || t('exams.manage.delete_failed', 'Delete failed'))
      }
    } catch (err) {
      console.error(err)
      toast.error(t('exams.manage.delete_error', 'An error occurred'))
    } finally {
      setDeletingId(null)
    }
  }

  const getTermLabel = (term) => {
    switch(term) {
        case 1: return t('exams.terms.first', '1st Trimester')
        case 2: return t('exams.terms.second', '2nd Trimester')
        case 3: return t('exams.terms.third', '3rd Trimester')
        default: return `${term}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Navigation / Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-text-secondary hover:text-special transition-colors group"
            >
                <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''} group-hover:-translate-x-1 transition-transform`} />
                <span>{t('common.back', 'Back')}</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-dark-secondary">
                <Link href="/exams" className="hover:text-special">{t('nav.exams', 'Exams')}</Link>
                <span>/</span>
                <Link href={`/exams/${year}`} className="hover:text-special capitalize">{year.replace(/([A-Z])/g, ' $1')}</Link>
                <span>/</span>
                <span className="text-special font-medium capitalize">{subject}</span>
            </div>
        </div>

        {/* Header */}
        <div className="mb-10 text-center md:text-left">
            <div className="flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8 text-special" />
                <h1 className="text-4xl font-bold font-montserrat text-text dark:text-text-dark capitalize">
                    {subject.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h1>
            </div>
            <p className="text-text-secondary dark:text-text-dark-secondary mt-1 max-w-2xl">
                {t('exams.list_description', 'Browse and download previous exams and tests.')}
            </p>
        </div>

        {/* Content */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-special animate-spin mb-4" />
                <p className="text-text-secondary">{t('common.loading', 'Loading exams...')}</p>
            </div>
        ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-10 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text dark:text-text-dark mb-2">{t('common.error', 'Error')}</h2>
          <p className="text-text-secondary">{error}</p>
        </div>
        ) : exams.length === 0 ? (
            <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/20 border border-border/50 dark:border-border-dark/50 rounded-3xl p-20 text-center">
          <FileText className="w-20 h-20 text-text-secondary/20 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-text dark:text-text-dark mb-2">{t('exams.no_exams', 'No exams found')}</h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            {t('exams.no_exams_desc', "There are no exams uploaded for this subject yet. Check back later!")}
          </p>
          <Link href={`/exams/${year}`} className="inline-flex items-center gap-2 px-8 py-3 bg-special text-white rounded-xl hover:bg-special-hover transition-all font-medium">
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {t('exams.browse_others', 'Browse other years')}
          </Link>
        </div>
        ) : (
            <div className="grid gap-6">
                {exams.map((exam) => (
                    <div 
                        key={exam._id}
                        className="group bg-bg dark:bg-bg-dark rounded-2xl border border-border dark:border-border-dark p-6 hover:border-special hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-6 items-start md:items-center"
                    >
                        {/* Type Icon */}
                        <div className={`p-4 rounded-2xl shrink-0 transition-colors ${
                            exam.type === 'test' 
                            ? 'bg-amber-500/10 text-amber-600' 
                            : 'bg-special/10 text-special'
                        }`}>
                            <FileText className="w-8 h-8" />
                        </div>

                        {/* Title & Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                    exam.type === 'test'
                                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                    : 'bg-special/20 text-special-dark dark:text-special-light'
                                }`}>
                                    {exam.type || 'exam'}
                                </span>
                                <span className="text-xs text-text-secondary opacity-60">•</span>
                                <span className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary">
                                    {getTermLabel(exam.term)}
                                </span>
                                {exam.hasCorrection === true && (
                                    <>
                                        <span className="text-xs text-text-secondary opacity-60">•</span>
                                        <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>{t('exams.badges.correction', 'Correction Included')}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-text dark:text-text-dark truncate group-hover:text-special transition-colors mb-2">
                                {exam.title}
                            </h3>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-text-secondary dark:text-text-dark-secondary">
                                {exam.teacher && (
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-4 h-4" />
                                        <span>{exam.teacher.fullName}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                            <Link 
                                href={`/exams/${year}/${stream}/${subject}/${exam._id}`}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-bg-secondary dark:bg-bg-dark-secondary text-text dark:text-text-dark rounded-xl hover:bg-special hover:text-white transition-all font-medium"
                            >
                                <ExternalLink className="w-4 h-4" />
                                {t('common.view', 'View')}
                            </Link>
                            <a 
                                href={exam.fileUrl} 
                                download
                                className="p-3 bg-special/10 text-special rounded-xl hover:bg-special hover:text-white transition-all"
                                title={t('common.download', 'Download')}
                            >
                                <Download className="w-5 h-5" />
                            </a>

                            {(session?.user?.isAdmin || (session?.user?.id === exam.teacher?._id)) && (
                                <button 
                                    onClick={() => handleDelete(exam._id, exam.title)}
                                    disabled={deletingId === exam._id}
                                    className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                                    title={t('exams.manage.btn_delete', 'Delete Exam')}
                                >
                                    {deletingId === exam._id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  )
}
