'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, User, Phone, Lock, CheckCircle, AlertCircle, Clock } from 'lucide-react'

export default function page() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    isActive : false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    }
    
    const score = Object.values(checks).filter(Boolean).length
    return { checks, score }
  }

  const passwordStrength = checkPasswordStrength(formData.password)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    } else if (!/^[a-zA-Z\s\-\'\.]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Full name can only contain letters, spaces, hyphens, apostrophes, and periods'
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else {
      const cleanPhone = formData.phoneNumber.replace(/[\s\-\(\)]/g, '')
      if (!/^[\+]?[1-9][\d]{0,15}$/.test(cleanPhone)) {
        newErrors.phoneNumber = 'Please enter a valid phone number'
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (passwordStrength.score < 5) {
      newErrors.password = 'Password does not meet security requirements'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const cleanPhoneNumber = formData.phoneNumber.replace(/[\s\-\(\)]/g, '')
      
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phoneNumber: cleanPhoneNumber,
          password: formData.password
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setFormData({
          fullName: '',
          phoneNumber: '',
          password: '',
          confirmPassword: '',
          isActive: false
        })
      } else {
        console.log('Registration failed:', { status: response.status, data })
        
        // Handle different error scenarios
        if (data.errors && Array.isArray(data.errors)) {
          // Handle validation errors array
          const errorObj = {}
          data.errors.forEach(error => {
            const errorLower = error.toLowerCase()
            if (errorLower.includes('phone number') || errorLower.includes('already registered')) {
              errorObj.phoneNumber = error
            } else if (errorLower.includes('name')) {
              errorObj.fullName = error
            } else if (errorLower.includes('password')) {
              errorObj.password = error
            } else {
              errorObj.general = error
            }
          })
          setErrors(errorObj)
        } else if (data.error && typeof data.error === 'string') {
          // Handle single error message
          const errorLower = data.error.toLowerCase()
          if (errorLower.includes('phone number') || errorLower.includes('already registered')) {
            setErrors({ phoneNumber: 'This phone number is already registered' })
          } else if (errorLower.includes('validation')) {
            setErrors({ general: data.error })
          } else {
            setErrors({ general: data.error })
          }
        } else {
          // Handle cases where error structure is unexpected
          setErrors({ 
            general: data.message || 'Registration failed. Please try again.' 
          })
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ 
        general: 'Network error. Please check your connection and try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-bg dark:bg-bg-dark rounded-2xl shadow-2xl p-8 border border-border dark:border-border-dark text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-text dark:text-text-dark mb-4">
              Registration Successful!
            </h1>
            
            <div className="space-y-4 text-text-secondary dark:text-text-dark-secondary">
              <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-xl">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    Account Pending Approval
                  </p>
                  <p className="text-xs text-orange-500 dark:text-orange-300">
                    An admin will review and activate your account
                  </p>
                </div>
              </div>
              
              <p className="text-sm">
                Your account has been created successfully but is currently inactive. 
                Please wait for an administrator to approve your registration. 
                You will be able to log in once your account is activated.
              </p>
              
              <p className="text-sm font-medium">
                You will receive confirmation once your account is approved.
              </p>
            </div>
            
            <div className="mt-6 space-y-3">
              <Link
                href="/auth/signin"
                className="block w-full px-6 py-3 bg-special hover:bg-special-hover text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
              >
                Go to Sign In
              </Link>
              
              <button
                onClick={() => setSuccess(false)}
                className="w-full px-6 py-3 bg-bg-secondary dark:bg-bg-dark-secondary hover:bg-special/10 dark:hover:bg-special-dark/20 text-text dark:text-text-dark font-medium rounded-xl transition-all duration-200"
              >
                Register Another Account
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-bg dark:bg-bg-dark rounded-2xl shadow-2xl p-8 border border-border dark:border-border-dark">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-special/20 dark:bg-special-dark/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-special dark:text-special-light" />
            </div>
            <h1 className="text-3xl font-bold text-text dark:text-text-dark mb-2">
              Create Account
            </h1>
            <p className="text-text-secondary dark:text-text-dark-secondary">
              Join our learning platform
            </p>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-text-dark-secondary" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 bg-bg-secondary dark:bg-bg-dark-secondary text-text dark:text-text-dark focus:ring-2 focus:ring-special focus:border-transparent ${
                    errors.fullName 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-border dark:border-border-dark'
                  }`}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-text-dark-secondary" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 bg-bg-secondary dark:bg-bg-dark-secondary text-text dark:text-text-dark focus:ring-2 focus:ring-special focus:border-transparent ${
                    errors.phoneNumber 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-border dark:border-border-dark'
                  }`}
                  placeholder="+1234567890"
                  disabled={isLoading}
                />
              </div>
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-text-dark-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all duration-200 bg-bg-secondary dark:bg-bg-dark-secondary text-text dark:text-text-dark focus:ring-2 focus:ring-special focus:border-transparent ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-border dark:border-border-dark'
                  }`}
                  placeholder="Create a strong password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-text-dark-secondary hover:text-text dark:hover:text-text-dark"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= passwordStrength.score
                            ? passwordStrength.score < 3 
                              ? 'bg-red-500' 
                              : passwordStrength.score < 4 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                            : 'bg-border dark:bg-border-dark'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs space-y-1">
                    {Object.entries({
                      length: '8+ characters',
                      lowercase: 'Lowercase letter',
                      uppercase: 'Uppercase letter',
                      number: 'Number',
                      special: 'Special character (@$!%*?&)'
                    }).map(([key, label]) => (
                      <div key={key} className={`flex items-center gap-2 ${
                        passwordStrength.checks[key] 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-text-secondary dark:text-text-dark-secondary'
                      }`}>
                        <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                          passwordStrength.checks[key] 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-border dark:border-border-dark'
                        }`}>
                          {passwordStrength.checks[key] && (
                            <CheckCircle className="w-2 h-2 text-white" />
                          )}
                        </div>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-text-dark-secondary" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all duration-200 bg-bg-secondary dark:bg-bg-dark-secondary text-text dark:text-text-dark focus:ring-2 focus:ring-special focus:border-transparent ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-border dark:border-border-dark'
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-text-dark-secondary hover:text-text dark:hover:text-text-dark"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Admin Approval Notice */}
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    Account Activation Required
                  </p>
                  <p className="text-xs text-orange-500 dark:text-orange-300 mt-1">
                    Your account will be inactive until approved by an administrator
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-special hover:bg-special-hover disabled:bg-special/50 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary dark:text-text-dark-secondary">
              Already have an account?{' '}
              <Link 
                href="/auth/signin" 
                className="text-special dark:text-special-light hover:underline font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}