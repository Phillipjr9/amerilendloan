import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
const en = {
  translation: {
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      yes: 'Yes',
      no: 'No',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      continue: 'Continue',
      confirm: 'Confirm',
      download: 'Download',
      upload: 'Upload',
      view: 'View',
      actions: 'Actions',
      status: 'Status',
      date: 'Date',
      amount: 'Amount',
      total: 'Total',
      from: 'From',
      to: 'To',
    },

    // Navigation
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      apply: 'Apply',
      loans: 'Loans',
      payments: 'Payments',
      profile: 'Profile',
      settings: 'Settings',
      support: 'Support',
      logout: 'Logout',
      admin: 'Admin',
    },

    // Home Page
    home: {
      title: 'Welcome to AmeriLend',
      subtitle: 'Your trusted partner for personal loans',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      hero: {
        title: 'Get the Financial Support You Need, Fast',
        subtitle: 'Quick approval, competitive rates, and flexible terms tailored to your needs',
        applyNow: 'Apply Now',
        checkRates: 'Check Rates',
      },
      features: {
        fast: 'Fast Approval',
        fastDesc: 'Get approved in minutes',
        secure: 'Secure Process',
        secureDesc: 'Bank-level security',
        support: '24/7 Support',
        supportDesc: 'We\'re here to help',
        title: 'Why Choose AmeriLend?',
        quickApproval: 'Quick Approval',
        quickApprovalDesc: 'Get approved in as little as 5 minutes with our streamlined application process',
        competitiveRates: 'Competitive Rates',
        competitiveRatesDesc: 'Enjoy some of the most competitive interest rates in the market',
        secureTitle: 'Secure & Safe',
        secureTitleDesc: 'Bank-level security to protect your personal and financial information',
        support247: '24/7 Customer Support',
        support247Desc: 'Our dedicated team is always here to help you with any questions',
        flexibleTerms: 'Flexible Terms',
        flexibleTermsDesc: 'Choose repayment terms that work best for your budget and lifestyle',
        noHiddenFees: 'No Hidden Fees',
        noHiddenFeesDesc: 'Complete transparency with all costs clearly outlined upfront',
      },
      about: {
        title: 'About Us',
        description: 'AmeriLend is committed to providing accessible financial solutions to help you achieve your goals',
      },
      faq: {
        title: 'Frequently Asked Questions',
        q1: 'How quickly can I get approved?',
        a1: 'Most applications are reviewed within minutes. You can expect a decision in less than 24 hours.',
        q2: 'What do I need to apply?',
        a2: 'You\'ll need a valid ID, proof of income, and bank account information to complete your application.',
        q3: 'What are the interest rates?',
        a3: 'Interest rates vary based on your credit profile and loan amount. Check your rate with no impact to your credit score.',
        q4: 'Can I pay off my loan early?',
        a4: 'Yes! There are no prepayment penalties. You can pay off your loan early to save on interest.',
        q5: 'How do I receive my funds?',
        a5: 'Once approved, funds are typically deposited directly into your bank account within 1-2 business days.',
      },
      cta: {
        readyToStart: 'Ready to Get Started?',
        applyToday: 'Apply today and get the funds you need',
        applyNow: 'Apply Now',
        contactUs: 'Contact Us',
      },
      nav: {
        loans: 'Loans',
        about: 'About Us',
        help: 'Help',
        login: 'Login',
        signup: 'Sign Up',
      },
    },

    // Loan Application
    apply: {
      title: 'Apply for a Loan',
      personalInfo: 'Personal Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      ssn: 'Social Security Number',
      dob: 'Date of Birth',
      loanDetails: 'Loan Details',
      loanAmount: 'Loan Amount',
      loanPurpose: 'Loan Purpose',
      term: 'Term (months)',
      employmentInfo: 'Employment Information',
      employer: 'Employer Name',
      jobTitle: 'Job Title',
      annualIncome: 'Annual Income',
      startDate: 'Employment Start Date',
      bankInfo: 'Bank Information',
      accountNumber: 'Account Number',
      routingNumber: 'Routing Number',
      submitApplication: 'Submit Application',
      submitting: 'Submitting...',
    },

    // Dashboard
    dashboard: {
      welcome: 'Welcome back',
      activeLoans: 'Active Loans',
      pendingPayment: 'Pending Payment',
      totalPaid: 'Total Paid',
      creditScore: 'Credit Score',
      recentActivity: 'Recent Activity',
      upcomingPayments: 'Upcoming Payments',
      quickActions: 'Quick Actions',
      makePayment: 'Make Payment',
      viewLoans: 'View Loans',
      applyLoan: 'Apply for Loan',
    },

    // Payments
    payments: {
      title: 'Payments',
      history: 'Payment History',
      makePayment: 'Make a Payment',
      selectLoan: 'Select Loan',
      paymentAmount: 'Payment Amount',
      paymentMethod: 'Payment Method',
      bankAccount: 'Bank Account',
      debitCard: 'Debit Card',
      creditCard: 'Credit Card',
      payNow: 'Pay Now',
      scheduledPayments: 'Scheduled Payments',
      autoPayEnabled: 'Auto-Pay Enabled',
      dueDate: 'Due Date',
      amountDue: 'Amount Due',
      minimumPayment: 'Minimum Payment',
      paymentConfirmation: 'Payment Confirmation',
      confirmationNumber: 'Confirmation Number',
    },

    // Loan Details
    loan: {
      details: 'Loan Details',
      loanNumber: 'Loan Number',
      principal: 'Principal Amount',
      interestRate: 'Interest Rate',
      remainingBalance: 'Remaining Balance',
      nextPayment: 'Next Payment',
      payoffAmount: 'Payoff Amount',
      originationDate: 'Origination Date',
      maturityDate: 'Maturity Date',
      monthlyPayment: 'Monthly Payment',
      totalInterest: 'Total Interest',
      paymentSchedule: 'Payment Schedule',
      loanDocuments: 'Loan Documents',
      loanAgreement: 'Loan Agreement',
      promissoryNote: 'Promissory Note',
    },

    // Profile
    profile: {
      title: 'Profile',
      personalInfo: 'Personal Information',
      contactInfo: 'Contact Information',
      address: 'Address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP Code',
      updateProfile: 'Update Profile',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      twoFactorAuth: 'Two-Factor Authentication',
      enableTwoFactor: 'Enable 2FA',
      disableTwoFactor: 'Disable 2FA',
    },

    // Settings
    settings: {
      title: 'Settings',
      language: 'Language',
      notifications: 'Notifications',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      pushNotifications: 'Push Notifications',
      paymentReminders: 'Payment Reminders',
      loanUpdates: 'Loan Updates',
      marketingEmails: 'Marketing Emails',
      privacy: 'Privacy',
      security: 'Security',
      preferences: 'Preferences',
    },

    // Support
    support: {
      title: 'Support Center',
      contactUs: 'Contact Us',
      helpCenter: 'Help Center',
      faq: 'FAQ',
      submitTicket: 'Submit a Ticket',
      subject: 'Subject',
      message: 'Message',
      category: 'Category',
      priority: 'Priority',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
      liveChat: 'Live Chat',
      startChat: 'Start Chat',
      chatWithAgent: 'Chat with an Agent',
    },

    // Admin
    admin: {
      dashboard: 'Admin Dashboard',
      users: 'Users',
      applications: 'Applications',
      approvals: 'Approvals',
      reports: 'Reports',
      analytics: 'Analytics',
      settings: 'Settings',
      userManagement: 'User Management',
      loanManagement: 'Loan Management',
      fraudDetection: 'Fraud Detection',
      collections: 'Collections',
      marketing: 'Marketing Campaigns',
    },

    // Notifications
    notifications: {
      title: 'Notifications',
      markAllRead: 'Mark All as Read',
      noNotifications: 'No notifications',
      paymentDue: 'Payment Due',
      paymentReceived: 'Payment Received',
      loanApproved: 'Loan Approved',
      loanDisbursed: 'Loan Disbursed',
      documentReady: 'Document Ready',
    },

    // Errors
    errors: {
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      invalidPhone: 'Invalid phone number',
      invalidSSN: 'Invalid SSN',
      passwordMismatch: 'Passwords do not match',
      minLength: 'Minimum length is {{min}} characters',
      maxLength: 'Maximum length is {{max}} characters',
      minAmount: 'Minimum amount is ${{min}}',
      maxAmount: 'Maximum amount is ${{max}}',
      networkError: 'Network error. Please try again.',
      unauthorized: 'Unauthorized. Please login.',
      sessionExpired: 'Session expired. Please login again.',
      serverError: 'Server error. Please try again later.',
    },

    // Success Messages
    success: {
      profileUpdated: 'Profile updated successfully',
      passwordChanged: 'Password changed successfully',
      paymentSubmitted: 'Payment submitted successfully',
      applicationSubmitted: 'Application submitted successfully',
      documentDownloaded: 'Document downloaded successfully',
      preferencesSaved: 'Preferences saved successfully',
    },

    // Financial Tools
    tools: {
      calculator: 'Loan Calculator',
      dtiCalculator: 'DTI Calculator',
      budgetTool: 'Budget Tool',
      creditEducation: 'Credit Education',
      monthlyIncome: 'Monthly Income',
      monthlyDebts: 'Monthly Debts',
      calculate: 'Calculate',
      result: 'Result',
      yourDTI: 'Your DTI Ratio',
    },

    // Hardship
    hardship: {
      title: 'Hardship Programs',
      applyForHelp: 'Apply for Assistance',
      programType: 'Program Type',
      forbearance: 'Forbearance',
      paymentReduction: 'Payment Reduction',
      termExtension: 'Term Extension',
      settlement: 'Settlement',
      reason: 'Reason for Hardship',
      monthlyIncome: 'Current Monthly Income',
      monthlyExpenses: 'Monthly Expenses',
      additionalInfo: 'Additional Information',
    },

    // Co-Signers
    cosigner: {
      title: 'Co-Signers',
      invite: 'Invite Co-Signer',
      coSignerEmail: 'Co-Signer Email',
      coSignerName: 'Co-Signer Name',
      liabilitySplit: 'Liability Split',
      sendInvitation: 'Send Invitation',
      pending: 'Pending',
      accepted: 'Accepted',
      declined: 'Declined',
    },

    // E-Signatures
    esignature: {
      title: 'E-Signatures',
      requestSignature: 'Request Signature',
      documentType: 'Document Type',
      signerName: 'Signer Name',
      signerEmail: 'Signer Email',
      documentTitle: 'Document Title',
      send: 'Send for Signature',
      signed: 'Signed',
      pending: 'Pending',
      expired: 'Expired',
    },
  },
};

