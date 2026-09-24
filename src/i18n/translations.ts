import type { Language } from '@/types/database';

export const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: 'FR' },
  { code: 'ar', label: 'العربية', flag: 'AR' },
  { code: 'en', label: 'English', flag: 'EN' },
];

type TranslationKey =
  | 'appName'
  | 'appTagline'
  | 'signIn'
  | 'signUp'
  | 'signOut'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'firstName'
  | 'lastName'
  | 'role'
  | 'teacher'
  | 'director'
  | 'welcome'
  | 'welcomeBack'
  | 'noAccount'
  | 'haveAccount'
  | 'createAccount'
  | 'signInToContinue'
  | 'dashboard'
  | 'myClass'
  | 'students'
  | 'attendance'
  | 'levels'
  | 'classes'
  | 'teachers'
  | 'reports'
  | 'settings'
  | 'addStudent'
  | 'importExcel'
  | 'exportExcel'
  | 'studentName'
  | 'studentNumber'
  | 'actions'
  | 'edit'
  | 'delete'
  | 'save'
  | 'cancel'
  | 'confirm'
  | 'confirmDelete'
  | 'search'
  | 'present'
  | 'absent'
  | 'late'
  | 'presentShort'
  | 'absentShort'
  | 'lateShort'
  | 'markAllPresent'
  | 'saveAttendance'
  | 'attendanceSaved'
  | 'selectDate'
  | 'today'
  | 'noStudents'
  | 'noClasses'
  | 'noLevels'
  | 'noTeachers'
  | 'addClass'
  | 'addLevel'
  | 'assignTeacher'
  | 'levelName'
  | 'className'
  | 'teacherName'
  | 'unassigned'
  | 'viewAttendance'
  | 'viewStudents'
  | 'selectClass'
  | 'selectLevel'
  | 'totalStudents'
  | 'presentToday'
  | 'absentToday'
  | 'lateToday'
  | 'attendanceRate'
  | 'week'
  | 'day'
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'weekend'
  | 'schoolDay'
  | 'noAttendanceRecorded'
  | 'loadingData'
  | 'errorOccurred'
  | 'saving'
  | 'loading'
  | 'profile'
  | 'language'
  | 'myProfile'
  | 'firstNameAr'
  | 'firstNameFr'
  | 'firstNameEn'
  | 'lastNameAr'
  | 'lastNameFr'
  | 'lastNameEn'
  | 'nameAr'
  | 'nameFr'
  | 'nameEn'
  | 'sortOrder'
  | 'allClasses'
  | 'allLevels'
  | 'allTeachers'
  | 'back'
  | 'next'
  | 'previous'
  | 'overview'
  | 'manageLevels'
  | 'manageClasses'
  | 'manageTeachers'
  | 'allAttendance'
  | 'noClassAssigned'
  | 'youAreAssignedTo'
  | 'studentCount'
  | 'recordsSaved'
  | 'invalidEmail'
  | 'passwordTooShort'
  | 'passwordsDoNotMatch'
  | 'fillAllFields'
  | 'selectRole'
  | 'invalidCredentials'
  | 'emailExists'
  | 'importSuccess'
  | 'importError'
  | 'importInstructions'
  | 'downloadTemplate'
  | 'dragDropFile'
  | 'orClickToBrowse'
  | 'fileSelected'
  | 'processFile'
  | 'studentsImported'
  | 'startDate'
  | 'endDate'
  | 'filterByDate'
  | 'filterByClass'
  | 'filterByLevel'
  | 'attendanceReport'
  | 'exportReport'
  | 'noDataForRange'
  | 'totalDays'
  | 'totalPresent'
  | 'totalAbsent'
  | 'totalLate'
  | 'rate'
  | 'student'
  | 'class'
  | 'level'
  | 'date'
  | 'status'
  | 'note'
  | 'addNote'
  | 'noNote'
  | 'statistics'
  | 'monthlyOverview'
  | 'dailyBreakdown'
  | 'selectMonth'
  | 'january'
  | 'february'
  | 'march'
  | 'april'
  | 'may'
  | 'june'
  | 'july'
  | 'august'
  | 'september'
  | 'october'
  | 'november'
  | 'december'
  | 'alreadyHasAccount'
  | 'firstNameRequired'
  | 'lastNameRequired'
  | 'directorCanManageAll'
  | 'teacherManagesOwnClass'
  | 'home'
  | 'quickActions'
  | 'recentActivity'
  | 'schoolOverview'
  | 'totalClasses'
  | 'totalLevels'
  | 'totalTeachers'
  | 'unassignedClasses'
  | 'assignedClasses'
  | 'confirmLogout'
  | 'yes'
  | 'no'
  | 'close'
  | 'add'
  | 'remove'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'saveChanges'
  | 'changesSaved'
  | 'noChanges'
  | 'editProfile'
  | 'updateProfile'
  | 'profileUpdated'
  | 'required'
  | 'optional'
  | 'duplicateStudent'
  | 'existingStudents'
  | 'newStudents'
  | 'skipDuplicates'
  | 'overwriteDuplicates'
  | 'importMode'
  | 'previewImport'
  | 'confirmImport'
  | 'cancelImport'
  | 'importing'
  | 'importComplete'
  | 'importedCount'
  | 'skippedCount'
  | 'errorCount'
  | 'resultImport'
  | 'excelTemplate'
  | 'templateDownloaded'
  | 'selectExcelFile'
  | 'onlyExcelFiles'
  | 'maxFileSize'
  | 'fileTooLarge'
  | 'invalidFileFormat'
  | 'processingFile'
  | 'noValidRows'
  | 'columnMapping'
  | 'mapColumns'
  | 'firstNameCol'
  | 'lastNameCol'
  | 'numberCol'
  | 'autoDetected'
  | 'reviewData'
  | 'importPreview'
  | 'rowsFound'
  | 'proceed'
  | 'retry'
  | 'goHome'
  | 'accessDenied'
  | 'noPermission'
  | 'pageNotFound'
  | 'serverError'
  | 'connectionError'
  | 'tryAgain'
  | 'refreshPage'
  | 'checkingAuth'
  | 'redirecting'
  | 'initializing'
  | 'readyToUse'
  | 'getStarted'
  | 'learnMore'
  | 'help'
  | 'support'
  | 'about'
  | 'version'
  | 'allRightsReserved'
  | 'termsOfService'
  | 'privacyPolicy'
  | 'contactUs'
  | 'feedback'
  | 'reportIssue'
  | 'theme'
  | 'dark'
  | 'light'
  | 'system'
  | 'notifications'
  | 'noNotifications'
  | 'markAllRead'
  | 'viewAll'
  | 'settingsGeneral'
  | 'settingsLanguage'
  | 'settingsTheme'
  | 'settingsProfile'
  | 'settingsAccount'
  | 'settingsSecurity'
  | 'deleteAccount'
  | 'changePassword'
  | 'forgotPassword'
  | 'resetPassword'
  | 'resetPasswordSent'
  | 'resetPasswordInstructions'
  | 'enterEmail'
  | 'sendResetLink'
  | 'backToLogin'
  | 'noTeacherAssigned'
  | 'assignToClass'
  | 'teacherAssigned'
  | 'teacherUnassigned'
  | 'classAssigned'
  | 'classUnassigned'
  | 'levelCreated'
  | 'levelUpdated'
  | 'levelDeleted'
  | 'classCreated'
  | 'classUpdated'
  | 'classDeleted'
  | 'studentCreated'
  | 'studentUpdated'
  | 'studentDeleted'
  | 'teacherCreated'
  | 'teacherUpdated'
  | 'teacherDeleted'
  | 'cannotDeleteLevel'
  | 'cannotDeleteClass'
  | 'hasClasses'
  | 'hasStudents'
  | 'confirmDeleteLevel'
  | 'confirmDeleteClass'
  | 'confirmDeleteStudent'
  | 'confirmDeleteTeacher'
  | 'levelInUse'
  | 'classInUse'
  | 'manageTeachersDesc'
  | 'addTeacher'
  | 'editTeacher'
  | 'teacherEmail'
  | 'teacherRole'
  | 'assignClass'
  | 'unassignClass'
  | 'currentlyAssigned'
  | 'notAssigned'
  | 'teachersList'
  | 'classesList'
  | 'levelsList'
  | 'studentsList'
  | 'attendanceList'
  | 'reportsList'
  | 'dailyAttendance'
  | 'monthlyReport'
  | 'customReport'
  | 'printReport'
  | 'exportPdf'
  | 'exportCsv'
  | 'exportData'
  | 'print'
  | 'filters'
  | 'clearFilters'
  | 'applyFilters'
  | 'showing'
  | 'of'
  | 'results'
  | 'noResults'
  | 'page'
  | 'prevPage'
  | 'nextPage'
  | 'rowsPerPage'
  | 'sortBy'
  | 'sortDirection'
  | 'ascending'
  | 'descending'
  | 'searchPlaceholder'
  | 'noSearchResults'
  | 'searchResults'
  | 'allStatuses'
  | 'allDates'
  | 'dateRange'
  | 'singleDate'
  | 'allClassesAttendance'
  | 'classAttendance'
  | 'studentAttendance'
  | 'attendanceFor'
  | 'attendanceHistory'
  | 'attendanceDetails'
  | 'attendanceTrends'
  | 'attendanceByDay'
  | 'attendanceByStatus'
  | 'presentRate'
  | 'absentRate'
  | 'lateRate'
  | 'bestAttendance'
  | 'worstAttendance'
  | 'mostAbsent'
  | 'mostLate'
  | 'perfectAttendance'
  | 'neverLate'
  | 'neverAbsent'
  | 'daysPresent'
  | 'daysAbsent'
  | 'daysLate'
  | 'totalRecords'
  | 'schoolYear'
  | 'semester'
  | 'quarter'
  | 'term'
  | 'firstSemester'
  | 'secondSemester'
  | 'firstQuarter'
  | 'secondQuarter'
  | 'thirdQuarter'
  | 'fourthQuarter'
  | 'allTime'
  | 'thisWeek'
  | 'thisMonth'
  | 'thisYear'
  | 'lastWeek'
  | 'lastMonth'
  | 'lastYear'
  | 'customRange'
  | 'from'
  | 'to'
  | 'apply'
  | 'reset'
  | 'clear'
  | 'export'
  | 'printView'
  | 'fullScreen'
  | 'exitFullScreen'
  | 'zoomIn'
  | 'zoomOut'
  | 'rotate'
  | 'flip'
  | 'crop'
  | 'filter'
  | 'adjust'
  | 'enhance'
  | 'restore'
  | 'undo'
  | 'redo'
  | 'resetAll'
  | 'applyChanges'
  | 'discardChanges'
  | 'saveAsTemplate'
  | 'loadTemplate'
  | 'manageTemplates'
  | 'templateName'
  | 'templateDescription'
  | 'createTemplate'
  | 'editTemplate'
  | 'deleteTemplate'
  | 'useTemplate'
  | 'templateCreated'
  | 'templateUpdated'
  | 'templateDeleted'
  | 'noTemplates'
  | 'templatesList'
  | 'selectTemplate'
  | 'templateSelected'
  | 'templateApplied'
  | 'applyTemplate'
  | 'previewTemplate'
  | 'templatePreview'
  | 'subject'
  | 'subjectArabic'
  | 'subjectFrench'
  | 'subjectEnglish'
  | 'subjectSport'
  | 'selectSubject'
  | 'teacherSubject'
  | 'createTeacherAccount'
  | 'directorCreatesTeachers'
  | 'onlyDirectorCanCreate'
  | 'temporaryPassword'
  | 'teacherAccountCreated'
  | 'enterTeacherDetails'
  | 'noSubject'
  | 'assignedTeachers'
  | 'addTeacherToClass'
  | 'removeTeacherFromClass'
  | 'noTeachersAssigned'
  | 'selectClassToView'
  | 'myClasses'
  | 'subjectLevelRestriction'
  | 'arabicLevelRange'
  | 'frenchLevelRange'
  | 'englishLevelRange'
  | 'sportLevelRange'
  | 'teacherAlreadyAssigned'
  | 'subjectAlreadyAssigned'
  | 'arabicMaxOneClass'
  | 'levelNotAllowed'
  | 'assignTeachers'
  | 'manageAssignments'
  | 'firstUse'
  | 'createDirectorAccount'
  | 'createDirectorDescription'
  | 'passwordMinimum'
  | 'accountCreated'
  | 'administratorAlreadyExists'
  | 'setupError'
  | 'creatingAccount'
  | 'createAdministrator';

