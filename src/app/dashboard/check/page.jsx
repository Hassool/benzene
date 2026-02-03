'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { UserRoundCheck, Check, Trash2, Clock, Users, UserCheck, AlertCircle, RefreshCw, Phone, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from "l_i18n"

export default function Page() {
  const { t, lang } = useTranslation()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [filter, setFilter] = useState('pending') // 'pending', 'active', 'inactive', 'all'
  const [statusCounts, setStatusCounts] = useState({})

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.isAdmin) {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  // Fetch users
  const fetchUsers = async () => {
    if (!session?.user?.isAdmin) return

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users?status=${filter}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
        setStatusCounts(data.statusCounts)
      } else {
        console.error('Failed to fetch users:', data.error)
        alert(`${t('check.errors.loadFailed')}: ${data.error}`)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      alert(`${t('check.errors.loadFailed')}. ${t('check.errors.tryAgain')}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchUsers()
    }
  }, [session, filter])

  // Activate user
  const handleActivate = async (userId) => {
    setProcessingId(userId)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          isActive: true
        })
      })

      const data = await response.json()

      if (data.success) {
        // Remove from current list if filtering by pending
        if (filter === 'pending') {
          setUsers(prev => prev.filter(user => user._id !== userId))
        } else {
          // Update the user in the list
          setUsers(prev => prev.map(user => 
            user._id === userId 
              ? { ...user, isActive: true }
              : user
          ))
        }
        // Update status counts
        setStatusCounts(prev => ({
          ...prev,
          pending: Math.max(0, (prev.pending || 0) - 1),
          active: (prev.active || 0) + 1
        }))
      } else {
        alert(`${t('check.errors.activateFailed')}: ${data.error}`)
      }
    } catch (error) {
      console.error('Error activating user:', error)
      alert(`${t('check.errors.activateFailed')}. ${t('check.errors.tryAgain')}`)
    } finally {
      setProcessingId(null)
    }
  }

  // Deactivate user
  const handleDeactivate = async (userId) => {
    if (!confirm(t('check.confirm.deactivate'))) {
      return
    }

    setProcessingId(userId)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          isActive: false
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update the user in the list
        setUsers(prev => prev.map(user => 
          user._id === userId 
            ? { ...user, isActive: false }
            : user
        ))
        // Update status counts
        setStatusCounts(prev => ({
          ...prev,
          active: Math.max(0, (prev.active || 0) - 1),
          pending: (prev.pending || 0) + 1
        }))
      } else {
        alert(`${t('check.errors.deactivateFailed')}: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deactivating user:', error)
      alert(`${t('check.errors.deactivateFailed')}. ${t('check.errors.tryAgain')}`)
    } finally {
      setProcessingId(null)
    }
  }

  // Delete user
  const handleDelete = async (userId) => {
    if (!confirm(t('check.confirm.delete'))) {
      return
    }

    setProcessingId(userId)
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        // Remove from list
        setUsers(prev => prev.filter(user => user._id !== userId))
        // Update status counts
        setStatusCounts(prev => ({
          ...prev,
          total: Math.max(0, (prev.total || 0) - 1),
          pending: filter === 'pending' ? Math.max(0, (prev.pending || 0) - 1) : prev.pending,
          active: filter === 'active' ? Math.max(0, (prev.active || 0) - 1) : prev.active
        }))
      } else {
        alert(`${t('check.errors.deleteFailed')}: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(`${t('check.errors.deleteFailed')}. ${t('check.errors.tryAgain')}`)
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
          <p className="text-text dark:text-text-dark font-inter">{t('check.loading.main')}</p>
        </div>
      </div>
    )
  }

  // Unauthorized access
  if (!session?.user?.isAdmin) {
    return null // Will redirect
  }

  return (
    <div className={`min-h-screen bg-gradient-light dark:bg-gradient-dark pt-20 ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <UserRoundCheck className="w-10 h-10 text-special dark:text-special-light" />
            <h1 className="text-4xl font-montserrat font-bold text-text dark:text-text-dark">
              {t('check.header.title')}
            </h1>
          </div>
          <p className="text-lg text-text-secondary dark:text-text-dark-secondary font-inter">
            {t('check.header.subtitle')}
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { key: 'pending', label: t('check.filters.pending'), icon: Clock, color: 'orange' },
            { key: 'active', label: t('check.filters.active'), icon: UserCheck, color: 'green' },
            { key: 'all', label: t('check.filters.all'), icon: Users, color: 'blue' }
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
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-bg-secondary dark:bg-bg-dark-secondary hover:bg-special/10 dark:hover:bg-special-dark/20 text-text dark:text-text-dark rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('check.actions.refresh')}</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-special mx-auto mb-4"></div>
              <p className="text-text-secondary dark:text-text-dark-secondary">{t('check.loading.users')}</p>
            </div>
          </div>
        )}

        {/* No Users State */}
        {!loading && users.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-text-secondary dark:text-text-dark-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text dark:text-text-dark mb-2">
              {filter === 'all' ? t('check.empty.noUsers') : `${t('check.empty.noUsers')} ${filter === 'pending' ? t('check.filters.pending') : t('check.filters.active')}`}
            </h3>
            <p className="text-text-secondary dark:text-text-dark-secondary">
              {filter === 'pending' 
                ? t('check.empty.allProcessed')
                : t('check.empty.noMatch')}
            </p>
          </div>
        )}

        {/* Users Grid */}
        {!loading && users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-bg dark:bg-bg-dark rounded-xl p-6 shadow-lg border-t-8 border-special dark:border-special-dark transition-all duration-300 hover:shadow-xl relative"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {user.isActive ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-full">
                      <UserCheck className="h-3 w-3" />
                      {t('check.status.active')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                      <Clock className="h-3 w-3" />
                      {t('check.status.pending')}
                    </span>
                  )}
                </div>

                {/* User Avatar */}
                <div className="text-center mt-8 mb-6">
                  <div className="w-20 h-20 bg-special/20 dark:bg-special-dark/30 rounded-full mx-auto flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-special dark:text-special-light" />
                  </div>
                  
                  {/* User Info */}
                  <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                    {user.fullName}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-text-secondary dark:text-text-dark-secondary">
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{user.phoneNumber}</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{t('check.info.joined')} {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {user.lastLogin && (
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{t('check.info.lastLogin')} {new Date(user.lastLogin).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-2 pt-4 border-t border-border/20 dark:border-border-dark/20">
                  {!user.isActive ? (
                    <button
                      onClick={() => handleActivate(user._id)}
                      disabled={processingId === user._id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {processingId === user._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span>{t('check.actions.activate')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeactivate(user._id)}
                      disabled={processingId === user._id}
                      className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {processingId === user._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      <span>{t('check.actions.deactivate')}</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(user._id)}
                    disabled={processingId === user._id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {processingId === user._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span>{t('check.actions.delete')}</span>
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