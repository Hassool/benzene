'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { modulesIn } from '@/components/modulesIn'
import { Upload, X, FileText, Check, AlertCircle, Loader2 } from 'lucide-react'
import { useTranslation } from 'l_i18n'

export default function CreateExamPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    branch: '', // Intermediate state for 2as/3as (tcs/tcl)
    stream: '', // Final stream (e.g. sience, or tcl for 1as)
    subject: '',
    term: '1',
    fileUrl: '',
    type: 'exam', // 'exam' or 'test'
    hasCorrection: false
  })

  // Derived State for Options
  const [branchOptions, setBranchOptions] = useState([])
  const [streamOptions, setStreamOptions] = useState([]) // Only used if branch has sub-streams
  const [subjectOptions, setSubjectOptions] = useState([])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Handle Year Change
  useEffect(() => {
    if (formData.year) {
      const yearData = modulesIn[formData.year]
      if (yearData) {
        setBranchOptions(Object.keys(yearData))
        // Reset downstream
        setFormData(prev => ({ ...prev, branch: '', stream: '', subject: '' }))
        setStreamOptions([])
        setSubjectOptions([])
      }
    }
  }, [formData.year])

  // Handle Branch Change
  useEffect(() => {
    if (formData.year && formData.branch) {
      const branchData = modulesIn[formData.year][formData.branch]
      
      if (Array.isArray(branchData)) {
        // Direct subjects list (e.g. 1as -> tcl)
        setSubjectOptions(branchData)
        setStreamOptions([])
        setFormData(prev => ({ ...prev, stream: formData.branch, subject: '' })) 
      } else if (typeof branchData === 'object') {
        // Nested streams (e.g. 2as -> tcs -> sience)
        setStreamOptions(Object.keys(branchData))
        setSubjectOptions([])
        setFormData(prev => ({ ...prev, stream: '', subject: '' }))
      }
    }
  }, [formData.year, formData.branch])

  // Handle Stream Change (only for nested)
  useEffect(() => {
    if (formData.year && formData.branch && formData.stream && streamOptions.length > 0) {
      const branchData = modulesIn[formData.year][formData.branch]
      // Verify validation to avoid accessing undefined if switching fast
      if (branchData && branchData[formData.stream] && Array.isArray(branchData[formData.stream])) {
         setSubjectOptions(branchData[formData.stream])
         setFormData(prev => ({ ...prev, subject: '' }))
      }
    }
  }, [formData.year, formData.branch, formData.stream, streamOptions])

  // File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`,
        { method: 'POST', body: data }
      )

      if (!response.ok) throw new Error('Upload failed')

      const result = await response.json()
      setFormData(prev => ({ ...prev, fileUrl: result.secure_url }))
    } catch (error) {
      console.error('Upload error:', error)
      alert(t('exams.create.uploadError', 'File upload failed'))
    } finally {
      setUploading(false)
    }
  }

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.year || !formData.stream || !formData.subject || !formData.fileUrl) {
      alert(t('exams.create.fillAll', 'Please fill all required fields'))
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (data.success) {
        alert(t('exams.create.success', 'Exam created successfully!'))
        // Reset or redirect
        router.push('/exams') // Or stay/reset
      } else {
        alert(data.error || t('exams.create.failed', 'Failed to create exam'))
      }
    } catch (error) {
       console.error(error)
       alert(t('exams.create.error', 'An error occurred'))
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold font-montserrat mb-8 text-text dark:text-text-dark">
        {t('exams.create.title', 'Create New Exam')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-bg dark:bg-bg-dark p-8 rounded-2xl shadow-sm border border-border dark:border-border-dark">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-text-dark-secondary">
            {t('exams.create.fields.title', 'Exam Title')}
          </label>
          <input
            type="text"
            className="w-full p-3 rounded-xl bg-bg-secondary dark:bg-bg-dark-secondary border border-border/50 dark:border-border-dark/50 focus:outline-none focus:border-special transition-colors"
            placeholder="e.g. First Trimester Math Exam 2024"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Year */}
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-text-dark-secondary">
              {t('exams.create.fields.year', 'Year')}
            </label>
            <select
              className="w-full p-3 rounded-xl bg-bg-secondary dark:bg-bg-dark-secondary border border-border/50 dark:border-border-dark/50 focus:outline-none focus:border-special transition-colors"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              required
            >
              <option value="">{t('common.select', 'Select')}</option>
              <option value="firstAs">1as</option>
              <option value="secondAs">2as</option>
              <option value="thirdAs">3as</option>
            </select>
          </div>

          {/* Branch (Intermediate) */}
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-text-dark-secondary">
               {t('exams.create.fields.branch', 'Branch')}
            </label>
            <select
              className="w-full p-3 rounded-xl bg-bg-secondary dark:bg-bg-dark-secondary border border-border/50 dark:border-border-dark/50 focus:outline-none focus:border-special transition-colors"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              required
              disabled={!formData.year}
            >
              <option value="">{t('common.select', 'Select')}</option>
              {branchOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stream (only if options exist) */}
        {streamOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-text-dark-secondary">
               {t('exams.create.fields.stream', 'Stream')}
            </label>
            <select
              className="w-full p-3 rounded-xl bg-bg-secondary dark:bg-bg-dark-secondary border border-border/50 dark:border-border-dark/50 focus:outline-none focus:border-special transition-colors"
              value={formData.stream}
              onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
              required
            >
              <option value="">{t('common.select', 'Select')}</option>
              {streamOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject */}
            <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-text-dark-secondary">
                {t('exams.create.fields.subject', 'Subject')}
            </label>
            <select
                className="w-full p-3 rounded-xl bg-bg-secondary dark:bg-bg-dark-secondary border border-border/50 dark:border-border-dark/50 focus:outline-none focus:border-special transition-colors"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                disabled={!subjectOptions.length}
            >
                <option value="">{t('common.select', 'Select')}</option>
                {subjectOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            </div>

            {/* Term */}
            <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-text-dark-secondary">
                {t('exams.create.fields.term', 'Term')}
            </label>
            <select
                className="w-full p-3 rounded-xl bg-bg-secondary dark:bg-bg-dark-secondary border border-border/50 dark:border-border-dark/50 focus:outline-none focus:border-special transition-colors"
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                required
            >
                <option value="1">{t('exams.terms.first', '1st Trimester')}</option>
                <option value="2">{t('exams.terms.second', '2nd Trimester')}</option>
                <option value="3">{t('exams.terms.third', '3rd Trimester')}</option>
            </select>
            </div>
        </div>
        
        {/* Exam Type */}
         <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-text-dark-secondary">
                {t('exams.create.fields.type', 'Type')}
            </label>
            <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="type" 
                        value="exam" 
                        checked={formData.type === 'exam'}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="text-special focus:ring-special"
                    />
                    <span className="text-text dark:text-text-dark">{t('exams.create.fields.type_exam', 'Exam')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="type" 
                        value="test" 
                        checked={formData.type === 'test'}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="text-special focus:ring-special"
                    />
                    <span className="text-text dark:text-text-dark">{t('exams.create.fields.type_test', 'Test / Assignment')}</span>
                </label>
            </div>
         </div>

        {/* Has Correction */}
        <div className="flex items-center gap-3 p-4 bg-bg-secondary dark:bg-bg-dark-secondary rounded-xl border border-border/50 dark:border-border-dark/50">
            <input 
                type="checkbox"
                id="hasCorrection"
                checked={formData.hasCorrection}
                onChange={(e) => setFormData({ ...formData, hasCorrection: e.target.checked })}
                className="w-5 h-5 rounded border-border text-special focus:ring-special"
            />
            <label htmlFor="hasCorrection" className="text-sm font-medium text-text dark:text-text-dark cursor-pointer">
                {t('exams.create.fields.hasCorrection', 'This exam includes the correction / answer key')}
            </label>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-text-dark-secondary">
            {t('exams.create.fields.file', 'Exam File (PDF)')}
          </label>
          
          {formData.fileUrl ? (
             <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
               <div className="p-2 bg-green-500 text-white rounded-lg">
                 <Check className="h-5 w-5" />
               </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 truncate">{t('exams.create.fields.upload.success', 'File uploaded successfully')}</p>
                  <a href={formData.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 dark:text-green-500 hover:underline truncate block">
                     {formData.fileUrl.split('/').pop()}
                  </a>
                </div>
               <button 
                 type="button"
                 onClick={() => setFormData({ ...formData, fileUrl: '' })}
                 className="p-2 text-text-secondary hover:text-red-500 transition-colors"
               >
                 <X className="h-5 w-5" />
               </button>
             </div>
          ) : (
            <div className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
              ${uploading 
                ? 'border-special/50 bg-special/5 cursor-wait' 
                : 'border-border/50 hover:border-special/50 hover:bg-bg-secondary/50 dark:hover:bg-bg-dark-secondary/10 cursor-pointer'}
            `}>
              <input
                type="file"
                id="exam-file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <label htmlFor="exam-file" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                {uploading ? (
                  <>
                    <Loader2 className="h-10 w-10 text-special animate-spin mb-4" />
                    <p className="text-special font-medium">{t('common.uploading', 'Uploading...')}</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-text-secondary dark:text-text-dark-secondary mb-4" />
                    <p className="font-medium text-text dark:text-text-dark mb-1">
                      {t('exams.create.fields.upload.click', 'Click to upload or drag and drop')}
                    </p>
                    <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                      {t('exams.create.fields.upload.hint', 'PDF, DOC up to 10MB')}
                    </p>
                  </>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4 gap-4">
           <button
             type="button"
             onClick={() => router.back()}
             className="px-6 py-2 rounded-xl border border-border dark:border-border-dark text-text-secondary hover:bg-bg-secondary dark:hover:bg-bg-dark-secondary transition-colors"
           >
             {t('common.cancel', 'Cancel')}
           </button>
           <button
             type="submit"
             disabled={loading || uploading || !formData.fileUrl}
             className="px-6 py-2 rounded-xl bg-special hover:bg-special-hover text-white font-medium shadow-lg shadow-special/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
           >
             {loading && <Loader2 className="h-4 w-4 animate-spin" />}
             {t('common.create', 'Create Exam')}
           </button>
        </div>
      </form>
    </div>
  )
}
