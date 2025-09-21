'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Mail, Check, Trash2, Clock, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function page() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [filter, setFilter] = useState('pending') // 'pending', 'approved', 'published', 'all'
  const [statusCounts, setStatusCounts] = useState({})

  // Redirect if not Yacine
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.isYacine) {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  // Fetch letters
  const fetchLetters = async () => {
    if (!session?.user?.isYacine) return

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/letters?status=${filter}`)
      const data = await response.json()

      if (data.success) {
        setLetters(data.data)
        setStatusCounts(data.statusCounts)
      } else {
        console.error('Failed to fetch letters:', data.error)
        alert('Failed to load letters: ' + data.error)
      }
    } catch (error) {
      console.error('Error fetching letters:', error)
      alert('Failed to load letters. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.isYacine) {
      fetchLetters()
    }
  }, [session, filter])

  // Approve and publish letter
  const handleApprove = async (letterId) => {
    setProcessingId(letterId)
    try {
      const response = await fetch('/api/letters', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          letterId,
          isApproved: true,
          publish: true
        })
      })

      const data = await response.json()

      if (data.success) {
        // Remove from current list if filtering by pending
        if (filter === 'pending') {
          setLetters(prev => prev.filter(letter => letter._id !== letterId))
        } else {
          // Update the letter in the list
          setLetters(prev => prev.map(letter => 
            letter._id === letterId 
              ? { ...letter, isApproved: true, publish: true }
              : letter
          ))
        }
        // Update status counts
        setStatusCounts(prev => ({
          ...prev,
          pending: Math.max(0, (prev.pending || 0) - 1),
          published: (prev.published || 0) + 1
        }))
      } else {
        alert('Failed to approve letter: ' + data.error)
      }
    } catch (error) {
      console.error('Error approving letter:', error)
      alert('Failed to approve letter. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  // Delete letter
  const handleDelete = async (letterId) => {
    if (!confirm('Are you sure you want to delete this letter? This action cannot be undone.')) {
      return
    }

    setProcessingId(letterId)
    try {
      const response = await fetch(`/api/letters?id=${letterId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        // Remove from list
        setLetters(prev => prev.filter(letter => letter._id !== letterId))
        // Update status counts
        setStatusCounts(prev => ({
          ...prev,
          total: Math.max(0, (prev.total || 0) - 1),
          pending: filter === 'pending' ? Math.max(0, (prev.pending || 0) - 1) : prev.pending
        }))
      } else {
        alert('Failed to delete letter: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting letter:', error)
      alert('Failed to delete letter. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  // Loading state
  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-special mx-auto mb-4"></div>
          <p className="text-text dark:text-text-dark font-inter">Loading...</p>
        </div>
      </div>
    )
  }

  // Unauthorized access
  if (!session?.user?.isYacine) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <Mail className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            <h1 className="text-4xl font-montserrat font-bold text-text dark:text-text-dark">
              Letter Moderation
            </h1>
          </div>
          <p className="text-lg text-text-secondary dark:text-text-dark-secondary font-inter">
            Review and approve submitted thank you letters
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { key: 'pending', label: 'Pending', icon: Clock, color: 'orange' },
            { key: 'approved', label: 'Approved', icon: Check, color: 'blue' },
            { key: 'published', label: 'Published', icon: Eye, color: 'green' },
            { key: 'all', label: 'All Letters', icon: Mail, color: 'purple' }
          ].map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
                ${filter === key
                  ? `bg-${color}-500 text-white shadow-lg`
                  : `text-text dark:text-text-dark hover:bg-${color}-500/10 dark:hover:bg-${color}-400/20`
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {statusCounts[key] !== undefined && (
                <span className={`
                  px-2 py-1 rounded-full text-xs font-bold
                  ${filter === key ? 'bg-white/20' : `bg-${color}-500/20 text-${color}-600 dark:text-${color}-400`}
                `}>
                  {statusCounts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={fetchLetters}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-bg-secondary dark:bg-bg-dark-secondary hover:bg-special/10 dark:hover:bg-special-dark/20 text-text dark:text-text-dark rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-special mx-auto mb-4"></div>
              <p className="text-text-secondary dark:text-text-dark-secondary">Loading letters...</p>
            </div>
          </div>
        )}

        {/* No Letters State */}
        {!loading && letters.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-text-secondary dark:text-text-dark-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text dark:text-text-dark mb-2">
              No {filter === 'all' ? '' : filter} letters found
            </h3>
            <p className="text-text-secondary dark:text-text-dark-secondary">
              {filter === 'pending' 
                ? 'All letters have been reviewed.' 
                : 'No letters match the current filter.'}
            </p>
          </div>
        )}

        {/* Letters Grid */}
        {!loading && letters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {letters.map((letter) => (
              <div
                key={letter._id}
                className={`bg-bg dark:bg-bg-dark rounded-xl p-6 shadow-lg border-t-8 transition-all duration-300 relative ${
                  letter.image 
                    ? 'col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2 w-full max-w-2xl' 
                    : 'w-full max-w-sm'
                }`}
                style={{ borderTopColor: letter.borderColor }}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {letter.publish ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-full">
                      <Eye className="h-3 w-3" />
                      Published
                    </span>
                  ) : letter.isApproved ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                      <Check className="h-3 w-3" />
                      Approved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  )}
                </div>

                {/* Letter Content */}
                {letter.image ? (
                  <div className="flex flex-col sm:flex-row gap-6 items-center mt-8">
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-border dark:border-border-dark">
                        <img src={letter.image} alt="Student" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-text dark:text-text-dark font-inter leading-relaxed mb-4 text-lg">
                        "{letter.message}"
                      </p>
                      <p className="text-text-secondary dark:text-text-dark-secondary font-montserrat font-semibold mb-4">
                        — {letter.name}
                      </p>
                      <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                        {new Date(letter.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center mt-8">
                    <p className="text-text dark:text-text-dark font-inter leading-relaxed mb-4">
                      "{letter.message}"
                    </p>
                    <p className="text-text-secondary dark:text-text-dark-secondary font-montserrat font-semibold mb-2">
                      — {letter.name}
                    </p>
                    <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                      {new Date(letter.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-border/20 dark:border-border-dark/20">
                  {!letter.publish && (
                    <button
                      onClick={() => handleApprove(letter._id)}
                      disabled={processingId === letter._id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === letter._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span>Approve</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(letter._id)}
                    disabled={processingId === letter._id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === letter._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}