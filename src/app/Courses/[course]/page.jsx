// src/app/Courses/[course]/page.jsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import CoursePageClient from '@/components/course/CoursePageClient'

export default async function CoursePage({ params }) {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.isAdmin === true

  return (
    <CoursePageClient 
      params={params} 
      isAdmin={isAdmin}
    />
  )
}