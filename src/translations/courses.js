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
    },
    
    resourceCreation: {
        pageTitle: "Manage Course Content",
        title: "Course Resources",
        items: "items",
        addResource: "Add Resource",
        noResources: "No resources yet",
        noResourcesDesc: "Start by adding documents, videos, or quizzes.",
        createFirst: "Create first resource",
        order: "Order",
        clickManageQuiz: "Click Manage Quiz to view questions",
        manageQuiz: "Manage Quiz Questions",
        editResource: "Edit Resource",
        deleteResource: "Delete Resource",
        backToResources: "Back to Resources",
        addQuestion: "Add Question",
        quizTitle: "Quiz",
        loadingQuestions: "Loading questions...",
        noQuestions: "No questions added yet.",
        correct: "Correct",
        
        modal: {
            addResource: "Add Resource",
            editResource: "Edit Resource",
            addQuestion: "Add Question",
            editQuestion: "Edit Question",
            title: "Title",
            description: "Description",
            type: "Type",
            order: "Order",
            cancel: "Cancel",
            saveResource: "Save Resource",
            saveQuestion: "Save Question",
            question: "Question",
            answers: "Answers",
            optionPlaceholder: "Option",
            correctAnswer: "Correct Answer",
            selectCorrect: "Select correct answer",
            uploading: "Uploading..."
        },
        
        types: {
            document: "Document",
            video: "Video",
            quiz: "Quiz",
            image: "Image",
            link: "Link"
        },
        
        upload: {
            uploadDocument: "Upload Document (PDF, DOC, PPT, etc.)",
            uploadVideo: "Upload Video",
            uploadImage: "Upload Image",
            linkUrl: "Link URL",
            quizInstructions: "Quiz Instructions",
            dragDrop: "Drag and drop or click to upload",
            chooseFile: "Choose File",
            removeFile: "Remove File",
            documentUploaded: "Document Uploaded",
            videoFormats: "MP4, WebM, MOV up to 100MB",
            imageFormats: "JPG, PNG, GIF, WebP up to 10MB",
            documentFormats: "PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX",
            quizPlaceholder: "Enter instructions for the quiz",
            linkPlaceholder: "https://..."
        },
        
        confirmDelete: "Are you sure?"
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
    },
    
    resourceCreation: {
        pageTitle: "إدارة محتوى الدورة",
        title: "موارد الدورة",
        items: "عناصر",
        addResource: "إضافة مورد",
        noResources: "لا توجد موارد بعد",
        noResourcesDesc: "ابدأ بإضافة مستندات أو فيديوهات أو اختبارات.",
        createFirst: "إنشاء أول مورد",
        order: "الترتيب",
        clickManageQuiz: "انقر على إدارة الاختبار لعرض الأسئلة",
        manageQuiz: "إدارة أسئلة الاختبار",
        editResource: "تعديل المورد",
        deleteResource: "حذف المورد",
        backToResources: "العودة إلى الموارد",
        addQuestion: "إضافة سؤال",
        quizTitle: "اختبار",
        loadingQuestions: "جاري تحميل الأسئلة...",
        noQuestions: "لم تتم إضافة أسئلة بعد.",
        correct: "صحيح",
        
        modal: {
            addResource: "إضافة مورد",
            editResource: "تعديل المورد",
            addQuestion: "إضافة سؤال",
            editQuestion: "تعديل السؤال",
            title: "العنوان",
            description: "الوصف",
            type: "النوع",
            order: "الترتيب",
            cancel: "إلغاء",
            saveResource: "حفظ المورد",
            saveQuestion: "حفظ السؤال",
            question: "السؤال",
            answers: "الإجابات",
            optionPlaceholder: "الخيار",
            correctAnswer: "الإجابة الصحيحة",
            selectCorrect: "اختر الإجابة الصحيحة",
            uploading: "جاري الرفع..."
        },
        
        types: {
            document: "مستند",
            video: "فيديو",
            quiz: "اختبار",
            image: "صورة",
            link: "رابط"
        },
        
        upload: {
            uploadDocument: "رفع مستند (PDF, DOC, PPT, إلخ)",
            uploadVideo: "رفع فيديو",
            uploadImage: "رفع صورة",
            linkUrl: "رابط URL",
            quizInstructions: "تعليمات الاختبار",
            dragDrop: "اسحب وأفلت أو انقر للرفع",
            chooseFile: "اختر ملف",
            removeFile: "إزالة الملف",
            documentUploaded: "تم رفع المستند",
            videoFormats: "MP4, WebM, MOV حتى 100 ميجابايت",
            imageFormats: "JPG, PNG, GIF, WebP حتى 10 ميجابايت",
            documentFormats: "PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX",
            quizPlaceholder: "أدخل تعليمات الاختبار",
            linkPlaceholder: "https://..."
        },
        
        confirmDelete: "هل أنت متأكد؟"
    }
}

