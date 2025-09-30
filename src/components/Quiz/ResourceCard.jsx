"use client"

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import QuizRunner from "./QuizRunner";
import { AlertCircle, Play, FileText, ExternalLink, Image, Video, Download, Eye, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from 'react-hot-toast';

// Configure PDF.js worker - Version 4.4.168
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

export default function ResourceCard({ res, isFirst, resourceNumber, totalResources }) {
  const [open, setOpen] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [error, setError] = useState(null);
  
  // PDF preview states
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfError, setPdfError] = useState(null);
  
  const collapsible = res.type === "video" || res.type === "image" || res.type === "quiz" || res.type === "document";

  useEffect(() => {
    if (res.type === "quiz" && open && quizzes.length === 0) {
      loadQuizzes();
    }
  }, [res.type, open]);

  const handleView = () => {
    if (!res.content) {
      toast.error('Document URL is missing');
      return;
    }
    window.open(res.content, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async () => {
    if (!res.content) {
      toast.error('Document URL is missing');
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = res.content;
      link.download = res.fileName || `${res.title || 'document'}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download document');
    }
  };

  const loadQuizzes = async () => {
    try {
      setLoadingQuizzes(true);
      const response = await fetch(`/api/quiz?resourceId=${res._id}`);
      const result = await response.json();
      
      if (result.success) {
        setQuizzes(result.data || []);
      } else {
        console.error('Failed to load quizzes:', result.msg);
        setError(result.msg || 'Failed to load quiz content');
        toast.error('Could not load quiz questions');
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      setError('Network error while loading quiz');
      toast.error('Network error. Please check your connection');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setPdfError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setPdfError('Failed to load PDF. Please try downloading it instead.');
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.6));

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

        <div className="flex gap-3 flex-wrap">
          {res.type === "document" && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setOpen(!open)}
                className="px-4 py-2 rounded-lg bg-special text-white hover:bg-special-hover transition-colors flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                <span>{open ? 'Hide Preview' : 'Preview Document'}</span>
              </button>
              
              <button
                onClick={handleView}
                disabled={!res.content}
                className={`px-4 py-2 rounded-lg border ${
                  !res.content
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'border-special text-special hover:bg-special hover:text-white'
                } transition-colors flex items-center gap-2`}
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open in New Tab</span>
              </button>
              
              <button
                onClick={handleDownload}
                disabled={!res.content}
                className={`px-4 py-2 rounded-lg border ${
                  !res.content
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'border-special text-special hover:bg-special hover:text-white'
                } transition-colors flex items-center gap-2`}
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
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

          {collapsible && res.type !== "document" && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="px-4 py-2 rounded-lg bg-special text-white font-semibold hover:bg-special-hover transition-colors flex items-center gap-2"
            >
              {getResourceIcon(res.type)}
              {open ? "Hide Content" : "View Content"}
            </button>
          )}
        </div>
      </div>

      {collapsible && (
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
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
                      e.target.src = '/placeholder-image.png';
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

              {res.type === "document" && (
                <div className="mt-4">
                  {!res.content ? (
                    <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <span>Document URL is missing</span>
                      </div>
                    </div>
                  ) : pdfError ? (
                    <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <span>{pdfError}</span>
                      </div>
                      <button 
                        onClick={handleDownload}
                        className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 rounded text-red-700 dark:text-red-200 text-sm"
                      >
                        Download Instead
                      </button>
                    </div>
                  ) : (
                    <div className="border border-border dark:border-border-dark rounded-lg overflow-hidden bg-white dark:bg-bg-dark">
                      <div className="flex items-center justify-between p-4 bg-bg-secondary dark:bg-bg-dark-secondary border-b border-border dark:border-border-dark flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={previousPage}
                            disabled={pageNumber <= 1}
                            className="p-2 rounded-lg border border-border dark:border-border-dark hover:bg-bg dark:hover:bg-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="text-sm text-text dark:text-text-dark px-3 whitespace-nowrap">
                            Page {pageNumber} of {numPages || '...'}
                          </span>
                          <button
                            onClick={nextPage}
                            disabled={pageNumber >= numPages}
                            className="p-2 rounded-lg border border-border dark:border-border-dark hover:bg-bg dark:hover:bg-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={zoomOut}
                            disabled={scale <= 0.6}
                            className="p-2 rounded-lg border border-border dark:border-border-dark hover:bg-bg dark:hover:bg-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ZoomOut className="h-4 w-4" />
                          </button>
                          <span className="text-sm text-text dark:text-text-dark px-2 whitespace-nowrap">
                            {Math.round(scale * 100)}%
                          </span>
                          <button
                            onClick={zoomIn}
                            disabled={scale >= 2.0}
                            className="p-2 rounded-lg border border-border dark:border-border-dark hover:bg-bg dark:hover:bg-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="overflow-auto bg-gray-100 dark:bg-gray-900" style={{ maxHeight: '700px' }}>
                        <div className="flex justify-center p-4">
                          <Document
                            file={res.content}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={
                              <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-special"></div>
                                <span className="ml-3 text-text-secondary dark:text-text-dark-secondary">
                                  Loading PDF...
                                </span>
                              </div>
                            }
                          >
                            <Page
                              pageNumber={pageNumber}
                              scale={scale}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              className="shadow-lg"
                            />
                          </Document>
                        </div>
                      </div>
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