"use client"

import EditCourse from '@/components/Dashboard/courses/EditCourse'
import { useParams } from 'next/navigation'
import React from 'react'

function page() {
  const { id } = useParams()

  
  return (
    <div><EditCourse courseId={id}/></div>
  )
}

export default page