const CoursesFR = {
    titles: "Nos Cours",
    search: {
        title: "Rechercher",
        placeholder: "Rechercher des cours, instructeurs, modules..."
    },
    filters: {
        title: "Filtres",
        s: "Trier Par",
        m: "Module",
        c: "Année",
        NF: "plus récent",
        OF: "plus ancien",
        clear: "Effacer les Filtres"
    },
    add: {
        title: "Ajouter un Nouveau Cours",
        subtitle: "Partagez votre expertise avec les étudiants",
        loading: "Chargement...",
        loginRequired: "Connexion Requise",
        loginMessage: "Veuillez vous connecter pour ajouter un cours.",
        successMessage: "Cours créé avec succès!",
        
        sections: {
            basicInfo: "Informations de Base",
            description: "Description du Cours",
            image: "Image du Cours (Optionnel)",
            publishing: "Options de Publication"
        },
        
        fields: {
            title: "Titre du Cours",
            titlePlaceholder: "Exemple: Mathématiques pour 1ère Année Secondaire - Algèbre et Géométrie",
            category: "Catégorie",
            selectCategory: "Sélectionner une catégorie",
            branch: "Filière",
            selectBranch: "Sélectionner une filière",
            module: "Matière",
            selectModule: "Sélectionner une matière",
            descriptionPlaceholder: "Décrivez le contenu, les méthodes d'enseignement et ce que les étudiants apprendront...",
            imagePlaceholder: "Glissez et déposez une image ou cliquez pour sélectionner",
            chooseImage: "Choisir une Image",
            uploading: "Téléchargement...",
            publishImmediately: "Publier le cours immédiatement",
            publishNote: "Si sélectionné, le cours sera visible par tous. Sinon, il restera comme brouillon."
        },
        
        categories: {
            '1as': '1ère Année Secondaire (1AS)',
            '2as': '2ème Année Secondaire (2AS)',
            '3as': '3ème Année Secondaire (3AS)',
            'other': 'Autre'
        },
        
        branches: {
            '1as': {
                'common-core-science': 'Tronc Commun Sciences',
                'common-core-arts': 'Tronc Commun Lettres',
                'all': 'Toutes les Filières'
            },
            '2as': {
                'common-core-science': 'Tronc Commun Sciences',
                'common-core-arts': 'Tronc Commun Lettres',
                'technical-math': 'Mathématiques Techniques',
                'mathematics': 'Mathématiques',
                'sciences': 'Sciences Expérimentales',
                'management-economics': 'Gestion et Économie',
                'languages': 'Langues Étrangères',
                'literature-philosophy': 'Lettres et Philosophie',
                'all': 'Toutes les Filières'
            },
            '3as': {
                'common-core-science': 'Tronc Commun Sciences',
                'common-core-arts': 'Tronc Commun Lettres',
                'technical-math': 'Mathématiques Techniques',
                'mathematics': 'Mathématiques',
                'sciences': 'Sciences Expérimentales',
                'management-economics': 'Gestion et Économie',
                'languages': 'Langues Étrangères',
                'literature-philosophy': 'Lettres et Philosophie',
                'all': 'Toutes les Filières'
            },
            'other': {
                'all': 'Toutes les Filières'
            }
        },
        
        modules: {
            1: {
                math: "Mathématiques",
                science: "Sciences de la Nature et de la Vie",
                physics: "Sciences Physiques",
                arabic: "Langue Arabe",
                EG: "Histoire et Géographie",
                french: "Langue Française",
                english: "Langue Anglaise",
                islamic: "Éducation Islamique",
                techno: "Technologie",
                info: "Informatique",
                gestion: "Gestion Comptable et Financière",
            },
            2: {
                math: "Mathématiques",
                science: "Sciences de la Nature et de la Vie",
                physics: "Sciences Physiques",
                arabic: "Langue Arabe",
                philo: "Philosophie",
                EG: "Histoire et Géographie",
                french: "Langue Française",
                english: "Langue Anglaise",
                de: "Langue Allemande",
                es: "Langue Espagnole",
                it: "Langue Italienne",
                islamic: "Éducation Islamique",
                gp: "Génie des Procédés",
                ge: "Génie Électrique",
                gm: "Génie Mécanique",
                gc: "Génie Civil",
                gestion: "Gestion Comptable et Financière",
                management: "Économie et Management",
                law: "Droit",
            },
            3: {
                math: "Mathématiques",
                science: "Sciences de la Nature et de la Vie",
                physics: "Sciences Physiques",
                arabic: "Langue Arabe",
                philo: "Philosophie",
                EG: "Histoire et Géographie",
                french: "Langue Française",
                english: "Langue Anglaise",
                de: "Langue Allemande",
                es: "Langue Espagnole",
                it: "Langue Italienne",
                islamic: "Éducation Islamique",
                gp: "Génie des Procédés",
                ge: "Génie Électrique",
                gm: "Génie Mécanique",
                gc: "Génie Civil",
                gestion: "Gestion Comptable et Financière",
                management: "Économie et Management",
                law: "Droit",
            }
        },
        
        buttons: {
            create: "Créer le Cours",
            saving: "Enregistrement..."
        },
        
        validation: {
            titleRequired: "Le titre est requis",
            titleMinLength: "Le titre doit comporter au moins 3 caractères",
            titleMaxLength: "Le titre ne peut pas dépasser 100 caractères",
            descRequired: "La description est requise",
            descMinLength: "La description doit comporter au moins 10 caractères",
            descMaxLength: "La description ne peut pas dépasser 1000 caractères",
            categoryRequired: "La catégorie est requise",
            branchRequired: "La filière est requise",
            moduleRequired: "La matière est requise",
            imageInvalid: "Veuillez sélectionner une image valide",
            imageSize: "La taille de l'image ne doit pas dépasser 5 Mo",
            imageUploadError: "Erreur de téléchargement d'image",
            submitError: "Une erreur est survenue",
            connectionError: "Erreur de connexion. Veuillez réessayer."
        }
    },
    
    view: {
        title: "Vos Cours",
        subtitle: "Gérez et modifiez le contenu de vos cours",
        loading: "Chargement de vos cours...",
        accessRequired: "Accès Requis",
        loginMessage: "Veuillez vous connecter pour voir vos cours.",
        
        empty: {
            title: "Pas de Cours Encore",
            message: "Commencez par créer votre premier cours pour le voir ici.",
            stitle: "Créer une nouvelle leçon"
        },
        
        course: {
            updated: "Mis à jour récemment",
            viewDetails: "Voir les Détails du Cours",
            delete: "Supprimer le Cours",
            deleting: "Suppression..."
        },
        
        delete: {
            confirmTitle: "Supprimer le Cours",
            confirmMessage: "Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible et supprimera toutes les ressources et données associées.",
            errorTitle: "Échec de la suppression du cours",
            dismiss: "Fermer"
        }
    },
    
    resourceCreation: {
        pageTitle: "Gérer le Contenu du Cours",
        title: "Ressources du Cours",
        items: "éléments",
        addResource: "Ajouter une Ressource",
        noResources: "Pas encore de ressources",
        noResourcesDesc: "Commencez par ajouter des documents, vidéos ou quiz.",
        createFirst: "Créer la première ressource",
        order: "Ordre",
        clickManageQuiz: "Cliquez sur Gérer le Quiz pour voir les questions",
        manageQuiz: "Gérer les Questions du Quiz",
        editResource: "Modifier la Ressource",
        deleteResource: "Supprimer la Ressource",
        backToResources: "Retour aux Ressources",
        addQuestion: "Ajouter une Question",
        quizTitle: "Quiz",
        loadingQuestions: "Chargement des questions...",
        noQuestions: "Aucune question ajoutée.",
        correct: "Correct",
        
        modal: {
            addResource: "Ajouter une Ressource",
            editResource: "Modifier la Ressource",
            addQuestion: "Ajouter une Question",
            editQuestion: "Modifier la Question",
            title: "Titre",
            description: "Description",
            type: "Type",
            order: "Ordre",
            cancel: "Annuler",
            saveResource: "Enregistrer la Ressource",
            saveQuestion: "Enregistrer la Question",
            question: "Question",
            answers: "Réponses",
            optionPlaceholder: "Option",
            correctAnswer: "Réponse Correcte",
            selectCorrect: "Sélectionner la bonne réponse",
            uploading: "Téléchargement..."
        },
        
        types: {
            document: "Document",
            video: "Vidéo",
            quiz: "Quiz",
            image: "Image",
            link: "Lien"
        },
        
        upload: {
            uploadDocument: "Télécharger un Document (PDF, DOC, PPT, etc.)",
            uploadVideo: "Télécharger une Vidéo",
            uploadImage: "Télécharger une Image",
            linkUrl: "URL du Lien",
            quizInstructions: "Instructions du Quiz",
            dragDrop: "Glissez-déposez ou cliquez pour télécharger",
            chooseFile: "Choisir un Fichier",
            removeFile: "Supprimer le Fichier",
            documentUploaded: "Document Téléchargé",
            videoFormats: "MP4, WebM, MOV jusqu'à 100 Mo",
            imageFormats: "JPG, PNG, GIF, WebP jusqu'à 10 Mo",
            documentFormats: "PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX",
            quizPlaceholder: "Entrez les instructions du quiz",
            linkPlaceholder: "https://..."
        },
        
        confirmDelete: "Êtes-vous sûr ?"
    }
}

export { CoursesAR, CoursesEN, CoursesFR }