const CoursesEN = {
    titles: "Our Courses",
    search: {
        title: "Search",
        placeholder: "Search courses, instructors, modules..."
    },
    filters: {
        title: "Filters",
        s: "Sort By",
        m: "Module",
        c: "Year",
        NF: "newest",
        OF: "oldest",
        clear: "Clear Filters"
    },
    add: {
        title: "Add New Course",
        subtitle: "Share your expertise with students",
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
            titlePlaceholder: "Example: Mathematics for First Year Secondary - Algebra and Geometry",
            category: "Category",
            selectCategory: "Select a category",
            branch: "Branch",
            selectBranch: "Select a branch",
            module: "Subject",
            selectModule: "Select a subject",
            descriptionPlaceholder: "Describe the content, teaching methods, and what students will learn...",
            imagePlaceholder: "Drag and drop an image or click to select",
            chooseImage: "Choose Image",
            uploading: "Uploading...",
            publishImmediately: "Publish course immediately",
            publishNote: "If selected, the course will be visible to everyone. Otherwise, it will remain as a draft."
        },
        
        categories: {
            '1as': 'First Year Secondary (1AS)',
            '2as': 'Second Year Secondary (2AS)',
            '3as': 'Third Year Secondary (3AS)',
            'other': 'Other'
        },
        
        branches: {
            '1as': {
                'common-core-science': 'Common Core Science',
                'common-core-arts': 'Common Core Arts',
                'all': 'All Branches'
            },
            '2as': {
                'common-core-science': 'Common Core Science',
                'common-core-arts': 'Common Core Arts',
                'technical-math': 'Technical Mathematics',
                'mathematics': 'Mathematics',
                'sciences': 'Experimental Sciences',
                'management-economics': 'Management and Economics',
                'languages': 'Foreign Languages',
                'literature-philosophy': 'Literature and Philosophy',
                'all': 'All Branches'
            },
            '3as': {
                'common-core-science': 'Common Core Science',
                'common-core-arts': 'Common Core Arts',
                'technical-math': 'Technical Mathematics',
                'mathematics': 'Mathematics',
                'sciences': 'Experimental Sciences',
                'management-economics': 'Management and Economics',
                'languages': 'Foreign Languages',
                'literature-philosophy': 'Literature and Philosophy',
                'all': 'All Branches'
            },
            'other': {
                'all': 'All Branches'
            }
        },
        
        modules: {
            1: {
                math: "Mathematics",
                science: "Natural and Life Sciences",
                physics: "Physical Sciences",
                arabic: "Arabic Language",
                EG: "History and Geography",
                french: "French Language",
                english: "English Language",
                islamic: "Islamic Education",
                techno: "Technology",
                info: "Computer Science",
                gestion: "Accounting and Financial Management",
            },
            2: {
                math: "Mathematics",
                science: "Natural and Life Sciences",
                physics: "Physical Sciences",
                arabic: "Arabic Language",
                philo: "Philosophy",
                EG: "History and Geography",
                french: "French Language",
                english: "English Language",
                de: "German Language",
                es: "Spanish Language",
                it: "Italian Language",
                islamic: "Islamic Education",
                gp: "Process Engineering",
                ge: "Electrical Engineering",
                gm: "Mechanical Engineering",
                gc: "Civil Engineering",
                gestion: "Accounting and Financial Management",
                management: "Economics and Management",
                law: "Law",
            },
            3: {
                math: "Mathematics",
                science: "Natural and Life Sciences",
                physics: "Physical Sciences",
                arabic: "Arabic Language",
                philo: "Philosophy",
                EG: "History and Geography",
                french: "French Language",
                english: "English Language",
                de: "German Language",
                es: "Spanish Language",
                it: "Italian Language",
                islamic: "Islamic Education",
                gp: "Process Engineering",
                ge: "Electrical Engineering",
                gm: "Mechanical Engineering",
                gc: "Civil Engineering",
                gestion: "Accounting and Financial Management",
                management: "Economics and Management",
                law: "Law",
            }
        },
        
        buttons: {
            create: "Create Course",
            saving: "Saving..."
        },
        
        validation: {
            titleRequired: "Title is required",
            titleMinLength: "Title must be at least 3 characters",
            titleMaxLength: "Title cannot exceed 100 characters",
            descRequired: "Description is required",
            descMinLength: "Description must be at least 10 characters",
            descMaxLength: "Description cannot exceed 1000 characters",
            categoryRequired: "Category is required",
            branchRequired: "Branch is required",
            moduleRequired: "Module is required",
            imageInvalid: "Please select a valid image",
            imageSize: "Image size must not exceed 5 MB",
            imageUploadError: "Image upload error",
            submitError: "An error occurred",
            connectionError: "Connection error. Please try again."
        }
    },
    
    view: {
        title: "Your Courses",
        subtitle: "Manage and edit your course content",
        loading: "Loading your courses...",
        accessRequired: "Access Required",
        loginMessage: "Please log in to view your courses.",
        
        empty: {
            title: "No Courses Yet",
            message: "Start creating your first course to see it here.",
            stitle: "Create a new lesson"
        },
        
        course: {
            updated: "Updated recently",
            viewDetails: "View Course Details",
            delete: "Delete Course",
            deleting: "Deleting..."
        },
        
        delete: {
            confirmTitle: "Delete Course",
            confirmMessage: "Are you sure you want to delete this course? This action cannot be undone and will delete all resources and associated data.",
            errorTitle: "Failed to delete course",
            dismiss: "Dismiss"
        }
    }
}

