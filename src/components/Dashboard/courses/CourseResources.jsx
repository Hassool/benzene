"use client"

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, FileText, Play, 
  Link, Image, HelpCircle, Save, X, ArrowUp, ArrowDown, Upload
} from 'lucide-react';
import { useTranslation } from 'l_i18n';

// UI Constants using tailwind config colors
const UI = {
  // Backgrounds
  bgPrimary: 'bg-bg dark:bg-bg-dark',
  bgSecondary: 'bg-bg-secondary dark:bg-bg-dark-secondary',
  bgCard: 'bg-bg dark:bg-bg-dark',
  bgCardSecondary: 'bg-bg-secondary/60 dark:bg-bg-dark-secondary/60',
  bgHover: 'hover:bg-bg-secondary dark:hover:bg-bg-dark-secondary',
  
  // Text
  textPrimary: 'text-text dark:text-text-dark',
  textSecondary: 'text-text-secondary dark:text-text-dark-secondary',
  
  // Borders
  border: 'border-border dark:border-border-dark',
  borderLight: 'border-border/40 dark:border-border-dark/40',
  
  // Special/Accent colors
  special: 'bg-special dark:bg-special-dark',
  specialText: 'text-special dark:text-special-light',
  specialHover: 'hover:bg-special-hover dark:hover:bg-special-dark/80',
  specialBgLight: 'bg-special/10 dark:bg-special-dark/20',
  specialBorder: 'border-special dark:border-special-dark',
  
  // Action buttons
  btnPrimary: 'bg-special dark:bg-special-dark text-white hover:bg-special-hover dark:hover:bg-special-dark/80',
  btnSecondary: 'border border-border dark:border-border-dark hover:bg-bg-secondary dark:hover:bg-bg-dark-secondary',
  
  // Status colors  
  success: 'bg-green-500/10 dark:bg-green-500/20 border-green-500/30 dark:border-green-500/40 text-green-600 dark:text-green-400',
  error: 'text-red-500 dark:text-red-400',
  errorBg: 'bg-red-500/10 hover:bg-red-500/20 dark:hover:bg-red-900/20',
  
  // Form inputs
  input: 'bg-bg dark:bg-bg-dark border border-border/40 dark:border-border-dark/40 rounded-xl text-text dark:text-text-dark placeholder-text-secondary dark:placeholder-text-dark-secondary focus:border-special dark:focus:border-special-light focus:outline-none transition-colors',
  
  // Badges/Tags
  badge: 'bg-special/10 dark:bg-special-dark/20 text-special dark:text-special-light',
  badgeSecondary: 'bg-bg-secondary dark:bg-bg-dark-secondary text-text-secondary dark:text-text-dark-secondary',
};

