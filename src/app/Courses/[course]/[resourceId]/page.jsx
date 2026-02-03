'use client';

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { Clock, BookOpen, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import ResourceCard from "@/components/Quiz/ResourceCard";
import { useTranslation } from "l_i18n";

export default function ResourcePage({ params }) {
  const { course, resourceId } = use(params);
  const { t } = useTranslation();
  
  const [resource, setResource] = useState(null);
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        // Fetch all resources for course to determine navigation
        const response = await fetch(`/api/resource?courseId=${course}`);
        if (!response.ok) throw new Error('Failed to fetch resources');
        const result = await response.json();
        
        if (result.success && result.data) {
           setAllResources(result.data);
           const current = result.data.find(r => r._id === resourceId);
           if (current) {
             setResource(current);
           } else {
             throw new Error('Resource not found');
           }
        } else {
           throw new Error(result.message || 'Failed to load resources');
        }
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    };

    if (course && resourceId) {
      fetchResources();
    }
  }, [course, resourceId]);

  // Determine previous and next resources
  const currentIndex = allResources.findIndex(r => r._id === resourceId);
  const prevResource = currentIndex > 0 ? allResources[currentIndex - 1] : null;
  const nextResource = currentIndex >= 0 && currentIndex < allResources.length - 1 ? allResources[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg dark:bg-bg-dark font-inter flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-special mx-auto mb-4"></div>
          <p className="text-text-secondary dark:text-text-dark-secondary">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-bg dark:bg-bg-dark font-inter py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Content Not Found</h2>
            <p className="text-red-600 dark:text-red-300 mb-6">{error || "The requested content could not be found."}</p>
            <Link 
              href={`/Courses/${course}`}
              className="inline-flex items-center px-6 py-3 bg-special hover:bg-special-hover text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("resCard.navigation.backToCourse")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark font-inter py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Breadcrumb */}
          <nav className="text-sm mb-6">
            <div className="flex items-center gap-2 text-text-secondary dark:text-text-dark-secondary">
              <Link href="/Courses" className="hover:text-special transition-colors">Courses</Link>
              <span>›</span>
              <Link 
                href={`/Courses/${course}`} 
                className="hover:text-special transition-colors"
              >
                {t("resCard.navigation.backToCourse")}
              </Link>
              <span>›</span>
              <span className="text-special font-medium">{resource.title}</span>
            </div>
          </nav>

          <div className="bg-gradient-to-r from-special/10 to-special/5 dark:from-special/20 dark:to-special/10 rounded-2xl p-8 border border-special/20">
             <h1 className="text-3xl font-bold text-text dark:text-text-dark mb-2">{resource.title}</h1>
             <p className="text-text-secondary dark:text-text-dark-secondary">{resource.description}</p>
          </div>
        </div>

        {/* Resource Content */}
        <div className="mb-12">
           <ResourceCard 
             res={resource} 
             isFirst={currentIndex === 0}
             resourceNumber={resource.order || currentIndex + 1}
             totalResources={allResources.length}
           />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-4 border-t border-border dark:border-border-dark pt-8">
           {prevResource ? (
             <Link 
               href={`/Courses/${course}/${prevResource._id}`}
               className="flex items-center px-6 py-3 rounded-xl bg-bg-secondary dark:bg-bg-dark-secondary border border-border dark:border-border-dark hover:border-special text-text dark:text-text-dark transition-all group"
             >
               <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
               <div>
                 <span className="block text-xs text-text-secondary dark:text-text-dark-secondary mb-0.5">{t("resCard.navigation.previousResource")}</span>
                 <span className="font-medium truncate max-w-[200px] block">{prevResource.title}</span>
               </div>
             </Link>
           ) : (
             <div className="w-1" /> // Spacer
           )}

           {nextResource ? (
             <Link 
               href={`/Courses/${course}/${nextResource._id}`}
               className="flex items-center px-6 py-3 rounded-xl bg-special text-white hover:bg-special-hover transition-all group text-right"
             >
               <div>
                 <span className="block text-xs text-white/80 mb-0.5">{t("resCard.navigation.nextResource")}</span>
                 <span className="font-medium truncate max-w-[200px] block">{nextResource.title}</span>
               </div>
               <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
             </Link>
           ) : (
             <Link
               href={`/Courses/${course}`}
               className="flex items-center px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all font-medium"
             >
               {t("resCard.navigation.backToCourse")}
             </Link>
           )}
        </div>
      </div>
    </div>
  );
}