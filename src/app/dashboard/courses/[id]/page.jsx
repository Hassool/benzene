"use client"

import EditSection from '@/components/Dashboard/courses/EditSection'
import { useFetchData } from '@/lib/UseFetch'
import { Copy } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'

// Confirmation Modal Component
function ConfirmDeleteModal({ isOpen, onClose, onConfirm, section, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary dark:bg-bg-dark-secondary border border-border dark:border-border-dark rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-montserrat font-semibold text-text dark:text-text-dark">
            Delete Section
          </h3>
        </div>
        
        <p className="text-text-secondary dark:text-text-dark-secondary font-inter mb-4 leading-relaxed">
          Are you sure you want to delete the section <span className="font-semibold text-text dark:text-text-dark">"{section?.title}"</span>? 
        </p>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
          <p className="text-red-800 dark:text-red-200 text-sm font-inter">
            <strong>Warning:</strong> This action cannot be undone. All resources, videos, documents, and quizzes in this section will be permanently deleted.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-text-secondary dark:text-text-dark-secondary hover:text-text dark:hover:text-text-dark border border-border dark:border-border-dark hover:border-special dark:hover:border-special-dark rounded-lg transition-colors font-inter font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-inter font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isDeleting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Deleting...</span>
              </>
            ) : (
              'Delete Section'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CoursePage() {
  const { id } = useParams()
  const courseId = id
  const [loading, setLoading] = useState(true)
  const [sectionLoading, setSectionLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, section: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const [sections, setSections] = useState([])
  const [SectionOnEdit, setSectionOnEdit] = useState(null)
  const [copied, setCopied] = useState(false); // ✅ Move here
  
  const { data: course, error } = useFetchData(`/api/course?id=${courseId}`, setLoading)
  const { data: sectionsData, error: sectionError, refetch: refetchSections } = useFetchData(`/api/section?courseId=${courseId}`, setSectionLoading, setSections)

  // Handle section deletion
  const handleDeleteSection = async (section) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/deleteSection?id=${section._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        // Remove the deleted section from local state
        setSections(prevSections => prevSections.filter(s => s._id !== section._id))
        
        // Close modal
        setDeleteModal({ isOpen: false, section: null })
        
        // Show success message (you might want to add a toast notification here)
        console.log('Section deleted successfully:', result.data)
        
        // Optionally refetch sections to ensure consistency
        // refetchSections()
      } else {
        console.error('Failed to delete section:', result.message)
        alert('Failed to delete section: ' + result.message)
      }
    } catch (error) {
      console.error('Error deleting section:', error)
      alert('An error occurred while deleting the section. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const openDeleteModal = (section) => {
    setDeleteModal({ isOpen: true, section })
  }

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, section: null })
    }
  }

  const StartEditig = (idToEdit) => {
    if (SectionOnEdit == idToEdit) {
      closeEditSection();
    } else {
      setSectionOnEdit(idToEdit);
    }
  }

  const closeEditSection = () => {
    setSectionOnEdit(null);
  };

  const handleCopy = async () => { // ✅ Move here
    try {
      await navigator.clipboard.writeText(`https://benzene-beta.vercel.app/Courses/${id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Loading states and early returns come AFTER all hooks
  if (loading || sectionLoading) {
    return (
      <div className="min-h-screen bg-bg dark:bg-bg-dark bg-gradient-light dark:bg-gradient-dark">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Loading skeleton */}
            <div className="animate-pulse">
              <div className="flex justify-between items-center mb-8">
                <div className="h-8 bg-border dark:bg-border-dark rounded-lg w-1/3"></div>
                <div className="flex space-x-3">
                  <div className="h-10 bg-border dark:bg-border-dark rounded-lg w-24"></div>
                  <div className="h-10 bg-border dark:bg-border-dark rounded-lg w-20"></div>
                </div>
              </div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 bg-border dark:bg-border-dark rounded-xl"></div>
                  <div className="h-32 bg-border dark:bg-border-dark rounded-xl"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-48 bg-border dark:bg-border-dark rounded-xl"></div>
                  <div className="h-32 bg-border dark:bg-border-dark rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
     )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg dark:bg-bg-dark bg-gradient-light dark:bg-gradient-dark flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-montserrat font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Course
            </h3>
            <p className="text-red-600 dark:text-red-400 font-inter">
              {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-bg dark:bg-bg-dark bg-gradient-light dark:bg-gradient-dark flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-6">
          <div className="bg-bg-secondary dark:bg-bg-dark-secondary border border-border dark:border-border-dark rounded-xl p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-border dark:bg-border-dark rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-text-secondary dark:text-text-dark-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-montserrat font-semibold text-text dark:text-text-dark mb-2">
              Course Not Found
            </h3>
            <p className="text-text-secondary dark:text-text-dark-secondary font-inter">
              The course you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    )
  }

   const courseSections = Array.isArray(sections) && sections.length > 0 ? sections : (Array.isArray(sectionsData) ? sectionsData : [])


  
  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark bg-gradient-light dark:bg-gradient-dark">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header with Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-montserrat font-bold text-text dark:text-text-dark mb-2">
                {course.title}
              </h1>
              <p className="text-text-secondary dark:text-text-dark-secondary font-inter">
                Manage your course content and settings
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href={`/Courses/${id}`} className="inline-flex items-center px-4 py-2 bg-special/10 dark:bg-special-dark/10 text-special dark:text-special-dark border border-special/20 dark:border-special-dark/20 rounded-lg hover:bg-special/20 dark:hover:bg-special-dark/20 transition-colors font-inter font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </Link>
              <Link href={`edit/${id}`} className="inline-flex items-center px-4 py-2 bg-special hover:bg-special-hover dark:bg-special-dark dark:hover:bg-special text-white rounded-lg transition-colors font-inter font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Course
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Course Overview Card */}
              <div className="bg-bg-secondary dark:bg-bg-dark-secondary border border-border dark:border-border-dark rounded-xl p-6">
                <h2 className="font-montserrat font-semibold text-xl text-text dark:text-text-dark mb-4">
                  Course Overview
                </h2>
                
                <div className="relative group mb-6">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg border border-border dark:border-border-dark"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-inter font-medium text-text dark:text-text-dark mb-2">
                      Description
                    </label>
                    <p className="text-text-secondary dark:text-text-dark-secondary font-inter leading-relaxed p-4 bg-bg dark:bg-bg-dark rounded-lg border border-border dark:border-border-dark">
                      {course.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Content Management */}
              <div className="bg-bg-secondary dark:bg-bg-dark-secondary border border-border dark:border-border-dark rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-montserrat font-semibold text-xl text-text dark:text-text-dark">
                      Course Sections
                    </h2>
                    <p className="text-sm text-text-secondary dark:text-text-dark-secondary font-inter mt-1">
                      {courseSections.length} {courseSections.length === 1 ? 'section' : 'sections'} total
                    </p>
                  </div>
                  <Link href={`addContent/${id}`} className="inline-flex items-center px-4 py-2 bg-special hover:bg-special-hover dark:bg-special-dark dark:hover:bg-special text-white rounded-lg transition-colors font-inter font-medium">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Section
                  </Link>
                </div>

                {/* Section Error Handling */}
                {sectionError && (
                  <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-200 font-inter text-sm">
                      Unable to load sections: {sectionError}
                    </p>
                  </div>
                )}
                
                {/* Sections List */}
                <div className="space-y-3">
                  {courseSections.length === 0 ? (
                    <div className="text-center py-12 bg-bg dark:bg-bg-dark rounded-lg border border-border dark:border-border-dark">
                      <svg className="w-12 h-12 mx-auto text-text-secondary dark:text-text-dark-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <h3 className="font-montserrat font-semibold text-text dark:text-text-dark mb-2">
                        No Sections Yet
                      </h3>
                      <p className="text-text-secondary dark:text-text-dark-secondary font-inter mb-4">
                        Start building your course by adding your first section.
                      </p>
                      <Link href={`addContent/${id}`} className="inline-flex items-center px-4 py-2 bg-special hover:bg-special-hover dark:bg-special-dark dark:hover:bg-special text-white rounded-lg transition-colors font-inter font-medium">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create First Section
                      </Link>
                    </div>
                  ) : (
                    courseSections.map((section, index) => (
                      <div key={section._id} className="group bg-bg dark:bg-bg-dark rounded-lg border border-border dark:border-border-dark hover:border-special/50 dark:hover:border-special-dark/50 transition-all duration-200 overflow-hidden">
                        {/* Section Header */}
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-special/10 dark:bg-special-dark/10 text-special dark:text-special-dark rounded-lg flex items-center justify-center font-inter font-semibold text-sm shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-inter font-semibold text-text dark:text-text-dark text-lg mb-1 truncate">
                                {section.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-text-secondary dark:text-text-dark-secondary">
                                
                                <span className="inline-flex items-center gap-1.5">
                                  <div className={`w-2 h-2 rounded-full bg-special`}></div>
                                  {section.type ? section.type.charAt(0).toUpperCase() + section.type.slice(1) : 'Content'}
                                </span>
                                {section.isPublished !== undefined && (
                                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    section.isPublished 
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                  }`}>
                                    {section.isPublished ? 'Published' : 'Draft'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 opacity-75 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={()=>StartEditig(section._id)}
                              className="p-2 text-text-secondary dark:text-text-dark-secondary hover:text-special dark:hover:text-special-dark transition-colors rounded-lg hover:bg-special/10 dark:hover:bg-special-dark/10"
                              title="Edit Section"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <Link href={`/Courses/${courseId}/${section._id}`} 
                              className="p-2 text-text-secondary dark:text-text-dark-secondary hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Preview Section"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                            <button 
                              onClick={() => openDeleteModal(section)}
                              className="p-2 text-text-secondary dark:text-text-dark-secondary hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete Section"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {/* Section Description */}
                        {section.description && (
                          <div className="px-4 pb-4">
                            <p className="text-text-secondary dark:text-text-dark-secondary font-inter text-sm leading-relaxed pl-14">
                              {section.description}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Course Details */}
              <div className="bg-bg-secondary dark:bg-bg-dark-secondary border border-border dark:border-border-dark rounded-xl p-6">
                <h3 className="font-montserrat font-semibold text-lg text-text dark:text-text-dark mb-4">
                  Course Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-inter font-medium text-text-secondary dark:text-text-dark-secondary mb-1">
                      Category
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 bg-special/10 dark:bg-special-dark/10 text-special dark:text-special-dark rounded-full text-sm font-inter">
                        {course.category}
                      </span>
                      <button className="p-1 text-text-secondary dark:text-text-dark-secondary hover:text-special dark:hover:text-special-dark transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-inter font-medium text-text-secondary dark:text-text-dark-secondary mb-1">
                      Module
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 bg-special-light/20 dark:bg-special-dark/20 text-special-light dark:text-special-dark rounded-full text-sm font-inter">
                        Module {course.module}
                      </span>
                      <button className="p-1 text-text-secondary dark:text-text-dark-secondary hover:text-special dark:hover:text-special-dark transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border dark:border-border-dark">
                    <p className="text-xs font-inter text-text-secondary dark:text-text-dark-secondary">
                      Created on March 15, 2024
                    </p>
                    <p className="text-xs font-inter text-text-secondary dark:text-text-dark-secondary">
                      Last updated 2 days ago
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-bg-secondary dark:bg-bg-dark-secondary border border-border dark:border-border-dark rounded-xl p-6">
                <h3 className="font-montserrat font-semibold text-lg text-text dark:text-text-dark mb-4">
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <button onClick={handleCopy} className="w-full flex items-center space-x-3 p-3 bg-bg dark:bg-bg-dark rounded-lg border border-border dark:border-border-dark hover:border-special dark:hover:border-special-dark transition-colors">
                    {copied ? (
                      <>
                        <Check size={18} />
                        <span className="font-inter text-text dark:text-text-dark">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        <span className="font-inter text-text dark:text-text-dark">Copy the Course URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteSection(deleteModal.section)}
        section={deleteModal.section}
        isDeleting={isDeleting}
      />

      {SectionOnEdit != null && (
        <EditSection 
          sectionId={SectionOnEdit} 
          onComplete={closeEditSection} 
        />
      )}
    </div>
  )
}

export default CoursePage