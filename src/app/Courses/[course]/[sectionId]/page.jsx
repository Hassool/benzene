'use client';

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { Clock, BookOpen, User, Calendar, AlertCircle, ArrowLeft } from "lucide-react";
import ResourceCard from "@/components/Quiz/ResourceCard";

export default function SectionPage({ params }) {
  const { course, sectionId } = use(params);
  const [sectionData, setSectionData] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        setLoading(true);
        
        // Fetch section information with resources
        const sectionResponse = await fetch(`/api/section?id=${sectionId}`);
        if (!sectionResponse.ok) throw new Error(sectionResponse);
        const sectionResult = await sectionResponse.json();
        
        if (!sectionResult.success) throw new Error(sectionResult.message);
        setSectionData(sectionResult.data);

        // Fetch resources separately for better control
        const resourcesResponse = await fetch(`/api/resource?sectionId=${sectionId}`);
        if (!resourcesResponse.ok) throw new Error('Failed to fetch resources');
        const resourcesResult = await resourcesResponse.json();
        
        if (resourcesResult.success) {
          // Sort resources by order
          const sortedResources = (resourcesResult.data || []).sort((a, b) => 
            (a.order || 0) - (b.order || 0)
          );
          setResources(sortedResources);
        }
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching section data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (course && sectionId) {
      fetchSectionData();
    }
  }, [course, sectionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg dark:bg-bg-dark font-inter flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-special mx-auto mb-4"></div>
          <p className="text-text-secondary dark:text-text-dark-secondary">Loading section...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg dark:bg-bg-dark font-inter py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Section Not Found</h2>
            <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
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

  if (!sectionData) {
    return (
      <div className="min-h-screen bg-bg dark:bg-bg-dark font-inter py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-text dark:text-text-dark mb-4">Section not found</h2>
          <Link 
            href={`/Courses/${course}`} 
            className="text-special hover:underline inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>
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
                {sectionData.courseId?.title || `Course ${course}`}
              </Link>
              <span>›</span>
              <span className="text-special font-medium">{sectionData.title}</span>
            </div>
          </nav>

          {/* Section Header */}
          <div className="bg-gradient-to-r from-special/10 to-special/5 dark:from-special/20 dark:to-special/10 rounded-2xl p-8 border border-special/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-text dark:text-text-dark mb-3 font-montserrat">
                  {sectionData.title}
                </h1>
                {sectionData.description && (
                  <p className="text-lg text-text-secondary dark:text-text-dark-secondary leading-relaxed mb-4">
                    {sectionData.description}
                  </p>
                )}
              </div>
              {sectionData.order && (
                <div className="bg-special/20 dark:bg-special/30 rounded-full px-4 py-2">
                  <span className="text-sm font-bold text-special">
                    Section {sectionData.order}
                  </span>
                </div>
              )}
            </div>

            {/* Section Stats */}
            <div className="flex flex-wrap items-center gap-6 text-text-secondary dark:text-text-dark-secondary">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>{resources.length} Resources</span>
              </div>
              {sectionData.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{sectionData.duration} minutes</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Updated {new Date(sectionData.updatedAt || sectionData.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-6">
          {resources.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-text-secondary dark:text-text-dark-secondary mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-text dark:text-text-dark mb-2">
                No Resources Available
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary">
                This section doesn't have any published resources yet.
              </p>
            </div>
          ) : (
            resources.map((resource, index) => (
              <ResourceCard 
                key={resource._id} 
                res={resource} 
                isFirst={index === 0}
                resourceNumber={index + 1}
                totalResources={resources.length}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}