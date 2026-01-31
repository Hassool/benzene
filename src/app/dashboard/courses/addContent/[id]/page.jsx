"use client"

import CourseResources from '@/components/Dashboard/courses/CourseResources'
import { useParams } from 'next/navigation'
import React from 'react'

function page() {
  const { id } = useParams()
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Manage Course Content</h1>
      <CourseResources courseId={id}/>
    </div>
  )
}

export default page