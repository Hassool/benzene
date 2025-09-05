// src/components/UD.js - Server Component (remove "use client")
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

async function UD() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return <p>Not signed in</p>
  }
  
  return (
    <div>
      <h1>Welcome {session.user.fullName}</h1>
      <p>Phone: {session.user.phoneNumber}</p>
      <p>Role: {session.user.role}</p>
    </div>
  )
}

export default UD