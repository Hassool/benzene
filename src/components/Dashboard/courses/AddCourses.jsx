// src/components/Addcourses.jsx - With Translations
"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Upload, Book, Image as ImageIcon, X, Check } from "lucide-react"
import { useTranslation } from "react-lite-translation"

export default function Addcourses() {
  const { t, lang } = useTranslation()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    module: '',
    thumbnail: '',
    isPublished: false
  })

  const [errors, setErrors] = useState({})

  // Dynamic categories from translations
  const CATEGORIES = [
    { value: '1as', label: t('courses.add.categories.1as') },
    { value: '2as', label: t('courses.add.categories.2as') },
    { value: '3as', label: t('courses.add.categories.3as') },
    { value: 'other', label: t('courses.add.categories.other') }
  ]

  const MODULES_BY_CATEGORY = {
    '1as': [
      t('courses.add.modules.mathematics'),
      t('courses.add.modules.physics'),
      t('courses.add.modules.naturalSciences'),
      t('courses.add.modules.french'),
      t('courses.add.modules.arabic'),
      t('courses.add.modules.english'),
      t('courses.add.modules.historyGeo'),
      t('courses.add.modules.islamicEd'),
      t('courses.add.modules.philosophy')
    ],
    '2as': [
      t('courses.add.modules.mathematics'),
      t('courses.add.modules.physics'),
      t('courses.add.modules.naturalSciences'),
      t('courses.add.modules.french'),
      t('courses.add.modules.arabic'),
      t('courses.add.modules.english'),
      t('courses.add.modules.historyGeo'),
      t('courses.add.modules.islamicEd'),
      t('courses.add.modules.philosophy'),
      t('courses.add.modules.engineering'),
      t('courses.add.modules.economics')
    ],
    '3as': [
      t('courses.add.modules.mathematics'),
      t('courses.add.modules.physics'),
      t('courses.add.modules.naturalSciences'),
      t('courses.add.modules.french'),
      t('courses.add.modules.arabic'),
      t('courses.add.modules.english'),
      t('courses.add.modules.historyGeo'),
      t('courses.add.modules.islamicEd'),
      t('courses.add.modules.philosophy'),
      t('courses.add.modules.engineering'),
      t('courses.add.modules.economics'),
      t('courses.add.modules.literature')
    ],
    'other': [
      t('courses.add.modules.vocational'),
      t('courses.add.modules.foreignLang'),
      t('courses.add.modules.computer'),
      t('courses.add.modules.arts'),
      t('courses.add.modules.sport'),
      t('courses.add.modules.music'),
      t('courses.add.modules.other')
    ]
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleCategoryChange = (e) => {
    const category = e.target.value
    setFormData(prev => ({
      ...prev,
      category,
      module: ''
    }))
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '', module: '' }))
    }
  }

  const uploadImage = async (file) => {
    setImageUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      if (!response.ok) throw new Error('Upload failed')
      const data = await response.json()
      return data.secure_url
    } finally {
      setImageUploading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, thumbnail: t('courses.add.validation.imageInvalid') }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, thumbnail: t('courses.add.validation.imageSize') }))
      return
    }

    try {
      const imageUrl = await uploadImage(file)
      setFormData(prev => ({ ...prev, thumbnail: imageUrl }))
      setErrors(prev => ({ ...prev, thumbnail: '' }))
    } catch {
      setErrors(prev => ({ ...prev, thumbnail: t('courses.add.validation.imageUploadError') }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = t('courses.add.validation.titleRequired')
    else if (formData.title.length < 3) newErrors.title = t('courses.add.validation.titleMinLength')
    else if (formData.title.length > 100) newErrors.title = t('courses.add.validation.titleMaxLength')

    if (!formData.description.trim()) newErrors.description = t('courses.add.validation.descRequired')
    else if (formData.description.length < 10) newErrors.description = t('courses.add.validation.descMinLength')
    else if (formData.description.length > 1000) newErrors.description = t('courses.add.validation.descMaxLength')

    if (!formData.category) newErrors.category = t('courses.add.validation.categoryRequired')
    if (!formData.module) newErrors.module = t('courses.add.validation.moduleRequired')

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)

    try {
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.toLowerCase(),
        module: formData.module.toLowerCase(),
        thumbnail: formData.thumbnail || null,
        isPublished: formData.isPublished
      }

      const response = await fetch('/api/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      })

      const result = await response.json()
      if (result.success) {
        setSuccess(true)
        setFormData({
          title: '',
          description: '',
          category: '',
          module: '',
          thumbnail: '',
          isPublished: false
        })
        setErrors({})
        setTimeout(() => setSuccess(false), 5000)
      } else {
        if (result.error === 'VALIDATION_ERROR' && result.errors) {
          const fieldErrors = {}
          result.errors.forEach(error => {
            if (error.includes('title')) fieldErrors.title = error
            if (error.includes('description')) fieldErrors.description = error
            if (error.includes('category')) fieldErrors.category = error
            if (error.includes('module')) fieldErrors.module = error
            if (error.includes('thumbnail')) fieldErrors.thumbnail = error
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ submit: result.message || t('courses.add.validation.submitError') })
        }
      }
    } catch {
      setErrors({ submit: t('courses.add.validation.connectionError') })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-special border-t-transparent mx-auto mb-4"></div>
          <p className="text-text dark:text-text-dark">{t('courses.add.loading')}</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex items-center justify-center">
        <div className="text-center p-8 bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm rounded-2xl border border-border/30 dark:border-border-dark/30">
          <Book className="w-16 h-16 mx-auto text-special/70 mb-4" />
          <h3 className="text-xl font-semibold text-text dark:text-text-dark mb-2">
            {t('courses.add.loginRequired')}
          </h3>
          <p className="text-text-secondary dark:text-text-dark-secondary mb-4">
            {t('courses.add.loginMessage')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-light dark:bg-gradient-dark ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text dark:text-text-dark mb-2">
            {t('courses.add.title')}
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary">
            {t('courses.add.subtitle')}
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 dark:border-green-500/40 rounded-xl">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-green-700 dark:text-green-300 font-medium">
                {t('courses.add.successMessage')}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-bg-secondary/60 dark:bg-bg-dark-secondary/60 backdrop-blur-sm rounded-2xl border border-border/30 dark:border-border-dark/30 p-6">
            <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
              <Book className="h-5 w-5 text-special dark:text-special-light" />
              {t('courses.add.sections.basicInfo')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                  {t('courses.add.fields.title')} *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full p-3 bg-bg dark:bg-bg-dark border border-border/40 dark:border-border-dark/40 rounded-xl text-text dark:text-text-dark placeholder-text-secondary dark:placeholder-text-dark-secondary focus:border-special dark:focus:border-special-light focus:outline-none transition-colors"
                  placeholder={t('courses.add.fields.titlePlaceholder')}
                />
                <div className="flex justify-between text-sm mt-1">
                  {errors.title && <p className="text-red-500">{errors.title}</p>}
                  <p className="text-text-secondary dark:text-text-dark-secondary ml-auto">
                    {formData.title.length}/100
                  </p>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                  {t('courses.add.fields.category')} *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full p-3 bg-bg dark:bg-bg-dark border border-border/40 dark:border-border-dark/40 rounded-xl text-text dark:text-text-dark focus:border-special dark:focus:border-special-light focus:outline-none transition-colors"
                >
                  <option value="">{t('courses.add.fields.selectCategory')}</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              {/* Module */}
              <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                  {t('courses.add.fields.module')} *
                </label>
                <select
                  name="module"
                  value={formData.module}
                  onChange={handleChange}
                  disabled={!formData.category}
                  className="w-full p-3 bg-bg dark:bg-bg-dark border border-border/40 dark:border-border-dark/40 rounded-xl text-text dark:text-text-dark focus:border-special dark:focus:border-special-light focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{t('courses.add.fields.selectModule')}</option>
                  {formData.category && MODULES_BY_CATEGORY[formData.category]?.map(module => (
                    <option key={module} value={module.toLowerCase()}>{module}</option>
                  ))}
                </select>
                {errors.module && <p className="text-red-500 text-sm mt-1">{errors.module}</p>}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-bg-secondary/60 dark:bg-bg-dark-secondary/60 backdrop-blur-sm rounded-2xl border border-border/30 dark:border-border-dark/30 p-6">
            <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-4">
              {t('courses.add.sections.description')}
            </h2>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              maxLength={1000}
              className="w-full p-3 bg-bg dark:bg-bg-dark border border-border/40 dark:border-border-dark/40 rounded-xl text-text dark:text-text-dark placeholder-text-secondary dark:placeholder-text-dark-secondary focus:border-special dark:focus:border-special-light focus:outline-none transition-colors resize-none"
              placeholder={t('courses.add.fields.descriptionPlaceholder')}
            />
            <div className="flex justify-between text-sm mt-1">
              {errors.description && <p className="text-red-500">{errors.description}</p>}
              <p className="text-text-secondary dark:text-text-dark-secondary ml-auto">
                {formData.description.length}/1000
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-bg-secondary/60 dark:bg-bg-dark-secondary/60 backdrop-blur-sm rounded-2xl border border-border/30 dark:border-border-dark/30 p-6">
            <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-special dark:text-special-light" />
              {t('courses.add.sections.image')}
            </h2>
            
            {formData.thumbnail ? (
              <div className="relative">
                <img
                  src={formData.thumbnail}
                  alt="Course thumbnail"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border/40 dark:border-border-dark/40 rounded-xl p-8 text-center hover:border-special/50 dark:hover:border-special-light/50 transition-colors">
                <Upload className="h-12 w-12 mx-auto text-text-secondary dark:text-text-dark-secondary mb-4" />
                <p className="text-text-secondary dark:text-text-dark-secondary mb-4">
                  {t('courses.add.fields.imagePlaceholder')}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={imageUploading}
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-special/10 dark:bg-special-dark/20 text-special dark:text-special-light rounded-xl hover:bg-special/20 dark:hover:bg-special-dark/30 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {imageUploading ? t('courses.add.fields.uploading') : t('courses.add.fields.chooseImage')}
                </label>
              </div>
            )}
            {errors.thumbnail && <p className="text-red-500 text-sm mt-2">{errors.thumbnail}</p>}
          </div>

          {/* Publishing Options */}
          <div className="bg-bg-secondary/60 dark:bg-bg-dark-secondary/60 backdrop-blur-sm rounded-2xl border border-border/30 dark:border-border-dark/30 p-6">
            <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-4">
              {t('courses.add.sections.publishing')}
            </h2>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="w-4 h-4 text-special bg-bg dark:bg-bg-dark border-border/40 dark:border-border-dark/40 rounded focus:ring-special dark:focus:ring-special-light focus:ring-2"
              />
              <label htmlFor="isPublished" className="text-text dark:text-text-dark">
                {t('courses.add.fields.publishImmediately')}
              </label>
            </div>
            <p className="text-text-secondary dark:text-text-dark-secondary text-sm mt-2">
              {t('courses.add.fields.publishNote')}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={loading || imageUploading}
              className="px-8 py-3 bg-special dark:bg-special-dark text-white font-medium rounded-xl hover:bg-special-hover dark:hover:bg-special-dark/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {t('courses.add.buttons.saving')}
                </>
              ) : (
                t('courses.add.buttons.create')
              )}
            </button>
          </div>

          {errors.submit && (
            <div className="text-red-500 text-center text-sm mt-4">{errors.submit}</div>
          )}
        </form>
      </div>
    </div>
  )
}