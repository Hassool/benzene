export const ReviewEN = {
  header: {
    title: "Architecture Review",
    description: "A technical deep dive into the stack, APIs, and design system powering this open source educational platform.",
    github: "View on GitHub",
    projectDescription: "Benzene is an open-source educational platform designed to make learning chemistry interactive and accessible."
  },
  sections: {
    stack: "Tech Stack & Dependencies",
    backend: "Backend API",
    ui: "UI Design System",
    otherLibs: "Other Important Libraries",
    apiFlow: "API Interaction Flow",
    colors: "Color Palette",
    typography: "Typography",
    interactive: "Interactive Elements"
  },
  headings: {
    orbitron: "Headings (Orbitron / Montserrat)",
    body: "Body (Inter)",
    code: "Code (JetBrains Mono)"
  },
  interactive: {
    primary: "Primary Action",
    secondary: "Secondary Action",
    inputPlaceholder: "Input field example..."
  },
  api: {
    input: "Input",
    output: "Output",
    balanceDesc: "Balances a chemical equation using a Gaussian elimination matrix solver (Ax=0). Supports complex molecules with parentheses.",
    registerDesc: "Registers a new user in the database. Hashes password using bcrypt.",
    courseDesc: "Fetches full course details, including attached resources and student progress (if authenticated)."
  },
  dependencies: {
    l18n: {
      name: "l_i18n (My Creation)",
      desc: "A lightweight, dependency-free translation engine for React & Next.js that I built specifically for this project. Features instant language switching, automatic RTL support, type safety, and a tiny ~5KB footprint for optimal performance."
    },
    react: {
      name: "React 19",
      desc: "The library for web and native user interfaces. Used for building the component-based UI."
    },
    next: {
      name: "Next.js 15",
      desc: "The React Framework for the Web. Handles routing, SSR, and API routes."
    },
    tailwind: {
      name: "Tailwind CSS",
      desc: "A utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup."
    },
    mongo: {
      name: "MongoDB / Mongoose",
      desc: "NoSQL database and elegant mongodb object modeling for node.js."
    },
    auth: {
      name: "NextAuth.js",
      desc: "Authentication solution for Next.js applications."
    },
    math: {
      name: "Math.js",
      desc: "An extensive math library for JavaScript and Node.js. Used for the unit converter and balancing logic."
    },
    framer: {
      name: "Framer Motion",
      desc: "A production-ready motion library for React."
    },
    cloudinary: {
      name: "Cloudinary",
      desc: "Image and video management in the cloud."
    }
  },
  colors: {
    bg: "Background",
    bgSec: "Background Secondary",
    bgDark: "Dark BG",
    bgDarkSec: "Dark Secondary",
    textPrim: "Text Primary",
    textSec: "Text Secondary",
    textDark: "Text Dark",
    textDarkSec: "Text Dark Sec",
    blue: "Blue 500",
    cyan: "Cyan 400",
    special: "Special",
    red: "Red 500"
  },
  secondaryDeps: {
    cheerio: "cheerio (HTML parsing)",
    bcrypt: "bcryptjs (Password hashing)",
    lucide: "lucide-react (Icons)",
    toast: "react-hot-toast (Notifications)",
    pdf: "react-pdf (PDF Rendering)"
  }
};

