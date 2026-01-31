'use client';

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { Clock, BookOpen, User, Calendar, AlertCircle, Play, Trash2, Loader2, Star, Award, ChevronRight } from "lucide-react";
import { useTranslation } from "react-lite-translation";

export default function CoursePageClient({ params, isAdmin }) {
  const { t, isRTL } = useTranslation();
  const { course } = use(params);
  const [courseData, setCourseData] = useState(null);
  const [resources, setResources] = useState([]);
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

        // Fetch course resources
        const resourcesResponse = await fetch(`/api/resource?courseId=${course}`);
        if (!resourcesResponse.ok) throw new Error('Failed to fetch resources');
        const resourcesResult = await resourcesResponse.json();
        
        if (resourcesResult.success) {
          setResources((resourcesResult.data || []).sort((a, b) => (a.order || 0) - (b.order || 0)));
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
    if (!confirm(t("coursePage.deleteConfirm.message"))) {
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
            <p className={`text-lg font-semibold text-text dark:text-text-dark ${isRTL ? 'text-right' : ''}`}>
              {t("coursePage.loading.title")}
            </p>
            <p className={`text-text-secondary dark:text-text-dark-secondary ${isRTL ? 'text-right' : ''}`}>
              {t("coursePage.loading.subtitle")}
            </p>
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
            <h2 className={`text-3xl font-bold text-text dark:text-text-dark mb-4 ${isRTL ? 'text-right' : ''}`}>
              {t("coursePage.errors.notFound")}
            </h2>
            <p className={`text-text-secondary dark:text-text-dark-secondary text-lg mb-8 ${isRTL ? 'text-right' : ''}`}>
              {error}
            </p>
            <Link 
              href="/Courses"
              className={`inline-flex items-center gap-3 px-8 py-4 bg-special hover:bg-special-hover text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ChevronRight className={`h-5 w-5 ${isRTL ? '' : 'rotate-180'}`} />
              {t("coursePage.errors.backToCourses")}
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
          <h2 className={`text-2xl font-bold text-text dark:text-text-dark ${isRTL ? 'text-right' : ''}`}>
            {t("coursePage.errors.courseNotFound")}
          </h2>
          <Link 
            href="/Courses" 
            className={`text-special hover:underline mt-4 inline-block ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {isRTL ? '' : '← '}{t("coursePage.errors.backToCourses")}{isRTL ? ' ←' : ''}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-light dark:bg-gradient-dark font-montserrat ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
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
              <div className={`flex items-center gap-3 text-bg/90 dark:text-text-dark/90 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Link 
                  href="/Courses" 
                  className="hover:text-special-light transition-colors duration-200 font-medium"
                >
                  {t("coursePage.breadcrumb.courses")}
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-bg font-semibold dark:text-text-dark">{courseData.title}</span>
              </div>
            </nav>

            {/* Delete Error Alert */}
            {deleteError && (
              <div className={`mb-8 p-6 bg-bg/95 dark:bg-bg-dark/95 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-2xl flex items-start space-x-4 shadow-lg ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    {t("coursePage.errors.deleteFailed")}
                  </h4>
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    {deleteError}
                  </p>
                  <button 
                    onClick={() => setDeleteError(null)}
                    className="text-red-600 dark:text-red-400 underline text-sm mt-2 hover:no-underline transition-all"
                  >
                    {t("coursePage.errors.dismiss")}
                  </button>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-16 items-start">
              {/* Main Course Info */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <div className={`flex items-start justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-special/20 dark:bg-special-dark/30 text-special-light dark:text-special border border-special/30 text-sm font-bold tracking-wide backdrop-blur-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Award className="h-4 w-4" />
                      {courseData.category?.toUpperCase() || t("coursePage.category.default")}
                    </div>
                    
                    {/* Enhanced Admin Delete Button */}
                    {isAdmin && (
                      <button
                        onClick={handleDeleteCourse}
                        disabled={deletingCourse}
                        className={`flex items-center gap-3 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-500/50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm font-medium ${isRTL ? 'flex-row-reverse' : ''}`}
                        title={deletingCourse ? t("coursePage.buttons.deleting") : t("coursePage.buttons.deleteTooltip")}
                      >
                        {deletingCourse ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>{t("coursePage.buttons.deleting")}</span>
                          </>
                        ) : (
                          <>
                            <Trash2 size={18} />
                            <span>{t("coursePage.buttons.deleteCourse")}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <h1 className={`text-5xl lg:text-6xl font-bold text-bg dark:text-text-dark mb-6 leading-tight ${isRTL ? 'text-right' : ''}`}>
                    {courseData.title}
                  </h1>
                  <div className="bg-bg/10 dark:bg-bg-dark/20 backdrop-blur-sm rounded-2xl p-6 border border-bg/20 dark:border-border-dark/30">
                    <p className={`text-lg text-bg/90 dark:text-text-dark/90 leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                      {courseData.description}
                    </p>
                  </div>
                </div>

                {/* Enhanced Course Stats */}
                <div className="bg-bg/10 dark:bg-bg-dark/20 backdrop-blur-sm rounded-2xl p-6 border border-bg/20 dark:border-border-dark/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={`flex items-center gap-3 text-bg/90 dark:text-text-dark/90 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 bg-special/20 dark:bg-special-dark/30 rounded-full flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-special-light dark:text-special" />
                      </div>
                      <div className={isRTL ? 'text-right' : ''}>
                        <div className="font-bold text-bg dark:text-text-dark">{resources.length}</div>
                        <div className="text-sm">{t("coursePage.stats.sections")}</div>
                      </div>
                    </div>
                    
                    {courseData.userID && (
                      <div className={`flex items-center gap-3 text-bg/90 dark:text-text-dark/90 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="w-10 h-10 bg-special/20 dark:bg-special-dark/30 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-special-light dark:text-special" />
                        </div>
                        <div className={isRTL ? 'text-right' : ''}>
                          <div className="font-bold text-bg dark:text-text-dark">{t("coursePage.stats.instructor")}</div>
                          <div className="text-sm">{courseData.userID.fullName}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className={`flex items-center gap-3 text-bg/90 dark:text-text-dark/90 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 bg-special/20 dark:bg-special-dark/30 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-special-light dark:text-special" />
                      </div>
                      <div className={isRTL ? 'text-right' : ''}>
                        <div className="font-bold text-bg dark:text-text-dark">{t("coursePage.stats.created")}</div>
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
                        {t("coursePage.stats.module")}
                      </div>
                    </div>
                    
                    {courseData.userID && (
                      <div className="pt-6 border-t border-border/30 dark:border-border-dark/50">
                        <div className={`text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-2 uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
                          {t("coursePage.stats.instructor")}
                        </div>
                        <div className={`font-bold text-text dark:text-text-dark text-lg ${isRTL ? 'text-right' : ''}`}>
                          {courseData.userID.fullName}
                        </div>
                        {courseData.userID.email && (
                          <div className={`text-sm text-text-secondary dark:text-text-dark-secondary mt-1 ${isRTL ? 'text-right' : ''}`}>
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
            <div className={`flex items-center justify-between mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <h2 className="text-4xl font-bold text-text dark:text-text-dark mb-3">
                  {t("coursePage.sectionsArea.title")}
                </h2>
                <p className="text-text-secondary dark:text-text-dark-secondary">
                  {t("coursePage.sectionsArea.subtitle")}
                </p>
              </div>
              <div className="bg-bg-secondary dark:bg-bg-dark-secondary px-4 py-2 rounded-full border border-border dark:border-border-dark">
                <span className="text-sm font-medium text-text dark:text-text-dark">
                  {resources.length} {t("coursePage.sectionsArea.count")}
                </span>
              </div>
            </div>
            
            {/* Enhanced Recommendation Note */}
            <div className="bg-special/5 dark:bg-special-dark/10 border border-special/20 dark:border-special-dark/30 rounded-2xl p-8 mb-12">
              <div className={`flex items-start gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex-shrink-0 w-12 h-12 bg-special/20 dark:bg-special-dark/30 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-special dark:text-special-light" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <h3 className="font-bold text-text dark:text-text-dark text-xl mb-3">
                    {t("coursePage.sectionsArea.recommendationTitle")}
                  </h3>
                  <p className="text-text-secondary dark:text-text-dark-secondary leading-relaxed">
                    {t("coursePage.sectionsArea.recommendationText")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {resources.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-text-secondary/10 dark:bg-text-dark-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <BookOpen className="h-12 w-12 text-text-secondary dark:text-text-dark-secondary opacity-50" />
              </div>
              <h3 className={`text-2xl font-bold text-text dark:text-text-dark mb-4 ${isRTL ? 'text-right' : ''}`}>
                {t("coursePage.sectionsArea.noSections")}
              </h3>
              <p className={`text-text-secondary dark:text-text-dark-secondary text-lg max-w-md mx-auto ${isRTL ? 'text-right' : ''}`}>
                {t("coursePage.sectionsArea.noSectionsText")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {resources.map((resource, index) => (
                <Link
                  key={resource._id}
                  href={`/Courses/${course}/${resource._id}`}
                  className="group block bg-bg-secondary dark:bg-bg-dark-secondary rounded-2xl border border-border dark:border-border-dark shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-special/30 dark:hover:border-special-dark/50"
                >
                  <div className="p-8">
                    <div className={`flex items-center gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {/* Enhanced Number */}
                      <div className="flex-shrink-0 w-12 h-12 bg-special/10 dark:bg-special-dark/20 rounded-xl flex items-center justify-center group-hover:bg-special/20 dark:group-hover:bg-special-dark/30 transition-all duration-300">
                        <span className="text-lg font-bold text-special dark:text-special-light">
                          {resource.order || index + 1}
                        </span>
                      </div>
                      
                      {/* Resource Content */}
                      <div className="flex-1 min-w-0">
                        <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <h3 className={`text-xl font-semibold text-text dark:text-text-dark group-hover:text-special dark:group-hover:text-special-light transition-colors duration-300 truncate ${isRTL ? 'text-right' : ''}`}>
                            {resource.title}
                          </h3>
                          
                          <div className={`flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary text-sm`}>
                             <span className="capitalize px-3 py-1 bg-bg dark:bg-bg-dark rounded-full border border-border dark:border-border-dark">
                               {resource.type}
                             </span>
                          </div>
                        </div>
                        
                        {resource.description && (
                          <p className={`text-text-secondary dark:text-text-dark-secondary mt-2 line-clamp-1 text-base ${isRTL ? 'text-right' : ''}`}>
                            {resource.description}
                          </p>
                        )}
                      </div>
                      
                       <div className={`text-special dark:text-special-light opacity-0 group-hover:opacity-100 transition-all duration-300 ${isRTL ? 'rotate-180' : ''}`}>
                         <Play className="h-5 w-5" />
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