const CourseResources = ({ courseId }) => {
  const { t } = useTranslation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchResources();
  }, [courseId]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/resource?courseId=${courseId}`);
      if (!res.ok) throw new Error('Failed to fetch resources');
      const data = await res.json();
      setResources(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // State for forms/modals
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('resource'); // 'resource' or 'quiz'
  const [editingItem, setEditingItem] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null); // For quiz management

  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    type: 'document',
    content: '',
    order: 1
  });

  const [quizForm, setQuizForm] = useState({
    Question: '',
    order: 1,
    answers: ['', '', '', ''],
    answer: ''
  });

  // Quiz state
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  const fetchQuizzes = async (resourceId) => {
    try {
      setLoadingQuizzes(true);
      const res = await fetch(`/api/quiz?resourceId=${resourceId}`);
      if (!res.ok) throw new Error('Failed to fetch quizzes');
      const data = await res.json();
      setQuizzes(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);

    if (item) {
      if (type === 'resource') {
        // When editing resource, content might be object or string depending on type/API implementation
        // Adjust as needed based on your API response structure
        const content = typeof item.content === 'object' ? (item.content.url || item.content.text || '') : item.content;
        setResourceForm({ ...item, content });
      } else if (type === 'quiz') {
        const answers = item.answers || ['', '', '', ''];
        setQuizForm({ ...item, answers });
      }
    } else {
      resetForms();
      // Auto-set order to next available
      if (type === 'resource') {
        const maxOrder = resources.length > 0 ? Math.max(...resources.map(r => r.order)) : 0;
        setResourceForm(prev => ({ ...prev, order: maxOrder + 1 }));
      } else if (type === 'quiz') {
        const maxOrder = quizzes.length > 0 ? Math.max(...quizzes.map(q => q.order)) : 0;
        setQuizForm(prev => ({ ...prev, order: maxOrder + 1 }));
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    resetForms();
  };

  const resetForms = () => {
    setResourceForm({ title: '', description: '', type: 'document', content: '', order: 1 });
    setQuizForm({ Question: '', order: 1, answers: ['', '', '', ''], answer: '' });
  };

  // Determine the Cloudinary resource type for upload
  const getCloudinaryResourceType = (type) => {
    switch (type) {
      case 'video': return 'video';
      case 'image': return 'image';
      case 'document': return 'raw'; // PDFs and docs go as raw
      default: return 'auto';
    }
  };

  // File upload handler for Cloudinary
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      
      const resourceType = getCloudinaryResourceType(resourceForm.type);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (data.secure_url) {
        setResourceForm(prev => ({ ...prev, content: data.secure_url }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setFileUploading(false);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setResourceForm(prev => ({ ...prev, content: '' }));
  };

  // Check if type requires file upload
  const requiresFileUpload = (type) => {
    return ['document', 'video', 'image'].includes(type);
  };

  // Get accepted file types for input
  const getAcceptedFileTypes = (type) => {
    switch (type) {
      case 'video': return 'video/*';
      case 'image': return 'image/*';
      case 'document': return '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt';
      default: return '*';
    }
  };

  // Get file type label
  const getFileTypeLabel = (type) => {
    switch (type) {
      case 'video': return t('courses.resourceCreation.types.video');
      case 'image': return t('courses.resourceCreation.types.image');
      case 'document': return t('courses.resourceCreation.upload.uploadDocument');
      default: return 'File';
    }
  };

  const handleSaveResource = async () => {
    try {
      const url = '/api/resource' + (editingItem ? `?id=${editingItem._id}` : '');
      const method = editingItem ? 'PATCH' : 'POST';
      const body = { 
        ...resourceForm, 
        courseId,
        // Content is always stored as a string in the database
        content: resourceForm.content || ''
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Failed to save resource');
      }
      
      await fetchResources();
      closeModal();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveQuiz = async () => {
    try {
      const url = '/api/quiz' + (editingItem ? `?id=${editingItem._id}` : '');
      const method = editingItem ? 'PATCH' : 'POST';
      const body = { 
        ...quizForm, 
        ResourceID: selectedResource._id
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Failed to save quiz');

      await fetchQuizzes(selectedResource._id);
      closeModal();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(t('courses.resourceCreation.confirmDelete'))) return;

    try {
      const url = type === 'resource' ? `/api/deleteResource?id=${id}` : `/api/quiz?id=${id}`;
      const res = await fetch(url, { method: 'DELETE' });
      
      if (!res.ok) throw new Error('Failed to delete');

      if (type === 'resource') {
        await fetchResources();
      } else {
        await fetchQuizzes(selectedResource._id);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleManageQuiz = (resource) => {
    setSelectedResource(resource);
    fetchQuizzes(resource._id);
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'quiz': return <HelpCircle className="h-4 w-4" />;
      case 'link': return <Link className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (selectedResource) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setSelectedResource(null)}
            className={`${UI.specialText} hover:opacity-80 flex items-center gap-2`}
          >
            ← {t('courses.resourceCreation.backToResources')}
          </button>
          <button 
             onClick={() => openModal('quiz')}
             className={`${UI.btnPrimary} px-4 py-2 rounded-lg flex items-center gap-2`}
          >
            <Plus className="h-4 w-4" />
            {t('courses.resourceCreation.addQuestion')}
          </button>
        </div>

        <div className={`${UI.bgCardSecondary} backdrop-blur-sm p-6 rounded-2xl border ${UI.borderLight}`}>
          <h2 className={`text-2xl font-bold mb-2 ${UI.textPrimary}`}>{t('courses.resourceCreation.quizTitle')}: {selectedResource.title}</h2>
          <p className={UI.textSecondary}>{selectedResource.description}</p>
        </div>

        {loadingQuizzes ? (
           <p className={`text-center py-4 ${UI.textSecondary}`}>{t('courses.resourceCreation.loadingQuestions')}</p>
        ) : quizzes.length === 0 ? (
           <p className={`text-center py-10 ${UI.bgSecondary} rounded-lg ${UI.textSecondary}`}>{t('courses.resourceCreation.noQuestions')}</p>
        ) : (
          <div className="space-y-4">
            {quizzes.sort((a,b) => a.order - b.order).map((quiz, index) => (
               <div key={quiz._id} className={`${UI.bgCardSecondary} backdrop-blur-sm rounded-2xl border ${UI.borderLight} p-6 relative`}>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => openModal('quiz', quiz)} className={`${UI.specialText} hover:opacity-80`}><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete('quiz', quiz._id)} className={`${UI.error} hover:opacity-80`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                  
                  <h3 className={`text-lg font-semibold mb-3 pr-16 ${UI.textPrimary}`}>
                    <span className={`${UI.badge} text-xs font-medium px-2 py-0.5 rounded mr-2`}>Q{quiz.order}</span>
                    {quiz.Question}
                  </h3>

                  <div className="space-y-2">
                    {quiz.answers.map((ans, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${ans === quiz.answer ? 'bg-green-500/10 dark:bg-green-500/20 border-green-500/30 dark:border-green-500/40' : `${UI.bgSecondary} ${UI.borderLight}`}`}>
                        <span className={`font-medium mr-2 ${UI.textSecondary}`}>{String.fromCharCode(65 + idx)}.</span>
                        <span className={UI.textPrimary}>{ans}</span>
                        {ans === quiz.answer && <span className="ml-2 text-green-600 dark:text-green-400 text-xs font-bold">✓ {t('courses.resourceCreation.correct')}</span>}
                      </div>
                    ))}
                  </div>
               </div>
            ))}
          </div>
        )}

        {/* Quiz Modal */}
        {showModal && modalType === 'quiz' && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className={`${UI.bgCard} rounded-2xl w-full max-w-2xl border ${UI.borderLight}`}>
              <div className={`p-6 border-b ${UI.borderLight} flex justify-between items-center`}>
                <h3 className={`text-xl font-bold ${UI.textPrimary}`}>{editingItem ? t('courses.resourceCreation.modal.editQuestion') : t('courses.resourceCreation.modal.addQuestion')}</h3>
                <button onClick={closeModal}><X className={`h-5 w-5 ${UI.textSecondary}`} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${UI.textSecondary}`}>{t('courses.resourceCreation.modal.question')}</label>
                  <textarea 
                    className={`w-full p-3 ${UI.input}`}
                    rows={3}
                    value={quizForm.Question}
                    onChange={e => setQuizForm({...quizForm, Question: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-3 ${UI.textSecondary}`}>{t('courses.resourceCreation.modal.answers')}</label>
                  {quizForm.answers.map((ans, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                       <span className={`py-2 w-6 ${UI.textSecondary}`}>{String.fromCharCode(65 + idx)}</span>
                       <input 
                         className={`flex-1 p-3 ${UI.input}`}
                         value={ans}
                         onChange={e => {
                           const newAns = [...quizForm.answers];
                           newAns[idx] = e.target.value;
                           setQuizForm({...quizForm, answers: newAns});
                         }}
                         placeholder={`${t('courses.resourceCreation.modal.optionPlaceholder')} ${String.fromCharCode(65 + idx)}`}
                       />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${UI.textSecondary}`}>{t('courses.resourceCreation.modal.correctAnswer')}</label>
                    <select 
                      className={`w-full p-3 ${UI.input}`}
                      value={quizForm.answer}
                      onChange={e => setQuizForm({...quizForm, answer: e.target.value})}
                    >
                      <option value="">{t('courses.resourceCreation.modal.selectCorrect')}</option>
                      {quizForm.answers.map((ans, idx) => ans && (
                        <option key={idx} value={ans}>{String.fromCharCode(65 + idx)}. {ans}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${UI.textSecondary}`}>{t('courses.resourceCreation.modal.order')}</label>
                    <input 
                      type="number" 
                      className={`w-full p-3 ${UI.input}`}
                      value={quizForm.order}
                      onChange={e => setQuizForm({...quizForm, order: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              <div className={`p-6 border-t ${UI.borderLight} flex justify-end gap-2`}>
                <button onClick={closeModal} className={`px-4 py-2 rounded-xl ${UI.btnSecondary} ${UI.textSecondary}`}>{t('courses.resourceCreation.modal.cancel')}</button>
                <button onClick={handleSaveQuiz} className={`px-4 py-2 rounded-xl ${UI.btnPrimary}`}>{t('courses.resourceCreation.modal.saveQuestion')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-xl font-bold ${UI.textPrimary}`}>{t('courses.resourceCreation.title')}</h2>
          <p className={`text-sm ${UI.textSecondary}`}>{resources.length} {t('courses.resourceCreation.items')}</p>
        </div>
        <button 
          onClick={() => openModal('resource')}
          className={`${UI.btnPrimary} px-4 py-2 rounded-lg flex items-center gap-2`}
        >
          <Plus className="h-4 w-4" /> {t('courses.resourceCreation.addResource')}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-special border-t-transparent mx-auto"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className={`text-center py-12 ${UI.bgSecondary} rounded-2xl border ${UI.borderLight}`}>
          <FileText className={`h-12 w-12 mx-auto ${UI.textSecondary} mb-2`} />
          <h3 className={`${UI.textPrimary} font-medium`}>{t('courses.resourceCreation.noResources')}</h3>
          <p className={`${UI.textSecondary} mb-4`}>{t('courses.resourceCreation.noResourcesDesc')}</p>
          <button onClick={() => openModal('resource')} className={`${UI.specialText} font-medium hover:underline`}>{t('courses.resourceCreation.createFirst')}</button>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.sort((a,b) => a.order - b.order).map(resource => (
            <div key={resource._id} className={`${UI.bgCardSecondary} backdrop-blur-sm p-4 rounded-2xl border ${UI.borderLight} flex items-center justify-between group hover:shadow-md transition-shadow`}>
              <div className="flex items-center gap-4">
                <div className={`p-2 ${UI.bgSecondary} rounded-lg ${UI.textSecondary}`}>
                  {getResourceIcon(resource.type)}
                </div>
                <div>
                  <h3 className={`font-semibold ${UI.textPrimary}`}>{resource.title}</h3>
                  <div className={`flex items-center gap-3 text-xs ${UI.textSecondary} mt-1`}>
                    <span className={`capitalize ${UI.badgeSecondary} px-2 py-0.5 rounded`}>{t(`courses.resourceCreation.types.${resource.type}`) || resource.type}</span>
                    <span>{t('courses.resourceCreation.order')}: {resource.order}</span>
                    {resource.type === 'quiz' && (
                       <span className={`${UI.specialText} cursor-pointer`}>{t('courses.resourceCreation.clickManageQuiz')}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {resource.type === 'quiz' && (
                  <button 
                    onClick={() => handleManageQuiz(resource)}
                    className={`p-2 ${UI.specialText} ${UI.specialBgLight} hover:opacity-80 rounded-lg`}
                    title={t('courses.resourceCreation.manageQuiz')}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                )}
                <button 
                  onClick={() => openModal('resource', resource)}
                  className={`p-2 ${UI.textSecondary} ${UI.bgHover} rounded-lg`}
                  title={t('courses.resourceCreation.editResource')}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete('resource', resource._id)}
                  className={`p-2 ${UI.error} ${UI.errorBg} rounded-lg`}
                  title={t('courses.resourceCreation.deleteResource')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resource Modal */}
      {showModal && modalType === 'resource' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`${UI.bgCard} rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border ${UI.borderLight}`}>
            <div className={`p-6 border-b ${UI.borderLight} flex justify-between items-center`}>
              <h3 className={`text-xl font-bold ${UI.textPrimary}`}>{editingItem ? t('courses.resourceCreation.modal.editResource') : t('courses.resourceCreation.modal.addResource')}</h3>
              <button onClick={closeModal}><X className={`h-5 w-5 ${UI.textSecondary}`} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${UI.textSecondary}`}>{t('courses.resourceCreation.modal.title')}</label>
                <input 
                   type="text" 
                   className={`w-full p-3 ${UI.input}`}
                   value={resourceForm.title}
                   onChange={e => setResourceForm({...resourceForm, title: e.target.value})}
                />
              </div>
              <div>
                 <label className={`block text-sm font-medium mb-1 ${UI.textSecondary}`}>{t('courses.resourceCreation.modal.description')}</label>
                 <textarea 
                    rows={2}
                    className={`w-full p-3 ${UI.input} resize-none`}
                    value={resourceForm.description}
                    onChange={e => setResourceForm({...resourceForm, description: e.target.value})}
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className={`block text-sm font-medium mb-1 ${UI.textSecondary}`}>{t('courses.resourceCreation.modal.type')}</label>
                   <select 
                      className={`w-full p-3 ${UI.input}`}
                      value={resourceForm.type}
                      onChange={e => setResourceForm({...resourceForm, type: e.target.value})}
                   >
                     <option value="document">{t('courses.resourceCreation.types.document')}</option>
                     <option value="video">{t('courses.resourceCreation.types.video')}</option>
                     <option value="quiz">{t('courses.resourceCreation.types.quiz')}</option>
                     <option value="image">{t('courses.resourceCreation.types.image')}</option>
                     <option value="link">{t('courses.resourceCreation.types.link')}</option>
                   </select>
                </div>
                <div>
                   <label className={`block text-sm font-medium mb-1 ${UI.textSecondary}`}>{t('courses.resourceCreation.modal.order')}</label>
                   <input 
                      type="number"
                      className={`w-full p-3 ${UI.input}`}
                      value={resourceForm.order}
                      onChange={e => setResourceForm({...resourceForm, order: parseInt(e.target.value)})}
                   />
                </div>
              </div>
              
              <div>
                 <label className={`block text-sm font-medium mb-2 ${UI.textSecondary}`}>
                    {requiresFileUpload(resourceForm.type) 
                      ? (resourceForm.type === 'document' ? t('courses.resourceCreation.upload.uploadDocument') : 
                         resourceForm.type === 'video' ? t('courses.resourceCreation.upload.uploadVideo') : 
                         t('courses.resourceCreation.upload.uploadImage'))
                      : resourceForm.type === 'link' ? t('courses.resourceCreation.upload.linkUrl') : t('courses.resourceCreation.upload.quizInstructions')}
                 </label>
                 
                 {/* File Upload UI for document, video, image */}
                 {requiresFileUpload(resourceForm.type) ? (
                    resourceForm.content ? (
                      <div className={`${UI.bgSecondary} rounded-xl p-4 border ${UI.borderLight}`}>
                        {/* Preview based on type */}
                        {resourceForm.type === 'image' && resourceForm.content && (
                          <img 
                            src={resourceForm.content || null} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                        )}
                        {resourceForm.type === 'video' && resourceForm.content && (
                          <video 
                            src={resourceForm.content || null} 
                            controls 
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                        )}
                        {resourceForm.type === 'document' && (
                          <div className={`flex items-center gap-3 p-4 ${UI.bgCard} rounded-lg mb-3`}>
                            <FileText className={`h-8 w-8 ${UI.specialText}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium ${UI.textPrimary} truncate`}>{t('courses.resourceCreation.upload.documentUploaded')}</p>
                              <p className={`text-xs ${UI.textSecondary} truncate`}>{resourceForm.content}</p>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2 ${UI.errorBg} ${UI.error} rounded-lg transition-colors`}
                        >
                          <X className="h-4 w-4" />
                          {t('courses.resourceCreation.upload.removeFile')}
                        </button>
                      </div>
                    ) : (
                      <div className={`border-2 border-dashed ${UI.borderLight} rounded-xl p-8 text-center hover:border-special/50 dark:hover:border-special-light/50 transition-colors`}>
                        <Upload className={`h-12 w-12 mx-auto ${UI.textSecondary} mb-4`} />
                        <p className={`${UI.textSecondary} mb-4`}>
                          {t('courses.resourceCreation.upload.dragDrop')}
                        </p>
                        <input
                          type="file"
                          accept={getAcceptedFileTypes(resourceForm.type)}
                          onChange={handleFileUpload}
                          className="hidden"
                          id="resource-file-upload"
                          disabled={fileUploading}
                        />
                        <label
                          htmlFor="resource-file-upload"
                          className={`inline-flex items-center gap-2 px-4 py-2 ${UI.specialBgLight} ${UI.specialText} rounded-xl hover:opacity-80 cursor-pointer transition-colors ${fileUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {fileUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                              {t('courses.resourceCreation.modal.uploading')}
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              {t('courses.resourceCreation.upload.chooseFile')}
                            </>
                          )}
                        </label>
                        <p className={`text-xs ${UI.textSecondary} mt-3`}>
                          {resourceForm.type === 'video' && t('courses.resourceCreation.upload.videoFormats')}
                          {resourceForm.type === 'image' && t('courses.resourceCreation.upload.imageFormats')}
                          {resourceForm.type === 'document' && t('courses.resourceCreation.upload.documentFormats')}
                        </p>
                      </div>
                    )
                 ) : (
                    /* Link or Quiz - text input */
                    <input 
                       type="text"
                       className={`w-full p-3 ${UI.input}`}
                       value={resourceForm.content}
                       onChange={e => setResourceForm({...resourceForm, content: e.target.value})}
                       placeholder={resourceForm.type === 'quiz' ? t('courses.resourceCreation.upload.quizPlaceholder') : t('courses.resourceCreation.upload.linkPlaceholder')}
                    />
                 )}
              </div>
            </div>
            <div className={`p-6 border-t ${UI.borderLight} flex justify-end gap-2`}>
               <button onClick={closeModal} className={`px-4 py-2 rounded-xl ${UI.btnSecondary} ${UI.textSecondary}`}>{t('courses.resourceCreation.modal.cancel')}</button>
               <button 
                 onClick={handleSaveResource} 
                 disabled={fileUploading}
                 className={`px-4 py-2 rounded-xl ${UI.btnPrimary} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
               >
                 {fileUploading ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                     {t('courses.resourceCreation.modal.uploading')}
                   </>
                 ) : (
                   t('courses.resourceCreation.modal.saveResource')
                 )}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseResources;
