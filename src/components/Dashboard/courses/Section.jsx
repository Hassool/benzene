import React, { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Save,
  CheckCircle,
  Book,
  FileText,
  Link,
  HelpCircle,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { useTranslation } from 'react-lite-translation'


// --- Utility helpers ---
const safeJson = async (res) => {
  try {
    const json = await res.json()
    return json
  } catch (e) {
    return { success: res.ok, data: null, message: res.statusText }
  }
}
const useToast = () => {
  const [toasts, setToasts] = useState([])
  const push = (type, text) => {
    const id = Date.now()
    setToasts((t) => [...t, { id, type, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000)
  }
  return { toasts, push }
}

// --- Progress indicator ---
const ProgressBar = ({ currentStep, totalSteps, steps }) => {
  const { t } = useTranslation()
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-montserrat font-semibold text-text dark:text-text-dark">
          {t("section.title")}
        </h2>
        <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
          {t("section.stepOf", { current: currentStep, total: totalSteps })}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        {steps.map((label, index) => {
          const stepNumber = index + 1
          const completed = stepNumber < currentStep
          const active = stepNumber === currentStep
          return (
            <React.Fragment key={label + index}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    completed || active ? 'bg-special text-white' : 'bg-bg-secondary dark:bg-bg-dark-secondary text-text-secondary dark:text-text-dark-secondary'
                  }`}
                  aria-current={active ? 'step' : undefined}
                >
                  {completed ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                </div>
                <span className="text-xs mt-1 text-center text-text-secondary dark:text-text-dark-secondary">
                  {t(`section.steps.${label}`)}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  aria-hidden
                  className={`flex-1 h-0.5 transition-all duration-300 ${completed ? 'bg-special' : 'bg-border dark:bg-border-dark'}`}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// --- Section Form ---
const SectionForm = ({ data, onChange, onSubmit, submitting }) => {
  const { t } = useTranslation()
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!data.title || data.title.trim().length < 3) e.title = t("section.validation.titleMinLength")
    if (data.title && data.title.length > 100) e.title = t("section.validation.titleMaxLength")
    if (data.description && data.description.length > 500) e.description = t("section.validation.descriptionMaxLength")
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <form
      onSubmit={async (ev) => {
        ev.preventDefault()
        if (!validate()) return
        onSubmit()
      }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-bg-dark-secondary rounded-xl p-6 shadow-sm border border-border dark:border-border-dark">
        <h3 className="text-lg font-montserrat font-medium text-text dark:text-text-dark mb-4">
          {t("section.sectionForm.title")}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
              {t("section.sectionForm.sectionTitle")} *
            </label>
            <input
              name="title"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
              type="text"
              value={data.title || ''}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border transition-colors bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-special focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-border dark:border-border-dark'
              }`}
              placeholder={t("section.sectionForm.sectionTitlePlaceholder")}
            />
            {errors.title && <p id="title-error" className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
              {t("section.sectionForm.description")}
            </label>
            <textarea
              name="description"
              rows={4}
              value={data.description || ''}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-special focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-border dark:border-border-dark'
              }`}
              placeholder={t("section.sectionForm.descriptionPlaceholder")}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className={`px-6 py-3 ${submitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-special-hover'} bg-special text-white font-medium rounded-lg transition-colors flex items-center space-x-2`}
        >
          <span>{submitting ? t("section.sectionForm.creating") : t("section.sectionForm.continue")}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

// --- Resource Type selector ---
const ResourceTypeSelector = ({ selectedType, onSelect }) => {
  const { t } = useTranslation()
  const resourceTypes = [
    { type: 'video', icon: <FileText className="w-6 h-6" />, title: t("section.resourceTypes.video.title"), description: t("section.resourceTypes.video.description") },
    { type: 'document', icon: <Book className="w-6 h-6" />, title: t("section.resourceTypes.document.title"), description: t("section.resourceTypes.document.description") },
    { type: 'link', icon: <Link className="w-6 h-6" />, title: t("section.resourceTypes.link.title"), description: t("section.resourceTypes.link.description") },
    { type: 'quiz', icon: <HelpCircle className="w-6 h-6" />, title: t("section.resourceTypes.quiz.title"), description: t("section.resourceTypes.quiz.description") },
    { type: 'image', icon: <FileText className="w-6 h-6" />, title: t("section.resourceTypes.image.title"), description: t("section.resourceTypes.image.description") }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {resourceTypes.map((r) => (
        <button
          key={r.type}
          type="button"
          onClick={() => onSelect(r.type)}
          aria-pressed={selectedType === r.type}
          className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
            selectedType === r.type
              ? 'border-special bg-special/10 dark:bg-special-dark/10'
              : 'border-border dark:border-border-dark bg-white dark:bg-bg-dark-secondary hover:border-special/50'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${selectedType === r.type ? 'bg-special text-white' : 'bg-bg-secondary dark:bg-bg-dark text-text-secondary dark:text-text-dark-secondary'}`}>
              {r.icon}
            </div>
            <div>
              <h3 className="font-medium text-text dark:text-text-dark">{r.title}</h3>
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">{r.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

// --- Resource form ---
// --- Resource form with Cloudinary Upload ---
const ResourceForm = ({ data, onChange, resourceType }) => {
  const { t } = useTranslation()
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Cloudinary upload
  const uploadToCloudinary = async (file) => {
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'benzen'
      if (!cloudName) throw new Error(t("section.errors.cloudinaryNotConfigured"))

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        { method: 'POST', body: formData }
      )
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error?.message || t("section.errors.uploadStatusError", { status: uploadResponse.status }))
      }

      const uploadData = await uploadResponse.json()
      const publicUrl = uploadData.secure_url
      if (!publicUrl) throw new Error(t("section.errors.noUrlReturned"))
      return publicUrl
    } catch (error) {
      throw new Error(t("section.toast.uploadError", { error: error.message }))
    }
  }
  
  // Gérer le changement de fichier
   const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx']
    const ext = file.name.split('.').pop().toLowerCase()
    if (!allowedExtensions.includes(ext)) {
      setErrors(prev => ({ ...prev, content: t("section.errors.uploadFailed") }))
      return
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, content: t("section.errors.fileSizeExceeded") }))
      return
    }

    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      onChange({ ...data, content: url, fileName: file.name, fileSize: file.size })
    } catch (err) {
      setErrors(prev => ({ ...prev, content: err.message }))
      if (fileInputRef.current) fileInputRef.current.value = ''
    } finally {
      setUploading(false)
    }
  }

  const validate = () => {
    const e = {}
    if (!data.title || data.title.trim().length < 3) e.title = t("section.validation.titleMinLength")
    if (data.title && data.title.length > 100) e.title = t("section.validation.titleMaxLength")
    if (data.description && data.description.length > 500) e.description = t("section.validation.descriptionMaxLength")
    if (resourceType !== 'quiz' && (!data.content || !data.content.trim())) {
      e.content = resourceType === 'document' ? t("section.validation.documentRequired") : t("section.validation.urlRequired")
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
          {t("section.resourceForm.resourceTitle")} *
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder={t("section.resourceForm.resourceTitlePlaceholder")}
          className={`w-full px-4 py-3 rounded-lg border transition-colors bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:ring-2 focus:ring-special ${
            errors.title ? 'border-red-500' : 'border-border dark:border-border-dark'
          }`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
          {t("section.resourceForm.description")}
        </label>
        <textarea
          rows={3}
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder={t("section.resourceForm.descriptionPlaceholder")}
          className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:ring-2 focus:ring-special ${
            errors.description ? 'border-red-500' : 'border-border dark:border-border-dark'
          }`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

      {/* File or URL */}
      {resourceType !== 'quiz' && (
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            {resourceType === 'document'
              ? t("section.resourceForm.uploadDocument")
              : resourceType === 'video'
              ? t("section.resourceForm.videoUrl")
              : resourceType === 'image'
              ? t("section.resourceForm.imageUrl")
              : t("section.resourceForm.linkUrl")}
          </label>

          {resourceType === 'document' ? (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                onChange={handleFileChange}
                disabled={uploading}
                className={`w-full px-4 py-3 rounded-lg border transition-colors bg-bg dark:bg-bg-dark text-text dark:text-text-dark file:bg-special/10 hover:file:bg-special/20 ${
                  uploading ? 'opacity-60' : ''
                } ${errors.content ? 'border-red-500' : 'border-border dark:border-border-dark'}`}
              />
              {uploading && (
                <div className="flex items-center space-x-2 text-sm text-text-secondary dark:text-text-dark-secondary">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-special"></div>
                  <span>{t("section.resourceForm.uploading")}</span>
                </div>
              )}
              {data.fileName && !uploading && (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>{t("section.resourceForm.uploaded", { file: data.fileName })}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ ...data, content: '', fileName: '', fileSize: null })
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    {t("section.resourceForm.remove")}
                  </button>
                </div>
              )}
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                {t("section.resourceForm.supportedFormats")}
              </p>
            </div>
          ) : (
            <input
              type="url"
              value={data.content || ''}
              onChange={(e) => onChange({ ...data, content: e.target.value })}
              placeholder={t("section.resourceForm.urlPlaceholder", { type: resourceType })}
              className={`w-full px-4 py-3 rounded-lg border transition-colors bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:ring-2 focus:ring-special ${
                errors.content ? 'border-red-500' : 'border-border dark:border-border-dark'
              }`}
            />
          )}
          {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
        </div>
      )}
    </div>
  )
}

// --- Quiz creator (for quiz resources) ---
const QuizCreator = ({ quizzes, onChange }) => {
  const { t } = useTranslation()

  const addQuestion = () => {
    const newQuiz = { id: Date.now(), Question: '', answers: ['', ''], answer: '', order: quizzes.length + 1 }
    onChange([...quizzes, newQuiz])
  }

  const updateQuestion = (id, field, value) =>
    onChange(quizzes.map((q) => (q.id === id ? { ...q, [field]: value } : q)))

  const updateAnswer = (quizId, i, value) =>
    onChange(quizzes.map((q) =>
      q.id === quizId ? { ...q, answers: q.answers.map((a, idx) => (i === idx ? value : a)) } : q
    ))

  const addAnswer = (id) => onChange(quizzes.map((q) => (q.id === id ? { ...q, answers: [...q.answers, ''] } : q)))
  const removeAnswer = (id, idx) =>
    onChange(quizzes.map((q) =>
      q.id === id ? { ...q, answers: q.answers.filter((_, i) => i !== idx) } : q
    ))

  const removeQuestion = (id) => onChange(quizzes.filter((q) => q.id !== id))
  const setCorrectAnswer = (id, answer) => onChange(quizzes.map((q) => (q.id === id ? { ...q, answer } : q)))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-montserrat font-medium text-text dark:text-text-dark">
          {t("section.quiz.title")}
        </h3>
        <button
          type="button"
          onClick={addQuestion}
          className="px-4 py-2 bg-special hover:bg-special-hover text-white font-medium rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t("section.quiz.addQuestion")}</span>
        </button>
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-8 bg-bg-secondary dark:bg-bg-dark-secondary rounded-lg border-2 border-dashed">
          <HelpCircle className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">{t("section.quiz.noQuestions")}</p>
        </div>
      )}

      {quizzes.map((quiz, index) => (
        <div key={quiz.id} className="bg-white dark:bg-bg-dark-secondary rounded-xl p-6 border border-border dark:border-border-dark">
          <div className="flex justify-between mb-4">
            <h4 className="text-md font-medium text-text dark:text-text-dark">
              {t("section.quiz.question")} {index + 1}
            </h4>
            <button type="button" onClick={() => removeQuestion(quiz.id)} className="text-red-500 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                {t("section.quiz.question")} *
              </label>
              <input
                type="text"
                value={quiz.Question || ''}
                onChange={(e) => updateQuestion(quiz.id, 'Question', e.target.value)}
                placeholder={t("section.quiz.questionPlaceholder")}
                className="w-full px-4 py-3 rounded-lg border border-border dark:border-border-dark bg-bg dark:bg-bg-dark focus:ring-2 focus:ring-special"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                {t("section.quiz.answerOptions")} *
              </label>
              <div className="space-y-2">
                {quiz.answers.map((answer, ai) => (
                  <div key={ai} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`correct-${quiz.id}`}
                      checked={quiz.answer === answer}
                      onChange={() => setCorrectAnswer(quiz.id, answer)}
                      className="w-4 h-4 text-special focus:ring-special"
                    />
                    <input
                      value={answer}
                      onChange={(e) => updateAnswer(quiz.id, ai, e.target.value)}
                      placeholder={t("section.quiz.answerPlaceholder", { number: ai + 1 })}
                      className="flex-1 px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-bg dark:bg-bg-dark"
                    />
                    {quiz.answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeAnswer(quiz.id, ai)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addAnswer(quiz.id)}
                  className="text-special hover:text-special-hover text-sm font-medium flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{t("section.quiz.addAnswer")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Rest of the component remains the same...
// (FinalActions component and main Section component continue as before)

// --- Final Actions ---
const FinalActions = ({ onAddResource, onAddSection, onFinish, createdSection, createdResources, creating }) => {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-bg-dark-secondary rounded-xl p-6 shadow-sm border border-border dark:border-border-dark">
        <h3 className="text-lg font-montserrat font-medium text-text dark:text-text-dark mb-4">
          {t("section.summary.title")}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-special" />
            <span className="text-text dark:text-text-dark">
              {t("section.summary.sectionCreated", {
                title: createdSection?.title || createdSection?.data?.title || '—',
              })}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-special" />
            <span className="text-text dark:text-text-dark">
              {t("section.summary.resourcesAdded", {
                count: createdResources?.length || 0,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={onAddResource}
          className="p-4 border-2 border-dashed border-special rounded-lg hover:bg-special/5 dark:hover:bg-special-dark/5 transition-colors text-center group"
        >
          <Plus className="w-8 h-8 text-special mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-medium text-text dark:text-text-dark">
            {t("section.summary.addResource.title")}
          </h4>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            {t("section.summary.addResource.description")}
          </p>
        </button>

        <button
          type="button"
          onClick={onAddSection}
          className="p-4 border-2 border-dashed border-special rounded-lg hover:bg-special/5 dark:hover:bg-special-dark/5 transition-colors text-center group"
        >
          <Book className="w-8 h-8 text-special mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-medium text-text dark:text-text-dark">
            {t("section.summary.addSection.title")}
          </h4>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            {t("section.summary.addSection.description")}
          </p>
        </button>

        <button
          type="button"
          onClick={onFinish}
          disabled={creating}
          className={`p-4 ${
            creating ? 'opacity-60 cursor-not-allowed' : 'bg-special hover:bg-special-hover'
          } text-white rounded-lg transition-colors text-center group`}
        >
          <Save className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-medium">
            {creating ? t("section.summary.finish.finishing") : t("section.summary.finish.title")}
          </h4>
          <p className="text-sm opacity-90">{t("section.summary.finish.description")}</p>
        </button>
      </div>
    </div>
  )
}


// Main component export continues from original...
export default function Section({ courseId, onComplete }) {
  const { t } = useTranslation()
  const { data: session, status } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [sectionData, setSectionData] = useState({ courseId })
  const [resourceData, setResourceData] = useState({ content: '' })
  const [resourceType, setResourceType] = useState('')
  const [quizzes, setQuizzes] = useState([])
  const [createdSection, setCreatedSection] = useState(null)
  const [createdResources, setCreatedResources] = useState([])
  const [loadingSection, setLoadingSection] = useState(false)
  const [loadingResource, setLoadingResource] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const { toasts, push } = useToast()

  const steps = [
    'sectionInfo',
    'resourceType',
    'resourceDetails',
    'complete',
  ]

  useEffect(() => {
    if (status === 'unauthenticated') push('error', t("section.toast.signInRequired"))
  }, [status])

  const handleCreateSection = async () => {
    if (status !== 'authenticated') {
      push('error', t("section.toast.authRequired"))
      return
    }
    setLoadingSection(true)
    try {
      const payload = { ...sectionData, courseId, order: 1 }
      const res = await fetch('/api/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const json = await safeJson(res)
      if (!res.ok) throw new Error(json?.message || t("section.toast.createFailed"))
      const created = json?.data || json
      setCreatedSection(created)
      push('success', t("section.toast.sectionCreated"))
      setCurrentStep(2)
    } catch (err) {
      push('error', err.message || t("section.toast.createFailed"))
    } finally {
      setLoadingSection(false)
    }
  }

  const handleCreateResource = async () => {
    if (!createdSection) {
      push('error', t("section.toast.createSectionFirst"))
      return
    }

    setLoadingResource(true)
    try {
      const sectionId = createdSection._id || createdSection.id
      if (!sectionId) throw new Error(t("section.errors.invalidSectionId"))

      if (resourceType === 'quiz') {
        const resourcePayload = {
          title: resourceData.title || 'Quiz Resource',
          description: resourceData.description || '',
          type: 'quiz',
          content: JSON.stringify({ quizCount: quizzes.length }),
          sectionId,
        }

        const resourceRes = await fetch('/api/resource', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(resourcePayload),
        })
        const resourceJson = await safeJson(resourceRes)
        if (!resourceRes.ok)
          throw new Error(resourceJson?.message || t("section.toast.resourceCreateFailed"))

        const createdResource = resourceJson?.data || resourceJson
        const resourceId = createdResource._id || createdResource.id

        const quizPromises = quizzes.map(async (quiz, index) => {
          const quizPayload = {
            Question: quiz.Question,
            answers: quiz.answers,
            answer: quiz.answer,
            order: index + 1,
            ResourceID: resourceId,
          }
          const res = await fetch('/api/quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(quizPayload),
          })
          const json = await safeJson(res)
          if (!res.ok)
            throw new Error(json?.message || t("section.toast.quizCreateFailed", { number: index + 1 }))
          return json?.data || json
        })
        const createdQuizzes = await Promise.all(quizPromises)
        setCreatedResources(prev => [...prev, createdResource, ...createdQuizzes])
        push('success', t("section.toast.quizCreated", { count: createdQuizzes.length }))
      } else {
        const payload = {
          title: resourceData.title,
          description: resourceData.description || '',
          type: resourceType,
          content: resourceData.content,
          sectionId,
        }
        const res = await fetch('/api/resource', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
        const json = await safeJson(res)
        if (!res.ok)
          throw new Error(json?.message || t("section.toast.resourceCreateFailed"))
        const created = json?.data || json
        setCreatedResources(prev => [...prev, created])
        push('success', t("section.toast.resourceCreated"))
      }
      setCurrentStep(4)
    } catch (err) {
      push('error', err.message || t("section.toast.resourceCreateFailed"))
    } finally {
      setLoadingResource(false)
    }
  }

  const finishFlow = async () => {
    setFinishing(true)
    try {
      push('success', t("section.toast.creationComplete"))
      if (onComplete) onComplete(createdSection, createdResources)
    } finally {
      setFinishing(false)
      redirect(`/dashboard/courses/${courseId}`)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-special mx-auto mb-4 rounded-full"></div>
          <p className="text-text-secondary">{t("section.auth.loading")}</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-4xl mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white dark:bg-bg-dark-secondary rounded-xl p-8 border">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("section.auth.required")}</h2>
          <p className="mb-4 text-text-secondary">{t("section.auth.requiredDescription")}</p>
          <button
            onClick={() => (window.location.href = '/auth/signin')}
            className="px-6 py-3 bg-special hover:bg-special-hover text-white rounded-lg"
          >
            {t("section.auth.signIn")}
          </button>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SectionForm
            data={sectionData}
            onChange={setSectionData}
            onSubmit={handleCreateSection}
            submitting={loadingSection}
          />
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-bg-dark-secondary rounded-xl p-6 border">
              <h3 className="text-lg font-montserrat font-medium mb-4">
                {t("section.resourceTypeSelector.title")}
              </h3>
              <ResourceTypeSelector selectedType={resourceType} onSelect={setResourceType} />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 border rounded-lg flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t("section.buttons.back")}</span>
              </button>
              {resourceType && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-special hover:bg-special-hover text-white rounded-lg flex items-center space-x-2"
                >
                  <span>{t("section.buttons.continue")}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-bg-dark-secondary rounded-xl p-6 border">
              <h3 className="text-lg font-montserrat font-medium mb-4">
                {t("section.steps.resourceDetails")}
              </h3>
              {resourceType === 'quiz' ? (
                <div className="space-y-6">
                  <ResourceForm data={resourceData} onChange={setResourceData} resourceType={resourceType} />
                  <QuizCreator quizzes={quizzes} onChange={setQuizzes} />
                </div>
              ) : (
                <ResourceForm data={resourceData} onChange={setResourceData} resourceType={resourceType} />
              )}
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 border rounded-lg flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t("section.buttons.back")}</span>
              </button>
              <button
                type="button"
                onClick={handleCreateResource}
                disabled={loadingResource}
                className={`px-6 py-3 ${
                  loadingResource ? 'opacity-60 cursor-not-allowed' : 'bg-special hover:bg-special-hover'
                } text-white rounded-lg flex items-center space-x-2`}
              >
                <span>{loadingResource ? t("section.buttons.creating") : t("section.buttons.createResource")}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      case 4:
        return (
          <FinalActions
            onAddResource={() => setCurrentStep(2)}
            onAddSection={() => setCurrentStep(1)}
            onFinish={finishFlow}
            createdSection={createdSection}
            createdResources={createdResources}
            creating={finishing}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-bg dark:bg-bg-dark">
      <div aria-live="polite" className="fixed right-6 top-6 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg border ${
              toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              <span>{toast.text}</span>
            </div>
          </div>
        ))}
      </div>
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} steps={steps} />
      {renderStep()}
    </div>
  )
}