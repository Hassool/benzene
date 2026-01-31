'use client';

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { Clock, BookOpen, AlertCircle, ArrowLeft } from "lucide-react";
import ResourceCard from "@/components/Quiz/ResourceCard";

export default function ResourcePage({ params }) {
  const { course, resourceId } = use(params);
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResourceData = async () => {
      try {
        setLoading(true);
        
        // Single resource fetch
        const response = await fetch(`/api/resource?id=${resourceId}`);
        if (!response.ok) throw new Error('Failed to fetch resource');
        const result = await response.json();
        
        if (result.success && result.data) {
           setResource(result.data);
        } else {
           throw new Error(result.message || 'Resource not found');
        }
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching resource data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (course && resourceId) {
      fetchResourceData();
    }
  }, [course, resourceId]);

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
              Back to Course
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
                Back to Course
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
        <div>
           <ResourceCard 
             res={resource} 
             isFirst={false}
             resourceNumber={resource.order || 1}
             totalResources={1}
           />
        </div>
      </div>
    </div>
  );
}