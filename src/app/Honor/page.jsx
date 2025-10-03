'use client'

import { useState, useEffect } from 'react'
import { Heart, Star, BookOpen, Award, Send } from 'lucide-react'
import { useTranslation } from '@/lib/TranslationProvider'

const defaultColors = [
  'hsl(145, 80%, 44%)', // Special Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f97316', // Orange
  '#ef4444', // Red
  '#14b8a6', // Teal
]


export default function Page() {
  const {t} = useTranslation()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    borderColor: 'hsl(145, 80%, 44%)',
    image: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  // Fetch published letters on component mount
  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const response = await fetch('/api/letters')
        const data = await response.json()
        
        if (data.success) {
          setCards(data.data)
        } else {
          console.error('Failed to fetch letters:', data.error)
        }
      } catch (error) {
        console.error('Error fetching letters:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLetters()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.message.trim()) {
      alert('Please enter a message.')
      return
    }

    if (formData.message.trim().length < 10) {
      alert('Message must be at least 10 characters long.')
      return
    }

    if (formData.message.length > 1000) {
      alert('Message cannot exceed 1000 characters.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          message: formData.message.trim(),
          borderColor: formData.borderColor,
          image: formData.image.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        // Show success message
        alert('Thank you! Your letter has been submitted successfully and is awaiting approval.')
        
        // Reset form
        setFormData({ 
          name: '', 
          message: '', 
          borderColor: 'hsl(145, 80%, 44%)', 
          image: '' 
        })

        // Clear file input
        const fileInput = document.querySelector('input[type="file"]')
        if (fileInput) fileInput.value = ''

      } else {
        // Show error message
        alert(data.error || 'Failed to submit letter. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit letter. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      const data = await response.json()
      
      if (data.secure_url) {
        setFormData(prev => ({
          ...prev,
          image: data.secure_url
        }))
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Image upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-special mx-auto mb-4"></div>
          <p className="text-text dark:text-text-dark font-inter">Loading letters...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-6">
            <Award className="w-12 h-12 text-special" />
            <h1 className="text-5xl font-montserrat font-bold text-text dark:text-text-dark">
              {t('honor.header.title')}
            </h1>
            <Star className="w-12 h-12 text-special" />
          </div>
          <p className="text-xl text-text-secondary dark:text-text-dark-secondary font-inter">
            {t('honor.header.slogan')}
          </p>
        </div>

        {/* Personal Message Section */}
        <div className="bg-bg-secondary dark:bg-bg-dark-secondary rounded-2xl p-8 mb-12 border-l-8 border-special shadow-lg">
          <div className="flex items-start gap-4">
            <Heart className="w-8 h-8 text-special flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-montserrat font-semibold text-text dark:text-text-dark mb-4">
                {t('honor.header.meTitle')}
              </h2>
              <p className="text-lg text-text dark:text-text-dark font-inter leading-relaxed">
                {t('honor.header.msg')}
              </p>
              <p className="text-right mt-6 text-text-secondary dark:text-text-dark-secondary font-inter italic">
                — {t('honor.header.meSlogan')}
              </p>
            </div>
          </div>
        </div>

        {/* Rope Decoration */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-4xl h-6 bg-gradient-to-r from-amber-800 to-amber-900 rounded-full shadow-md relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-800 rounded-full transform rotate-1"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-800 to-amber-900 rounded-full"></div>
          </div>
        </div>

        {/* Thank You Cards */}
        <div className="mb-12">
          <h2 className="text-3xl font-montserrat font-bold text-center text-text dark:text-text-dark mb-8 flex items-center justify-center gap-3">
            <BookOpen className="w-8 h-8 text-special" />
            {t('honor.header.second')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {cards.map((card, index) => (
              <div
                key={card.id || card._id}
                className={`bg-bg dark:bg-bg-dark rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300 border-t-8 hover:shadow-xl animate-pulse ${
                  card.image 
                    ? 'col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2 w-full max-w-2xl' 
                    : 'w-full max-w-sm'
                }`}
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: '3s',
                  animationIterationCount: '1',
                  animationFillMode: 'forwards',
                  borderTopColor: card.borderColor
                }}
              >
                {card.image ? (
                  // Layout for cards with images - horizontal on large screens, vertical on small
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-border dark:border-border-dark">
                        <img src={card.image} alt="Student" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-text dark:text-text-dark font-inter leading-relaxed mb-4 text-lg">
                        "{card.message}"
                      </p>
                      <p className="text-text-secondary dark:text-text-dark-secondary font-montserrat font-semibold">
                        — {card.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Layout for cards without images - standard vertical layout
                  <div className="text-center">
                    <p className="text-text dark:text-text-dark font-inter leading-relaxed mb-4">
                      "{card.message}"
                    </p>
                    <p className="text-text-secondary dark:text-text-dark-secondary font-montserrat font-semibold">
                      — {card.name}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Your Letter Form */}
        <div className="bg-bg dark:bg-bg-dark rounded-2xl p-8 shadow-lg border border-border dark:border-border-dark">
          <h2 className="text-3xl font-montserrat font-bold text-center text-text dark:text-text-dark mb-8 flex items-center justify-center gap-3">
            <Send className="w-8 h-8 text-special" />
            {t('honor.form.title')}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div>
              <label className="block text-text dark:text-text-dark font-montserrat font-medium mb-2">
                {t('honor.form.name.legend')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('honor.form..name.ph')}
                className="w-full px-4 py-3 rounded-lg border border-border dark:border-border-dark bg-bg-secondary dark:bg-bg-dark-secondary text-text dark:text-text-dark font-inter focus:ring-2 focus:ring-special focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-text dark:text-text-dark font-montserrat font-medium mb-2">
                {t('honor.form.letter.legend')}
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={5}
                placeholder={t('honor.form.letter.ph')}
                className="w-full px-4 py-3 rounded-lg border border-border dark:border-border-dark bg-bg-secondary dark:bg-bg-dark-secondary text-text dark:text-text-dark font-inter focus:ring-2 focus:ring-special focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-text dark:text-text-dark font-montserrat font-medium mb-2">
                {t('honor.form.color')}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  name="borderColor"
                  value={formData.borderColor}
                  onChange={handleInputChange}
                  className="w-16 h-12 rounded-lg border border-border dark:border-border-dark bg-bg-secondary dark:bg-bg-dark-secondary cursor-pointer"
                />
                <div className="flex flex-wrap gap-2">
                  {defaultColors.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, borderColor: color }))}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-all"
                      style={{ backgroundColor: color }}
                      title={`Select ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-text dark:text-text-dark font-montserrat font-medium mb-2">
                {t('honor.form..photo.legend')}
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="w-full px-4 py-3 rounded-lg border border-border dark:border-border-dark bg-bg-secondary dark:bg-bg-dark-secondary text-text dark:text-text-dark font-inter focus:ring-2 focus:ring-special focus:border-transparent transition-all disabled:opacity-50"
                />
                {isUploading && (
                  <div className="flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-special"></div>
                    <span className="text-sm">Uploading image...</span>
                  </div>
                )}
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                  {t('honor.form.photo.ph')}
                </p>
              </div>
            </div>

            {/* Preview Section */}
            {(formData.name || formData.message || formData.image) && (
              <div className="border-t border-border dark:border-border-dark pt-6">
                <div 
                  className={`bg-bg-secondary dark:bg-bg-dark-secondary rounded-xl p-6 shadow-lg border-t-8 ${
                    formData.image ? 'max-w-2xl mx-auto' : 'max-w-sm mx-auto'
                  }`}
                  style={{ borderTopColor: formData.borderColor }}
                >
                  {formData.image ? (
                    // Preview with image - horizontal layout
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-border dark:border-border-dark">
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-text dark:text-text-dark font-inter leading-relaxed mb-4 text-lg">
                          "{formData.message || 'Your message will appear here...'}"
                        </p>
                        <p className="text-text-secondary dark:text-text-dark-secondary font-montserrat font-semibold">
                          — {formData.name || 'Anonymous'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Preview without image - vertical layout
                    <div className="text-center">
                      <p className="text-text dark:text-text-dark font-inter leading-relaxed mb-4">
                        "{formData.message || 'Your message will appear here...'}"
                      </p>
                      <p className="text-text-secondary dark:text-text-dark-secondary font-montserrat font-semibold">
                        — {formData.name || 'Anonymous'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting || isUploading || !formData.message.trim()}
                className="px-8 py-4 bg-special hover:bg-special-hover text-white font-montserrat font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 mx-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {t('honor.form.action')=="Add My Letter" ? "Adding your letter ..." : "إضافة رسالتك ..."}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {t('honor.form.action')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}