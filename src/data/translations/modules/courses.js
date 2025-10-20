const CoursesEN = {
    titles: "Our Courses",
    search : {
        title:"Search",
        palceholder:"Search courses, instructors, modules..."
    },
    filters: {
        title:"Filters",
        s:"Sort By",
        m:"Module",
        c:"Year",
        NF:"newest",
        OF: "oldest",
        clear: "Clear Filters"
    },
    add: {
    title: "Add a New Course",
    subtitle: "Create and share your expertise with students",
    loading: "Loading...",
    loginRequired: "Login Required",
    loginMessage: "Please log in to add a course.",
    successMessage: "Course created successfully!",
    
    sections: {
      basicInfo: "Basic Information",
      description: "Course Description",
      image: "Course Image (Optional)",
      publishing: "Publishing Options"
    },
    
    fields: {
      title: "Course Title",
      titlePlaceholder: "Ex: Mathematics for 1AS - Algebra and Geometry",
      category: "Category",
      selectCategory: "Select a category",
      module: "Module",
      selectModule: "Select a module",
      descriptionPlaceholder: "Describe the content, teaching methods and what students will learn...",
      imagePlaceholder: "Drag and drop an image or click to select",
      chooseImage: "Choose an image",
      uploading: "Uploading...",
      publishImmediately: "Publish the course immediately",
      publishNote: "If checked, the course will be publicly visible. Otherwise, it will remain a draft."
    },
    
    categories: {
      '1as': 'First Year Secondary (1AS)',
      '2as': 'Second Year Secondary (2AS)',
      '3as': 'Third Year Secondary (3AS)',
      'other': 'Other'
    },
    
    modules: {
      mathematics: 'Mathematics',
      physics: 'Physics',
      naturalSciences: 'Natural Sciences',
      french: 'French',
      arabic: 'Arabic',
      english: 'English',
      historyGeo: 'History-Geography',
      islamicEd: 'Islamic Education',
      philosophy: 'Philosophy',
      engineering: 'Engineering Sciences',
      economics: 'Economics-Management',
      literature: 'Literature',
      vocational: 'Vocational Training',
      foreignLang: 'Foreign Language',
      computer: 'Computer Science',
      arts: 'Arts',
      sport: 'Sport',
      music: 'Music',
      other: 'Other'
    },
    
    buttons: {
      create: "Create Course",
      saving: "Saving..."
    },
    
    validation: {
      titleRequired: "Title is required",
      titleMinLength: "Title must contain at least 3 characters",
      titleMaxLength: "Title cannot exceed 100 characters",
      descRequired: "Description is required",
      descMinLength: "Description must contain at least 10 characters",
      descMaxLength: "Description cannot exceed 1000 characters",
      categoryRequired: "Category is required",
      moduleRequired: "Module is required",
      imageInvalid: "Please select a valid image",
      imageSize: "Image size must not exceed 5MB",
      imageUploadError: "Error uploading image",
      submitError: "An error occurred",
      connectionError: "Connection error. Please try again."
    }
  },
  
  // ViewCourses component
  view: {
    title: "Your Courses",
    subtitle: "Manage and edit your course content",
    loading: "Loading your courses...",
    accessRequired: "Access Required",
    loginMessage: "Please log in to view your courses.",
    
    empty: {
      title: "No Courses Yet",
      message: "Start creating your first course to see it here."
    },
    
    course: {
      updated: "Updated recently",
      viewDetails: "View Course Details",
      delete: "Delete Course",
      deleting: "Deleting..."
    },
    
    delete: {
      confirmTitle: "Delete Course",
      confirmMessage: "Are you sure you want to delete this course? This action cannot be undone and will delete all sections, resources, and associated data.",
      errorTitle: "Failed to delete course",
      dismiss: "Dismiss"
    }
  }
}

