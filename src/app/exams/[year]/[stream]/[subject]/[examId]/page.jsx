'use client'

import React, { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, ArrowRight, Download, ExternalLink, 
  Loader2, AlertCircle, FileText, CheckCircle2,
  Calendar, User, Trash2
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { useTranslation } from "l_i18n"

export default function ExamViewerPage({ params }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { t, isRTL } = useTranslation()
  
  const resolvedParams = use(params)
  const { year, stream, subject, examId } = resolvedParams

  const [exam, setExam] = useState(null)
  const [allExams, setAllExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm(t('exams.manage.delete_confirm', { title: exam?.title }))) return
    
    try {
      setDeleting(true)
      const res = await fetch(`/api/exams?id=${examId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(t('exams.manage.delete_success', 'Deleted successfully'))
        router.push(`/exams/${year}/${stream}/${subject}`)
      } else {
        toast.error(data.error || t('exams.manage.delete_failed', 'Delete failed'))
      }
    } catch (err) {
      console.error(err)
      toast.error(t('exams.manage.delete_error', 'An error occurred'))
    } finally {
      setDeleting(false)
    }
  }

  const handleNext = () => {
    if (nextExam) {
      router.push(`/exams/${year}/${stream}/${subject}/${nextExam._id}`)
    }
  }

  const handlePrev = () => {
    if (prevExam) {
      router.push(`/exams/${year}/${stream}/${subject}/${prevExam._id}`)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch all exams for this subject to handle "Next" navigation
        const resList = await fetch(`/api/exams?year=${year}&stream=${stream}&subject=${subject}`)
        const dataList = await resList.json()
        
        if (dataList.success) {
          const list = dataList.data || []
          setAllExams(list)
          
          const current = list.find(e => e._id === examId)
          if (current) {
            setExam(current)
          } else {
            setError('Exam not found')
          }
        } else {
          setError(dataList.error || 'Failed to fetch exam details')
        }
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [year, stream, subject, examId])

  // Navigation Logic
  const currentIndex = allExams.findIndex(e => e._id === examId)
  const nextExam = currentIndex >= 0 && currentIndex < allExams.length - 1 ? allExams[currentIndex + 1] : null
  const prevExam = currentIndex > 0 ? allExams[currentIndex - 1] : null

  const getTermLabel = (term) => {
    switch(term) {
        case 1: return t('exams.terms.first', '1st Trimester')
        case 2: return t('exams.terms.second', '2nd Trimester')
        case 3: return t('exams.terms.third', '3rd Trimester')
        default: return `${term}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg dark:bg-bg-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-special animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">{t('common.loading', 'Loading exam...')}</p>
        </div>
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-bg dark:bg-bg-dark flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-3xl p-10">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-text dark:text-text-dark mb-2">{t('common.error', 'Error')}</h2>
          <p className="text-text-secondary mb-8">{error || t('exams.error_load', "Could not load the exam.")}</p>
          <button onClick={() => router.back()} className="px-8 py-3 bg-special text-white rounded-xl hover:bg-special-hover transition-all">
            {t('common.back', 'Go Back')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark flex flex-col">
      {/* Viewer Header */}
      <header className="bg-bg-secondary dark:bg-bg-dark-secondary border-b border-border/50 dark:border-border-dark/50 p-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button 
                onClick={() => router.back()}
                className="p-2 hover:bg-bg dark:hover:bg-bg-dark rounded-xl transition-colors text-text-secondary"
            >
                <ArrowLeft className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
            <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-special/20 text-special-dark dark:text-special-light rounded-full">
                        {exam.type || 'exam'}
                    </span>
                    <span className="text-xs text-text-secondary">{getTermLabel(exam.term)}</span>
                </div>
                <h1 className="text-lg font-bold text-text dark:text-text-dark truncate">
                    {exam.title}
                </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
              <a 
                href={exam.fileUrl} 
                download
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-special/10 text-special rounded-xl hover:bg-special hover:text-white transition-all text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                {t('common.download', 'Download')}
              </a>
              <a 
                href={exam.fileUrl} 
                target="_blank"
                className="p-2 bg-bg dark:bg-bg-dark border border-border dark:border-border-dark text-text-secondary rounded-xl hover:border-special hover:text-special transition-all"
                title="Open in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>

              {(session?.user?.isAdmin || (session?.user?.id === exam.teacher?._id)) && (
                <button 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                  title="Delete Exam"
                >
                  {deleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-950 relative overflow-hidden flex flex-col">
          <embed 
            src={exam.fileUrl}
            type="application/pdf"
            className="w-full h-full border-none"
            title={exam.title}
          />
          
          {/* Fallback info for small screens or slow loads */}
            <div className="absolute inset-0 flex flex-col items-center justify-center h-full text-center p-8 bg-bg dark:bg-bg-dark rounded-2xl border border-border/50 dark:border-border-dark/50">
              <Loader2 className="w-12 h-12 text-special animate-spin mb-4" />
              <h3 className="text-lg font-bold text-text dark:text-text-dark mb-2">
                {t('exams.viewer.loading_pdf', 'Loading PDF Preview...')}
              </h3>
              <p className="text-sm text-text-secondary max-w-sm">
                {t('exams.viewer.loading_hint', 'If it doesn\'t load, use the "Download" or "View in new tab" buttons.')}
              </p>
            </div>
        </div>

        {/* Sidebar Info & Navigation */}
        <aside className="w-full md:w-80 bg-bg dark:bg-bg-dark border-l border-border/50 dark:border-border-dark/50 flex flex-col">
            <div className="p-6 space-y-8 flex-1 overflow-y-auto">
                {/* Details */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary opacity-50 mb-4">
                      {t('exams.viewer.exam_info', 'Exam Info')}
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-bg-secondary dark:bg-bg-dark-secondary rounded-xl border border-border/50 dark:border-border-dark/50">
                                <div className="flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary text-xs mb-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{t('exams.viewer.info_added', 'Added')}</span>
                                </div>
                                <p className="text-sm font-semibold text-text dark:text-text-dark">
                                    {new Date(exam.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="p-3 bg-bg-secondary dark:bg-bg-dark-secondary rounded-xl border border-border/50 dark:border-border-dark/50">
                                <div className="flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary text-xs mb-1">
                                    <User className="w-3.5 h-3.5" />
                                    <span>{t('exams.viewer.info_teacher', 'Teacher')}</span>
                                </div>
                                <p className="text-sm font-semibold text-text dark:text-text-dark truncate">
                                    {exam.teacher?.fullName || 'Teacher'}
                                </p>
                            </div>
                        </div>
                        {exam.hasCorrection === true && (
                             <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-700 dark:text-green-400 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{t('exams.viewer.includes_correction', 'Includes Correction')}</span>
                             </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div>
                   <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary opacity-50 mb-4">
                     {t('exams.viewer.jump_to', 'Jump To')}
                   </h2>
                   <div className="grid gap-3">
                        {prevExam && (
                            <Link 
                                href={`/exams/${year}/${stream}/${subject}/${prevExam._id}`}
                                className="p-3 rounded-xl border border-border/50 dark:border-border-dark/50 hover:border-special transition-all group"
                            >
                                <span className="block text-[10px] text-text-secondary mb-1">{t('exams.viewer.prev', 'Previous')}</span>
                                <span className="block text-sm font-bold truncate">{prevExam.title}</span>
                            </Link>
                        )}
                        {nextExam && (
                            <Link 
                                href={`/exams/${year}/${stream}/${subject}/${nextExam._id}`}
                                className="p-4 rounded-2xl bg-special text-white shadow-lg shadow-special/20 hover:scale-[1.02] transition-all group"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] text-white/70">{t('exams.viewer.next', 'Next Exam')}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                                <span className="block text-sm font-bold truncate">{nextExam.title}</span>
                            </Link>
                        )}
                   </div>
                </div>
            </div>

            {/* Bottom Actions for Mobile */}
            <div className="md:hidden p-4 border-t border-border/50 dark:border-border-dark/50 flex gap-2">
                <a 
                    href={exam.fileUrl} 
                    download
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-special text-white rounded-xl font-medium"
                >
                    <Download className="w-4 h-4" />
                    {t('common.download', 'Download')}
                </a>
            </div>

            {/* Bottom Navigation for Desktop */}
            <div className="hidden md:flex p-4 border-t border-border/50 dark:border-border-dark/50 gap-2">
              <button 
                onClick={handlePrev}
                disabled={!prevExam}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-bg-secondary dark:bg-bg-dark-secondary text-text-secondary rounded-xl hover:bg-bg dark:hover:bg-bg-dark disabled:opacity-50 disabled:bg-bg-secondary dark:disabled:bg-bg-dark-secondary transition-all font-medium"
              >
                <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                {t('exams.viewer.prev', 'Previous')}
              </button>
              <button 
                onClick={handleNext}
                disabled={!nextExam}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-special text-white rounded-xl hover:bg-special-hover disabled:opacity-50 disabled:bg-bg-secondary dark:disabled:bg-bg-dark-secondary transition-all font-medium"
              >
                {t('exams.viewer.next', 'Next Exam')}
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
        </aside>
      </main>
    </div>
  )
}