const CoursesAR = {
    titles: "دروسنا",
    search: {
        title: "ابحث",
        placeholder: "البحث عن الدروس ومواد"
    },
    filters: {
        title: "المرشحات",
        s: "فرز حسب",
        m: "المادة",
        c: "سنة",
        NF: "الأحدث",
        OF: "الأقدم",
        clear: "مسح المرشحات"
    },
    add: {
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
            branch: "الشعبة",
            selectBranch: "اختر شعبة",
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
        
        branches: {
            '1as': {
                'common-core-science': 'جذع مشترك علوم',
                'common-core-arts': 'جذع مشترك آداب',
                'all': 'جميع الشعب'
            },
            '2as': {
                'common-core-science': 'جذع مشترك علوم',
                'common-core-arts': 'جذع مشترك آداب',
                'technical-math': 'تقني رياضي',
                'mathematics': 'رياضيات',
                'sciences': 'علوم تجريبية',
                'management-economics': 'تسيير واقتصاد',
                'languages': 'لغات أجنبية',
                'literature-philosophy': 'آداب وفلسفة',
                'all': 'جميع الشعب'
            },
            '3as': {
                'common-core-science': 'جذع مشترك علوم',
                'common-core-arts': 'جذع مشترك آداب',
                'technical-math': 'تقني رياضي',
                'mathematics': 'رياضيات',
                'sciences': 'علوم تجريبية',
                'management-economics': 'تسيير واقتصاد',
                'languages': 'لغات أجنبية',
                'literature-philosophy': 'آداب وفلسفة',
                'all': 'جميع الشعب'
            },
            'other': {
                'all': 'جميع الشعب'
            }
        },
        
        modules: {
            1: {
                math: "الرياضيات",
                science: "علوم الطبيعة والحياة",
                physics: "العلوم الفيزيائية",
                arabic: "اللغة العربية",
                EG: "التاريخ والجغرافيا",
                french: "اللغة الفرنسية",
                english: "اللغة الإنجليزية",
                islamic: "التربية الإسلامية",
                techno: "التكنولوجيا",
                info: "الإعلام الآلي",
                gestion: "التسيير المحاسبي والمالي",
            },
            2: {
                math: "الرياضيات",
                science: "علوم الطبيعة والحياة",
                physics: "العلوم الفيزيائية",
                arabic: "اللغة العربية",
                philo: "الفلسفة",
                EG: "التاريخ والجغرافيا",
                french: "اللغة الفرنسية",
                english: "اللغة الإنجليزية",
                de: "اللغة الألمانية",
                es: "اللغة الإسبانية",
                it: "اللغة الإيطالية",
                islamic: "التربية الإسلامية",
                gp: "هندسة الطرائق",
                ge: "الهندسة الكهربائية",
                gm: "الهندسة الميكانيكية",
                gc: "الهندسة المدنية",
                gestion: "التسيير المحاسبي والمالي",
                management: "الاقتصاد والمناجمنت",
                law: "القانون",
            },
            3: {
                math: "الرياضيات",
                science: "علوم الطبيعة والحياة",
                physics: "العلوم الفيزيائية",
                arabic: "اللغة العربية",
                philo: "الفلسفة",
                EG: "التاريخ والجغرافيا",
                french: "اللغة الفرنسية",
                english: "اللغة الإنجليزية",
                de: "اللغة الألمانية",
                es: "اللغة الإسبانية",
                it: "اللغة الإيطالية",
                islamic: "التربية الإسلامية",
                gp: "هندسة الطرائق",
                ge: "الهندسة الكهربائية",
                gm: "الهندسة الميكانيكية",
                gc: "الهندسة المدنية",
                gestion: "التسيير المحاسبي والمالي",
                management: "الاقتصاد والمناجمنت",
                law: "القانون",
            }
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
            branchRequired: "الشعبة مطلوبة",
            moduleRequired: "المادة مطلوبة",
            imageInvalid: "يرجى اختيار صورة صالحة",
            imageSize: "يجب ألا يتجاوز حجم الصورة 5 ميجابايت",
            imageUploadError: "خطأ في رفع الصورة",
            submitError: "حدث خطأ",
            connectionError: "خطأ في الاتصال. يرجى المحاولة مرة أخرى."
        }
    },
    
    view: {
        title: "دوراتك",
        subtitle: "إدارة وتعديل محتوى دوراتك",
        loading: "جاري تحميل دوراتك...",
        accessRequired: "الوصول مطلوب",
        loginMessage: "يرجى تسجيل الدخول لعرض دوراتك.",
        
        empty: {
            title: "لا توجد دورات بعد",
            message: "ابدأ بإنشاء دورتك الأولى لتظهر هنا.",
            stitle: "أنشئ درسا جديدا"
        },
        
        course: {
            updated: "تم التحديث مؤخراً",
            viewDetails: "عرض تفاصيل الدورة",
            delete: "حذف الدورة",
            deleting: "جاري الحذف..."
        },
        
        delete: {
            confirmTitle: "حذف الدورة",
            confirmMessage: "هل أنت متأكد من حذف هذه الدورة؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع الموارد والبيانات المرتبطة.",
            errorTitle: "فشل حذف الدورة",
            dismiss: "إغلاق"
        }
    }
}

export { CoursesAR, CoursesEN }