"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Trash2, Book, Clock, ArrowBigDownDash, ExternalLink, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useFetchData } from "@/lib/UseFetch"
import { useTranslation } from "react-lite-translation"

export default function ViewCourses() {
  const {t} = useTranslation()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [deletingCourseId, setDeletingCourseId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const teacherId = session?.user?.id

  const [courses, setCourses] = useState([])
  const { data, error } = useFetchData("/api/course", setLoading)
  
  useEffect(() => {
    if (data.length && teacherId) {
      setCourses(data.filter((c) => c.userID?._id === teacherId))
    }
  }, [data, teacherId])

  const handleDelete = async (courseId) => {
    if (!confirm(t("courses.view.delete.confirmMessage"))) {
      return
    }

    setDeletingCourseId(courseId)
    setDeleteError(null)

    try {
      const response = await fetch(`/api/deleteCourse?id=${courseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || t("courses.view.delete.errorTitle"))
      }

      setCourses((prev) => prev.filter((c) => c._id !== courseId))
      
    } catch (error) {
      console.error("Error deleting course:", error)
      setDeleteError(error.message)
    } finally {
      setDeletingCourseId(null)
    }
  }

  if (!teacherId) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex items-center justify-center">
        <div className="text-center p-8 bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm rounded-2xl border border-border/30 dark:border-border-dark/30">
          <Book className="w-16 h-16 mx-auto text-special/70 mb-4" />
          <h3 className="text-xl font-semibold text-text dark:text-text-dark mb-2">
            {t("courses.view.accessRequired")}
          </h3>
          <p className="text-text-secondary dark:text-text-dark-secondary">
            {t("courses.view.loginMessage")}
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex items-center justify-center">
        <div className="text-center p-8">
          <Loader2 className="w-12 h-12 mx-auto text-special dark:text-special-dark animate-spin mb-4" />
          <p className="text-text-secondary dark:text-text-dark-secondary">{t("courses.view.loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text dark:text-text-dark mb-2">
            {t("courses.view.title")}
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary">
            {t("courses.view.subtitle")}
          </p>
        </div>

        {deleteError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                {t("courses.view.delete.errorTitle")}
              </h4>
              <p className="text-red-600 dark:text-red-400 text-sm">
                {deleteError}
              </p>
              <button 
                onClick={() => setDeleteError(null)}
                className="text-red-600 dark:text-red-400 underline text-sm mt-1 hover:no-underline"
              >
                {t("courses.view.delete.dismiss")}
              </button>
            </div>
          </div>
        )}

        {courses.length === 0 ? (
          <>
          <div className="text-center py-16">
            <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm rounded-2xl border border-border/30 dark:border-border-dark/30 p-12 max-w-md mx-auto">
              <Book className="w-20 h-20 mx-auto text-special/50 mb-6" />
              <h3 className="text-xl font-semibold text-text dark:text-text-dark mb-2">
                {t("courses.view.empty.title")}
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary">
                {t("courses.view.empty.message")}
              </p>
            </div>
          </div>
          <div className="text-center py-16">
            <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm rounded-2xl border border-border/30 dark:border-border-dark/30 p-12 max-w-md mx-auto">
              <ArrowBigDownDash className="w-20 h-20 mx-auto text-special/50 mb-6" />
              <h3 className="text-xl font-semibold text-text dark:text-text-dark mb-2">
                {t("courses.view.empty.stitle")}
              </h3>
            </div>
          </div>
          </>
        ) : (
          <div className="grid gap-6">
            {courses.map((course) => (
              <div 
                key={course._id} 
                className={`group bg-bg-secondary/60 dark:bg-bg-dark-secondary/60 backdrop-blur-sm rounded-2xl border border-border/30 dark:border-border-dark/30 p-6 hover:shadow-xl hover:shadow-special/5 dark:hover:shadow-special-dark/10 transition-all duration-300 hover:-translate-y-1 ${
                  deletingCourseId === course._id ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <div className="flex gap-6">
                  <div className="relative overflow-hidden rounded-xl shrink-0">
                    <img
                      src={course.thumbnail || "https://via.placeholder.com/150"}
                      alt={course.title}
                      className="h-32 w-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {deletingCourseId === course._id && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0 mr-4">
                        <h3 className="text-xl font-semibold text-text dark:text-text-dark mb-1 truncate">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-text-secondary dark:text-text-dark-secondary">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-special/10 dark:bg-special-dark/20 text-special dark:text-special-light rounded-full">
                            <Book size={14} />
                            {course.category}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={14} />
                            {t("courses.view.course.updated")}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 opacity-75 group-hover:opacity-100 transition-opacity duration-200">
                        <Link
                          href={`/dashboard/courses/${course._id}`}
                          className="relative p-2.5 rounded-xl bg-special/10 dark:bg-special-dark/20 text-special dark:text-special-light hover:bg-special/20 dark:hover:bg-special-dark/30 transition-colors duration-200 group/view"
                          title={t("courses.view.course.viewDetails")}
                        >
                          <ExternalLink size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(course._id)}
                          disabled={deletingCourseId === course._id}
                          className="relative p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors duration-200 group/delete disabled:opacity-50 disabled:cursor-not-allowed"
                          title={deletingCourseId === course._id ? t("courses.view.course.deleting") : t("courses.view.course.delete")}
                        >
                          {deletingCourseId === course._id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-text-secondary dark:text-text-dark-secondary leading-relaxed line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
