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
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-montserrat font-semibold text-text dark:text-text-dark">
          Create New Section
        </h2>
        <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
          Step {currentStep} of {totalSteps}
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
                  {label}
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
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!data.title || data.title.trim().length < 3) e.title = 'Title must be at least 3 characters'
    if (data.title && data.title.length > 100) e.title = 'Title cannot exceed 100 characters'
    if (data.description && data.description.length > 500) e.description = 'Description cannot exceed 500 characters'
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
        <h3 className="text-lg font-montserrat font-medium text-text dark:text-text-dark mb-4">Section Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">Section Title *</label>
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
              placeholder="Enter section title"
            />
            {errors.title && <p id="title-error" className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">Description (Optional)</label>
            <textarea
              name="description"
              rows={4}
              value={data.description || ''}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-special focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-border dark:border-border-dark'
              }`}
              placeholder="Describe what this section covers..."
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
          <span>{submitting ? 'Creating...' : 'Continue'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

// --- Resource Type selector ---
const ResourceTypeSelector = ({ selectedType, onSelect }) => {
  const resourceTypes = [
    { type: 'video', icon: <FileText className="w-6 h-6" />, title: 'Video', description: 'Upload or link to video content' },
    { type: 'document', icon: <Book className="w-6 h-6" />, title: 'Document', description: 'PDF, Word, or other document files' },
    { type: 'link', icon: <Link className="w-6 h-6" />, title: 'External Link', description: 'Link to external resources or websites' },
    { type: 'quiz', icon: <HelpCircle className="w-6 h-6" />, title: 'Quiz', description: 'Create interactive quiz questions' },
    { type: 'image', icon: <FileText className="w-6 h-6" />, title: 'Image', description: 'Add image resources' }
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
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  
  // Cloudinary upload function using unsigned preset
  const uploadToCloudinary = async (file) => {
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'benzen';
      
      if (!cloudName) {
        throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
      }
      
      // Créer FormData pour l'upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      
      console.log(`Uploading to Cloudinary: ${cloudName}, preset: ${uploadPreset}`);
      
      // Upload vers Cloudinary (resource_type: 'raw' pour les PDFs/documents)
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(
          errorData.error?.message || 
          `Upload failed with status ${uploadResponse.status}`
        );
      }
      
      const uploadData = await uploadResponse.json();
      const publicUrl = uploadData.secure_url;
      
      if (!publicUrl) {
        throw new Error('No URL returned from Cloudinary');
      }
      
      console.log('Cloudinary upload successful:', { 
        publicId: uploadData.public_id,
        publicUrl,
        format: uploadData.format
      });
      
      return publicUrl;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }
  
  // Gérer le changement de fichier
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validation du type de fichier
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    const fileExtension = file.name.split('.').pop().toLowerCase()
    const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx']
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setErrors(prev => ({ ...prev, content: 'Please upload a PDF, Word, Excel, or text file' }))
      return
    }
    
    // Validation de la taille (25MB max)
    const maxSize = 25 * 1024 * 1024 // 25MB
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, content: `File size must be less than 25MB` }))
      return
    }
    
    setUploading(true)
    setErrors(prev => ({ ...prev, content: null }))
    
    try {
      const cloudinaryUrl = await uploadToCloudinary(file)
      onChange({ 
        ...data, 
        content: cloudinaryUrl, 
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || fileExtension
      })
      setErrors(prev => ({ ...prev, content: null }))
    } catch (error) {
      console.error('Upload error:', error)
      setErrors(prev => ({ ...prev, content: error.message }))
      // Reset file input on error
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } finally {
      setUploading(false)
    }
  }
  
  const validate = () => {
    const e = {}
    if (!data.title || data.title.trim().length < 3) e.title = 'Title must be at least 3 characters'
    if (data.title && data.title.length > 100) e.title = 'Title cannot exceed 100 characters'
    if (data.description && data.description.length > 500) e.description = 'Description cannot exceed 500 characters'
    if (resourceType !== 'quiz' && (!data.content || !data.content.trim())) {
      e.content = resourceType === 'document' ? 'Please upload a document' : 'URL is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }
  
  return (
    <div className="space-y-4">
      {/* Title input */}
      <div>
        <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
          Resource Title *
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className={`w-full px-4 py-3 rounded-lg border transition-colors bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-special ${
            errors.title ? 'border-red-500' : 'border-border dark:border-border-dark'
          }`}
          placeholder="Enter resource title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Description textarea */}
      <div>
        <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
          Description (Optional)
        </label>
        <textarea
          rows={3}
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-special ${
            errors.description ? 'border-red-500' : 'border-border dark:border-border-dark'
          }`}
          placeholder="Describe this resource..."
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

      {/* Content input - Document upload ou URL */}
      {resourceType !== 'quiz' && (
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            {resourceType === 'document' ? 'Upload Document *' : 
             resourceType === 'video' ? 'Video URL *' : 
             resourceType === 'image' ? 'Image URL *' : 'Link URL *'}
          </label>
          
          {resourceType === 'document' ? (
            <div className="space-y-2">
              {/* File input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                onChange={handleFileChange}
                disabled={uploading}
                className={`w-full px-4 py-3 rounded-lg border transition-colors bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-special file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-special/10 file:text-special hover:file:bg-special/20 ${
                  errors.content ? 'border-red-500' : 'border-border dark:border-border-dark'
                } ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
              
              {/* Upload progress */}
              {uploading && (
                <div className="flex items-center space-x-2 text-sm text-text-secondary dark:text-text-dark-secondary">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-special"></div>
                  <span>Uploading document to Cloudinary...</span>
                </div>
              )}
              
              {/* Upload success */}
              {data.fileName && !uploading && (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Uploaded: {data.fileName}</span>
                    {data.fileSize && (
                      <span className="text-xs opacity-75">
                        ({(data.fileSize / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ ...data, content: '', fileName: '', fileSize: null, fileType: null })
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
              
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                Supported formats: PDF, Word, Excel, Text files (Max size: 25MB)
              </p>
            </div>
          ) : (
            // URL input for video/image/link
            <input
              type="url"
              value={data.content || ''}
              onChange={(e) => onChange({ ...data, content: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border transition-colors bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-special ${
                errors.content ? 'border-red-500' : 'border-border dark:border-border-dark'
              }`}
              placeholder={`Enter ${resourceType} URL`}
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
  const addQuestion = () => {
    const newQuiz = { 
      id: Date.now(), 
      Question: '', 
      answers: ['', ''], 
      answer: '', 
      order: quizzes.length + 1 
    }
    onChange([...quizzes, newQuiz])
  }

  const updateQuestion = (id, field, value) => onChange(quizzes.map((q) => (q.id === id ? { ...q, [field]: value } : q)))

  const updateAnswer = (quizId, answerIndex, value) =>
    onChange(quizzes.map((q) => (q.id === quizId ? { ...q, answers: q.answers.map((a, i) => (i === answerIndex ? value : a)) } : q)))

  const addAnswer = (quizId) => onChange(quizzes.map((q) => (q.id === quizId ? { ...q, answers: [...q.answers, ''] } : q)))

  const removeAnswer = (quizId, answerIndex) =>
    onChange(
      quizzes.map((q) =>
        q.id === quizId
          ? {
              ...q,
              answers: q.answers.filter((_, idx) => idx !== answerIndex),
              answer: q.answers[answerIndex] === q.answer ? (q.answers[0] !== q.answers[answerIndex] ? q.answers[0] : '') : q.answer
            }
          : q
      )
    )

  const removeQuestion = (id) => onChange(quizzes.filter((q) => q.id !== id))

  const setCorrectAnswer = (quizId, answerText) => {
    onChange(quizzes.map((q) => (q.id === quizId ? { ...q, answer: answerText } : q)))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-montserrat font-medium text-text dark:text-text-dark">Quiz Questions</h3>
        <button type="button" onClick={addQuestion} className="px-4 py-2 bg-special hover:bg-special-hover text-white font-medium rounded-lg transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-8 bg-bg-secondary dark:bg-bg-dark-secondary rounded-lg border-2 border-dashed border-border dark:border-border-dark">
          <HelpCircle className="w-12 h-12 text-text-secondary dark:text-text-dark-secondary mx-auto mb-3" />
          <p className="text-text-secondary dark:text-text-dark-secondary">No questions added yet. Click "Add Question" to get started.</p>
        </div>
      )}

      {quizzes.map((quiz, index) => (
        <div key={quiz.id} className="bg-white dark:bg-bg-dark-secondary rounded-xl p-6 border border-border dark:border-border-dark">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-md font-medium text-text dark:text-text-dark">Question {index + 1}</h4>
            <button type="button" onClick={() => removeQuestion(quiz.id)} className="text-red-500 hover:text-red-600 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">Question *</label>
              <input 
                type="text" 
                value={quiz.Question || ''} 
                onChange={(e) => updateQuestion(quiz.id, 'Question', e.target.value)} 
                className="w-full px-4 py-3 rounded-lg border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-special focus:border-transparent" 
                placeholder="Enter your question" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">Answer Options *</label>
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
                      className="flex-1 px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-special focus:border-transparent" 
                      placeholder={`Answer ${ai + 1}`} 
                    />
                    {quiz.answers.length > 2 && (
                      <button type="button" onClick={() => removeAnswer(quiz.id, ai)} className="text-red-500 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button type="button" onClick={() => addAnswer(quiz.id)} className="text-special hover:text-special-hover text-sm font-medium transition-colors flex items-center space-x-1">
                  <Plus className="w-3 h-3" />
                  <span>Add Answer</span>
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
const FinalActions = ({ onAddResource, onAddSection, onFinish, createdSection, createdResources, creating }) => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-bg-dark-secondary rounded-xl p-6 shadow-sm border border-border dark:border-border-dark">
      <h3 className="text-lg font-montserrat font-medium text-text dark:text-text-dark mb-4">Creation Summary</h3>

      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-special" />
          <span className="text-text dark:text-text-dark">
            Section "{createdSection?.title || createdSection?.data?.title || '—'}" created
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-special" />
          <span className="text-text dark:text-text-dark">{(createdResources?.length) || 0} resource(s) added</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button type="button" onClick={onAddResource} className="p-4 border-2 border-dashed border-special rounded-lg hover:bg-special/5 dark:hover:bg-special-dark/5 transition-colors text-center group">
        <Plus className="w-8 h-8 text-special mx-auto mb-2 group-hover:scale-110 transition-transform" />
        <h4 className="font-medium text-text dark:text-text-dark">Add Resource</h4>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">Add another resource to this section</p>
      </button>

      <button type="button" onClick={onAddSection} className="p-4 border-2 border-dashed border-special rounded-lg hover:bg-special/5 dark:hover:bg-special-dark/5 transition-colors text-center group">
        <Book className="w-8 h-8 text-special mx-auto mb-2 group-hover:scale-110 transition-transform" />
        <h4 className="font-medium text-text dark:text-text-dark">Add Section</h4>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">Create a new section</p>
      </button>

      <button type="button" onClick={onFinish} disabled={creating} className={`p-4 ${creating ? 'opacity-60 cursor-not-allowed' : 'bg-special hover:bg-special-hover'} text-white rounded-lg transition-colors text-center group`}>
        <Save className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
        <h4 className="font-medium">{creating ? 'Finishing...' : 'Finish'}</h4>
        <p className="text-sm opacity-90">Complete the creation process</p>
      </button>
    </div>
  </div>
)

// Main component export continues from original...
export default function Section({ courseId, onComplete }) {
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

  const steps = ['Section Info', 'Resource Type', 'Resource Details', 'Complete']

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      push('error', 'Please sign in to create sections')
    }
  }, [status])

  // Load draft data on mount
  useEffect(() => {
    if (!courseId) return
    
    const key = `section:draft:${courseId}`
    const draft = localStorage.getItem(key)
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        if (parsed.sectionData) setSectionData(prev => ({ ...prev, ...parsed.sectionData }))
        if (parsed.resourceData) setResourceData(prev => ({ ...prev, ...parsed.resourceData }))
        if (parsed.resourceType) setResourceType(parsed.resourceType)
        if (parsed.quizzes) setQuizzes(parsed.quizzes)
      } catch (e) {
        console.warn('Failed to parse draft data:', e)
      }
    }
  }, [courseId])

  // Save draft data when state changes (debounced)
  useEffect(() => {
    if (!courseId) return

    const timeoutId = setTimeout(() => {
      const key = `section:draft:${courseId}`
      const draftData = { sectionData, resourceData, resourceType, quizzes }
      localStorage.setItem(key, JSON.stringify(draftData))
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [courseId, sectionData, resourceData, resourceType, quizzes])

  // Handle page unload
  useEffect(() => {
    if (!courseId) return

    const onUnload = () => {
      const key = `section:draft:${courseId}`
      const draftData = { sectionData, resourceData, resourceType, quizzes }
      localStorage.setItem(key, JSON.stringify(draftData))
    }
    
    window.addEventListener('beforeunload', onUnload)
    return () => {
      window.removeEventListener('beforeunload', onUnload)
      onUnload()
    }
  }, [courseId, sectionData, resourceData, resourceType, quizzes])

  const handleCreateSection = async () => {
    if (status !== 'authenticated') {
      push('error', 'Please sign in to create sections')
      return
    }

    setLoadingSection(true)
    try {
      const payload = {
        ...sectionData,
        courseId,
        order: 1
      }

      const res = await fetch('/api/section', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const json = await safeJson(res)
      
      if (res.status === 401) {
        push('error', 'Authentication required - please sign in')
        return
      }
      
      if (!res.ok) {
        push('error', json?.msg || json?.message || 'Failed to create section')
        throw new Error(json?.msg || json?.message || 'Failed to create section')
      }

      const created = json?.data || json
      setCreatedSection(created)
      push('success', 'Section created successfully')
      setCurrentStep(2)
      
    } catch (err) {
      console.error('Create section error:', err)
      push('error', err.message || 'Failed to create section')
    } finally {
      setLoadingSection(false)
    }
  }

  const handleCreateResource = async () => {
    if (!createdSection) {
      push('error', 'Create the section first')
      return
    }

    setLoadingResource(true)
    try {
      const sectionId = createdSection._id || createdSection.id
      if (!sectionId) {
        throw new Error('Invalid section ID')
      }

      if (resourceType === 'quiz') {
        const resourcePayload = {
          title: resourceData.title || 'Quiz Resource',
          description: resourceData.description || '',
          type: 'quiz',
          content: JSON.stringify({ quizCount: quizzes.length }),
          sectionId: sectionId,
          order: createdResources.length + 1
        }

        console.log('Creating quiz resource:', resourcePayload)

        const resourceRes = await fetch('/api/resource', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(resourcePayload),
        })

        const resourceJson = await safeJson(resourceRes)
        if (!resourceRes.ok) {
          throw new Error(resourceJson?.msg || resourceJson?.message || 'Failed to create quiz resource')
        }

        const createdResource = resourceJson?.data || resourceJson
        const resourceId = createdResource._id || createdResource.id

        console.log('Quiz resource created:', resourceId)

        const quizPromises = quizzes.map(async (quiz, index) => {
          const quizPayload = {
            Question: quiz.Question,
            answers: quiz.answers,
            answer: quiz.answer,
            order: index + 1,
            ResourceID: resourceId
          }

          console.log('Creating quiz question:', { Question: quiz.Question, ResourceID: resourceId })

          const res = await fetch('/api/quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(quizPayload),
          })

          const json = await safeJson(res)
          if (!res.ok) {
            console.error('Quiz creation failed:', json)
            throw new Error(json?.msg || json?.message || `Failed to create quiz question ${index + 1}`)
          }
          return json?.data || json
        })

        const createdQuizzes = await Promise.all(quizPromises)
        
        setCreatedResources(prev => [...prev, createdResource, ...createdQuizzes])
        push('success', `Quiz resource with ${createdQuizzes.length} questions created successfully`)
        
      } else {
        const payload = {
          title: resourceData.title,
          description: resourceData.description || '',
          type: resourceType,
          content: resourceData.content,
          sectionId: sectionId,
          order: createdResources.length + 1
        }

        if (resourceType === 'document' && resourceData.fileName) {
          payload.fileName = resourceData.fileName
          payload.fileType = resourceData.fileType || 'document'
        }

        console.log('Creating regular resource:', payload)

        const res = await fetch('/api/resource', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
        
        const json = await safeJson(res)
        if (!res.ok) {
          throw new Error(json?.msg || json?.message || 'Failed to create resource')
        }

        const created = json?.data || json
        setCreatedResources(prev => [...prev, created])
        push('success', 'Resource created successfully')
      }

      setCurrentStep(4)
      
    } catch (err) {
      console.error('Create resource error:', err)
      push('error', err.message || 'Failed to create resource')
    } finally {
      setLoadingResource(false)
    }
  }

  const resetResourceFlow = () => {
    setResourceData({ content: '' })
    setResourceType('')
    setQuizzes([])
    setCurrentStep(2)
  }

  const resetToNewSection = () => {
    setSectionData({ courseId })
    setResourceData({ content: '' })
    setResourceType('')
    setQuizzes([])
    setCreatedSection(null)
    setCreatedResources([])
    setCurrentStep(1)
    if (courseId) {
      localStorage.removeItem(`section:draft:${courseId}`)
    }
  }

  const finishFlow = async () => {
    setFinishing(true)
    try {
      if (courseId) {
        localStorage.removeItem(`section:draft:${courseId}`)
      }
      
      push('success', 'Section creation completed successfully')
      
      if (onComplete) {
        onComplete(createdSection, createdResources)
      }
      
    } catch (err) {
      push('error', err.message || 'Error finishing creation process')
    } finally {
      setFinishing(false)
      redirect(`/dashboard/courses/${courseId}`)
    }
  }

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-bg dark:bg-bg-dark min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-special mx-auto mb-4"></div>
          <p className="text-text-secondary dark:text-text-dark-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-bg dark:bg-bg-dark min-h-screen flex items-center justify-center">
        <div className="text-center bg-white dark:bg-bg-dark-secondary rounded-xl p-8 border border-border dark:border-border-dark">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-2">Authentication Required</h2>
          <p className="text-text-secondary dark:text-text-dark-secondary mb-4">You need to sign in to create sections.</p>
          <button 
            onClick={() => window.location.href = '/auth/signin'} 
            className="px-6 py-3 bg-special hover:bg-special-hover text-white font-medium rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SectionForm data={sectionData} onChange={setSectionData} onSubmit={handleCreateSection} submitting={loadingSection} />

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-bg-dark-secondary rounded-xl p-6 shadow-sm border border-border dark:border-border-dark">
              <h3 className="text-lg font-montserrat font-medium text-text dark:text-text-dark mb-4">Choose Resource Type</h3>
              <ResourceTypeSelector selectedType={resourceType} onSelect={setResourceType} />
            </div>

            <div className="flex justify-between">
              <button 
                type="button" 
                onClick={() => setCurrentStep(1)} 
                className="px-6 py-3 border border-border dark:border-border-dark text-text dark:text-text-dark font-medium rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-dark transition-colors flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {resourceType && (
                <button 
                  type="button" 
                  onClick={() => setCurrentStep(3)} 
                  className="px-6 py-3 bg-special hover:bg-special-hover text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-bg-dark-secondary rounded-xl p-6 shadow-sm border border-border dark:border-border-dark">
              <h3 className="text-lg font-montserrat font-medium text-text dark:text-text-dark mb-4">Resource Details</h3>

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
                className="px-6 py-3 border border-border dark:border-border-dark text-text dark:text-text-dark font-medium rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-dark transition-colors flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button 
                type="button" 
                onClick={handleCreateResource} 
                disabled={loadingResource} 
                className={`px-6 py-3 ${loadingResource ? 'opacity-60 cursor-not-allowed' : 'bg-special hover:bg-special-hover'} text-white font-medium rounded-lg transition-colors flex items-center space-x-2`}
              >
                <span>{loadingResource ? 'Creating...' : 'Create Resource'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <FinalActions
            onAddResource={resetResourceFlow}
            onAddSection={resetToNewSection}
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
    <div className="max-w-4xl mx-auto p-6 bg-bg dark:bg-bg-dark min-h-screen">
      <div aria-live="polite" className="fixed right-6 top-6 z-50 space-y-2">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 ${
              toast.type === 'error' 
                ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' 
                : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
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