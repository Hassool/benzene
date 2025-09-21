'use client';

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { Clock, BookOpen, User, Calendar, AlertCircle, Play, Trash2, Loader2, Star, Award, ChevronRight } from "lucide-react";

export default function CoursePageClient({ params, isAdmin }) {
  const { course } = use(params);
  const [courseData, setCourseData] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        // Fetch course information
        const courseResponse = await fetch(`/api/course?id=${course}`);
        if (!courseResponse.ok) throw new Error('Failed to fetch course');
        const courseResult = await courseResponse.json();
        
        if (!courseResult.success) throw new Error(courseResult.message);
        setCourseData(courseResult.data);

        // Fetch course sections
        const sectionsResponse = await fetch(`/api/section?courseId=${course}`);
        if (!sectionsResponse.ok) throw new Error('Failed to fetch sections');
        const sectionsResult = await sectionsResponse.json();
        
        if (sectionsResult.success) {
          setSections(sectionsResult.data || []);
        }
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching course data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (course) {
      fetchCourseData();
    }
  }, [course]);

  const handleDeleteCourse = async () => {
    if (!confirm("Are you sure you want to delete this entire course? This action cannot be undone and will delete all sections, resources, and associated data.")) {
      return;
    }

    setDeletingCourse(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/deleteCourse?id=${course}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to delete course');
      }

      if (responseData.data?.statistics) {
        console.log("Course deleted successfully:", {
          courseId: responseData.data.courseId,
          courseTitle: responseData.data.courseTitle,
          statistics: responseData.data.statistics
        });
      }

      window.location.href = '/Courses';
      
    } catch (error) {
      console.error("Error deleting course:", error);
      setDeleteError(error.message);
    } finally {
      setDeletingCourse(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark font-montserrat flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-special/20 border-t-special mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-special/10 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-text dark:text-text-dark">Loading Course</p>
            <p className="text-text-secondary dark:text-text-dark-secondary">Please wait while we fetch the content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark font-montserrat py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-bg/80 dark:bg-bg-dark/80 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 rounded-2xl p-12 shadow-2xl">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-text dark:text-text-dark mb-4">Course Not Found</h2>
            <p className="text-text-secondary dark:text-text-dark-secondary text-lg mb-8">{error}</p>
            <Link 
              href="/Courses"
              className="inline-flex items-center gap-3 px-8 py-4 bg-special hover:bg-special-hover text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark font-montserrat py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-text dark:text-text-dark">Course not found</h2>
          <Link href="/Courses" className="text-special hover:underline mt-4 inline-block">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark font-montserrat">
      {/* Hero Section with Course Information */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Background Image with Enhanced Overlay */}
        {courseData.thumbnail && (
          <div className="absolute inset-0 z-0">
            <img 
              src={courseData.thumbnail} 
              alt={courseData.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-text/80 via-text/60 to-special/40 dark:from-bg-dark/90 dark:via-bg-dark/70 dark:to-special-dark/50"></div>
          </div>
        )}
        
        {/* Course Content */}
        <div className="relative z-10 pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Breadcrumb */}
            <nav className="text-sm mb-12">
              <div className="flex items-center gap-3 text-bg/90 dark:text-text-dark/90">
                <Link 
                  href="/Courses" 
                  className="hover:text-special-light transition-colors duration-200 font-medium"
                >
                  Courses
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-bg font-semibold dark:text-text-dark">{courseData.title}</span>
              </div>
            </nav>

            {/* Delete Error Alert */}
            {deleteError && (
              <div className="mb-8 p-6 bg-bg/95 dark:bg-bg-dark/95 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-2xl flex items-start space-x-4 shadow-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    Failed to delete course
                  </h4>
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    {deleteError}
                  </p>
                  <button 
                    onClick={() => setDeleteError(null)}
                    className="text-red-600 dark:text-red-400 underline text-sm mt-2 hover:no-underline transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-16 items-start">
              {/* Main Course Info */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-special/20 dark:bg-special-dark/30 text-special-light dark:text-special border border-special/30 text-sm font-bold tracking-wide backdrop-blur-sm">
                      <Award className="h-4 w-4" />
                      {courseData.category?.toUpperCase() || 'COURSE'}
                    </div>
                    
                    {/* Enhanced Admin Delete Button */}
                    {isAdmin && (
                      <button
                        onClick={handleDeleteCourse}
                        disabled={deletingCourse}
                        className="flex items-center gap-3 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-500/50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm font-medium"
                        title={deletingCourse ? "Deleting course..." : "Delete Course (Admin)"}
                      >
                        {deletingCourse ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 size={18} />
                            <span>Delete Course</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <h1 className="text-5xl lg:text-6xl font-bold text-bg dark:text-text-dark mb-6 leading-tight">
                    {courseData.title}
                  </h1>
                  <div className="bg-bg/10 dark:bg-bg-dark/20 backdrop-blur-sm rounded-2xl p-6 border border-bg/20 dark:border-border-dark/30">
                    <p className="text-lg text-bg/90 dark:text-text-dark/90 leading-relaxed">
                      {courseData.description}
                    </p>
                  </div>
                </div>

                {/* Enhanced Course Stats */}
                <div className="bg-bg/10 dark:bg-bg-dark/20 backdrop-blur-sm rounded-2xl p-6 border border-bg/20 dark:border-border-dark/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3 text-bg/90 dark:text-text-dark/90">
                      <div className="w-10 h-10 bg-special/20 dark:bg-special-dark/30 rounded-full flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-special-light dark:text-special" />
                      </div>
                      <div>
                        <div className="font-bold text-bg dark:text-text-dark">{sections.length}</div>
                        <div className="text-sm">Sections</div>
                      </div>
                    </div>
                    
                    {courseData.userID && (
                      <div className="flex items-center gap-3 text-bg/90 dark:text-text-dark/90">
                        <div className="w-10 h-10 bg-special/20 dark:bg-special-dark/30 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-special-light dark:text-special" />
                        </div>
                        <div>
                          <div className="font-bold text-bg dark:text-text-dark">Instructor</div>
                          <div className="text-sm">{courseData.userID.fullName}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 text-bg/90 dark:text-text-dark/90">
                      <div className="w-10 h-10 bg-special/20 dark:bg-special-dark/30 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-special-light dark:text-special" />
                      </div>
                      <div>
                        <div className="font-bold text-bg dark:text-text-dark">Created</div>
                        <div className="text-sm">{new Date(courseData.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Course Card */}
              <div className="lg:col-span-1">
                <div className="bg-bg/95 dark:bg-bg-dark/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-bg/30 dark:border-border-dark/50 overflow-hidden sticky top-8">
                  {courseData.thumbnail && (
                    <div className="aspect-video overflow-hidden relative">
                      <img 
                        src={courseData.thumbnail} 
                        alt={courseData.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  )}
                  <div className="p-8 space-y-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-special/10 dark:bg-special-dark/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <div className="text-3xl font-bold text-special dark:text-special-light">
                          {courseData.module}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                        Module
                      </div>
                    </div>
                    
                    {courseData.userID && (
                      <div className="pt-6 border-t border-border/30 dark:border-border-dark/50">
                        <div className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-2 uppercase tracking-wider">
                          Instructor
                        </div>
                        <div className="font-bold text-text dark:text-text-dark text-lg">
                          {courseData.userID.fullName}
                        </div>
                        {courseData.userID.email && (
                          <div className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">
                            {courseData.userID.email}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Sections Content */}
      <div className="py-20 px-6 bg-bg dark:bg-bg-dark">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold text-text dark:text-text-dark mb-3">
                  Course Sections
                </h2>
                <p className="text-text-secondary dark:text-text-dark-secondary">
                  Explore the structured learning path designed for optimal knowledge acquisition
                </p>
              </div>
              <div className="bg-bg-secondary dark:bg-bg-dark-secondary px-4 py-2 rounded-full border border-border dark:border-border-dark">
                <span className="text-sm font-medium text-text dark:text-text-dark">
                  {sections.length} sections
                </span>
              </div>
            </div>
            
            {/* Enhanced Recommendation Note */}
            <div className="bg-special/5 dark:bg-special-dark/10 border border-special/20 dark:border-special-dark/30 rounded-2xl p-8 mb-12">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-special/20 dark:bg-special-dark/30 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-special dark:text-special-light" />
                </div>
                <div>
                  <h3 className="font-bold text-text dark:text-text-dark text-xl mb-3">
                    Recommended Learning Path
                  </h3>
                  <p className="text-text-secondary dark:text-text-dark-secondary leading-relaxed">
                    For the best learning experience, we recommend completing sections in order. 
                    However, you're free to explore any section that interests you at any time.
                    Each section builds upon the previous one, creating a comprehensive learning journey.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {sections.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-text-secondary/10 dark:bg-text-dark-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <BookOpen className="h-12 w-12 text-text-secondary dark:text-text-dark-secondary opacity-50" />
              </div>
              <h3 className="text-2xl font-bold text-text dark:text-text-dark mb-4">
                No Sections Available
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary text-lg max-w-md mx-auto">
                This course doesn't have any published sections yet. Check back soon for new content!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sections.map((section, index) => (
                <Link
                  key={section._id}
                  href={`/Courses/${course}/${section._id}`}
                  className="group block bg-bg-secondary dark:bg-bg-dark-secondary rounded-2xl border border-border dark:border-border-dark shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-special/30 dark:hover:border-special-dark/50"
                >
                  <div className="p-8">
                    <div className="flex items-start gap-6">
                      {/* Enhanced Section Number */}
                      <div className="flex-shrink-0 w-16 h-16 bg-special/10 dark:bg-special-dark/20 rounded-2xl flex items-center justify-center group-hover:bg-special/20 dark:group-hover:bg-special-dark/30 transition-all duration-300 group-hover:scale-110">
                        <span className="text-xl font-bold text-special dark:text-special-light">
                          {section.order || index + 1}
                        </span>
                      </div>
                      
                      {/* Enhanced Section Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-2xl font-bold text-text dark:text-text-dark group-hover:text-special dark:group-hover:text-special-light transition-colors duration-300">
                            {section.title}
                          </h3>
                          <div className="flex items-center gap-3 text-special dark:text-special-light opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                            <span className="text-sm font-bold tracking-wide">START</span>
                            <div className="w-10 h-10 bg-special/20 dark:bg-special-dark/30 rounded-full flex items-center justify-center">
                              <Play className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                        
                        {section.description && (
                          <p className="text-text-secondary dark:text-text-dark-secondary mb-6 line-clamp-2 text-lg leading-relaxed">
                            {section.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-8 text-text-secondary dark:text-text-dark-secondary">
                          {section.duration && (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-text-secondary/10 dark:bg-text-dark-secondary/10 rounded-full flex items-center justify-center">
                                <Clock className="h-4 w-4" />
                              </div>
                              <span className="font-medium">{section.duration} min</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-text-secondary/10 dark:bg-text-dark-secondary/10 rounded-full flex items-center justify-center">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <span className="font-medium">Section {section.order || index + 1}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}