// Spanish translations
const es = {
  translation: {
    // Common
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      submit: 'Enviar',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      search: 'Buscar',
      filter: 'Filtrar',
      yes: 'Sí',
      no: 'No',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      continue: 'Continuar',
      confirm: 'Confirmar',
      download: 'Descargar',
      upload: 'Subir',
      view: 'Ver',
      actions: 'Acciones',
      status: 'Estado',
      date: 'Fecha',
      amount: 'Monto',
      total: 'Total',
      from: 'Desde',
      to: 'Hasta',
    },

    // Navigation
    nav: {
      home: 'Inicio',
      dashboard: 'Panel',
      apply: 'Solicitar',
      loans: 'Préstamos',
      payments: 'Pagos',
      profile: 'Perfil',
      settings: 'Configuración',
      support: 'Soporte',
      logout: 'Cerrar Sesión',
      admin: 'Administrador',
    },

    // Home Page
    home: {
      title: 'Bienvenido a AmeriLend',
      subtitle: 'Su socio de confianza para préstamos personales',
      getStarted: 'Comenzar',
      learnMore: 'Saber Más',
      hero: {
        title: 'Obtenga el Apoyo Financiero que Necesita, Rápido',
        subtitle: 'Aprobación rápida, tasas competitivas y términos flexibles adaptados a sus necesidades',
        applyNow: 'Solicitar Ahora',
        checkRates: 'Verificar Tasas',
      },
      features: {
        fast: 'Aprobación Rápida',
        fastDesc: 'Aprobación en minutos',
        secure: 'Proceso Seguro',
        secureDesc: 'Seguridad bancaria',
        support: 'Soporte 24/7',
        supportDesc: 'Estamos aquí para ayudar',
        title: '¿Por Qué Elegir AmeriLend?',
        quickApproval: 'Aprobación Rápida',
        quickApprovalDesc: 'Obtenga aprobación en tan solo 5 minutos con nuestro proceso de solicitud simplificado',
        competitiveRates: 'Tasas Competitivas',
        competitiveRatesDesc: 'Disfrute de algunas de las tasas de interés más competitivas del mercado',
        secureTitle: 'Seguro y Protegido',
        secureTitleDesc: 'Seguridad de nivel bancario para proteger su información personal y financiera',
        support247: 'Soporte al Cliente 24/7',
        support247Desc: 'Nuestro equipo dedicado siempre está aquí para ayudarle con cualquier pregunta',
        flexibleTerms: 'Términos Flexibles',
        flexibleTermsDesc: 'Elija términos de pago que funcionen mejor para su presupuesto y estilo de vida',
        noHiddenFees: 'Sin Tarifas Ocultas',
        noHiddenFeesDesc: 'Transparencia completa con todos los costos claramente delineados por adelantado',
      },
      about: {
        title: 'Acerca de Nosotros',
        description: 'AmeriLend está comprometido a proporcionar soluciones financieras accesibles para ayudarle a alcanzar sus metas',
      },
      faq: {
        title: 'Preguntas Frecuentes',
        q1: '¿Qué tan rápido puedo ser aprobado?',
        a1: 'La mayoría de las solicitudes se revisan en minutos. Puede esperar una decisión en menos de 24 horas.',
        q2: '¿Qué necesito para solicitar?',
        a2: 'Necesitará una identificación válida, comprobante de ingresos e información de cuenta bancaria para completar su solicitud.',
        q3: '¿Cuáles son las tasas de interés?',
        a3: 'Las tasas de interés varían según su perfil crediticio y monto del préstamo. Verifique su tasa sin impacto en su puntaje de crédito.',
        q4: '¿Puedo pagar mi préstamo antes de tiempo?',
        a4: '¡Sí! No hay penalidades por pago anticipado. Puede liquidar su préstamo antes para ahorrar en intereses.',
        q5: '¿Cómo recibo mis fondos?',
        a5: 'Una vez aprobado, los fondos generalmente se depositan directamente en su cuenta bancaria dentro de 1-2 días hábiles.',
      },
      cta: {
        readyToStart: '¿Listo para Comenzar?',
        applyToday: 'Solicite hoy y obtenga los fondos que necesita',
        applyNow: 'Solicitar Ahora',
        contactUs: 'Contáctenos',
      },
      nav: {
        loans: 'Préstamos',
        about: 'Acerca de Nosotros',
        help: 'Ayuda',
        login: 'Iniciar Sesión',
        signup: 'Registrarse',
      },
    },

    // Loan Application
    apply: {
      title: 'Solicitar un Préstamo',
      personalInfo: 'Información Personal',
      firstName: 'Nombre',
      lastName: 'Apellido',
      email: 'Correo Electrónico',
      phone: 'Número de Teléfono',
      ssn: 'Número de Seguro Social',
      dob: 'Fecha de Nacimiento',
      loanDetails: 'Detalles del Préstamo',
      loanAmount: 'Monto del Préstamo',
      loanPurpose: 'Propósito del Préstamo',
      term: 'Plazo (meses)',
      employmentInfo: 'Información de Empleo',
      employer: 'Nombre del Empleador',
      jobTitle: 'Título del Trabajo',
      annualIncome: 'Ingreso Anual',
      startDate: 'Fecha de Inicio de Empleo',
      bankInfo: 'Información Bancaria',
      accountNumber: 'Número de Cuenta',
      routingNumber: 'Número de Ruta',
      submitApplication: 'Enviar Solicitud',
      submitting: 'Enviando...',
    },

    // Dashboard
    dashboard: {
      welcome: 'Bienvenido de nuevo',
      activeLoans: 'Préstamos Activos',
      pendingPayment: 'Pago Pendiente',
      totalPaid: 'Total Pagado',
      creditScore: 'Puntaje de Crédito',
      recentActivity: 'Actividad Reciente',
      upcomingPayments: 'Próximos Pagos',
      quickActions: 'Acciones Rápidas',
      makePayment: 'Hacer un Pago',
      viewLoans: 'Ver Préstamos',
      applyLoan: 'Solicitar Préstamo',
    },

    // Payments
    payments: {
      title: 'Pagos',
      history: 'Historial de Pagos',
      makePayment: 'Hacer un Pago',
      selectLoan: 'Seleccionar Préstamo',
      paymentAmount: 'Monto del Pago',
      paymentMethod: 'Método de Pago',
      bankAccount: 'Cuenta Bancaria',
      debitCard: 'Tarjeta de Débito',
      creditCard: 'Tarjeta de Crédito',
      payNow: 'Pagar Ahora',
      scheduledPayments: 'Pagos Programados',
      autoPayEnabled: 'Pago Automático Activado',
      dueDate: 'Fecha de Vencimiento',
      amountDue: 'Monto Adeudado',
      minimumPayment: 'Pago Mínimo',
      paymentConfirmation: 'Confirmación de Pago',
      confirmationNumber: 'Número de Confirmación',
    },

    // Loan Details
    loan: {
      details: 'Detalles del Préstamo',
      loanNumber: 'Número de Préstamo',
      principal: 'Monto Principal',
      interestRate: 'Tasa de Interés',
      remainingBalance: 'Saldo Restante',
      nextPayment: 'Próximo Pago',
      payoffAmount: 'Monto de Liquidación',
      originationDate: 'Fecha de Origen',
      maturityDate: 'Fecha de Vencimiento',
      monthlyPayment: 'Pago Mensual',
      totalInterest: 'Interés Total',
      paymentSchedule: 'Calendario de Pagos',
      loanDocuments: 'Documentos del Préstamo',
      loanAgreement: 'Acuerdo de Préstamo',
      promissoryNote: 'Pagaré',
    },

    // Profile
    profile: {
      title: 'Perfil',
      personalInfo: 'Información Personal',
      contactInfo: 'Información de Contacto',
      address: 'Dirección',
      city: 'Ciudad',
      state: 'Estado',
      zipCode: 'Código Postal',
      updateProfile: 'Actualizar Perfil',
      changePassword: 'Cambiar Contraseña',
      currentPassword: 'Contraseña Actual',
      newPassword: 'Nueva Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      twoFactorAuth: 'Autenticación de Dos Factores',
      enableTwoFactor: 'Activar 2FA',
      disableTwoFactor: 'Desactivar 2FA',
    },

    // Settings
    settings: {
      title: 'Configuración',
      language: 'Idioma',
      notifications: 'Notificaciones',
      emailNotifications: 'Notificaciones por Correo',
      smsNotifications: 'Notificaciones por SMS',
      pushNotifications: 'Notificaciones Push',
      paymentReminders: 'Recordatorios de Pago',
      loanUpdates: 'Actualizaciones de Préstamo',
      marketingEmails: 'Correos de Marketing',
      privacy: 'Privacidad',
      security: 'Seguridad',
      preferences: 'Preferencias',
    },

    // Support
    support: {
      title: 'Centro de Soporte',
      contactUs: 'Contáctenos',
      helpCenter: 'Centro de Ayuda',
      faq: 'Preguntas Frecuentes',
      submitTicket: 'Enviar un Ticket',
      subject: 'Asunto',
      message: 'Mensaje',
      category: 'Categoría',
      priority: 'Prioridad',
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente',
      liveChat: 'Chat en Vivo',
      startChat: 'Iniciar Chat',
      chatWithAgent: 'Chatear con un Agente',
    },

    // Admin
    admin: {
      dashboard: 'Panel de Administración',
      users: 'Usuarios',
      applications: 'Solicitudes',
      approvals: 'Aprobaciones',
      reports: 'Reportes',
      analytics: 'Analíticas',
      settings: 'Configuración',
      userManagement: 'Gestión de Usuarios',
      loanManagement: 'Gestión de Préstamos',
      fraudDetection: 'Detección de Fraude',
      collections: 'Cobranzas',
      marketing: 'Campañas de Marketing',
    },

    // Notifications
    notifications: {
      title: 'Notificaciones',
      markAllRead: 'Marcar Todas como Leídas',
      noNotifications: 'Sin notificaciones',
      paymentDue: 'Pago Vencido',
      paymentReceived: 'Pago Recibido',
      loanApproved: 'Préstamo Aprobado',
      loanDisbursed: 'Préstamo Desembolsado',
      documentReady: 'Documento Listo',
    },

    // Errors
    errors: {
      required: 'Este campo es obligatorio',
      invalidEmail: 'Correo electrónico inválido',
      invalidPhone: 'Número de teléfono inválido',
      invalidSSN: 'SSN inválido',
      passwordMismatch: 'Las contraseñas no coinciden',
      minLength: 'La longitud mínima es {{min}} caracteres',
      maxLength: 'La longitud máxima es {{max}} caracteres',
      minAmount: 'El monto mínimo es ${{min}}',
      maxAmount: 'El monto máximo es ${{max}}',
      networkError: 'Error de red. Por favor intente de nuevo.',
      unauthorized: 'No autorizado. Por favor inicie sesión.',
      sessionExpired: 'Sesión expirada. Por favor inicie sesión de nuevo.',
      serverError: 'Error del servidor. Por favor intente más tarde.',
    },

    // Success Messages
    success: {
      profileUpdated: 'Perfil actualizado exitosamente',
      passwordChanged: 'Contraseña cambiada exitosamente',
      paymentSubmitted: 'Pago enviado exitosamente',
      applicationSubmitted: 'Solicitud enviada exitosamente',
      documentDownloaded: 'Documento descargado exitosamente',
      preferencesSaved: 'Preferencias guardadas exitosamente',
    },

    // Financial Tools
    tools: {
      calculator: 'Calculadora de Préstamos',
      dtiCalculator: 'Calculadora DTI',
      budgetTool: 'Herramienta de Presupuesto',
      creditEducation: 'Educación de Crédito',
      monthlyIncome: 'Ingreso Mensual',
      monthlyDebts: 'Deudas Mensuales',
      calculate: 'Calcular',
      result: 'Resultado',
      yourDTI: 'Su Relación DTI',
    },

    // Hardship
    hardship: {
      title: 'Programas de Dificultades',
      applyForHelp: 'Solicitar Asistencia',
      programType: 'Tipo de Programa',
      forbearance: 'Indulgencia',
      paymentReduction: 'Reducción de Pago',
      termExtension: 'Extensión de Plazo',
      settlement: 'Liquidación',
      reason: 'Razón de Dificultad',
      monthlyIncome: 'Ingreso Mensual Actual',
      monthlyExpenses: 'Gastos Mensuales',
      additionalInfo: 'Información Adicional',
    },

    // Co-Signers
    cosigner: {
      title: 'Co-Firmantes',
      invite: 'Invitar Co-Firmante',
      coSignerEmail: 'Correo del Co-Firmante',
      coSignerName: 'Nombre del Co-Firmante',
      liabilitySplit: 'División de Responsabilidad',
      sendInvitation: 'Enviar Invitación',
      pending: 'Pendiente',
      accepted: 'Aceptado',
      declined: 'Rechazado',
    },

    // E-Signatures
    esignature: {
      title: 'Firmas Electrónicas',
      requestSignature: 'Solicitar Firma',
      documentType: 'Tipo de Documento',
      signerName: 'Nombre del Firmante',
      signerEmail: 'Correo del Firmante',
      documentTitle: 'Título del Documento',
      send: 'Enviar para Firma',
      signed: 'Firmado',
      pending: 'Pendiente',
      expired: 'Expirado',
    },
  },
};

// French translations
const fr = {
  translation: { ...en.translation },
};

// German translations
const de = {
  translation: { ...en.translation },
};

// Chinese (Simplified) translations
const zh = {
  translation: { ...en.translation },
};

// Japanese translations
const ja = {
  translation: { ...en.translation },
};

// Portuguese translations
const pt = {
  translation: { ...en.translation },
};

// Russian translations
const ru = {
  translation: { ...en.translation },
};

// Arabic translations
const ar = {
  translation: { ...en.translation },
};

// Hindi translations
const hi = {
  translation: { ...en.translation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en,
      es,
      fr,
      de,
      zh,
      ja,
      pt,
      ru,
      ar,
      hi,
    },
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
