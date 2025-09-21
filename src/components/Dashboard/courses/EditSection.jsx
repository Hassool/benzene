import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Plus,
  Save,
  Trash2,
  Edit,
  X,
  Book,
  FileText,
  Link,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, {
      credentials: 'include',
      ...options
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Utility helpers
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

// Resource Type selector
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

// Resource form
const ResourceForm = ({ data, onChange, resourceType, errors, mode = 'create' }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">Resource Title *</label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className={`w-full px-4 py-3 rounded-lg border transition-colors bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-special focus:border-transparent ${
            errors?.title ? 'border-red-500' : 'border-border dark:border-border-dark'
          }`}
          placeholder="Enter resource title"
        />
        {errors?.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">Description (Optional)</label>
        <textarea
          rows={3}
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-special focus:border-transparent ${
            errors?.description ? 'border-red-500' : 'border-border dark:border-border-dark'
          }`}
          placeholder="Describe this resource..."
        />
        {errors?.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

      {resourceType !== 'quiz' && (
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            {resourceType === 'document' ? 'Document URL' : resourceType === 'video' ? 'Video URL' : resourceType === 'image' ? 'Image URL' : 'Link URL'} *
          </label>
          <input
            type="url"
            value={data.content || ''}
            onChange={(e) => onChange({ ...data, content: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border transition-colors bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-special focus:border-transparent ${
              errors?.content ? 'border-red-500' : 'border-border dark:border-border-dark'
            }`}
            placeholder={`Enter ${resourceType} URL`}
            required={resourceType !== 'quiz'}
          />
          {errors?.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">Order</label>
          <input
            type="number"
            min="1"
            value={data.order || ''}
            onChange={(e) => onChange({ ...data, order: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-3 rounded-lg border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-special focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2 mt-6">
          <input
            type="checkbox"
            id="isPublished"
            checked={data.isPublished || false}
            onChange={(e) => onChange({ ...data, isPublished: e.target.checked })}
            className="w-4 h-4 text-special focus:ring-special"
          />
          <label htmlFor="isPublished" className="text-sm font-medium text-text dark:text-text-dark">
            Publish this resource
          </label>
        </div>
      </div>
    </div>
  )
}

// QuizCreator component
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

// Section form
const SectionForm = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-bg-dark-secondary rounded-xl p-6 shadow-sm border border-border dark:border-border-dark">
        <h3 className="text-lg font-montserrat font-medium text-text dark:text-text-dark mb-4">Section Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">Section Title *</label>
            <input
              name="title"
              aria-invalid={!!errors?.title}
              aria-describedby={errors?.title ? 'title-error' : undefined}
              type="text"
              value={data.title || ''}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border transition-colors bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-special focus:border-transparent ${
                errors?.title ? 'border-red-500' : 'border-border dark:border-border-dark'
              }`}
              placeholder="Enter section title"
            />
            {errors?.title && <p id="title-error" className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">Description (Optional)</label>
            <textarea
              name="description"
              rows={4}
              value={data.description || ''}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-special focus:border-transparent ${
                errors?.description ? 'border-red-500' : 'border-border dark:border-border-dark'
              }`}
              placeholder="Describe what this section covers..."
            />
            {errors?.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={data.isPublished || false}
              onChange={(e) => onChange({ ...data, isPublished: e.target.checked })}
              className="w-4 h-4 text-special focus:ring-special"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-text dark:text-text-dark">
              Publish this section
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

// Resource item component
const ResourceItem = ({ resource, onEdit, onDelete, onMove }) => {
  const [expanded, setExpanded] = useState(false)
  
  const getIcon = (type) => {
    switch (type) {
      case 'video': return <FileText className="w-5 h-5" />
      case 'document': return <Book className="w-5 h-5" />
      case 'link': return <Link className="w-5 h-5" />
      case 'quiz': return <HelpCircle className="w-5 h-5" />
      case 'image': return <FileText className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  return (
    <div className="bg-white dark:bg-bg-dark-secondary rounded-xl border border-border dark:border-border-dark overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-special/10 text-special">
            {getIcon(resource.type)}
          </div>
          <div>
            <h4 className="font-medium text-text dark:text-text-dark">{resource.title}</h4>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
              {resource.type} • Order: {resource.order} • {resource.isPublished ? 'Published' : 'Draft'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="p-1 text-text-secondary dark:text-text-dark-secondary hover:text-text dark:hover:text-text-dark"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => onEdit(resource)} 
            className="p-1 text-text-secondary dark:text-text-dark-secondary hover:text-special"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDelete(resource._id)} 
            className="p-1 text-text-secondary dark:text-text-dark-secondary hover:text-red-500"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 border-t border-border dark:border-border-dark pt-4">
          {resource.description && (
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-3">{resource.description}</p>
          )}
          
          {resource.type !== 'quiz' && resource.content && (
            <div className="text-sm">
              <span className="font-medium text-text dark:text-text-dark">Content: </span>
              <a href={resource.content} target="_blank" rel="noopener noreferrer" className="text-special hover:underline break-all">
                {resource.content}
              </a>
            </div>
          )}
          
          {resource.type === 'quiz' && (
            <div className="text-sm text-text-secondary dark:text-text-dark-secondary">
              Quiz resource - click edit to manage questions
            </div>
          )}
          
          <div className="flex items-center space-x-4 mt-3">
            <button 
              onClick={() => onMove(resource._id, 'up')}
              disabled={resource.order <= 1}
              className="text-sm text-special hover:text-special-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Move Up
            </button>
            <button 
              onClick={() => onMove(resource._id, 'down')}
              className="text-sm text-special hover:text-special-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Move Down
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Main EditSection component
export default function EditSection({ sectionId, onComplete }) {
  const { data: session, status } = useSession()
  const [section, setSection] = useState(null)
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showResourceForm, setShowResourceForm] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [resourceType, setResourceType] = useState('')
  const [resourceData, setResourceData] = useState({})
  const [resourceErrors, setResourceErrors] = useState({})
  const [sectionErrors, setSectionErrors] = useState({})
  const [hasFetched, setHasFetched] = useState(false)
  const [quizzes, setQuizzes] = useState([])

  const { toasts, push } = useToast()

  // Fetch section and resources
  useEffect(() => {
    if (!sectionId || hasFetched) return;
    
    let isMounted = true;
    
    const fetchSection = async () => {
      try {
        setLoading(true);
        console.log('Fetching section with ID:', sectionId);
        
        const [sectionRes, resourcesRes] = await Promise.all([
          safeFetch(`/api/section?id=${sectionId}`),
          safeFetch(`/api/resource?sectionId=${sectionId}`)
        ]);
        
        if (!isMounted) return;
        
        if (sectionRes.success) {
          setSection(sectionRes.data);
        } else {
          push('error', sectionRes.message || 'Failed to fetch section');
        }
        
        if (resourcesRes.success) {
          setResources(resourcesRes.data || []);
        } else {
          push('error', resourcesRes.message || 'Failed to fetch resources');
        }
      } catch (err) {
        console.error('Fetch section error:', err);
        push('error', `Failed to fetch section: ${err.message}`);
      } finally {
        if (isMounted) {
          setHasFetched(true);
          setLoading(false);
        }
      }
    };
    
    fetchSection();
    
    return () => {
      isMounted = false;
    };
  }, [sectionId, push, hasFetched]);

  const validateSection = () => {
    const errors = {}
    if (!section.title || section.title.trim().length < 3) errors.title = 'Title must be at least 3 characters'
    if (section.title && section.title.length > 100) errors.title = 'Title cannot exceed 100 characters'
    if (section.description && section.description.length > 500) errors.description = 'Description cannot exceed 500 characters'
    
    setSectionErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateResource = () => {
    const errors = {}
    if (!resourceData.title || resourceData.title.trim().length < 3) errors.title = 'Title must be at least 3 characters'
    if (resourceData.title && resourceData.title.length > 100) errors.title = 'Title cannot exceed 100 characters'
    if (resourceData.description && resourceData.description.length > 500) errors.description = 'Description cannot exceed 500 characters'
    
    // For non-quiz resources, require URL in content
    if (resourceType !== 'quiz' && (!resourceData.content || !resourceData.content.trim())) {
      errors.content = 'URL is required for this resource type'
    }
    
    // For quiz resources, require at least one question
    if (resourceType === 'quiz' && quizzes.length === 0) {
      errors.quizzes = 'At least one quiz question is required'
    }
    
    setResourceErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveSection = async () => {
    if (!validateSection()) return
    
    try {
      setSaving(true)
      const res = await fetch(`/api/section?id=${sectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(section),
      })
      
      const json = await safeJson(res)
      
      if (!res.ok) {
        push('error', json?.msg || 'Failed to update section')
        return
      }
      
      push('success', 'Section updated successfully')
      setSection(json.data)
    } catch (err) {
      console.error('Update section error:', err)
      push('error', 'Failed to update section')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveResource = async () => {
    if (!validateResource()) return
    
    try {
      setSaving(true)
      const url = editingResource ? `/api/resource?id=${editingResource._id}` : '/api/resource'
      const method = editingResource ? 'PATCH' : 'POST'
      
      let payload = {
        ...resourceData,
        type: resourceType,
        sectionId: sectionId
      }
      
      // For quiz resources, handle quiz creation
      if (resourceType === 'quiz') {
        if (editingResource) {
          // For editing quiz resources, just update metadata
          payload.content = JSON.stringify({ quizCount: quizzes.length })
        } else {
          // For new quiz resources, create the resource first
          payload.content = JSON.stringify({ quizCount: quizzes.length })
          
          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
          })
          
          const json = await safeJson(res)
          
          if (!res.ok) {
            push('error', json?.msg || 'Failed to create quiz resource')
            return
          }
          
          const createdResource = json?.data || json
          const resourceId = createdResource._id || createdResource.id
          
          // Now create the quiz questions
          const quizPromises = quizzes.map(async (quiz, index) => {
            const quizPayload = {
              Question: quiz.Question,
              answers: quiz.answers,
              answer: quiz.answer,
              order: index + 1,
              ResourceID: resourceId
            }
            
            const quizRes = await fetch('/api/quiz', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(quizPayload),
            })
            
            const quizJson = await safeJson(quizRes)
            if (!quizRes.ok) {
              console.error('Quiz creation failed:', quizJson)
              throw new Error(quizJson?.msg || quizJson?.message || `Failed to create quiz question ${index + 1}`)
            }
            return quizJson?.data || quizJson
          })
          
          const createdQuizzes = await Promise.all(quizPromises)
          
          push('success', `Quiz resource with ${createdQuizzes.length} questions created successfully`)
          setResources([...resources, createdResource])
          
          // Reset form
          setShowResourceForm(false)
          setEditingResource(null)
          setResourceType('')
          setResourceData({})
          setResourceErrors({})
          setQuizzes([])
          
          return
        }
      }
      
      // For non-quiz resources or editing quiz metadata
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      
      const json = await safeJson(res)
      
      if (!res.ok) {
        push('error', json?.msg || `Failed to ${editingResource ? 'update' : 'create'} resource`)
        return
      }
      
      push('success', `Resource ${editingResource ? 'updated' : 'created'} successfully`)
      
      // Update resources list
      if (editingResource) {
        setResources(resources.map(r => r._id === editingResource._id ? json.data : r))
      } else {
        setResources([...resources, json.data])
      }
      
      // Reset resource form
      setShowResourceForm(false)
      setEditingResource(null)
      setResourceType('')
      setResourceData({})
      setResourceErrors({})
      setQuizzes([])
    } catch (err) {
      console.error('Save resource error:', err)
      push('error', `Failed to ${editingResource ? 'update' : 'create'} resource`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteResource = async (id) => {
    if (!confirm('Are you sure you want to delete this resource?')) return
    
    try {
      setSaving(true)
      const res = await fetch(`/api/resource?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      const json = await safeJson(res)
      
      if (!res.ok) {
        push('error', json?.msg || 'Failed to delete resource')
        return
      }
      
      push('success', 'Resource deleted successfully')
      setResources(resources.filter(r => r._id !== id))
    } catch (err) {
      console.error('Delete resource error:', err)
      push('error', 'Failed to delete resource')
    } finally {
      setSaving(false)
    }
  }

  const handleMoveResource = async (id, direction) => {
    const resource = resources.find(r => r._id === id)
    if (!resource) return
    
    const currentOrder = resource.order
    let newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1
    
    // Check if new order is valid
    if (newOrder < 1 || newOrder > resources.length) return
    
    // Find the resource that currently has the target order
    const targetResource = resources.find(r => r.order === newOrder)
    
    if (!targetResource) return
    
    try {
      setSaving(true)
      
      // Update both resources
      const updates = [
        fetch(`/api/resource?id=${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ order: newOrder }),
        }),
        fetch(`/api/resource?id=${targetResource._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ order: currentOrder }),
        })
      ]
      
      const responses = await Promise.all(updates)
      const results = await Promise.all(responses.map(r => safeJson(r)))
      
      const hasError = responses.some(r => !r.ok)
      if (hasError) {
        push('error', 'Failed to reorder resources')
        return
      }
      
      push('success', 'Resource order updated')
      
      // Update local state
      setResources(resources.map(r => {
        if (r._id === id) return { ...r, order: newOrder }
        if (r._id === targetResource._id) return { ...r, order: currentOrder }
        return r
      }))
    } catch (err) {
      console.error('Move resource error:', err)
      push('error', 'Failed to reorder resources')
    } finally {
      setSaving(false)
    }
  }

  const handleEditResource = (resource) => {
    setEditingResource(resource)
    setResourceType(resource.type)
    setResourceData({
      title: resource.title,
      description: resource.description || '',
      content: resource.content || '',
      order: resource.order,
      isPublished: resource.isPublished
    })
    
    // If it's a quiz resource, fetch the quiz questions
    if (resource.type === 'quiz') {
      // You might want to fetch existing quiz questions here
      setQuizzes([]) // Reset quizzes for now
    } else {
      setQuizzes([])
    }
    
    setShowResourceForm(true)
  }

  const handleNewResource = () => {
    setEditingResource(null)
    setResourceType('')
    setResourceData({
      title: '',
      description: '',
      content: '',
      order: resources.length + 1,
      isPublished: false
    })
    setQuizzes([])
    setShowResourceForm(true)
  }

  const cancelResourceForm = () => {
    setShowResourceForm(false)
    setEditingResource(null)
    setResourceType('')
    setResourceData({})
    setResourceErrors({})
    setQuizzes([])
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-bg dark:bg-bg-dark min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-special mx-auto mb-4"></div>
          <p className="text-text-secondary dark:text-text-dark-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!section) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-bg dark:bg-bg-dark min-h-screen flex items-center justify-center">
        <div className="text-center bg-white dark:bg-bg-dark-secondary rounded-xl p-8 border border-border dark:border-border-dark">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-2">Section Not Found</h2>
          <p className="text-text-secondary dark:text-text-dark-secondary">The section you're trying to edit doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-bg dark:bg-bg-dark min-h-screen">
      {/* Toast notifications */}
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

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-montserrat font-semibold text-text dark:text-text-dark">Edit Section</h1>
        <button
          onClick={handleSaveSection}
          disabled={saving}
          className={`px-4 py-2 ${saving ? 'opacity-60 cursor-not-allowed' : 'hover:bg-special-hover'} bg-special text-white font-medium rounded-lg transition-colors flex items-center space-x-2`}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Section'}</span>
        </button>
      </div>

      <SectionForm data={section} onChange={setSection} errors={sectionErrors} />

      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-montserrat font-semibold text-text dark:text-text-dark">Resources</h2>
          <button
            onClick={handleNewResource}
            className="px-4 py-2 bg-special hover:bg-special-hover text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        </div>

        {showResourceForm ? (
          <div className="bg-white dark:bg-bg-dark-secondary rounded-xl p-6 shadow-sm border border-border dark:border-border-dark mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-montserrat font-medium text-text dark:text-text-dark">
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </h3>
              <button onClick={cancelResourceForm} className="text-text-secondary dark:text-text-dark-secondary hover:text-text dark:hover:text-text-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!resourceType ? (
              <div>
                <h4 className="text-md font-medium text-text dark:text-text-dark mb-4">Choose Resource Type</h4>
                <ResourceTypeSelector selectedType={resourceType} onSelect={setResourceType} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-text dark:text-text-dark">
                    {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Resource
                  </h4>
                  <button 
                    onClick={() => setResourceType('')} 
                    className="text-sm text-special hover:text-special-hover"
                  >
                    Change Type
                  </button>
                </div>

                {resourceType === 'quiz' ? (
                  <div className="space-y-6">
                    <ResourceForm 
                      data={resourceData} 
                      onChange={setResourceData} 
                      resourceType={resourceType} 
                      errors={resourceErrors}
                      mode={editingResource ? 'edit' : 'create'}
                    />
                    <QuizCreator quizzes={quizzes} onChange={setQuizzes} />
                    {resourceErrors.quizzes && <p className="text-sm text-red-500">{resourceErrors.quizzes}</p>}
                  </div>
                ) : (
                  <ResourceForm 
                    data={resourceData} 
                    onChange={setResourceData} 
                    resourceType={resourceType} 
                    errors={resourceErrors}
                    mode={editingResource ? 'edit' : 'create'}
                  />
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelResourceForm}
                    className="px-4 py-2 border border-border dark:border-border-dark text-text dark:text-text-dark font-medium rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-dark transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveResource}
                    disabled={saving}
                    className={`px-4 py-2 ${saving ? 'opacity-60 cursor-not-allowed' : 'hover:bg-special-hover'} bg-special text-white font-medium rounded-lg transition-colors`}
                  >
                    {saving ? 'Saving...' : editingResource ? 'Update Resource' : 'Create Resource'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {resources.length === 0 ? (
          <div className="text-center py-12 bg-bg-secondary dark:bg-bg-dark-secondary rounded-lg border-2 border-dashed border-border dark:border-border-dark">
            <FileText className="w-12 h-12 text-text-secondary dark:text-text-dark-secondary mx-auto mb-3" />
            <p className="text-text-secondary dark:text-text-dark-secondary">No resources added yet.</p>
            <button
              onClick={handleNewResource}
              className="mt-4 text-special hover:text-special-hover font-medium"
            >
              Add your first resource
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {resources
              .sort((a, b) => a.order - b.order)
              .map(resource => (
                <ResourceItem 
                  key={resource._id} 
                  resource={resource} 
                  onEdit={handleEditResource}
                  onDelete={handleDeleteResource}
                  onMove={handleMoveResource}
                />
              ))
            }
          </div>
        )}
      </div>
    </div>
  )
}