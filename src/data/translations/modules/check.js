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
    delete: "Are you sure you want to delete this user? This action cannot be undone."
  },
  errors: {
    loadFailed: "Failed to load users",
    activateFailed: "Failed to activate user",
    deactivateFailed: "Failed to deactivate user",
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
    delete: "هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء."
  },
  errors: {
    loadFailed: "فشل تحميل المستخدمين",
    activateFailed: "فشل تفعيل المستخدم",
    deactivateFailed: "فشل إلغاء تفعيل المستخدم",
    deleteFailed: "فشل حذف المستخدم",
    tryAgain: "يرجى المحاولة مرة أخرى."
  }
}

export { CheckAR, CheckEN }