const CoursesAR = {
    titles: "دروسنا",
    search : {
        title:"ابحث",
        palceholder:"البحث عن الدروس  ومواد "
    },
    filters: {
        title:"المرشحات",
        s:"فرز حسب",
        m:"المادة ",
        c:"سنة",
        NF:"الأحدث",
        OF: "الأقدم",
        clear: "مسح المرشحات"
    },
    dd: {
    title: "إضافة دورة جديدة",
    subtitle: "شارك خبرتك مع الطلاب",
    loading: "جاري التحميل...",
    loginRequired: "تسجيل الدخول مطلوب",
    loginMessage: "يرجى تسجيل الدخول لإضافة دورة.",
    successMessage: "تم إنشاء الدورة بنجاح!",
    
    sections: {
      basicInfo: "المعلومات الأساسية",
      description: "وصف الدورة",
      image: "صورة الدورة (اختياري)",
      publishing: "خيارات النشر"
    },
    
    fields: {
      title: "عنوان الدورة",
      titlePlaceholder: "مثال: الرياضيات للسنة الأولى ثانوي - الجبر والهندسة",
      category: "الفئة",
      selectCategory: "اختر فئة",
      module: "المادة",
      selectModule: "اختر مادة",
      descriptionPlaceholder: "صف المحتوى وطرق التدريس وما سيتعلمه الطلاب...",
      imagePlaceholder: "اسحب وأفلت صورة أو انقر للاختيار",
      chooseImage: "اختر صورة",
      uploading: "جاري الرفع...",
      publishImmediately: "نشر الدورة فوراً",
      publishNote: "إذا تم التحديد، ستكون الدورة مرئية للجميع. وإلا ستبقى كمسودة."
    },
    
    categories: {
      '1as': 'السنة الأولى ثانوي (1AS)',
      '2as': 'السنة الثانية ثانوي (2AS)',
      '3as': 'السنة الثالثة ثانوي (3AS)',
      'other': 'أخرى'
    },
    
    modules: {
      mathematics: 'الرياضيات',
      physics: 'الفيزياء',
      naturalSciences: 'العلوم الطبيعية',
      french: 'الفرنسية',
      arabic: 'العربية',
      english: 'الإنجليزية',
      historyGeo: 'التاريخ والجغرافيا',
      islamicEd: 'التربية الإسلامية',
      philosophy: 'الفلسفة',
      engineering: 'علوم الهندسة',
      economics: 'الاقتصاد والتسيير',
      literature: 'الأدب',
      vocational: 'التدريب المهني',
      foreignLang: 'لغة أجنبية',
      computer: 'الإعلام الآلي',
      arts: 'الفنون',
      sport: 'الرياضة',
      music: 'الموسيقى',
      other: 'أخرى'
    },
    
    buttons: {
      create: "إنشاء الدورة",
      saving: "جاري الحفظ..."
    },
    
    validation: {
      titleRequired: "العنوان مطلوب",
      titleMinLength: "يجب أن يحتوي العنوان على 3 أحرف على الأقل",
      titleMaxLength: "لا يمكن أن يتجاوز العنوان 100 حرف",
      descRequired: "الوصف مطلوب",
      descMinLength: "يجب أن يحتوي الوصف على 10 أحرف على الأقل",
      descMaxLength: "لا يمكن أن يتجاوز الوصف 1000 حرف",
      categoryRequired: "الفئة مطلوبة",
      moduleRequired: "المادة مطلوبة",
      imageInvalid: "يرجى اختيار صورة صالحة",
      imageSize: "يجب ألا يتجاوز حجم الصورة 5 ميجابايت",
      imageUploadError: "خطأ في رفع الصورة",
      submitError: "حدث خطأ",
      connectionError: "خطأ في الاتصال. يرجى المحاولة مرة أخرى."
    }
  },
  
  // ViewCourses component
  view: {
    title: "دوراتك",
    subtitle: "إدارة وتعديل محتوى دوراتك",
    loading: "جاري تحميل دوراتك...",
    accessRequired: "الوصول مطلوب",
    loginMessage: "يرجى تسجيل الدخول لعرض دوراتك.",
    
    empty: {
      title: "لا توجد دورات بعد",
      message: "ابدأ بإنشاء دورتك الأولى لتظهر هنا."
    },
    
    course: {
      updated: "تم التحديث مؤخراً",
      viewDetails: "عرض تفاصيل الدورة",
      delete: "حذف الدورة",
      deleting: "جاري الحذف..."
    },
    
    delete: {
      confirmTitle: "حذف الدورة",
      confirmMessage: "هل أنت متأكد من حذف هذه الدورة؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع الأقسام والموارد والبيانات المرتبطة.",
      errorTitle: "فشل حذف الدورة",
      dismiss: "إغلاق"
    }
  }
}


export {CoursesAR , CoursesEN}