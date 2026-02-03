'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, User, Phone, Lock, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { useTranslation } from 'l_i18n'

export default function Page() {
  const { isRTL } = useTranslation()
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    isActive: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [isAgreed, setIsAgreed] = useState(false)

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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = isRTL ? 'الاسم الكامل مطلوب' : 'Full name is required'
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = isRTL ? 'يجب أن يكون الاسم الكامل حرفين على الأقل' : 'Full name must be at least 2 characters'
    } else if (!/^[a-zA-Z\s\-\'\.]+$/.test(formData.fullName)) {
      newErrors.fullName = isRTL ? 'يجب أن يحتوي الاسم على أحرف فقط' : 'Full name can only contain letters, spaces, hyphens, apostrophes, and periods'
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = isRTL ? 'رقم الهاتف مطلوب' : 'Phone number is required'
    } else {
      const cleanPhone = formData.phoneNumber.replace(/[\s\-\(\)]/g, '')
      if (!/^[\+]?[1-9][\d]{0,15}$/.test(cleanPhone)) {
        newErrors.phoneNumber = isRTL ? 'الرجاء إدخال رقم هاتف صالح' : 'Please enter a valid phone number'
      }
    }

    if (!formData.password) {
      newErrors.password = isRTL ? 'كلمة المرور مطلوبة' : 'Password is required'
    } else if (passwordStrength.score < 5) {
      newErrors.password = isRTL ? 'كلمة المرور لا تلبي متطلبات الأمان' : 'Password does not meet security requirements'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = isRTL ? 'يرجى تأكيد كلمة المرور' : 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = isRTL ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'
    }

    if (!isAgreed) {
      newErrors.agreement = isRTL ? 'يجب الموافقة على الشروط والسياسات قبل المتابعة' : 'You must agree to the terms and policies before continuing'
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phoneNumber: cleanPhoneNumber,
          password: formData.password
        })
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(true)
        setFormData({ fullName: '', phoneNumber: '', password: '', confirmPassword: '', isActive: false })
      } else {
        setErrors({ general: data.error || (isRTL ? 'فشل التسجيل' : 'Registration failed') })
      }
    } catch {
      setErrors({ general: isRTL ? 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.' : 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-bg dark:bg-bg-dark rounded-2xl shadow-2xl p-8 border border-border dark:border-border-dark">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-text dark:text-text-dark mb-4">
              {isRTL ? 'تم إرسال طلب التسجيل بنجاح!' : 'Registration Successful!'}
            </h1>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
              {isRTL
                ? 'تم إنشاء حسابك وهو قيد المراجعة حالياً. سيتم تفعيله بعد الموافقة من قبل الإدارة.'
                : 'Your account has been created successfully but is pending approval by an administrator.'}
            </p>
            <div className="mt-6 space-y-3">
              <Link
                href="/auth/signin"
                className="block w-full px-6 py-3 bg-special hover:bg-special-hover text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
              >
                {isRTL ? 'الانتقال إلى تسجيل الدخول' : 'Go to Sign In'}
              </Link>
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
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-special/20 dark:bg-special-dark/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-special dark:text-special-light" />
            </div>
            <h1 className="text-3xl font-bold text-text dark:text-text-dark mb-2">
              {isRTL ? 'إنشاء حساب جديد' : 'Create Account'}
            </h1>
            <p className="text-text-secondary dark:text-text-dark-secondary">
              {isRTL ? 'انضم إلى منصتنا التعليمية' : 'Join our learning platform'}
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                {isRTL ? 'الاسم الكامل *' : 'Full Name *'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border bg-bg-secondary dark:bg-bg-dark-secondary text-text dark:text-text-dark focus:ring-2 focus:ring-special focus:border-transparent"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                {isRTL ? 'رقم الهاتف *' : 'Phone Number *'}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder={isRTL ? '+213XXXXXXXXX' : '+1234567890'}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border bg-bg-secondary dark:bg-bg-dark-secondary text-text dark:text-text-dark focus:ring-2 focus:ring-special focus:border-transparent"
                />
              </div>
              {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                {isRTL ? 'كلمة المرور *' : 'Password *'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isRTL ? 'أنشئ كلمة مرور قوية' : 'Create a strong password'}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border bg-bg-secondary dark:bg-bg-dark-secondary text-text dark:text-text-dark focus:ring-2 focus:ring-special focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                {isRTL ? 'تأكيد كلمة المرور *' : 'Confirm Password *'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={isRTL ? 'أعد إدخال كلمة المرور' : 'Confirm your password'}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border bg-bg-secondary dark:bg-bg-dark-secondary text-text dark:text-text-dark focus:ring-2 focus:ring-special focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="agree"
                checked={isAgreed}
                onChange={() => setIsAgreed(!isAgreed)}
                className="mt-1 accent-special"
              />
              <label htmlFor="agree" className="text-sm text-text-secondary dark:text-text-dark-secondary">
                {isRTL ? 'بإنشائك حساباً، فإنك توافق على' : 'By requesting an account, you agree to our'}{' '}
                <Link href="/terms-of-service" className="text-special hover:underline">
                  {isRTL ? 'شروط الخدمة' : 'Terms of Service'}
                </Link>
                {'، '}
                <Link href="/privacy-policy" className="text-special hover:underline">
                  {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </Link>{' '}
                {isRTL ? 'و' : 'and'}{' '}
                <Link href="/cookie-policy" className="text-special hover:underline">
                  {isRTL ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}
                </Link>
              </label>
            </div>
            {errors.agreement && <p className="text-sm text-red-600">{errors.agreement}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={!isAgreed || isLoading}
              className={`w-full px-6 py-3 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                isAgreed
                  ? 'bg-special hover:bg-special-hover text-white hover:scale-105'
                  : 'bg-special/40 text-white cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isRTL ? 'جارٍ الإرسال...' : 'Submitting...'}
                </>
              ) : (
                (isRTL ? 'طلب حساب' : 'Request Account')
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary dark:text-text-dark-secondary">
              {isRTL ? 'هل لديك حساب بالفعل؟ ' : 'Already have an account? '}{' '}
              <Link href="/auth/signin" className="text-special hover:underline font-medium">
                {isRTL ? 'تسجيل الدخول هنا' : 'Sign in here'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
