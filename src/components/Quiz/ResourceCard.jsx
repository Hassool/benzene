"use client"

import { useState, useEffect } from "react";
import QuizRunner from "./QuizRunner";
import { AlertCircle, Play, FileText, ExternalLink, Image, Video } from "lucide-react";

export default function ResourceCard({ res, isFirst, resourceNumber, totalResources }) {
  const [open, setOpen] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  const collapsible = res.type === "video" || res.type === "image" || res.type === "quiz";

  // Load quizzes when opening a quiz resource
  useEffect(() => {
    if (res.type === "quiz" && open && quizzes.length === 0) {
      loadQuizzes();
    }
  }, [res.type, open]);

  const loadQuizzes = async () => {
    try {
      setLoadingQuizzes(true);
      const response = await fetch(`/api/quiz?resourceId=${res._id}`);
      const result = await response.json();
      
      if (result.success) {
        setQuizzes(result.data || []);
      } else {
        console.error('Failed to load quizzes:', result.msg);
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      case 'quiz': return <Play className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'link': return <ExternalLink className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getContentUrl = (resource) => {
    if (typeof resource.content === 'string') {
      return resource.content;
    }
    return resource.content?.url || resource.content?.content || '';
  };

  return (
    <div className="bg-bg-secondary dark:bg-bg-dark-secondary border border-border dark:border-border-dark rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-special/10 dark:bg-special/20 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-special">
                {res.order || resourceNumber}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text dark:text-text-dark font-montserrat">
                {res.title}
              </h2>
              <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-dark-secondary mt-1">
                {getResourceIcon(res.type)}
                <span className="capitalize">{res.type}</span>
                {res.duration && (
                  <>
                    <span>•</span>
                    <span>{res.duration} min</span>
                  </>
                )}
                {res.isRequired && (
                  <>
                    <span>•</span>
                    <span className="text-special font-medium">Required</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {res.description && (
          <p className="text-text-secondary dark:text-text-dark-secondary mb-4 leading-relaxed">
            {res.description}
          </p>
        )}

        {/* Order recommendation note - show only for first resource */}
        {isFirst && totalResources > 1 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm mb-1">
                  Recommended Learning Path
                </h4>
                <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                  For the best learning experience, we recommend completing resources in order. 
                  However, you can explore any resource that interests you.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {collapsible && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="px-4 py-2 rounded-lg bg-special text-white font-semibold hover:bg-special-hover transition-colors flex items-center gap-2"
            >
              {getResourceIcon(res.type)}
              {open ? "Hide Content" : "View Content"}
            </button>
          )}

          {res.type === "link" && (
            <a
              href={getContentUrl(res)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-special text-special hover:bg-special hover:text-white transition-colors flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Link
            </a>
          )}

          {res.type === "document" && (
            <a
              href={getContentUrl(res)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-special text-special hover:bg-special hover:text-white transition-colors flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              View Document
            </a>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {collapsible && (
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 pb-6">
            <div className="border-t border-border dark:border-border-dark pt-4">
              {res.type === "video" && (
                <div className="rounded-lg overflow-hidden bg-black">
                  <video 
                    src={getContentUrl(res)} 
                    controls 
                    className="w-full h-auto"
                    controlsList="nodownload"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {res.type === "image" && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={getContentUrl(res)}
                    alt={res.title}
                    className="w-full h-auto rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png'; // You can add a placeholder
                    }}
                  />
                </div>
              )}

              {res.type === "quiz" && (
                <div>
                  {loadingQuizzes ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-special"></div>
                      <span className="ml-3 text-text-secondary dark:text-text-dark-secondary">
                        Loading quiz...
                      </span>
                    </div>
                  ) : quizzes.length > 0 ? (
                    <QuizRunner quizzes={quizzes} />
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-text-secondary dark:text-text-dark-secondary mx-auto mb-3 opacity-50" />
                      <p className="text-text-secondary dark:text-text-dark-secondary">
                        No quiz questions available yet.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {res.type === "text" && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div 
                    className="text-text dark:text-text-dark leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: getContentUrl(res).replace(/\n/g, '<br/>') 
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}