type TranslationDict = Record<TranslationKey, string>;

export const translations: Record<Language, TranslationDict> = {
  fr: {
    appName: 'Gestion de Présence',
    appTagline: 'Système de gestion de présence des élèves',
    signIn: 'Se connecter',
    signUp: "S'inscrire",
    signOut: 'Se déconnecter',
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    firstName: 'Prénom',
    lastName: 'Nom',
    role: 'Rôle',
    teacher: 'Enseignant',
    director: 'Directeur',
    welcome: 'Bienvenue',
    welcomeBack: 'Bon retour',
    noAccount: "Pas de compte?",
    haveAccount: 'Vous avez un compte?',
    createAccount: 'Créer un compte',
    signInToContinue: 'Connectez-vous pour continuer',
    dashboard: 'Tableau de bord',
    myClass: 'Ma classe',
    students: 'Élèves',
    attendance: 'Présence',
    levels: 'Niveaux',
    classes: 'Classes',
    teachers: 'Enseignants',
    reports: 'Rapports',
    settings: 'Paramètres',
    addStudent: 'Ajouter un élève',
    importExcel: 'Importer Excel',
    exportExcel: 'Exporter Excel',
    studentName: "Nom de l'élève",
    studentNumber: "Numéro d'élève",
    actions: 'Actions',
    edit: 'Modifier',
    delete: 'Supprimer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    confirmDelete: 'Confirmer la suppression?',
    search: 'Rechercher',
    present: 'Présent',
    absent: 'Absent',
    late: 'Retard',
    presentShort: 'P',
    absentShort: 'A',
    lateShort: 'R',
    markAllPresent: 'Marquer tous présents',
    saveAttendance: "Enregistrer la présence",
    attendanceSaved: 'Présence enregistrée',
    selectDate: 'Sélectionner une date',
    today: "Aujourd'hui",
    noStudents: 'Aucun élève',
    noClasses: 'Aucune classe',
    noLevels: 'Aucun niveau',
    noTeachers: 'Aucun enseignant',
    addClass: 'Ajouter une classe',
    addLevel: 'Ajouter un niveau',
    assignTeacher: 'Assigner un enseignant',
    levelName: 'Nom du niveau',
    className: 'Nom de la classe',
    teacherName: "Nom de l'enseignant",
    unassigned: 'Non assigné',
    viewAttendance: 'Voir la présence',
    viewStudents: 'Voir les élèves',
    selectClass: 'Sélectionner une classe',
    selectLevel: 'Sélectionner un niveau',
    totalStudents: 'Total élèves',
    presentToday: 'Présents aujourd\'hui',
    absentToday: 'Absents aujourd\'hui',
    lateToday: 'Retards aujourd\'hui',
    attendanceRate: 'Taux de présence',
    week: 'Semaine',
    day: 'Jour',
    sunday: 'Dimanche',
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    weekend: 'Weekend',
    schoolDay: 'Jour d\'école',
    noAttendanceRecorded: 'Aucune présence enregistrée',
    loadingData: 'Chargement des données...',
    errorOccurred: 'Une erreur est survenue',
    saving: 'Enregistrement...',
    loading: 'Chargement...',
    profile: 'Profil',
    language: 'Langue',
    myProfile: 'Mon profil',
    firstNameAr: 'Prénom (Arabe)',
    firstNameFr: 'Prénom (Français)',
    firstNameEn: 'Prénom (Anglais)',
    lastNameAr: 'Nom (Arabe)',
    lastNameFr: 'Nom (Français)',
    lastNameEn: 'Nom (Anglais)',
    nameAr: 'Nom (Arabe)',
    nameFr: 'Nom (Français)',
    nameEn: 'Nom (Anglais)',
    sortOrder: 'Ordre de tri',
    allClasses: 'Toutes les classes',
    allLevels: 'Tous les niveaux',
    allTeachers: 'Tous les enseignants',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    overview: 'Vue d\'ensemble',
    manageLevels: 'Gérer les niveaux',
    manageClasses: 'Gérer les classes',
    manageTeachers: 'Gérer les enseignants',
    allAttendance: 'Toute la présence',
    noClassAssigned: 'Aucune classe assignée',
    youAreAssignedTo: 'Vous êtes assigné à',
    studentCount: 'Nombre d\'élèves',
    recordsSaved: 'enregistrements sauvegardés',
    invalidEmail: 'Email invalide',
    passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
    passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
    fillAllFields: 'Veuillez remplir tous les champs',
    selectRole: 'Sélectionner un rôle',
    invalidCredentials: 'Email ou mot de passe incorrect',
    emailExists: 'Cet email est déjà utilisé',
    importSuccess: 'Importation réussie',
    importError: "Erreur d'importation",
    importInstructions: 'Instructions d\'importation',
    downloadTemplate: 'Télécharger le modèle',
    dragDropFile: 'Glissez-déposez un fichier Excel',
    orClickToBrowse: 'ou cliquez pour parcourir',
    fileSelected: 'Fichier sélectionné',
    processFile: 'Traiter le fichier',
    studentsImported: 'élèves importés',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    filterByDate: 'Filtrer par date',
    filterByClass: 'Filtrer par classe',
    filterByLevel: 'Filtrer par niveau',
    attendanceReport: 'Rapport de présence',
    exportReport: 'Exporter le rapport',
    noDataForRange: 'Aucune donnée pour cette période',
    totalDays: 'Total jours',
    totalPresent: 'Total présents',
    totalAbsent: 'Total absents',
    totalLate: 'Total retards',
    rate: 'Taux',
    student: 'Élève',
    class: 'Classe',
    level: 'Niveau',
    date: 'Date',
    status: 'Statut',
    note: 'Note',
    addNote: 'Ajouter une note',
    noNote: 'Aucune note',
    statistics: 'Statistiques',
    monthlyOverview: 'Vue mensuelle',
    dailyBreakdown: 'Répartition journalière',
    selectMonth: 'Sélectionner un mois',
    january: 'Janvier', february: 'Février', march: 'Mars', april: 'Avril',
    may: 'Mai', june: 'Juin', july: 'Juillet', august: 'Août',
    september: 'Septembre', october: 'Octobre', november: 'Novembre', december: 'Décembre',
    alreadyHasAccount: 'Vous avez déjà un compte?',
    firstNameRequired: 'Prénom requis',
    lastNameRequired: 'Nom requis',
    directorCanManageAll: 'Le directeur peut tout gérer',
    teacherManagesOwnClass: 'L\'enseignant gère sa classe',
    home: 'Accueil',
    quickActions: 'Actions rapides',
    recentActivity: 'Activité récente',
    schoolOverview: 'Vue d\'ensemble de l\'école',
    totalClasses: 'Total classes',
    totalLevels: 'Total niveaux',
    totalTeachers: 'Total enseignants',
    unassignedClasses: 'Classes non assignées',
    assignedClasses: 'Classes assignées',
    confirmLogout: 'Voulez-vous vraiment vous déconnecter?',
    yes: 'Oui',
    no: 'Non',
    close: 'Fermer',
    add: 'Ajouter',
    remove: 'Retirer',
    success: 'Succès',
    error: 'Erreur',
    warning: 'Avertissement',
    info: 'Information',
    saveChanges: 'Enregistrer les modifications',
    changesSaved: 'Modifications enregistrées',
    noChanges: 'Aucune modification',
    editProfile: 'Modifier le profil',
    updateProfile: 'Mettre à jour le profil',
    profileUpdated: 'Profil mis à jour',
    required: 'Requis',
    optional: 'Optionnel',
    duplicateStudent: 'Élève en double',
    existingStudents: 'Élèves existants',
    newStudents: 'Nouveaux élèves',
    skipDuplicates: 'Ignorer les doublons',
    overwriteDuplicates: 'Écraser les doublons',
    importMode: 'Mode d\'importation',
    previewImport: 'Aperçu de l\'importation',
    confirmImport: 'Confirmer l\'importation',
    cancelImport: 'Annuler l\'importation',
    importing: 'Importation...',
    importComplete: 'Importation terminée',
    importedCount: 'Importés',
    skippedCount: 'Ignorés',
    errorCount: 'Erreurs',
    resultImport: 'Résultat de l\'importation',
    excelTemplate: 'Modèle Excel',
    templateDownloaded: 'Modèle téléchargé',
    selectExcelFile: 'Sélectionner un fichier Excel',
    onlyExcelFiles: 'Fichiers Excel uniquement',
    maxFileSize: 'Taille maximale: 10MB',
    fileTooLarge: 'Fichier trop volumineux',
    invalidFileFormat: 'Format de fichier invalide',
    processingFile: 'Traitement du fichier...',
    noValidRows: 'Aucune ligne valide',
    columnMapping: 'Correspondance des colonnes',
    mapColumns: 'Mapper les colonnes',
    firstNameCol: 'Colonne Prénom',
    lastNameCol: 'Colonne Nom',
    numberCol: 'Colonne Numéro',
    autoDetected: 'Détecté automatiquement',
    reviewData: 'Vérifier les données',
    importPreview: 'Aperçu de l\'importation',
    rowsFound: 'lignes trouvées',
    proceed: 'Continuer',
    retry: 'Réessayer',
    goHome: 'Aller à l\'accueil',
    accessDenied: 'Accès refusé',
    noPermission: 'Vous n\'avez pas la permission d\'accéder à cette page',
    pageNotFound: 'Page introuvable',
    serverError: 'Erreur du serveur',
    connectionError: 'Erreur de connexion',
    tryAgain: 'Essayer à nouveau',
    refreshPage: 'Rafraîchir la page',
    checkingAuth: 'Vérification de l\'authentification...',
    redirecting: 'Redirection...',
    initializing: 'Initialisation...',
    readyToUse: 'Prêt à utiliser',
    getStarted: 'Commencer',
    learnMore: 'En savoir plus',
    help: 'Aide',
    support: 'Support',
    about: 'À propos',
    version: 'Version',
    allRightsReserved: 'Tous droits réservés',
    termsOfService: 'Conditions d\'utilisation',
    privacyPolicy: 'Politique de confidentialité',
    contactUs: 'Contactez-nous',
    feedback: 'Commentaires',
    reportIssue: 'Signaler un problème',
    theme: 'Thème',
    dark: 'Sombre',
    light: 'Clair',
    system: 'Système',
    notifications: 'Notifications',
    noNotifications: 'Aucune notification',
    markAllRead: 'Tout marquer comme lu',
    viewAll: 'Voir tout',
    settingsGeneral: 'Paramètres généraux',
    settingsLanguage: 'Langue',
    settingsTheme: 'Thème',
    settingsProfile: 'Profil',
    settingsAccount: 'Compte',
    settingsSecurity: 'Sécurité',
    deleteAccount: 'Supprimer le compte',
    changePassword: 'Changer le mot de passe',
    forgotPassword: 'Mot de passe oublié?',
    resetPassword: 'Réinitialiser le mot de passe',
    resetPasswordSent: 'Email de réinitialisation envoyé',
    resetPasswordInstructions: 'Entrez votre email pour recevoir un lien de réinitialisation',
    enterEmail: 'Entrez votre email',
    sendResetLink: 'Envoyer le lien',
    backToLogin: 'Retour à la connexion',
    noTeacherAssigned: 'Aucun enseignant assigné',
    assignToClass: 'Assigner à une classe',
    teacherAssigned: 'Enseignant assigné',
    teacherUnassigned: 'Enseignant non assigné',
    classAssigned: 'Classe assignée',
    classUnassigned: 'Classe non assignée',
    levelCreated: 'Niveau créé',
    levelUpdated: 'Niveau mis à jour',
    levelDeleted: 'Niveau supprimé',
    classCreated: 'Classe créée',
    classUpdated: 'Classe mise à jour',
    classDeleted: 'Classe supprimée',
    studentCreated: 'Élève ajouté',
    studentUpdated: 'Élève mis à jour',
    studentDeleted: 'Élève supprimé',
    teacherCreated: 'Enseignant créé',
    teacherUpdated: 'Enseignant mis à jour',
    teacherDeleted: 'Enseignant supprimé',
    cannotDeleteLevel: 'Impossible de supprimer ce niveau',
    cannotDeleteClass: 'Impossible de supprimer cette classe',
    hasClasses: 'A des classes',
    hasStudents: 'A des élèves',
    confirmDeleteLevel: 'Voulez-vous vraiment supprimer ce niveau? Toutes les classes associées seront supprimées.',
    confirmDeleteClass: 'Voulez-vous vraiment supprimer cette classe? Tous les élèves associés seront supprimés.',
    confirmDeleteStudent: 'Voulez-vous vraiment supprimer cet élève?',
    confirmDeleteTeacher: 'Voulez-vous vraiment supprimer cet enseignant?',
    levelInUse: 'Ce niveau est utilisé par des classes',
    classInUse: 'Cette classe a des élèves',
    manageTeachersDesc: 'Gérer les enseignants et leurs assignations de classes',
    addTeacher: 'Ajouter un enseignant',
    editTeacher: 'Modifier l\'enseignant',
    teacherEmail: 'Email de l\'enseignant',
    teacherRole: 'Rôle',
    assignClass: 'Assigner une classe',
    unassignClass: 'Désassigner la classe',
    currentlyAssigned: 'Actuellement assigné',
    notAssigned: 'Non assigné',
    teachersList: 'Liste des enseignants',
    classesList: 'Liste des classes',
    levelsList: 'Liste des niveaux',
    studentsList: 'Liste des élèves',
    attendanceList: 'Liste de présence',
    reportsList: 'Liste des rapports',
    dailyAttendance: 'Présence journalière',
    monthlyReport: 'Rapport mensuel',
    customReport: 'Rapport personnalisé',
    printReport: 'Imprimer le rapport',
    exportPdf: 'Exporter PDF',
    exportCsv: 'Exporter CSV',
    exportData: 'Exporter les données',
    print: 'Imprimer',
    filters: 'Filtres',
    clearFilters: 'Effacer les filtres',
    applyFilters: 'Appliquer les filtres',
    showing: 'Affichage de',
    of: 'sur',
    results: 'résultats',
    noResults: 'Aucun résultat',
    page: 'Page',
    prevPage: 'Page précédente',
    nextPage: 'Page suivante',
    rowsPerPage: 'Lignes par page',
    sortBy: 'Trier par',
    sortDirection: 'Sens du tri',
    ascending: 'Croissant',
    descending: 'Décroissant',
    searchPlaceholder: 'Rechercher...',
    noSearchResults: 'Aucun résultat trouvé',
    searchResults: 'Résultats de recherche',
    allStatuses: 'Tous les statuts',
    allDates: 'Toutes les dates',
    dateRange: 'Plage de dates',
    singleDate: 'Date unique',
    allClassesAttendance: 'Présence toutes classes',
    classAttendance: 'Présence de la classe',
    studentAttendance: 'Présence de l\'élève',
    attendanceFor: 'Présence pour',
    attendanceHistory: 'Historique de présence',
    attendanceDetails: 'Détails de présence',
    attendanceTrends: 'Tendances de présence',
    attendanceByDay: 'Présence par jour',
    attendanceByStatus: 'Présence par statut',
    presentRate: 'Taux de présence',
    absentRate: 'Taux d\'absence',
    lateRate: 'Taux de retard',
    bestAttendance: 'Meilleure présence',
    worstAttendance: 'Pire présence',
    mostAbsent: 'Plus d\'absences',
    mostLate: 'Plus de retards',
    perfectAttendance: 'Présence parfaite',
    neverLate: 'Jamais en retard',
    neverAbsent: 'Jamais absent',
    daysPresent: 'Jours présents',
    daysAbsent: 'Jours absents',
    daysLate: 'Jours en retard',
    totalRecords: 'Total enregistrements',
    schoolYear: 'Année scolaire',
    semester: 'Semestre',
    quarter: 'Trimestre',
    term: 'Période',
    firstSemester: 'Premier semestre',
    secondSemester: 'Deuxième semestre',
    firstQuarter: 'Premier trimestre',
    secondQuarter: 'Deuxième trimestre',
    thirdQuarter: 'Troisième trimestre',
    fourthQuarter: 'Quatrième trimestre',
    allTime: 'Tout',
    thisWeek: 'Cette semaine',
    thisMonth: 'Ce mois',
    thisYear: 'Cette année',
    lastWeek: 'Semaine dernière',
    lastMonth: 'Mois dernier',
    lastYear: 'Année dernière',
    customRange: 'Période personnalisée',
    from: 'De',
    to: 'À',
    apply: 'Appliquer',
    reset: 'Réinitialiser',
    clear: 'Effacer',
    export: 'Exporter',
    printView: 'Vue d\'impression',
    fullScreen: 'Plein écran',
    exitFullScreen: 'Quitter plein écran',
    zoomIn: 'Zoom avant',
    zoomOut: 'Zoom arrière',
    rotate: 'Rotation',
    flip: 'Retourner',
    crop: 'Rogner',
    filter: 'Filtrer',
    adjust: 'Ajuster',
    enhance: 'Améliorer',
    restore: 'Restaurer',
    undo: 'Annuler',
    redo: 'Rétablir',
    resetAll: 'Tout réinitialiser',
    applyChanges: 'Appliquer les modifications',
    discardChanges: 'Annuler les modifications',
    saveAsTemplate: 'Enregistrer comme modèle',
    loadTemplate: 'Charger un modèle',
    manageTemplates: 'Gérer les modèles',
    templateName: 'Nom du modèle',
    templateDescription: 'Description du modèle',
    createTemplate: 'Créer un modèle',
    editTemplate: 'Modifier le modèle',
    deleteTemplate: 'Supprimer le modèle',
    useTemplate: 'Utiliser le modèle',
    templateCreated: 'Modèle créé',
    templateUpdated: 'Modèle mis à jour',
    templateDeleted: 'Modèle supprimé',
    noTemplates: 'Aucun modèle',
    templatesList: 'Liste des modèles',
    selectTemplate: 'Sélectionner un modèle',
    templateSelected: 'Modèle sélectionné',
    templateApplied: 'Modèle appliqué',
    applyTemplate: 'Appliquer le modèle',
    previewTemplate: 'Aperçu du modèle',
    templatePreview: 'Aperçu du modèle',
    subject: 'Matière',
    subjectArabic: 'Arabe',
    subjectFrench: 'Français',
    subjectEnglish: 'Anglais',
    subjectSport: 'Sport',
    selectSubject: 'Sélectionner une matière',
    teacherSubject: 'Matière enseignée',
    createTeacherAccount: 'Créer un compte enseignant',
    directorCreatesTeachers: 'Le directeur crée les comptes enseignants',
    onlyDirectorCanCreate: 'Seul le directeur peut créer des comptes',
    temporaryPassword: 'Mot de passe temporaire',
    teacherAccountCreated: 'Compte enseignant créé avec succès',
    enterTeacherDetails: 'Saisir les informations de l\'enseignant',
    noSubject: 'Aucune matière',
    assignedTeachers: 'Enseignants assignés',
    addTeacherToClass: 'Ajouter un enseignant',
    removeTeacherFromClass: 'Retirer l\'enseignant',
    noTeachersAssigned: 'Aucun enseignant assigné',
    selectClassToView: 'Sélectionner une classe',
    myClasses: 'Mes classes',
    subjectLevelRestriction: 'Restrictions par matière',
    arabicLevelRange: 'Arabe : tous les niveaux (1 classe max)',
    frenchLevelRange: 'Français : 4ème et 5ème primaire',
    englishLevelRange: 'Anglais : 3ème, 4ème et 5ème primaire',
    sportLevelRange: 'Sport : tous les niveaux',
    teacherAlreadyAssigned: 'Cet enseignant est déjà assigné à cette classe',
    subjectAlreadyAssigned: 'Cette matière est déjà assignée à cette classe',
    arabicMaxOneClass: 'Un enseignant d\'arabe ne peut avoir qu\'une seule classe',
    levelNotAllowed: 'Ce niveau n\'est pas autorisé pour cette matière',
    assignTeachers: 'Assigner les enseignants',
    manageAssignments: 'Gérer les assignations',
    firstUse: 'Première utilisation',
    createDirectorAccount: 'Créer le compte administrateur',
    createDirectorDescription:
      'Configurez le premier compte administrateur de votre école.',
    passwordMinimum: 'Le mot de passe doit contenir au moins 8 caractères',
    accountCreated: 'Compte administrateur créé avec succès',
    administratorAlreadyExists:
      'Un compte administrateur existe déjà.',
    setupError:
      'Impossible de créer le compte administrateur.',
    creatingAccount: 'Création du compte...',
    createAdministrator: 'Créer le compte administrateur',
    settings: 'Configuration'
  },
  ar: {
    appName: 'إدارة الحضور',
    appTagline: 'نظام إدارة حضور التلاميذ',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    signOut: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    firstName: 'الاسم',
    lastName: 'اللقب',
    role: 'الدور',
    teacher: 'معلم',
    director: 'مدير',
    welcome: 'مرحبا',
    welcomeBack: 'مرحبا بعودتك',
    noAccount: 'ليس لديك حساب؟',
    haveAccount: 'لديك حساب؟',
    createAccount: 'إنشاء حساب',
    signInToContinue: 'سجل الدخول للمتابعة',
    dashboard: 'لوحة التحكم',
    myClass: 'فصلي',
    students: 'التلاميذ',
    attendance: 'الحضور',
    levels: 'المستويات',
    classes: 'الفصول',
    teachers: 'المعلمون',
    reports: 'التقارير',
    settings: 'الإعدادات',
    addStudent: 'إضافة تلميذ',
    importExcel: 'استيراد Excel',
    exportExcel: 'تصدير Excel',
    studentName: 'اسم التلميذ',
    studentNumber: 'رقم التلميذ',
    actions: 'إجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    confirmDelete: 'تأكيد الحذف؟',
    search: 'بحث',
    present: 'حاضر',
    absent: 'غائب',
    late: 'متأخر',
    presentShort: 'ح',
    absentShort: 'غ',
    lateShort: 'م',
    markAllPresent: 'تعليم الكل حاضر',
    saveAttendance: 'حفظ الحضور',
    attendanceSaved: 'تم حفظ الحضور',
    selectDate: 'اختر التاريخ',
    today: 'اليوم',
    noStudents: 'لا يوجد تلاميذ',
    noClasses: 'لا توجد فصول',
    noLevels: 'لا توجد مستويات',
    noTeachers: 'لا يوجد معلمون',
    addClass: 'إضافة فصل',
    addLevel: 'إضافة مستوى',
    assignTeacher: 'تعيين معلم',
    levelName: 'اسم المستوى',
    className: 'اسم الفصل',
    teacherName: 'اسم المعلم',
    unassigned: 'غير معين',
    viewAttendance: 'عرض الحضور',
    viewStudents: 'عرض التلاميذ',
    selectClass: 'اختر فصلا',
    selectLevel: 'اختر مستوى',
    totalStudents: 'مجموع التلاميذ',
    presentToday: 'حاضرون اليوم',
    absentToday: 'غائبون اليوم',
    lateToday: 'متأخرون اليوم',
    attendanceRate: 'نسبة الحضور',
    week: 'الأسبوع',
    day: 'اليوم',
    sunday: 'الأحد',
    monday: 'الإثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
    weekend: 'عطلة الأسبوع',
    schoolDay: 'يوم مدرسي',
    noAttendanceRecorded: 'لا يوجد حضور مسجل',
    loadingData: 'جاري تحميل البيانات...',
    errorOccurred: 'حدث خطأ',
    saving: 'جاري الحفظ...',
    loading: 'جاري التحميل...',
    profile: 'الملف الشخصي',
    language: 'اللغة',
    myProfile: 'ملفي الشخصي',
    firstNameAr: 'الاسم (العربية)',
    firstNameFr: 'الاسم (الفرنسية)',
    firstNameEn: 'الاسم (الإنجليزية)',
    lastNameAr: 'اللقب (العربية)',
    lastNameFr: 'اللقب (الفرنسية)',
    lastNameEn: 'اللقب (الإنجليزية)',
    nameAr: 'الاسم (العربية)',
    nameFr: 'الاسم (الفرنسية)',
    nameEn: 'الاسم (الإنجليزية)',
    sortOrder: 'ترتيب الفرز',
    allClasses: 'جميع الفصول',
    allLevels: 'جميع المستويات',
    allTeachers: 'جميع المعلمين',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    overview: 'نظرة عامة',
    manageLevels: 'إدارة المستويات',
    manageClasses: 'إدارة الفصول',
    manageTeachers: 'إدارة المعلمين',
    allAttendance: 'كل الحضور',
    noClassAssigned: 'لا يوجد فصل معين',
    youAreAssignedTo: 'أنت معين إلى',
    studentCount: 'عدد التلاميذ',
    recordsSaved: 'سجلات محفوظة',
    invalidEmail: 'بريد إلكتروني غير صالح',
    passwordTooShort: 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل',
    passwordsDoNotMatch: 'كلمتا المرور غير متطابقتين',
    fillAllFields: 'يرجى ملء جميع الحقول',
    selectRole: 'اختر دورا',
    invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    emailExists: 'هذا البريد الإلكتروني مستخدم بالفعل',
    importSuccess: 'تم الاستيراد بنجاح',
    importError: 'خطأ في الاستيراد',
    importInstructions: 'تعليمات الاستيراد',
    downloadTemplate: 'تحميل القالب',
    dragDropFile: 'اسحب وأفلت ملف Excel',
    orClickToBrowse: 'أو انقر للتصفح',
    fileSelected: 'الملف المحدد',
    processFile: 'معالجة الملف',
    studentsImported: 'تلاميذ مستوردون',
    startDate: 'تاريخ البداية',
    endDate: 'تاريخ النهاية',
    filterByDate: 'تصفية حسب التاريخ',
    filterByClass: 'تصفية حسب الفصل',
    filterByLevel: 'تصفية حسب المستوى',
    attendanceReport: 'تقرير الحضور',
    exportReport: 'تصدير التقرير',
    noDataForRange: 'لا توجد بيانات لهذه الفترة',
    totalDays: 'مجموع الأيام',
    totalPresent: 'مجموع الحاضرين',
    totalAbsent: 'مجموع الغائبين',
    totalLate: 'مجموع المتأخرين',
    rate: 'النسبة',
    student: 'تلميذ',
    class: 'فصل',
    level: 'مستوى',
    date: 'التاريخ',
    status: 'الحالة',
    note: 'ملاحظة',
    addNote: 'إضافة ملاحظة',
    noNote: 'لا توجد ملاحظة',
    statistics: 'إحصائيات',
    monthlyOverview: 'نظرة شهرية',
    dailyBreakdown: 'توزيع يومي',
    selectMonth: 'اختر الشهر',
    january: 'يناير', february: 'فبراير', march: 'مارس', april: 'أبريل',
    may: 'مايو', june: 'يونيو', july: 'يوليو', august: 'أغسطس',
    september: 'سبتمبر', october: 'أكتوبر', november: 'نوفمبر', december: 'ديسمبر',
    alreadyHasAccount: 'لديك حساب بالفعل؟',
    firstNameRequired: 'الاسم مطلوب',
    lastNameRequired: 'اللقب مطلوب',
    directorCanManageAll: 'المدير يمكنه إدارة كل شيء',
    teacherManagesOwnClass: 'المعلم يدير فصله',
    home: 'الرئيسية',
    quickActions: 'إجراءات سريعة',
    recentActivity: 'النشاط الأخير',
    schoolOverview: 'نظرة عامة على المدرسة',
    totalClasses: 'مجموع الفصول',
    totalLevels: 'مجموع المستويات',
    totalTeachers: 'مجموع المعلمين',
    unassignedClasses: 'فصول غير معينة',
    assignedClasses: 'فصول معينة',
    confirmLogout: 'هل تريد حقا تسجيل الخروج؟',
    yes: 'نعم',
    no: 'لا',
    close: 'إغلاق',
    add: 'إضافة',
    remove: 'إزالة',
    success: 'نجاح',
    error: 'خطأ',
    warning: 'تحذير',
    info: 'معلومات',
    saveChanges: 'حفظ التغييرات',
    changesSaved: 'تم حفظ التغييرات',
    noChanges: 'لا توجد تغييرات',
    editProfile: 'تعديل الملف الشخصي',
    updateProfile: 'تحديث الملف الشخصي',
    profileUpdated: 'تم تحديث الملف الشخصي',
    required: 'مطلوب',
    optional: 'اختياري',
    duplicateStudent: 'تلميذ مكرر',
    existingStudents: 'تلاميذ موجودون',
    newStudents: 'تلاميذ جدد',
    skipDuplicates: 'تخطي المكرر',
    overwriteDuplicates: 'استبدال المكرر',
    importMode: 'وضع الاستيراد',
    previewImport: 'معاينة الاستيراد',
    confirmImport: 'تأكيد الاستيراد',
    cancelImport: 'إلغاء الاستيراد',
    importing: 'جاري الاستيراد...',
    importComplete: 'اكتمل الاستيراد',
    importedCount: 'تم استيرادهم',
    skippedCount: 'تم تخطيهم',
    errorCount: 'أخطاء',
    resultImport: 'نتيجة الاستيراد',
    excelTemplate: 'قالب Excel',
    templateDownloaded: 'تم تحميل القالب',
    selectExcelFile: 'اختر ملف Excel',
    onlyExcelFiles: 'ملفات Excel فقط',
    maxFileSize: 'الحجم الأقصى: 10 ميغابايت',
    fileTooLarge: 'الملف كبير جدا',
    invalidFileFormat: 'صيغة ملف غير صالحة',
    processingFile: 'جاري معالجة الملف...',
    noValidRows: 'لا توجد صفوف صالحة',
    columnMapping: 'مطابقة الأعمدة',
    mapColumns: 'مطابقة الأعمدة',
    firstNameCol: 'عمود الاسم',
    lastNameCol: 'عمود اللقب',
    numberCol: 'عمود الرقم',
    autoDetected: 'تم الكشف تلقائيا',
    reviewData: 'مراجعة البيانات',
    importPreview: 'معاينة الاستيراد',
    rowsFound: 'صفوف موجودة',
    proceed: 'متابعة',
    retry: 'إعادة المحاولة',
    goHome: 'الذهاب للرئيسية',
    accessDenied: 'تم رفض الوصول',
    noPermission: 'ليس لديك صلاحية الوصول إلى هذه الصفحة',
    pageNotFound: 'الصفحة غير موجودة',
    serverError: 'خطأ في الخادم',
    connectionError: 'خطأ في الاتصال',
    tryAgain: 'حاول مرة أخرى',
    refreshPage: 'تحديث الصفحة',
    checkingAuth: 'جاري التحقق من المصادقة...',
    redirecting: 'جاري إعادة التوجيه...',
    initializing: 'جاري التهيئة...',
    readyToUse: 'جاهز للاستخدام',
    getStarted: 'ابدأ',
    learnMore: 'اعرف المزيد',
    help: 'مساعدة',
    support: 'دعم',
    about: 'حول',
    version: 'الإصدار',
    allRightsReserved: 'جميع الحقوق محفوظة',
    termsOfService: 'شروط الخدمة',
    privacyPolicy: 'سياسة الخصوصية',
    contactUs: 'اتصل بنا',
    feedback: 'ملاحظات',
    reportIssue: 'الإبلاغ عن مشكلة',
    theme: 'المظهر',
    dark: 'داكن',
    light: 'فاتح',
    system: 'النظام',
    notifications: 'الإشعارات',
    noNotifications: 'لا توجد إشعارات',
    markAllRead: 'تعليم الكل كمقروء',
    viewAll: 'عرض الكل',
    settingsGeneral: 'الإعدادات العامة',
    settingsLanguage: 'اللغة',
    settingsTheme: 'المظهر',
    settingsProfile: 'الملف الشخصي',
    settingsAccount: 'الحساب',
    settingsSecurity: 'الأمان',
    deleteAccount: 'حذف الحساب',
    changePassword: 'تغيير كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    resetPassword: 'إعادة تعيين كلمة المرور',
    resetPasswordSent: 'تم إرسال بريد إعادة التعيين',
    resetPasswordInstructions: 'أدخل بريدك الإلكتروني لتستقبل رابط إعادة التعيين',
    enterEmail: 'أدخل بريدك الإلكتروني',
    sendResetLink: 'إرسال الرابط',
    backToLogin: 'العودة لتسجيل الدخول',
    noTeacherAssigned: 'لا يوجد معلم معين',
    assignToClass: 'تعيين لفصل',
    teacherAssigned: 'تم تعيين المعلم',
    teacherUnassigned: 'لم يتم تعيين المعلم',
    classAssigned: 'تم تعيين الفصل',
    classUnassigned: 'لم يتم تعيين الفصل',
    levelCreated: 'تم إنشاء المستوى',
    levelUpdated: 'تم تحديث المستوى',
    levelDeleted: 'تم حذف المستوى',
    classCreated: 'تم إنشاء الفصل',
    classUpdated: 'تم تحديث الفصل',
    classDeleted: 'تم حذف الفصل',
    studentCreated: 'تم إضافة التلميذ',
    studentUpdated: 'تم تحديث التلميذ',
    studentDeleted: 'تم حذف التلميذ',
    teacherCreated: 'تم إنشاء المعلم',
    teacherUpdated: 'تم تحديث المعلم',
    teacherDeleted: 'تم حذف المعلم',
    cannotDeleteLevel: 'لا يمكن حذف هذا المستوى',
    cannotDeleteClass: 'لا يمكن حذف هذا الفصل',
    hasClasses: 'لديه فصول',
    hasStudents: 'لديه تلاميذ',
    confirmDeleteLevel: 'هل تريد حقا حذف هذا المستوى؟ سيتم حذف جميع الفصول المرتبطة.',
    confirmDeleteClass: 'هل تريد حقا حذف هذا الفصل؟ سيتم حذف جميع التلاميذ المرتبطين.',
    confirmDeleteStudent: 'هل تريد حقا حذف هذا التلميذ؟',
    confirmDeleteTeacher: 'هل تريد حقا حذف هذا المعلم؟',
    levelInUse: 'هذا المستوى مستخدم من قبل فصول',
    classInUse: 'هذا الفصل به تلاميذ',
    manageTeachersDesc: 'إدارة المعلمين وتعيينات الفصول',
    addTeacher: 'إضافة معلم',
    editTeacher: 'تعديل المعلم',
    teacherEmail: 'بريد المعلم الإلكتروني',
    teacherRole: 'الدور',
    assignClass: 'تعيين فصل',
    unassignClass: 'إلغاء تعيين الفصل',
    currentlyAssigned: 'معين حاليا',
    notAssigned: 'غير معين',
    teachersList: 'قائمة المعلمين',
    classesList: 'قائمة الفصول',
    levelsList: 'قائمة المستويات',
    studentsList: 'قائمة التلاميذ',
    attendanceList: 'قائمة الحضور',
    reportsList: 'قائمة التقارير',
    dailyAttendance: 'الحضور اليومي',
    monthlyReport: 'تقرير شهري',
    customReport: 'تقرير مخصص',
    printReport: 'طباعة التقرير',
    exportPdf: 'تصدير PDF',
    exportCsv: 'تصدير CSV',
    exportData: 'تصدير البيانات',
    print: 'طباعة',
    filters: 'مرشحات',
    clearFilters: 'مسح المرشحات',
    applyFilters: 'تطبيق المرشحات',
    showing: 'عرض',
    of: 'من',
    results: 'نتائج',
    noResults: 'لا توجد نتائج',
    page: 'صفحة',
    prevPage: 'الصفحة السابقة',
    nextPage: 'الصفحة التالية',
    rowsPerPage: 'صفوف لكل صفحة',
    sortBy: 'فرز حسب',
    sortDirection: 'اتجاه الفرز',
    ascending: 'تصاعدي',
    descending: 'تنازلي',
    searchPlaceholder: 'بحث...',
    noSearchResults: 'لم يتم العثور على نتائج',
    searchResults: 'نتائج البحث',
    allStatuses: 'كل الحالات',
    allDates: 'كل التواريخ',
    dateRange: 'نطاق التواريخ',
    singleDate: 'تاريخ واحد',
    allClassesAttendance: 'حضور كل الفصول',
    classAttendance: 'حضور الفصل',
    studentAttendance: 'حضور التلميذ',
    attendanceFor: 'الحضور لـ',
    attendanceHistory: 'سجل الحضور',
    attendanceDetails: 'تفاصيل الحضور',
    attendanceTrends: 'اتجاهات الحضور',
    attendanceByDay: 'الحضور حسب اليوم',
    attendanceByStatus: 'الحضور حسب الحالة',
    presentRate: 'نسبة الحضور',
    absentRate: 'نسبة الغياب',
    lateRate: 'نسبة التأخر',
    bestAttendance: 'أفضل حضور',
    worstAttendance: 'أسوأ حضور',
    mostAbsent: 'أكثر غيابا',
    mostLate: 'أكثر تأخرا',
    perfectAttendance: 'حضور مثالي',
    neverLate: 'لم يتأخر أبدا',
    neverAbsent: 'لم يغب أبدا',
    daysPresent: 'أيام الحضور',
    daysAbsent: 'أيام الغياب',
    daysLate: 'أيام التأخر',
    totalRecords: 'مجموع السجلات',
    schoolYear: 'السنة الدراسية',
    semester: 'الفصل',
    quarter: 'الثلاثي',
    term: 'الدورة',
    firstSemester: 'الفصل الأول',
    secondSemester: 'الفصل الثاني',
    firstQuarter: 'الثلاثي الأول',
    secondQuarter: 'الثلاثي الثاني',
    thirdQuarter: 'الثلاثي الثالث',
    fourthQuarter: 'الثلاثي الرابع',
    allTime: 'الكل',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    thisYear: 'هذه السنة',
    lastWeek: 'الأسبوع الماضي',
    lastMonth: 'الشهر الماضي',
    lastYear: 'السنة الماضية',
    customRange: 'فترة مخصصة',
    from: 'من',
    to: 'إلى',
    apply: 'تطبيق',
    reset: 'إعادة تعيين',
    clear: 'مسح',
    export: 'تصدير',
    printView: 'عرض الطباعة',
    fullScreen: 'ملء الشاشة',
    exitFullScreen: 'إنهاء ملء الشاشة',
    zoomIn: 'تكبير',
    zoomOut: 'تصغير',
    rotate: 'تدوير',
    flip: 'قلب',
    crop: 'اقتصاص',
    filter: 'تصفية',
    adjust: 'ضبط',
    enhance: 'تحسين',
    restore: 'استعادة',
    undo: 'تراجع',
    redo: 'إعادة',
    resetAll: 'إعادة تعيين الكل',
    applyChanges: 'تطبيق التغييرات',
    discardChanges: 'تجاهل التغييرات',
    saveAsTemplate: 'حفظ كقالب',
    loadTemplate: 'تحميل قالب',
    manageTemplates: 'إدارة القوالب',
    templateName: 'اسم القالب',
    templateDescription: 'وصف القالب',
    createTemplate: 'إنشاء قالب',
    editTemplate: 'تعديل القالب',
    deleteTemplate: 'حذف القالب',
    useTemplate: 'استخدام القالب',
    templateCreated: 'تم إنشاء القالب',
    templateUpdated: 'تم تحديث القالب',
    templateDeleted: 'تم حذف القالب',
    noTemplates: 'لا توجد قوالب',
    templatesList: 'قائمة القوالب',
    selectTemplate: 'اختر قالبا',
    templateSelected: 'تم اختيار القالب',
    templateApplied: 'تم تطبيق القالب',
    applyTemplate: 'تطبيق القالب',
    previewTemplate: 'معاينة القالب',
    templatePreview: 'معاينة القالب',
    subject: 'المادة',
    subjectArabic: 'العربية',
    subjectFrench: 'الفرنسية',
    subjectEnglish: 'الإنجليزية',
    subjectSport: 'الرياضة',
    selectSubject: 'اختر المادة',
    teacherSubject: 'المادة المدرسة',
    createTeacherAccount: 'إنشاء حساب معلم',
    directorCreatesTeachers: 'المدير ينشئ حسابات المعلمين',
    onlyDirectorCanCreate: 'المدير فقط يمكنه إنشاء الحسابات',
    temporaryPassword: 'كلمة مرور مؤقتة',
    teacherAccountCreated: 'تم إنشاء حساب المعلم بنجاح',
    enterTeacherDetails: 'أدخل معلومات المعلم',
    noSubject: 'لا توجد مادة',
    assignedTeachers: 'المعلمون المعينون',
    addTeacherToClass: 'إضافة معلم',
    removeTeacherFromClass: 'إزالة المعلم',
    noTeachersAssigned: 'لا يوجد معلمون معينون',
    selectClassToView: 'اختر فصلاً',
    myClasses: 'فصلي',
    subjectLevelRestriction: 'قيود المواد',
    arabicLevelRange: 'العربية: جميع المستويات (فصل واحد فقط)',
    frenchLevelRange: 'الفرنسية: المستوى الرابع والخامس',
    englishLevelRange: 'الإنجليزية: المستوى الثالث والرابع والخامس',
    sportLevelRange: 'الرياضة: جميع المستويات',
    teacherAlreadyAssigned: 'هذا المعلم معين بالفعل لهذا الفصل',
    subjectAlreadyAssigned: 'هذه المادة معينة بالفعل لهذا الفصل',
    arabicMaxOneClass: 'معلم اللغة العربية يمكنه تدريس فصل واحد فقط',
    levelNotAllowed: 'هذا المستوى غير مسموح لهذه المادة',
    assignTeachers: 'تعيين المعلمين',
    manageAssignments: 'إدارة التعيينات',
        firstUse: 'الاستخدام الأول',
    createDirectorAccount: 'إنشاء حساب المدير',
    createDirectorDescription:
      'قم بإنشاء حساب المدير الأول للمدرسة.',
    passwordMinimum: 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل',
    accountCreated: 'تم إنشاء حساب المدير بنجاح',
    administratorAlreadyExists:
      'يوجد حساب مدير بالفعل.',
    setupError:
      'تعذر إنشاء حساب المدير.',
    creatingAccount: 'جارٍ إنشاء الحساب...',
    createAdministrator: 'إنشاء حساب المدير',
  },
  en: {
    appName: 'Attendance Manager',
    appTagline: 'School student attendance management system',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    role: 'Role',
    teacher: 'Teacher',
    director: 'Director',
    welcome: 'Welcome',
    welcomeBack: 'Welcome back',
    noAccount: 'No account?',
    haveAccount: 'Have an account?',
    createAccount: 'Create an account',
    signInToContinue: 'Sign in to continue',
    dashboard: 'Dashboard',
    myClass: 'My Class',
    students: 'Students',
    attendance: 'Attendance',
    levels: 'Levels',
    classes: 'Classes',
    teachers: 'Teachers',
    reports: 'Reports',
    settings: 'Settings',
    addStudent: 'Add Student',
    importExcel: 'Import Excel',
    exportExcel: 'Export Excel',
    studentName: 'Student Name',
    studentNumber: 'Student Number',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    confirmDelete: 'Confirm delete?',
    search: 'Search',
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    presentShort: 'P',
    absentShort: 'A',
    lateShort: 'L',
    markAllPresent: 'Mark all present',
    saveAttendance: 'Save Attendance',
    attendanceSaved: 'Attendance saved',
    selectDate: 'Select Date',
    today: 'Today',
    noStudents: 'No students',
    noClasses: 'No classes',
    noLevels: 'No levels',
    noTeachers: 'No teachers',
    addClass: 'Add Class',
    addLevel: 'Add Level',
    assignTeacher: 'Assign Teacher',
    levelName: 'Level Name',
    className: 'Class Name',
    teacherName: 'Teacher Name',
    unassigned: 'Unassigned',
    viewAttendance: 'View Attendance',
    viewStudents: 'View Students',
    selectClass: 'Select Class',
    selectLevel: 'Select Level',
    totalStudents: 'Total Students',
    presentToday: 'Present today',
    absentToday: 'Absent today',
    lateToday: 'Late today',
    attendanceRate: 'Attendance Rate',
    week: 'Week',
    day: 'Day',
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    weekend: 'Weekend',
    schoolDay: 'School Day',
    noAttendanceRecorded: 'No attendance recorded',
    loadingData: 'Loading data...',
    errorOccurred: 'An error occurred',
    saving: 'Saving...',
    loading: 'Loading...',
    profile: 'Profile',
    language: 'Language',
    myProfile: 'My Profile',
    firstNameAr: 'First Name (Arabic)',
    firstNameFr: 'First Name (French)',
    firstNameEn: 'First Name (English)',
    lastNameAr: 'Last Name (Arabic)',
    lastNameFr: 'Last Name (French)',
    lastNameEn: 'Last Name (English)',
    nameAr: 'Name (Arabic)',
    nameFr: 'Name (French)',
    nameEn: 'Name (English)',
    sortOrder: 'Sort Order',
    allClasses: 'All Classes',
    allLevels: 'All Levels',
    allTeachers: 'All Teachers',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    overview: 'Overview',
    manageLevels: 'Manage Levels',
    manageClasses: 'Manage Classes',
    manageTeachers: 'Manage Teachers',
    allAttendance: 'All Attendance',
    noClassAssigned: 'No class assigned',
    youAreAssignedTo: 'You are assigned to',
    studentCount: 'Student Count',
    recordsSaved: 'records saved',
    invalidEmail: 'Invalid email',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordsDoNotMatch: 'Passwords do not match',
    fillAllFields: 'Please fill all fields',
    selectRole: 'Select a role',
    invalidCredentials: 'Invalid email or password',
    emailExists: 'This email is already in use',
    importSuccess: 'Import successful',
    importError: 'Import error',
    importInstructions: 'Import Instructions',
    downloadTemplate: 'Download Template',
    dragDropFile: 'Drag & drop an Excel file',
    orClickToBrowse: 'or click to browse',
    fileSelected: 'File selected',
    processFile: 'Process File',
    studentsImported: 'students imported',
    startDate: 'Start Date',
    endDate: 'End Date',
    filterByDate: 'Filter by date',
    filterByClass: 'Filter by class',
    filterByLevel: 'Filter by level',
    attendanceReport: 'Attendance Report',
    exportReport: 'Export Report',
    noDataForRange: 'No data for this range',
    totalDays: 'Total Days',
    totalPresent: 'Total Present',
    totalAbsent: 'Total Absent',
    totalLate: 'Total Late',
    rate: 'Rate',
    student: 'Student',
    class: 'Class',
    level: 'Level',
    date: 'Date',
    status: 'Status',
    note: 'Note',
    addNote: 'Add Note',
    noNote: 'No note',
    statistics: 'Statistics',
    monthlyOverview: 'Monthly Overview',
    dailyBreakdown: 'Daily Breakdown',
    selectMonth: 'Select Month',
    january: 'January', february: 'February', march: 'March', april: 'April',
    may: 'May', june: 'June', july: 'July', august: 'August',
    september: 'September', october: 'October', november: 'November', december: 'December',
    alreadyHasAccount: 'Already have an account?',
    firstNameRequired: 'First name required',
    lastNameRequired: 'Last name required',
    directorCanManageAll: 'Director can manage everything',
    teacherManagesOwnClass: 'Teacher manages own class',
    home: 'Home',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    schoolOverview: 'School Overview',
    totalClasses: 'Total Classes',
    totalLevels: 'Total Levels',
    totalTeachers: 'Total Teachers',
    unassignedClasses: 'Unassigned Classes',
    assignedClasses: 'Assigned Classes',
    confirmLogout: 'Do you really want to log out?',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    add: 'Add',
    remove: 'Remove',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    saveChanges: 'Save Changes',
    changesSaved: 'Changes saved',
    noChanges: 'No changes',
    editProfile: 'Edit Profile',
    updateProfile: 'Update Profile',
    profileUpdated: 'Profile updated',
    required: 'Required',
    optional: 'Optional',
    duplicateStudent: 'Duplicate student',
    existingStudents: 'Existing students',
    newStudents: 'New students',
    skipDuplicates: 'Skip duplicates',
    overwriteDuplicates: 'Overwrite duplicates',
    importMode: 'Import mode',
    previewImport: 'Import Preview',
    confirmImport: 'Confirm Import',
    cancelImport: 'Cancel Import',
    importing: 'Importing...',
    importComplete: 'Import complete',
    importedCount: 'Imported',
    skippedCount: 'Skipped',
    errorCount: 'Errors',
    resultImport: 'Import Result',
    excelTemplate: 'Excel Template',
    templateDownloaded: 'Template downloaded',
    selectExcelFile: 'Select an Excel file',
    onlyExcelFiles: 'Excel files only',
    maxFileSize: 'Max size: 10MB',
    fileTooLarge: 'File too large',
    invalidFileFormat: 'Invalid file format',
    processingFile: 'Processing file...',
    noValidRows: 'No valid rows',
    columnMapping: 'Column Mapping',
    mapColumns: 'Map Columns',
    firstNameCol: 'First Name Column',
    lastNameCol: 'Last Name Column',
    numberCol: 'Number Column',
    autoDetected: 'Auto-detected',
    reviewData: 'Review Data',
    importPreview: 'Import Preview',
    rowsFound: 'rows found',
    proceed: 'Proceed',
    retry: 'Retry',
    goHome: 'Go Home',
    accessDenied: 'Access Denied',
    noPermission: 'You do not have permission to access this page',
    pageNotFound: 'Page not found',
    serverError: 'Server error',
    connectionError: 'Connection error',
    tryAgain: 'Try again',
    refreshPage: 'Refresh page',
    checkingAuth: 'Checking authentication...',
    redirecting: 'Redirecting...',
    initializing: 'Initializing...',
    readyToUse: 'Ready to use',
    getStarted: 'Get Started',
    learnMore: 'Learn more',
    help: 'Help',
    support: 'Support',
    about: 'About',
    version: 'Version',
    allRightsReserved: 'All rights reserved',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    contactUs: 'Contact Us',
    feedback: 'Feedback',
    reportIssue: 'Report Issue',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    system: 'System',
    notifications: 'Notifications',
    noNotifications: 'No notifications',
    markAllRead: 'Mark all read',
    viewAll: 'View all',
    settingsGeneral: 'General Settings',
    settingsLanguage: 'Language',
    settingsTheme: 'Theme',
    settingsProfile: 'Profile',
    settingsAccount: 'Account',
    settingsSecurity: 'Security',
    deleteAccount: 'Delete Account',
    changePassword: 'Change Password',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset Password',
    resetPasswordSent: 'Reset email sent',
    resetPasswordInstructions: 'Enter your email to receive a reset link',
    enterEmail: 'Enter your email',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to login',
    noTeacherAssigned: 'No teacher assigned',
    assignToClass: 'Assign to class',
    teacherAssigned: 'Teacher assigned',
    teacherUnassigned: 'Teacher unassigned',
    classAssigned: 'Class assigned',
    classUnassigned: 'Class unassigned',
    levelCreated: 'Level created',
    levelUpdated: 'Level updated',
    levelDeleted: 'Level deleted',
    classCreated: 'Class created',
    classUpdated: 'Class updated',
    classDeleted: 'Class deleted',
    studentCreated: 'Student added',
    studentUpdated: 'Student updated',
    studentDeleted: 'Student deleted',
    teacherCreated: 'Teacher created',
    teacherUpdated: 'Teacher updated',
    teacherDeleted: 'Teacher deleted',
    cannotDeleteLevel: 'Cannot delete this level',
    cannotDeleteClass: 'Cannot delete this class',
    hasClasses: 'Has classes',
    hasStudents: 'Has students',
    confirmDeleteLevel: 'Do you really want to delete this level? All associated classes will be deleted.',
    confirmDeleteClass: 'Do you really want to delete this class? All associated students will be deleted.',
    confirmDeleteStudent: 'Do you really want to delete this student?',
    confirmDeleteTeacher: 'Do you really want to delete this teacher?',
    levelInUse: 'This level is used by classes',
    classInUse: 'This class has students',
    manageTeachersDesc: 'Manage teachers and their class assignments',
    addTeacher: 'Add Teacher',
    editTeacher: 'Edit Teacher',
    teacherEmail: 'Teacher Email',
    teacherRole: 'Role',
    assignClass: 'Assign Class',
    unassignClass: 'Unassign Class',
    currentlyAssigned: 'Currently assigned',
    notAssigned: 'Not assigned',
    teachersList: 'Teachers List',
    classesList: 'Classes List',
    levelsList: 'Levels List',
    studentsList: 'Students List',
    attendanceList: 'Attendance List',
    reportsList: 'Reports List',
    dailyAttendance: 'Daily Attendance',
    monthlyReport: 'Monthly Report',
    customReport: 'Custom Report',
    printReport: 'Print Report',
    exportPdf: 'Export PDF',
    exportCsv: 'Export CSV',
    exportData: 'Export Data',
    print: 'Print',
    filters: 'Filters',
    clearFilters: 'Clear Filters',
    applyFilters: 'Apply Filters',
    showing: 'Showing',
    of: 'of',
    results: 'results',
    noResults: 'No results',
    page: 'Page',
    prevPage: 'Previous Page',
    nextPage: 'Next Page',
    rowsPerPage: 'Rows per page',
    sortBy: 'Sort by',
    sortDirection: 'Sort direction',
    ascending: 'Ascending',
    descending: 'Descending',
    searchPlaceholder: 'Search...',
    noSearchResults: 'No search results found',
    searchResults: 'Search results',
    allStatuses: 'All statuses',
    allDates: 'All dates',
    dateRange: 'Date range',
    singleDate: 'Single date',
    allClassesAttendance: 'All Classes Attendance',
    classAttendance: 'Class Attendance',
    studentAttendance: 'Student Attendance',
    attendanceFor: 'Attendance for',
    attendanceHistory: 'Attendance History',
    attendanceDetails: 'Attendance Details',
    attendanceTrends: 'Attendance Trends',
    attendanceByDay: 'Attendance by Day',
    attendanceByStatus: 'Attendance by Status',
    presentRate: 'Present rate',
    absentRate: 'Absent rate',
    lateRate: 'Late rate',
    bestAttendance: 'Best attendance',
    worstAttendance: 'Worst attendance',
    mostAbsent: 'Most absent',
    mostLate: 'Most late',
    perfectAttendance: 'Perfect attendance',
    neverLate: 'Never late',
    neverAbsent: 'Never absent',
    daysPresent: 'Days present',
    daysAbsent: 'Days absent',
    daysLate: 'Days late',
    totalRecords: 'Total records',
    schoolYear: 'School year',
    semester: 'Semester',
    quarter: 'Quarter',
    term: 'Term',
    firstSemester: 'First semester',
    secondSemester: 'Second semester',
    firstQuarter: 'First quarter',
    secondQuarter: 'Second quarter',
    thirdQuarter: 'Third quarter',
    fourthQuarter: 'Fourth quarter',
    allTime: 'All time',
    thisWeek: 'This week',
    thisMonth: 'This month',
    thisYear: 'This year',
    lastWeek: 'Last week',
    lastMonth: 'Last month',
    lastYear: 'Last year',
    customRange: 'Custom range',
    from: 'From',
    to: 'To',
    apply: 'Apply',
    reset: 'Reset',
    clear: 'Clear',
    export: 'Export',
    printView: 'Print view',
    fullScreen: 'Full screen',
    exitFullScreen: 'Exit full screen',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    rotate: 'Rotate',
    flip: 'Flip',
    crop: 'Crop',
    filter: 'Filter',
    adjust: 'Adjust',
    enhance: 'Enhance',
    restore: 'Restore',
    undo: 'Undo',
    redo: 'Redo',
    resetAll: 'Reset all',
    applyChanges: 'Apply changes',
    discardChanges: 'Discard changes',
    saveAsTemplate: 'Save as template',
    loadTemplate: 'Load template',
    manageTemplates: 'Manage templates',
    templateName: 'Template name',
    templateDescription: 'Template description',
    createTemplate: 'Create template',
    editTemplate: 'Edit template',
    deleteTemplate: 'Delete template',
    useTemplate: 'Use template',
    templateCreated: 'Template created',
    templateUpdated: 'Template updated',
    templateDeleted: 'Template deleted',
    noTemplates: 'No templates',
    templatesList: 'Templates list',
    selectTemplate: 'Select template',
    templateSelected: 'Template selected',
    templateApplied: 'Template applied',
    applyTemplate: 'Apply template',
    previewTemplate: 'Preview template',
    templatePreview: 'Template preview',
    subject: 'Subject',
    subjectArabic: 'Arabic',
    subjectFrench: 'French',
    subjectEnglish: 'English',
    subjectSport: 'Sport',
    selectSubject: 'Select a subject',
    teacherSubject: 'Teaching subject',
    createTeacherAccount: 'Create teacher account',
    directorCreatesTeachers: 'Director creates teacher accounts',
    onlyDirectorCanCreate: 'Only the director can create accounts',
    temporaryPassword: 'Temporary password',
    teacherAccountCreated: 'Teacher account created successfully',
    enterTeacherDetails: 'Enter teacher details',
    noSubject: 'No subject',
    assignedTeachers: 'Assigned teachers',
    addTeacherToClass: 'Add teacher',
    removeTeacherFromClass: 'Remove teacher',
    noTeachersAssigned: 'No teachers assigned',
    selectClassToView: 'Select a class',
    myClasses: 'My classes',
    subjectLevelRestriction: 'Subject restrictions',
    arabicLevelRange: 'Arabic: all levels (1 class max)',
    frenchLevelRange: 'French: 4th and 5th primary',
    englishLevelRange: 'English: 3rd, 4th and 5th primary',
    sportLevelRange: 'Sport: all levels',
    teacherAlreadyAssigned: 'This teacher is already assigned to this class',
    subjectAlreadyAssigned: 'This subject is already assigned to this class',
    arabicMaxOneClass: 'An Arabic teacher can only have one class',
    levelNotAllowed: 'This level is not allowed for this subject',
    assignTeachers: 'Assign teachers',
    manageAssignments: 'Manage assignments',
        firstUse: 'First use',
    createDirectorAccount: 'Create administrator account',
    createDirectorDescription:
      'Create the first administrator account for your school.',
    passwordMinimum: 'The password must contain at least 8 characters',
    accountCreated: 'Administrator account created successfully',
    administratorAlreadyExists:
      'An administrator account already exists.',
    setupError:
      'Unable to create the administrator account.',
    creatingAccount: 'Creating account...',
    createAdministrator: 'Create administrator account',
  },
};
