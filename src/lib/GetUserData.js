// src/lib/GetUserData.js
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Access user data
  const userData = {
    id: session.user.id,
    fullName: session.user.fullName,
    phoneNumber: session.user.phoneNumber,
    role: session.user.role
  }
  
  return Response.json({ user: userData })
}