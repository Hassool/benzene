"use client"

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, FileText, Play, 
  Link, Image, HelpCircle, Save, X,  ArrowUp, ArrowDown
} from 'lucide-react';
import { useTranslation } from 'react-lite-translation';

const CourseResources = ({ courseId }) => {
  const { t } = useTranslation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleSaveResource = async () => {
    try {
      const url = '/api/resource' + (editingItem ? `?id=${editingItem._id}` : '');
      const method = editingItem ? 'PATCH' : 'POST';
      const body = { 
        ...resourceForm, 
        courseId,
        // Ensure content is formatted correctly if DB expects specific structure
        content: resourceForm.type === 'document' ? resourceForm.content : { url: resourceForm.content }
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Failed to save resource');
      
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
    if (!window.confirm('Are you sure?')) return;

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
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Resources
          </button>
          <button 
             onClick={() => openModal('quiz')}
             className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Quiz: {selectedResource.title}</h2>
          <p className="text-gray-600 dark:text-gray-300">{selectedResource.description}</p>
        </div>

        {loadingQuizzes ? (
           <p className="text-center py-4">Loading questions...</p>
        ) : quizzes.length === 0 ? (
           <p className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500">No questions added yet.</p>
        ) : (
          <div className="space-y-4">
            {quizzes.sort((a,b) => a.order - b.order).map((quiz, index) => (
               <div key={quiz._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => openModal('quiz', quiz)} className="text-blue-600 hover:text-blue-800"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete('quiz', quiz._id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3 pr-16 text-gray-900 dark:text-white">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded mr-2">Q{quiz.order}</span>
                    {quiz.Question}
                  </h3>

                  <div className="space-y-2">
                    {quiz.answers.map((ans, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${ans === quiz.answer ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-gray-50 border-gray-100 dark:bg-gray-700 dark:border-gray-600'}`}>
                        <span className="font-medium mr-2 text-gray-700 dark:text-gray-300">{String.fromCharCode(65 + idx)}.</span>
                        <span className="text-gray-800 dark:text-gray-200">{ans}</span>
                        {ans === quiz.answer && <span className="ml-2 text-green-600 dark:text-green-400 text-xs font-bold">✓ Correct</span>}
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
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingItem ? 'Edit' : 'Add'} Question</h3>
                <button onClick={closeModal}><X className="h-5 w-5 text-gray-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Question</label>
                  <textarea 
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                    value={quizForm.Question}
                    onChange={e => setQuizForm({...quizForm, Question: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Answers</label>
                  {quizForm.answers.map((ans, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                       <span className="py-2 w-6 text-gray-500">{String.fromCharCode(65 + idx)}</span>
                       <input 
                         className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                         value={ans}
                         onChange={e => {
                           const newAns = [...quizForm.answers];
                           newAns[idx] = e.target.value;
                           setQuizForm({...quizForm, answers: newAns});
                         }}
                         placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                       />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Correct Answer</label>
                    <select 
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={quizForm.answer}
                      onChange={e => setQuizForm({...quizForm, answer: e.target.value})}
                    >
                      <option value="">Select correct answer</option>
                      {quizForm.answers.map((ans, idx) => ans && (
                        <option key={idx} value={ans}>{String.fromCharCode(65 + idx)}. {ans}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Order</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={quizForm.order}
                      onChange={e => setQuizForm({...quizForm, order: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                <button onClick={closeModal} className="px-4 py-2 border rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
                <button onClick={handleSaveQuiz} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Save Question</button>
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Resources</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{resources.length} items</p>
        </div>
        <button 
          onClick={() => openModal('resource')}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Resource
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <h3 className="text-gray-900 dark:text-white font-medium">No resources yet</h3>
          <p className="text-gray-500 mb-4">Start by adding documents, videos, or quizzes.</p>
          <button onClick={() => openModal('resource')} className="text-purple-600 font-medium hover:underline">Create first resource</button>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.sort((a,b) => a.order - b.order).map(resource => (
            <div key={resource._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                  {getResourceIcon(resource.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{resource.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{resource.type}</span>
                    <span>Order: {resource.order}</span>
                    {resource.type === 'quiz' && (
                       <span className="text-orange-600 dark:text-orange-400 pointer">Click Manage Quiz to view questions</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {resource.type === 'quiz' && (
                  <button 
                    onClick={() => handleManageQuiz(resource)}
                    className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg"
                    title="Manage Quiz Questions"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                )}
                <button 
                  onClick={() => openModal('resource', resource)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Edit Resource"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete('resource', resource._id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  title="Delete Resource"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingItem ? 'Edit' : 'Add'} Resource</h3>
              <button onClick={closeModal}><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
                <input 
                   type="text" 
                   className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   value={resourceForm.title}
                   onChange={e => setResourceForm({...resourceForm, title: e.target.value})}
                />
              </div>
              <div>
                 <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                 <textarea 
                    rows={2}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={resourceForm.description}
                    onChange={e => setResourceForm({...resourceForm, description: e.target.value})}
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Type</label>
                   <select 
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={resourceForm.type}
                      onChange={e => setResourceForm({...resourceForm, type: e.target.value})}
                   >
                     <option value="document">Document</option>
                     <option value="video">Video</option>
                     <option value="quiz">Quiz</option>
                     <option value="image">Image</option>
                     <option value="link">Link</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Order</label>
                   <input 
                      type="number"
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={resourceForm.order}
                      onChange={e => setResourceForm({...resourceForm, order: parseInt(e.target.value)})}
                   />
                </div>
              </div>
              
              <div>
                 <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {resourceForm.type === 'document' ? 'Content (HTML)' : 
                     resourceForm.type === 'video' ? 'Video URL' : 
                     resourceForm.type === 'image' ? 'Image URL' : 
                     resourceForm.type === 'link' ? 'Link URL' : 'Quiz Instructions'}
                 </label>
                 {resourceForm.type === 'document' ? (
                    <textarea 
                       rows={6}
                       className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                       value={resourceForm.content}
                       onChange={e => setResourceForm({...resourceForm, content: e.target.value})}
                    />
                 ) : (
                    <input 
                       type="text"
                       className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                       value={resourceForm.content}
                       onChange={e => setResourceForm({...resourceForm, content: e.target.value})}
                       placeholder={resourceForm.type === 'quiz' ? 'Enter instructions for the quiz' : 'https://...'}
                    />
                 )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
               <button onClick={closeModal} className="px-4 py-2 border rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
               <button onClick={handleSaveResource} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Save Resource</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseResources;