export const ReviewAR = {
  header: {
    title: "مراجعة الهيكلية",
    description: "نظرة تقنية متعمقة في الحزمة البرمجية، واجهات برمجة التطبيقات، ونظام التصميم الذي يشغّل هذه المنصة التعليمية مفتوحة المصدر.",
    github: "عرض على GitHub",
    projectDescription: "بنزن هي منصة تعليمية مفتوحة المصدر مصممة لجعل تعلم الكيمياء تفاعليًا ومتاحًا للجميع."
  },
  sections: {
    stack: "الحزمة التقنية والاعتمادات",
    backend: "واجهة برمجة التطبيقات (Backend API)",
    ui: "نظام تصميم واجهة المستخدم",
    otherLibs: "مكتبات مهمة أخرى",
    apiFlow: "تتدفق تفاعل API",
    colors: "لوحة الألوان",
    typography: "الخطوط",
    interactive: "العناصر التفاعلية"
  },
  headings: {
    orbitron: "العناوين (Orbitron / Montserrat)",
    body: "النص الأساسي (Inter)",
    code: "البرمجية (JetBrains Mono)"
  },
  interactive: {
    primary: "إجراء أساسي",
    secondary: "إجراء ثانوي",
    inputPlaceholder: "مثال حقل إدخال..."
  },
  api: {
    input: "المدخلات",
    output: "المخرجات",
    balanceDesc: "يقوم بموازنة المعادلة الكيميائية باستخدام حل المصفوفات (Gaussian elimination). يدعم الجزيئات المعقدة والأقواس.",
    registerDesc: "يسجل مستخدماً جديداً في قاعدة البيانات. يقوم بتشفير كلمة المرور باستخدام bcrypt.",
    courseDesc: "يجلب تفاصيل الدورة الكاملة، بما في ذلك الموارد المرفقة وتقدم الطالب (إذا كان مسجلاً)."
  },
  dependencies: {
    l18n: {
      name: "l_i18n (من إنشائي)",
      desc: "محرك ترجمة خفيف الوزن وخالي من الاعتمادات لـ React و Next.js قمت ببنائه خصيصاً لهذا المشروع. يتميز بالتبديل الفوري للغة، دعم تلقائي للغات RTL، أمان النوع، وحجم صغير جداً (~5KB) لأداء مثالي."
    },
    react: {
      name: "React 19",
      desc: "المكتبة لواجهات المستخدم للويب والأجهزة المحمولة. تستخدم لبناء واجهة المستخدم القائمة على المكونات."
    },
    next: {
      name: "Next.js 15",
      desc: "إطار عمل React للويب. يعالج التوجيه، العرض من الخادم (SSR)، ومسارات API."
    },
    tailwind: {
      name: "Tailwind CSS",
      desc: "إطار عمل CSS يعتمد على الأدوات المساعدة ومليء بالفئات التي يمكن تركيبها لبناء أي تصميم مباشرة في التعليمات البرمجية."
    },
    mongo: {
      name: "MongoDB / Mongoose",
      desc: "قاعدة بيانات NoSQL ونمذجة كائنات mongodb أنيقة لـ node.js."
    },
    auth: {
      name: "NextAuth.js",
      desc: "حل المصادقة لتطبيقات Next.js."
    },
    math: {
      name: "Math.js",
      desc: "مكتبة رياضيات شاملة لـ JavaScript و Node.js. تستخدم لمحولات الوحدات ومنطق الموازنة."
    },
    framer: {
      name: "Framer Motion",
      desc: "مكتبة حركة جاهزة للإنتاج لـ React."
    },
    cloudinary: {
      name: "Cloudinary",
      desc: "إدارة الصور والفيديو في السحابة."
    }
  },
  colors: {
    bg: "الخلفية",
    bgSec: "الخلفية الثانوية",
    bgDark: "خلفية داكنة",
    bgDarkSec: "خلفية داكنة ثانوية",
    textPrim: "النص الأساسي",
    textSec: "النص الثانوي",
    textDark: "النص الداكن",
    textDarkSec: "النص الداكن الثانوي",
    blue: "أزرق 500",
    cyan: "سماوي 400",
    special: "مميّز",
    red: "أحمر 500"
  },
  secondaryDeps: {
    cheerio: "cheerio (تحليل HTML)",
    bcrypt: "bcryptjs (تشفير كلمات المرور)",
    lucide: "lucide-react (أيقونات)",
    toast: "react-hot-toast (إشعارات)",
    pdf: "react-pdf (عرض PDF)"
  }
};

