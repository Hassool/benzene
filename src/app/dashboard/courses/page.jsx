import AddCourses from '@/components/Dashboard/courses/AddCourses'
import ViewCourses from '@/components/Dashboard/courses/viewCourses'
import React from 'react'

function page() {
  return (
    <div>
        <ViewCourses/>
        <AddCourses/>
    </div>
  )
}

export default page