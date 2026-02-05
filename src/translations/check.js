const CheckEN = {
  header: {
    title: "User Management",
    subtitle: "Review and manage user registration requests"
  },
  filters: {
    pending: "Pending",
    active: "Active",
    all: "All Users"
  },
  actions: {
    refresh: "Refresh",
    activate: "Activate",
    deactivate: "Deactivate",
    makeAdmin: "Make Admin",
    removeAdmin: "Remove Admin",
    delete: "Delete"
  },
  status: {
    active: "Active",
    pending: "Pending"
  },
  info: {
    joined: "Joined:",
    lastLogin: "Last login:"
  },
  loading: {
    main: "Loading...",
    users: "Loading users..."
  },
  empty: {
    noUsers: "No users found",
    noFilteredUsers: "users found",
    allProcessed: "All user requests have been processed.",
    noMatch: "No users match the current filter."
  },
  confirm: {
    deactivate: "Are you sure you want to deactivate this user? They will not be able to log in.",
    makeAdmin: "Are you sure you want to grant Admin privileges to this user?",
    removeAdmin: "Are you sure you want to remove Admin privileges from this user?",
    delete: "Are you sure you want to delete this user? This action cannot be undone."
  },
  errors: {
    loadFailed: "Failed to load users",
    activateFailed: "Failed to activate user",
    deactivateFailed: "Failed to deactivate user",
    roleUpdateFailed: "Failed to update user role",
    deleteFailed: "Failed to delete user",
    tryAgain: "Please try again."
  }
}

const CheckAR = {
  header: {
    title: "إدارة المستخدمين",
    subtitle: "مراجعة وإدارة طلبات تسجيل المستخدمين"
  },
  filters: {
    pending: "قيد الانتظار",
    active: "نشط",
    all: "جميع المستخدمين"
  },
  actions: {
    refresh: "تحديث",
    activate: "تفعيل",
    deactivate: "إلغاء التفعيل",
    makeAdmin: "تعيين كمشرف",
    removeAdmin: "إزالة الإشراف",
    delete: "حذف"
  },
  status: {
    active: "نشط",
    pending: "قيد الانتظار"
  },
  info: {
    joined: "انضم:",
    lastLogin: "آخر تسجيل دخول:"
  },
  loading: {
    main: "جاري التحميل...",
    users: "جاري تحميل المستخدمين..."
  },
  empty: {
    noUsers: "لا يوجد مستخدمون",
    noFilteredUsers: "مستخدم",
    allProcessed: "تمت معالجة جميع طلبات المستخدمين.",
    noMatch: "لا يوجد مستخدمون يطابقون الفلتر الحالي."
  },
  confirm: {
    deactivate: "هل أنت متأكد من إلغاء تفعيل هذا المستخدم؟ لن يتمكن من تسجيل الدخول.",
    makeAdmin: "هل أنت متأكد من منح صلاحيات المشرف لهذا المستخدم؟",
    removeAdmin: "هل أنت متأكد من إزالة صلاحيات المشرف من هذا المستخدم؟",
    delete: "هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء."
  },
  errors: {
    loadFailed: "فشل تحميل المستخدمين",
    activateFailed: "فشل تفعيل المستخدم",
    deactivateFailed: "فشل إلغاء تفعيل المستخدم",
    roleUpdateFailed: "فشل تحديث دور المستخدم",
    deleteFailed: "فشل حذف المستخدم",
    tryAgain: "يرجى المحاولة مرة أخرى."
  }
}

const CheckFR = {
  header: {
    title: "Gestion des Utilisateurs",
    subtitle: "Examiner et gérer les demandes d'inscription des utilisateurs"
  },
  filters: {
    pending: "En Attente",
    active: "Actif",
    all: "Tous les Utilisateurs"
  },
  actions: {
    refresh: "Actualiser",
    activate: "Activer",
    deactivate: "Désactiver",
    makeAdmin: "Nommer Admin",
    removeAdmin: "Retirer Admin",
    delete: "Supprimer"
  },
  status: {
    active: "Actif",
    pending: "En Attente"
  },
  info: {
    joined: "Rejoint le :",
    lastLogin: "Dernière connexion :"
  },
  loading: {
    main: "Chargement...",
    users: "Chargement des utilisateurs..."
  },
  empty: {
    noUsers: "Aucun utilisateur trouvé",
    noFilteredUsers: "utilisateurs trouvés",
    allProcessed: "Toutes les demandes d'utilisateurs ont été traitées.",
    noMatch: "Aucun utilisateur ne correspond au filtre actuel."
  },
  confirm: {
    deactivate: "Êtes-vous sûr de vouloir désactiver cet utilisateur ? Il ne pourra plus se connecter.",
    makeAdmin: "Êtes-vous sûr de vouloir accorder les privilèges d'administrateur à cet utilisateur ?",
    removeAdmin: "Êtes-vous sûr de vouloir retirer les privilèges d'administrateur de cet utilisateur ?",
    delete: "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
  },
  errors: {
    loadFailed: "Échec du chargement des utilisateurs",
    activateFailed: "Échec de l'activation de l'utilisateur",
    deactivateFailed: "Échec de la désactivation de l'utilisateur",
    roleUpdateFailed: "Échec de la mise à jour du rôle utilisateur",
    deleteFailed: "Échec de la suppression de l'utilisateur",
    tryAgain: "Veuillez réessayer."
  }
}

export { CheckAR, CheckEN, CheckFR }