export const ReviewFR = {
  header: {
    title: "Revue d'Architecture",
    description: "Une analyse technique approfondie de la stack, des API et du système de conception qui propulsent cette plateforme éducative open source.",
    github: "Voir sur GitHub",
    projectDescription: "Benzene est une plateforme éducative open source conçue pour rendre l'apprentissage de la chimie interactif et accessible."
  },
  sections: {
    stack: "Stack Technique & Dépendances",
    backend: "API Backend",
    ui: "Système de Design UI",
    otherLibs: "Autres Bibliothèques Importantes",
    apiFlow: "Flux d'Interaction API",
    colors: "Palette de Couleurs",
    typography: "Typographie",
    interactive: "Éléments Interactifs"
  },
  headings: {
    orbitron: "Titres (Orbitron / Montserrat)",
    body: "Corps (Inter)",
    code: "Code (JetBrains Mono)"
  },
  interactive: {
    primary: "Action Primaire",
    secondary: "Action Secondaire",
    inputPlaceholder: "Exemple de champ de saisie..."
  },
  api: {
    input: "Entrée",
    output: "Sortie",
    balanceDesc: "Équilibre une équation chimique en utilisant un solveur matriciel (élimination de Gauss) Ax=0. Supporte les molécules complexes avec parenthèses.",
    registerDesc: "Enregistre un nouvel utilisateur dans la base de données. Hache le mot de passe avec bcrypt.",
    courseDesc: "Récupère les détails complets du cours, y compris les ressources jointes et la progression de l'étudiant (si authentifié)."
  },
  dependencies: {
    l18n: {
      name: "l_i18n (Ma Création)",
      desc: "Un moteur de traduction léger et sans dépendance pour React & Next.js que j'ai construit spécifiquement pour ce projet. Comprend le changement instantané de langue, le support RTL automatique, le typage sécurisé et une empreinte minuscule de ~5KB."
    },
    react: {
      name: "React 19",
      desc: "La bibliothèque pour les interfaces utilisateur web et natives. Utilisée pour construire l'UI basée sur les composants."
    },
    next: {
      name: "Next.js 15",
      desc: "Le framework React pour le Web. Gère le routage, le SSR et les routes API."
    },
    tailwind: {
      name: "Tailwind CSS",
      desc: "Un framework CSS utilitaire rempli de classes qui peuvent être composées pour construire n'importe quel design directement dans votre balisage."
    },
    mongo: {
      name: "MongoDB / Mongoose",
      desc: "Base de données NoSQL et modélisation élégante d'objets mongodb pour node.js."
    },
    auth: {
      name: "NextAuth.js",
      desc: "Solution d'authentification pour les applications Next.js."
    },
    math: {
      name: "Math.js",
      desc: "Une vaste bibliothèque mathématique pour JavaScript et Node.js. Utilisée pour le convertisseur d'unités et la logique d'équilibrage."
    },
    framer: {
      name: "Framer Motion",
      desc: "Une bibliothèque d'animation prête pour la production pour React."
    },
    cloudinary: {
      name: "Cloudinary",
      desc: "Gestion d'images et de vidéos dans le cloud."
    }
  },
  colors: {
    bg: "Arrière-plan",
    bgSec: "Arrière-plan Secondaire",
    bgDark: "Fond Sombre",
    bgDarkSec: "Fond Sombre Secondaire",
    textPrim: "Texte Primaire",
    textSec: "Texte Secondaire",
    textDark: "Texte Sombre",
    textDarkSec: "Texte Sombre Secondaires",
    blue: "Bleu 500",
    cyan: "Cyan 400",
    special: "Spécial",
    red: "Rouge 500"
  },
  secondaryDeps: {
    cheerio: "cheerio (Analyse HTML)",
    bcrypt: "bcryptjs (Hachage de mot de passe)",
    lucide: "lucide-react (Icônes)",
    toast: "react-hot-toast (Notifications)",
    pdf: "react-pdf (Rendu PDF)"
  }
};
