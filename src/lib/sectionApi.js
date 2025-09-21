// utils/sectionApi.js

/**
 * Section API Helper with proper authentication handling
 */

// Base API configuration
const API_BASE = '/api/section'

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json()
  
  if (!response.ok) {
    if (response.status === 401) {
      // Handle authentication error
      throw new Error('Authentication required. Please sign in.')
    } else if (response.status === 403) {
      // Handle authorization error
      throw new Error('You are not authorized to perform this action.')
    } else if (response.status === 404) {
      throw new Error('Resource not found.')
    } else {
      throw new Error(data.msg || 'An error occurred')
    }
  }
  
  return data
}

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Important: Include cookies for session auth
    ...options,
  }

  try {
    const response = await fetch(url, defaultOptions)
    return await handleResponse(response)
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

// Section API methods
export const sectionApi = {
  // Get all sections (public - no auth required)
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value.toString())
      }
    })
    
    const url = searchParams.toString() 
      ? `${API_BASE}?${searchParams.toString()}`
      : API_BASE
    
    return makeRequest(url, { method: 'GET' })
  },

  // Get single section (public - no auth required)
  getById: async (id, includeResources = false) => {
    if (!id) throw new Error('Section ID is required')
    
    const params = new URLSearchParams({ id })
    if (includeResources) {
      params.append('includeResources', 'true')
    }
    
    return makeRequest(`${API_BASE}?${params.toString()}`, { method: 'GET' })
  },

  // Get sections by course ID (public - no auth required)
  getByCourseId: async (courseId, options = {}) => {
    if (!courseId) throw new Error('Course ID is required')
    
    const params = {
      courseId,
      ...options
    }
    
    return sectionApi.getAll(params)
  },

  // Create section (requires auth)
  create: async (sectionData) => {
    if (!sectionData.title || !sectionData.courseId || !sectionData.duration) {
      throw new Error('Title, courseId, and duration are required')
    }

    return makeRequest(API_BASE, {
      method: 'POST',
      body: JSON.stringify(sectionData),
    })
  },

  // Update section (requires auth)
  update: async (id, updateData) => {
    if (!id) throw new Error('Section ID is required')
    
    return makeRequest(`${API_BASE}?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    })
  },

  // Delete section (requires auth)
  delete: async (id) => {
    if (!id) throw new Error('Section ID is required')
    
    return makeRequest(`${API_BASE}?id=${id}`, {
      method: 'DELETE',
    })
  },

  // Reorder sections (requires auth)
  reorder: async (courseId, sectionOrders) => {
    if (!courseId || !Array.isArray(sectionOrders)) {
      throw new Error('Course ID and section orders array are required')
    }

    return makeRequest(`${API_BASE}/reorder`, {
      method: 'PUT',
      body: JSON.stringify({
        courseId,
        sectionOrders,
      }),
    })
  },

  // Publish/unpublish section (requires auth)
  togglePublish: async (id, isPublished) => {
    return sectionApi.update(id, { isPublished })
  },

  // Batch operations
  batch: {
    // Get multiple sections by IDs
    getByIds: async (ids) => {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Array of section IDs is required')
      }
      
      // Since we don't have a batch endpoint, we'll make individual requests
      const promises = ids.map(id => sectionApi.getById(id).catch(err => ({ error: err.message, id })))
      return Promise.all(promises)
    },

    // Delete multiple sections
    deleteMany: async (ids) => {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Array of section IDs is required')
      }
      
      const promises = ids.map(id => sectionApi.delete(id).catch(err => ({ error: err.message, id })))
      return Promise.all(promises)
    }
  }
}

// React hook for sections (optional)
import { useState, useEffect, useCallback } from 'react'

export const useSections = (courseId, options = {}) => {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSections = useCallback(async () => {
    if (!courseId) return

    setLoading(true)
    setError(null)

    try {
      const response = await sectionApi.getByCourseId(courseId, options)
      setSections(response.data || [])
    } catch (err) {
      setError(err.message)
      setSections([])
    } finally {
      setLoading(false)
    }
  }, [courseId, options])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  const createSection = async (sectionData) => {
    try {
      const response = await sectionApi.create({
        ...sectionData,
        courseId,
      })
      setSections(prev => [...prev, response.data])
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateSection = async (id, updateData) => {
    try {
      const response = await sectionApi.update(id, updateData)
      setSections(prev => 
        prev.map(section => 
          section._id === id ? response.data : section
        )
      )
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteSection = async (id) => {
    try {
      await sectionApi.delete(id)
      setSections(prev => prev.filter(section => section._id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const reorderSections = async (sectionOrders) => {
    try {
      const response = await sectionApi.reorder(courseId, sectionOrders)
      setSections(response.data.sections)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return {
    sections,
    loading,
    error,
    refetch: fetchSections,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
  }
}

// Example usage in a component:
/*
import { useSections, sectionApi } from '@/utils/sectionApi'

function SectionManager({ courseId }) {
  const { sections, loading, error, createSection, updateSection, deleteSection } = useSections(courseId, {
    published: true,
    includeResources: true
  })

  const handleCreate = async (sectionData) => {
    try {
      await createSection(sectionData)
      alert('Section created successfully!')
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {sections.map(section => (
        <div key={section._id}>
          <h3>{section.title}</h3>
          <button onClick={() => updateSection(section._id, { isPublished: !section.isPublished })}>
            {section.isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button onClick={() => deleteSection(section._id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
*/