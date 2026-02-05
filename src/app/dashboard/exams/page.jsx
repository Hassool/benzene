'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  FileText, Plus, Search, Trash2, 
  ExternalLink, Calendar, Loader2, AlertCircle,
  Eye, CheckCircle2
} from 'lucide-react'
import { useTranslation } from "l_i18n"
import { toast } from 'react-hot-toast'

export default function ManageExamsPage() {
  const { data: session } = useSession()
  const { t } = useTranslation()
  
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const fetchExams = async () => {
    try {
      setLoading(true)
      // Fetch exams for this specific teacher
      const res = await fetch(`/api/exams?teacherId=${session?.user?.id}`)
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
    if (session?.user?.id) {
        fetchExams()
    }
  }, [session?.user?.id])

  const handleDelete = async (id, title) => {
    if (!window.confirm(t('exams.manage.delete_confirm', { title }))) {
        return
    }

    try {
        setDeletingId(id)
        const res = await fetch(`/api/exams?id=${id}`, {
            method: 'DELETE'
        })
        const data = await res.json()

        if (data.success) {
            toast.success(t('exams.manage.delete_success', 'Exam deleted successfully'))
            setExams(exams.filter(e => e._id !== id))
        } else {
            toast.error(data.error || t('exams.manage.delete_failed', 'Failed to delete exam'))
        }
    } catch (err) {
        console.error(err)
        toast.error(t('exams.manage.delete_error', 'An error occurred during deletion'))
    } finally {
        setDeletingId(null)
    }
  }

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTermLabel = (term) => {
    switch(term) {
        case 1: return t('exams.terms.first', '1st Trimester')
        case 2: return t('exams.terms.second', '2nd Trimester')
        case 3: return t('exams.terms.third', '3rd Trimester')
        default: return `${term}`
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text dark:text-text-dark flex items-center gap-3">
            <FileText className="w-8 h-8 text-special" />
            {t('dashNav.nav.manageExams', 'Manage My Exams')}
          </h1>
          <p className="text-text-secondary mt-1">
            {t('exams.manage.desc', 'View and manage all exams you have published.')}
          </p>
        </div>
        <Link 
          href="/dashboard/exams/create"
          className="flex items-center gap-2 px-6 py-3 bg-special text-white rounded-xl hover:bg-special-hover transition-all shadow-lg shadow-special/20 font-medium whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          {t('dashNav.nav.createExam', 'Add New Exam')}
        </Link>
      </div>

      {/* Filters & Stats */}
      <div className="bg-bg-secondary dark:bg-bg-dark-secondary rounded-2xl p-4 mb-8 border border-border/50 dark:border-border-dark/50 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary opacity-50" />
          <input 
            type="text" 
            placeholder={t('common.search', 'Search by title or subject...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-bg dark:bg-bg-dark border border-border/50 dark:border-border-dark/50 rounded-xl focus:border-special outline-none transition-all"
          />
        </div>
        <div className="flex gap-4">
            <div className="px-4 py-3 bg-bg dark:bg-bg-dark border border-border/50 dark:border-border-dark/50 rounded-xl flex items-center gap-2 min-w-[120px]">
                <span className="text-sm text-text-secondary uppercase font-bold tracking-wider">Total:</span>
                <span className="text-lg font-bold text-special">{exams.length}</span>
            </div>
        </div>
      </div>

      {/* Exams List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-special animate-spin mb-4" />
          <p className="text-text-secondary">{t('common.loading', 'Loading your exams...')}</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-10 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text dark:text-text-dark mb-2">{t('common.error', 'Error')}</h2>
          <p className="text-text-secondary">{error}</p>
          <button onClick={fetchExams} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
            {t('common.tryAgain', 'Try Again')}
          </button>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/20 border border-border/50 dark:border-border-dark/50 rounded-3xl p-20 text-center">
          <FileText className="w-20 h-20 text-text-secondary/20 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-text dark:text-text-dark mb-2">{t('exams.manage.no_exams', 'No Exams Found')}</h2>
          <p className="text-text-secondary mb-8">
            {searchQuery ? t('exams.manage.no_search_desc', 'No exams match your search.') : t('exams.manage.no_exams_desc', "You haven't uploaded any exams yet.")}
          </p>
          {!searchQuery && (
            <Link href="/dashboard/exams/create" className="px-8 py-3 bg-special text-white rounded-xl hover:bg-special-hover transition-all">
                {t('exams.manage.btn_first', 'Publish Your First Exam')}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredExams.map((exam) => (
            <div 
                key={exam._id} 
                className="group bg-bg dark:bg-bg-dark border border-border/50 dark:border-border-dark/50 rounded-2xl p-5 hover:border-special transition-all flex flex-col md:flex-row items-center gap-6"
            >
                {/* Thumb/Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                    exam.type === 'test' ? 'bg-amber-500/10 text-amber-600' : 'bg-special/10 text-special'
                }`}>
                    <FileText className="w-8 h-8" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                             exam.type === 'test' ? 'bg-amber-500/20 text-amber-700' : 'bg-special/20 text-special'
                        }`}>
                            {exam.type || 'exam'}
                        </span>
                        <span className="text-xs text-text-secondary opacity-60">•</span>
                        <span className="text-sm font-medium text-text-secondary">
                            {getTermLabel(exam.term)}
                        </span>
                        {exam.hasCorrection && (
                            <>
                                <span className="text-xs text-text-secondary opacity-60">•</span>
                                <div className="flex items-center gap-1 text-xs text-green-600 font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{t('exams.badges.correction_short', 'Correction')}</span>
                                </div>
                            </>
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-text dark:text-text-dark truncate">
                        {exam.title}
                    </h3>
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm text-text-secondary">
                        <span className="capitalize">{exam.year.replace(/([A-Z])/g, ' $1')} • {exam.stream} • {exam.subject}</span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                            <Calendar className="w-4 h-4" />
                            {new Date(exam.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <Link 
                        href={`/exams/${exam.year}/${exam.stream}/${exam.subject}/${exam._id}`}
                        className="p-3 bg-bg-secondary dark:bg-bg-dark-secondary text-text-secondary dark:text-text-dark-secondary rounded-xl hover:bg-special hover:text-white transition-all shadow-sm"
                        title={t('exams.manage.btn_view', 'View Publicly')}
                    >
                        <Eye className="w-5 h-5" />
                    </Link>
                    <button 
                        onClick={() => handleDelete(exam._id, exam.title)}
                        disabled={deletingId === exam._id}
                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                        title="Delete Exam"
                    >
                        {deletingId === exam._id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Trash2 className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
