"use client"

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, FileText, Play, 
  Link, Image, HelpCircle, Save, X,  ArrowUp, ArrowDown, Eye, BookOpen
} from 'lucide-react';

const CourseDashboard = () => {
  // Navigation state
  const [currentView, setCurrentView] = useState('courses'); // courses, course-detail, section-detail, resource-detail, quiz-detail
  const [breadcrumb, setBreadcrumb] = useState([{ label: 'Courses', view: 'courses' }]);

  // Data states
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [resources, setResources] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // Current selection states
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    thumbnail: ''
  });

  const [sectionForm, setSectionForm] = useState({
    title: '',
    description: ''
  });

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
    ansewers: ['', '', '', ''],
    ansewer: ''
  });

  // Initialize mock data
  useEffect(() => {
    const mockCourses = [
      { _id: '1', title: 'Introduction to Programming', description: 'Learn the basics of programming with practical examples', thumbnail: '' },
      { _id: '2', title: 'Web Development Fundamentals', description: 'Complete guide to modern web development', thumbnail: '' }
    ];

    const mockSections = [
      { _id: 's1', title: 'Getting Started', description: 'Introduction and setup', courseId: '1' },
      { _id: 's2', title: 'Variables and Data Types', description: 'Understanding basic concepts', courseId: '1' },
      { _id: 's3', title: 'HTML Basics', description: 'Structure of web pages', courseId: '2' }
    ];

    const mockResources = [
      { _id: 'r1', title: 'Welcome Video', description: 'Course introduction', sectionId: 's1', type: 'video', content: 'https://example.com/video1.mp4', order: 1 },
      { _id: 'r2', title: 'Programming Quiz', description: 'Test your knowledge', sectionId: 's1', type: 'quiz', content: '', order: 2 },
      { _id: 'r3', title: 'HTML Structure', description: 'Learn HTML basics', sectionId: 's3', type: 'document', content: '<h1>HTML Tutorial</h1>', order: 1 }
    ];

    const mockQuizzes = [
      { _id: 'q1', Question: 'What is a variable?', order: 1, ResourceID: 'r2', ansewers: ['A storage location', 'A function', 'A loop', 'A condition'], ansewer: 'A storage location' },
      { _id: 'q2', Question: 'Which is a programming language?', order: 2, ResourceID: 'r2', ansewers: ['HTML', 'CSS', 'JavaScript', 'All of the above'], ansewer: 'JavaScript' }
    ];

    setCourses(mockCourses);
    setSections(mockSections);
    setResources(mockResources);
    setQuizzes(mockQuizzes);
  }, []);

  // Navigation functions
  const navigateTo = (view, item = null, label = '') => {
    const newBreadcrumb = [...breadcrumb];
    
    switch (view) {
      case 'course-detail':
        setSelectedCourse(item);
        newBreadcrumb.push({ label: label || item?.title, view, item });
        break;
      case 'section-detail':
        setSelectedSection(item);
        newBreadcrumb.push({ label: label || item?.title, view, item });
        break;
      case 'resource-detail':
        setSelectedResource(item);
        newBreadcrumb.push({ label: label || item?.title, view, item });
        break;
      case 'quiz-detail':
        newBreadcrumb.push({ label: 'Quiz Management', view, item });
        break;
    }
    
    setCurrentView(view);
    setBreadcrumb(newBreadcrumb);
  };

  const navigateBack = (index) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    const targetItem = newBreadcrumb[newBreadcrumb.length - 1];
    
    setBreadcrumb(newBreadcrumb);
    setCurrentView(targetItem.view);
    
    if (targetItem.view === 'course-detail') {
      setSelectedCourse(targetItem.item);
    } else if (targetItem.view === 'section-detail') {
      setSelectedSection(targetItem.item);
    } else if (targetItem.view === 'resource-detail') {
      setSelectedResource(targetItem.item);
    }
  };

  // Modal functions
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);

    // Pre-fill forms for editing
    if (item) {
      switch (type) {
        case 'course':
          setCourseForm(item);
          break;
        case 'section':
          setSectionForm(item);
          break;
        case 'resource':
          setResourceForm(item);
          break;
        case 'quiz':
          setQuizForm(item);
          break;
      }
    } else {
      // Reset forms for new items
      resetForms();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    resetForms();
  };

  const resetForms = () => {
    setCourseForm({ title: '', description: '', thumbnail: '' });
    setSectionForm({ title: '', description: '' });
    setResourceForm({ title: '', description: '', type: 'document', content: '', order: 1 });
    setQuizForm({ Question: '', order: 1, ansewers: ['', '', '', ''], ansewer: '' });
  };

  // CRUD functions
  const handleSaveCourse = () => {
    if (editingItem) {
      setCourses(courses.map(c => c._id === editingItem._id ? { ...courseForm, _id: editingItem._id } : c));
    } else {
      const newCourse = { ...courseForm, _id: Date.now().toString() };
      setCourses([...courses, newCourse]);
    }
    closeModal();
  };

  const handleSaveSection = () => {
    const sectionData = { ...sectionForm, courseId: selectedCourse._id };
    
    if (editingItem) {
      setSections(sections.map(s => s._id === editingItem._id ? { ...sectionData, _id: editingItem._id } : s));
    } else {
      const newSection = { ...sectionData, _id: Date.now().toString() };
      setSections([...sections, newSection]);
    }
    closeModal();
  };

  const handleSaveResource = () => {
    const resourceData = { ...resourceForm, sectionId: selectedSection._id };
    
    if (editingItem) {
      setResources(resources.map(r => r._id === editingItem._id ? { ...resourceData, _id: editingItem._id } : r));
    } else {
      const newResource = { ...resourceData, _id: Date.now().toString() };
      setResources([...resources, newResource]);
    }
    closeModal();
  };

  const handleSaveQuiz = () => {
    const quizData = { ...quizForm, ResourceID: selectedResource._id };
    
    if (editingItem) {
      setQuizzes(quizzes.map(q => q._id === editingItem._id ? { ...quizData, _id: editingItem._id } : q));
    } else {
      const newQuiz = { ...quizData, _id: Date.now().toString() };
      setQuizzes([...quizzes, newQuiz]);
    }
    closeModal();
  };

  const handleDelete = (type, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      switch (type) {
        case 'course':
          setCourses(courses.filter(c => c._id !== id));
          // Also delete related sections, resources, and quizzes
          const courseSections = sections.filter(s => s.courseId === id);
          const sectionIds = courseSections.map(s => s._id);
          setSections(sections.filter(s => s.courseId !== id));
          
          const courseResources = resources.filter(r => sectionIds.includes(r.sectionId));
          const resourceIds = courseResources.map(r => r._id);
          setResources(resources.filter(r => !sectionIds.includes(r.sectionId)));
          setQuizzes(quizzes.filter(q => !resourceIds.includes(q.ResourceID)));
          break;
        case 'section':
          setSections(sections.filter(s => s._id !== id));
          const sectionResources = resources.filter(r => r.sectionId === id);
          const resIds = sectionResources.map(r => r._id);
          setResources(resources.filter(r => r.sectionId !== id));
          setQuizzes(quizzes.filter(q => !resIds.includes(q.ResourceID)));
          break;
        case 'resource':
          setResources(resources.filter(r => r._id !== id));
          setQuizzes(quizzes.filter(q => q.ResourceID !== id));
          break;
        case 'quiz':
          setQuizzes(quizzes.filter(q => q._id !== id));
          break;
      }
    }
  };

  // Move quiz up/down
  const moveQuiz = (quizId, direction) => {
    const resourceQuizzes = quizzes.filter(q => q.ResourceID === selectedResource._id).sort((a, b) => a.order - b.order);
    const currentIndex = resourceQuizzes.findIndex(q => q._id === quizId);
    
    if ((direction === 'up' && currentIndex > 0) || (direction === 'down' && currentIndex < resourceQuizzes.length - 1)) {
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const updatedQuizzes = [...resourceQuizzes];
      
      // Swap orders
      [updatedQuizzes[currentIndex].order, updatedQuizzes[newIndex].order] = 
      [updatedQuizzes[newIndex].order, updatedQuizzes[currentIndex].order];
      
      // Update the main quizzes array
      const updatedAllQuizzes = quizzes.map(q => {
        const updated = updatedQuizzes.find(uq => uq._id === q._id);
        return updated || q;
      });
      
      setQuizzes(updatedAllQuizzes);
    }
  };

  // Get resource type icon
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

  // Filter functions
  const getSectionsByCourse = (courseId) => sections.filter(s => s.courseId === courseId);
  const getResourcesBySection = (sectionId) => resources.filter(r => r.sectionId === sectionId).sort((a, b) => a.order - b.order);
  const getQuizzesByResource = (resourceId) => quizzes.filter(q => q.ResourceID === resourceId).sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
              {breadcrumb.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span>/</span>}
                  <button 
                    onClick={() => navigateBack(index)}
                    className="hover:text-blue-600 hover:underline"
                  >
                    {item.label}
                  </button>
                </React.Fragment>
              ))}
            </nav>
          </div>
          
          {/* Add button based on current view */}
          <div>
            {currentView === 'courses' && (
              <button 
                onClick={() => openModal('course')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Course
              </button>
            )}
            {currentView === 'course-detail' && (
              <button 
                onClick={() => openModal('section')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Section
              </button>
            )}
            {currentView === 'section-detail' && (
              <button 
                onClick={() => openModal('resource')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Resource
              </button>
            )}
            {currentView === 'quiz-detail' && (
              <button 
                onClick={() => openModal('quiz')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Quiz Question
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Courses View */}
        {currentView === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {course.thumbnail && (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {getSectionsByCourse(course._id).length} sections
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateTo('course-detail', course)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => openModal('course', course)}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('course', course._id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Course Detail View */}
        {currentView === 'course-detail' && selectedCourse && (
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
                  <div className="text-sm text-gray-500">
                    {getSectionsByCourse(selectedCourse._id).length} sections
                  </div>
                </div>
                <button
                  onClick={() => openModal('course', selectedCourse)}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Edit className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sections List */}
            <div className="space-y-4">
              {getSectionsByCourse(selectedCourse._id).map(section => (
                <div key={section._id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{section.description}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        {getResourcesBySection(section._id).length} resources
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateTo('section-detail', section)}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 flex items-center gap-1"
                      >
                        <BookOpen className="h-4 w-4" />
                        Manage
                      </button>
                      <button
                        onClick={() => openModal('section', section)}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('section', section._id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section Detail View */}
        {currentView === 'section-detail' && selectedSection && (
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedSection.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedSection.description}</p>
                  <div className="text-sm text-gray-500">
                    {getResourcesBySection(selectedSection._id).length} resources
                  </div>
                </div>
                <button
                  onClick={() => openModal('section', selectedSection)}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Edit className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Resources List */}
            <div className="space-y-4">
              {getResourcesBySection(selectedSection._id).map(resource => (
                <div key={resource._id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{resource.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded capitalize">{resource.type}</span>
                          <span>Order: {resource.order}</span>
                          {resource.type === 'quiz' && (
                            <span>{getQuizzesByResource(resource._id).length} questions</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {resource.type === 'quiz' && (
                        <button
                          onClick={() => navigateTo('quiz-detail', resource)}
                          className="bg-orange-100 text-orange-700 px-3 py-1 rounded-md hover:bg-orange-200 flex items-center gap-1"
                        >
                          <HelpCircle className="h-4 w-4" />
                          Manage Quiz
                        </button>
                      )}
                      <button
                        onClick={() => openModal('resource', resource)}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('resource', resource._id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Detail View */}
        {currentView === 'quiz-detail' && selectedResource && (
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz: {selectedResource.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedResource.description}</p>
                  <div className="text-sm text-gray-500">
                    {getQuizzesByResource(selectedResource._id).length} questions
                  </div>
                </div>
              </div>
            </div>

            {/* Quiz Questions List */}
            <div className="space-y-4">
              {getQuizzesByResource(selectedResource._id).map((quiz, index) => (
                <div key={quiz._id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          Question {quiz.order}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{quiz.Question}</h3>
                      
                      <div className="space-y-2">
                        {quiz.ansewers.map((answer, idx) => (
                          <div 
                            key={idx} 
                            className={`p-3 rounded-lg border-2 ${
                              answer === quiz.ansewer 
                                ? 'border-green-200 bg-green-50 text-green-800' 
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>
                              <span>{answer}</span>
                              {answer === quiz.ansewer && (
                                <span className="text-green-600 text-sm font-medium ml-auto">✓ Correct</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => moveQuiz(quiz._id, 'up')}
                        disabled={index === 0}
                        className="text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveQuiz(quiz._id, 'down')}
                        disabled={index === getQuizzesByResource(selectedResource._id).length - 1}
                        className="text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal('quiz', quiz)}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('quiz', quiz._id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Course Form */}
              {modalType === 'course' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter course title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter course description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                    <input
                      type="url"
                      value={courseForm.thumbnail}
                      onChange={(e) => setCourseForm({...courseForm, thumbnail: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              )}

              {/* Section Form */}
              {modalType === 'section' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={sectionForm.title}
                      onChange={(e) => setSectionForm({...sectionForm, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={sectionForm.description}
                      onChange={(e) => setSectionForm({...sectionForm, description: e.target.value})}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter section description (optional)"
                    />
                  </div>
                </div>
              )}

              {/* Resource Form */}
              {modalType === 'resource' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={resourceForm.title}
                      onChange={(e) => setResourceForm({...resourceForm, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter resource title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={resourceForm.type}
                      onChange={(e) => setResourceForm({...resourceForm, type: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="document">Document</option>
                      <option value="video">Video</option>
                      <option value="quiz">Quiz</option>
                      <option value="link">Link</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={resourceForm.description}
                      onChange={(e) => setResourceForm({...resourceForm, description: e.target.value})}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter resource description (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {resourceForm.type === 'video' && 'Video URL'}
                      {resourceForm.type === 'link' && 'Link URL'}
                      {resourceForm.type === 'image' && 'Image URL'}
                      {resourceForm.type === 'document' && 'Content'}
                      {resourceForm.type === 'quiz' && 'Quiz Instructions'}
                    </label>
                    {resourceForm.type === 'document' ? (
                      <textarea
                        value={resourceForm.content}
                        onChange={(e) => setResourceForm({...resourceForm, content: e.target.value})}
                        rows={6}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Enter document content (HTML supported)"
                      />
                    ) : (
                      <input
                        type={resourceForm.type === 'video' || resourceForm.type === 'link' || resourceForm.type === 'image' ? 'url' : 'text'}
                        value={resourceForm.content}
                        onChange={(e) => setResourceForm({...resourceForm, content: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder={
                          resourceForm.type === 'video' ? 'https://example.com/video.mp4' :
                          resourceForm.type === 'link' ? 'https://example.com' :
                          resourceForm.type === 'image' ? 'https://example.com/image.jpg' :
                          'Enter quiz instructions'
                        }
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      min="1"
                      value={resourceForm.order}
                      onChange={(e) => setResourceForm({...resourceForm, order: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* Quiz Form */}
              {modalType === 'quiz' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                    <textarea
                      value={quizForm.Question}
                      onChange={(e) => setQuizForm({...quizForm, Question: e.target.value})}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your question here"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Answer Options</label>
                    <div className="space-y-3">
                      {quizForm.ansewers.map((answer, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="font-medium text-gray-600 w-8">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <input
                            type="text"
                            value={answer}
                            onChange={(e) => {
                              const newAnswers = [...quizForm.ansewers];
                              newAnswers[index] = e.target.value;
                              setQuizForm({...quizForm, ansewers: newAnswers});
                            }}
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder={`Answer option ${String.fromCharCode(65 + index)}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                    <select
                      value={quizForm.ansewer}
                      onChange={(e) => setQuizForm({...quizForm, ansewer: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select the correct answer</option>
                      {quizForm.ansewers.map((answer, index) => (
                        answer && (
                          <option key={index} value={answer}>
                            {String.fromCharCode(65 + index)}. {answer}
                          </option>
                        )
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Order</label>
                    <input
                      type="number"
                      min="1"
                      value={quizForm.order}
                      onChange={(e) => setQuizForm({...quizForm, order: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    switch (modalType) {
                      case 'course': handleSaveCourse(); break;
                      case 'section': handleSaveSection(); break;
                      case 'resource': handleSaveResource(); break;
                      case 'quiz': handleSaveQuiz(); break;
                    }
                  }}
                  className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 ${
                    modalType === 'course' ? 'bg-blue-600' :
                    modalType === 'section' ? 'bg-green-600' :
                    modalType === 'resource' ? 'bg-purple-600' :
                    'bg-orange-600'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  {editingItem ? 'Update' : 'Create'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDashboard;