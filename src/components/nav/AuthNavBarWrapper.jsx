// src/components/nav/AuthNavBarWrapper.jsx
'use client'
import { SessionProvider } from 'next-auth/react'
import NavBar from './NavBar'

export default function AuthNavBarWrapper() {
  return (
    <SessionProvider>
      <NavBar />
    </SessionProvider>
  )
}