"use client"

import Section from '@/components/Dashboard/courses/Section'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'

function page() {
  const { id } = useParams()
  return (
    <div>{id}
    <Section courseId={id}/>
    </div>
  )
}

export default page