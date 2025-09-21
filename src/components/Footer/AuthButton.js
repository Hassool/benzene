'use client'

import { useSession, signOut, SessionProvider } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

function AuthContent() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (session) {
    return (
      <div className="flex flex-col items-center space-y-3">
        <div className="text-center">
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            Welcome back,
          </p>
          <p className="font-montserrat font-semibold text-text dark:text-text-dark truncate max-w-32">
            {session.user?.fullName}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span className="relative z-10">
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-3">
      <Link
        href="/auth/signin"
        className="group relative overflow-hidden bg-special hover:bg-special-hover text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-center"
      >
        <span className="relative z-10">Sign In</span>
        <div className="absolute inset-0 bg-special-hover transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      </Link>
      <Link
        href="/auth/signup"
        className="group relative overflow-hidden border-2 border-special text-special hover:text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-center"
      >
        <span className="relative z-10">Request Account</span>
        <div className="absolute inset-0 bg-special transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      </Link>
    </div>
  )
}

export default function AuthButton() {
  return (
    <SessionProvider>
      <AuthContent />
    </SessionProvider>
  )
}
