import type { Language } from '../../../shared/types';
import { useLanguageStore } from '../store/languageStore';

export type TranslationKey = 
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.close'
  | 'common.back'
  | 'common.next'
  | 'common.previous'
  | 'common.search'
  | 'common.filter'
  | 'common.sort'
  | 'common.actions'
  | 'common.backToHome'
  | 'common.welcome'
  | 'common.or'
  | 'common.and'
  | 'auth.login'
  | 'auth.logout'
  | 'auth.register'
  | 'auth.email'
  | 'auth.password'
  | 'auth.forgotPassword'
  | 'auth.resetPassword'
  | 'auth.name'
  | 'auth.currentPassword'
  | 'auth.newPassword'
  | 'auth.confirmPassword'
  | 'auth.changePassword'
  | 'auth.updateProfile'
  | 'auth.profile'
  | 'auth.settings'
  | 'auth.language'
  | 'auth.selectLanguage'
  | 'auth.signIn'
  | 'auth.createAccount'
  | 'auth.welcomeBack'
  | 'auth.loginFailed'
  | 'auth.invalidEmail'
  | 'auth.passwordRequired'
  | 'auth.passwordMinLength'
  | 'auth.passwordsDontMatch'
  | 'auth.nameOptional'
  | 'auth.signingIn'
  | 'auth.signInButton'
  | 'auth.forgotPasswordQuestion'
  | 'auth.noAccount'
  | 'auth.signUp'
  | 'auth.alreadyHaveAccount'
  | 'auth.signUpButton'
  | 'auth.creatingAccount'
  | 'auth.accountCreated'
  | 'dashboard.title'
  | 'dashboard.uploadContract'
  | 'dashboard.myContracts'
  | 'dashboard.noContracts'
  | 'dashboard.uploadNew'
  | 'dashboard.searchContracts'
  | 'dashboard.upgradePlan'
  | 'dashboard.noContractsFound'
  | 'dashboard.manageSubscription'
  | 'dashboard.unlockPremium'
  | 'dashboard.upload'
  | 'dashboard.bulkUpload'
  | 'dashboard.uploading'
  | 'dashboard.all'
  | 'dashboard.completed'
  | 'dashboard.processing'
  | 'dashboard.analytics'
  | 'dashboard.sortContracts'
  | 'dashboard.compare'
  | 'contract.analyzing'
  | 'contract.analysis'
  | 'contract.summary'
  | 'contract.risks'
  | 'contract.clauses'
  | 'contract.download'
  | 'contract.share'
  | 'contract.delete'
  | 'contract.upload'
  | 'contract.processing'
  | 'contract.completed'
  | 'contract.failed'
  | 'pricing.title'
  | 'pricing.selectPlan'
  | 'pricing.monthly'
  | 'pricing.annually'
  | 'pricing.currentPlan'
  | 'pricing.upgrade'
  | 'pricing.downgrade'
  | 'pricing.features'
  | 'pricing.unlimited'
  | 'landing.title'
  | 'landing.subtitle'
  | 'landing.getStarted'
  | 'landing.learnMore'
  | 'landing.features'
  | 'landing.testimonials'
  | 'landing.faq'
  | 'landing.backToHome'
  | 'landing.howItWorks'
  | 'landing.pricing'
  | 'landing.signIn'
  | 'landing.lovedByUsers'
  | 'landing.heroTitle1'
  | 'landing.heroTitle2'
  | 'landing.heroSubtitle1'
  | 'landing.heroSubtitle2'
  | 'landing.capabilityUnlimited'
  | 'landing.capabilityFormats'
  | 'landing.capabilityAI'
  | 'landing.capabilityRisk'
  | 'landing.statTime'
  | 'landing.statContracts'
  | 'landing.statUptime'
  | 'landing.featureAITitle'
  | 'landing.featureAIDesc'
  | 'landing.featureAIBadge'
  | 'landing.featureRiskTitle'
  | 'landing.featureRiskDesc'
  | 'landing.featureRiskBadge'
  | 'landing.featurePlainTitle'
  | 'landing.featurePlainDesc'
  | 'landing.featurePlainBadge'
  | 'landing.featureFastTitle'
  | 'landing.featureFastDesc'
  | 'landing.featureFastBadge'
  | 'landing.featureInsightsTitle'
  | 'landing.featureInsightsDesc'
  | 'landing.featureInsightsBadge'
  | 'landing.featureSecureTitle'
  | 'landing.featureSecureDesc'
  | 'landing.featureSecureBadge'
  | 'footer.privacy'
  | 'footer.terms'
  | 'footer.contact'
  | 'footer.copyright';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.actions': 'Actions',
    'common.backToHome': 'Back to Home',
    'common.welcome': 'Welcome',
    'common.or': 'or',
    'common.and': 'and',
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot Password',
    'auth.resetPassword': 'Reset Password',
    'auth.name': 'Name',
    'auth.currentPassword': 'Current Password',
    'auth.newPassword': 'New Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.changePassword': 'Change Password',
    'auth.updateProfile': 'Update Profile',
    'auth.profile': 'Profile',
    'auth.settings': 'Settings',
    'auth.language': 'Language',
    'auth.selectLanguage': 'Select Language',
    'auth.signIn': 'Sign in to your account',
    'auth.createAccount': 'Create your account',
    'auth.welcomeBack': 'Welcome back!',
    'auth.loginFailed': 'Login failed',
    'auth.invalidEmail': 'Invalid email address',
    'auth.passwordRequired': 'Password is required',
    'auth.passwordMinLength': 'Password must be at least 8 characters',
    'auth.passwordsDontMatch': "Passwords don't match",
    'auth.nameOptional': 'Name (optional)',
    'auth.signingIn': 'Signing in...',
    'auth.signInButton': 'Sign In',
    'auth.forgotPasswordQuestion': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.signUp': 'Sign up',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.signUpButton': 'Sign Up',
    'auth.creatingAccount': 'Creating account...',
    'auth.accountCreated': 'Account created successfully!',
    'dashboard.title': 'Dashboard',
    'dashboard.uploadContract': 'Upload Contract',
    'dashboard.myContracts': 'My Contracts',
    'dashboard.noContracts': 'No contracts yet',
    'dashboard.uploadNew': 'Upload your first contract',
    'dashboard.searchContracts': 'Search contracts...',
    'dashboard.upgradePlan': 'Upgrade Plan',
    'dashboard.noContractsFound': 'No contracts found',
    'dashboard.manageSubscription': 'Manage Subscription',
    'dashboard.unlockPremium': 'Unlock premium features',
    'dashboard.upload': 'Upload',
    'dashboard.bulkUpload': 'Bulk Upload',
    'dashboard.uploading': 'Uploading...',
    'dashboard.all': 'All',
    'dashboard.completed': 'Completed',
    'dashboard.processing': 'Processing',
    'dashboard.analytics': 'Analytics',
    'dashboard.sortContracts': 'Sort contracts',
    'dashboard.compare': 'Compare',
    'contract.analyzing': 'Analyzing...',
    'contract.analysis': 'Analysis',
    'contract.summary': 'Summary',
    'contract.risks': 'Risks',
    'contract.clauses': 'Clauses',
    'contract.download': 'Download',
    'contract.share': 'Share',
    'contract.delete': 'Delete',
    'contract.upload': 'Upload',
    'contract.processing': 'Processing',
    'contract.completed': 'Completed',
    'contract.failed': 'Failed',
    'pricing.title': 'Pricing',
    'pricing.selectPlan': 'Select Plan',
    'pricing.monthly': 'Monthly',
    'pricing.annually': 'Annually',
    'pricing.currentPlan': 'Current Plan',
    'pricing.upgrade': 'Upgrade',
    'pricing.downgrade': 'Downgrade',
    'pricing.features': 'Features',
    'pricing.unlimited': 'Unlimited',
    'landing.title': 'ContractIQ',
    'landing.subtitle': 'AI-Powered Contract Analysis',
    'landing.getStarted': 'Get Started',
    'landing.learnMore': 'Learn More',
    'landing.features': 'Features',
    'landing.testimonials': 'Testimonials',
    'landing.faq': 'FAQ',
    'landing.backToHome': 'Back to Home',
    'landing.howItWorks': 'How It Works',
    'landing.pricing': 'Pricing',
    'landing.signIn': 'Sign In',
    'landing.lovedByUsers': 'Loved by 10,000+ Users',
    'landing.heroTitle1': 'Answers You Can Trust.',
    'landing.heroTitle2': 'Sources You Can See.',
    'landing.heroSubtitle1': 'AI-powered contract analysis that saves you time and money.',
    'landing.heroSubtitle2': 'Understand any contract in plain English—no legal degree required.',
    'landing.capabilityUnlimited': 'Unlimited Contracts',
    'landing.capabilityFormats': 'PDF, DOCX, TXT',
    'landing.capabilityAI': 'AI Analysis',
    'landing.capabilityRisk': 'Risk Detection',
    'landing.statTime': 'Average Analysis Time',
    'landing.statContracts': 'Contracts Analyzed',
    'landing.statUptime': 'Uptime',
    'landing.featureAITitle': 'AI-Powered Analysis',
    'landing.featureAIDesc': 'Advanced AI technology analyzes your contracts in seconds, extracting key information and identifying potential issues.',
    'landing.featureAIBadge': 'Core Feature',
    'landing.featureRiskTitle': 'Risk Detection',
    'landing.featureRiskDesc': 'Automatically flags red flags like non-compete clauses, auto-renewal terms, and liability issues before you sign.',
    'landing.featureRiskBadge': 'Smart Alerts',
    'landing.featurePlainTitle': 'Plain English Summaries',
    'landing.featurePlainDesc': 'Complex legal jargon translated into clear, understandable language so you know exactly what you\'re agreeing to.',
    'landing.featurePlainBadge': 'Easy to Understand',
    'landing.featureFastTitle': 'Lightning Fast',
    'landing.featureFastDesc': 'Get comprehensive contract analysis in under 60 seconds. No waiting, no delays, just instant insights.',
    'landing.featureFastBadge': '60s Average',
    'landing.featureInsightsTitle': 'Detailed Insights',
    'landing.featureInsightsDesc': 'Every legal term and clause explained in detail, helping you understand the fine print without a law degree.',
    'landing.featureInsightsBadge': 'Comprehensive',
    'landing.featureSecureTitle': 'Secure & Private',
    'landing.featureSecureDesc': 'Your contracts are encrypted and stored securely. We never share your data with third parties.',
    'landing.featureSecureBadge': 'Enterprise Grade',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.contact': 'Contact',
    'footer.copyright': '© 2024 ContractIQ. All rights reserved.',
  },
  he: {
    'common.loading': 'טוען...',
    'common.error': 'שגיאה',
    'common.success': 'הצלחה',
    'common.save': 'שמור',
    'common.cancel': 'ביטול',
    'common.delete': 'מחק',
    'common.edit': 'ערוך',
    'common.close': 'סגור',
    'common.back': 'חזור',
    'common.next': 'הבא',
    'common.previous': 'הקודם',
    'common.search': 'חפש',
    'common.filter': 'סנן',
    'common.sort': 'מיין',
    'common.actions': 'פעולות',
    'common.backToHome': 'חזור לדף הבית',
    'common.welcome': 'ברוך הבא',
    'common.or': 'או',
    'common.and': 'וגם',
    'auth.login': 'התחבר',
    'auth.logout': 'התנתק',
    'auth.register': 'הרשמה',
    'auth.email': 'אימייל',
    'auth.password': 'סיסמה',
    'auth.forgotPassword': 'שכחתי סיסמה',
    'auth.resetPassword': 'איפוס סיסמה',
    'auth.name': 'שם',
    'auth.currentPassword': 'סיסמה נוכחית',
    'auth.newPassword': 'סיסמה חדשה',
    'auth.confirmPassword': 'אימות סיסמה',
    'auth.changePassword': 'שנה סיסמה',
    'auth.updateProfile': 'עדכן פרופיל',
    'auth.profile': 'פרופיל',
    'auth.settings': 'הגדרות',
    'auth.language': 'שפה',
    'auth.selectLanguage': 'בחר שפה',
    'auth.signIn': 'התחבר לחשבון שלך',
    'auth.createAccount': 'צור את החשבון שלך',
    'auth.welcomeBack': 'ברוך שובך!',
    'auth.loginFailed': 'ההתחברות נכשלה',
    'auth.invalidEmail': 'כתובת אימייל לא תקינה',
    'auth.passwordRequired': 'סיסמה נדרשת',
    'auth.passwordMinLength': 'הסיסמה חייבת להכיל לפחות 8 תווים',
    'auth.passwordsDontMatch': 'הסיסמאות לא תואמות',
    'auth.nameOptional': 'שם (אופציונלי)',
    'auth.signingIn': 'מתחבר...',
    'auth.signInButton': 'התחבר',
    'auth.forgotPasswordQuestion': 'שכחת סיסמה?',
    'auth.noAccount': 'אין לך חשבון?',
    'auth.signUp': 'הירשם',
    'auth.alreadyHaveAccount': 'כבר יש לך חשבון?',
    'auth.signUpButton': 'הירשם',
    'auth.creatingAccount': 'יוצר חשבון...',
    'auth.accountCreated': 'החשבון נוצר בהצלחה!',
    'dashboard.title': 'לוח בקרה',
    'dashboard.uploadContract': 'העלה חוזה',
    'dashboard.myContracts': 'החוזים שלי',
    'dashboard.noContracts': 'אין חוזים עדיין',
    'dashboard.uploadNew': 'העלה את החוזה הראשון שלך',
    'dashboard.searchContracts': 'חפש חוזים...',
    'dashboard.upgradePlan': 'שדרג תוכנית',
    'dashboard.noContractsFound': 'לא נמצאו חוזים',
    'dashboard.manageSubscription': 'נהל מנוי',
    'dashboard.unlockPremium': 'פתח תכונות פרימיום',
    'dashboard.upload': 'העלה',
    'dashboard.bulkUpload': 'העלאה מרובה',
    'dashboard.uploading': 'מעלה...',
    'dashboard.all': 'הכל',
    'dashboard.completed': 'הושלם',
    'dashboard.processing': 'מעבד',
    'dashboard.analytics': 'אנליטיקה',
    'dashboard.sortContracts': 'מיין חוזים',
    'dashboard.compare': 'השווה',
    'contract.analyzing': 'מנתח...',
    'contract.analysis': 'ניתוח',
    'contract.summary': 'סיכום',
    'contract.risks': 'סיכונים',
    'contract.clauses': 'סעיפים',
    'contract.download': 'הורד',
    'contract.share': 'שתף',
    'contract.delete': 'מחק',
    'contract.upload': 'העלה',
    'contract.processing': 'מעבד',
    'contract.completed': 'הושלם',
    'contract.failed': 'נכשל',
    'pricing.title': 'תמחור',
    'pricing.selectPlan': 'בחר תוכנית',
    'pricing.monthly': 'חודשי',
    'pricing.annually': 'שנתי',
    'pricing.currentPlan': 'תוכנית נוכחית',
    'pricing.upgrade': 'שדרג',
    'pricing.downgrade': 'הורד',
    'pricing.features': 'תכונות',
    'pricing.unlimited': 'ללא הגבלה',
    'landing.title': 'ContractIQ',
    'landing.subtitle': 'ניתוח חוזים מבוסס בינה מלאכותית',
    'landing.getStarted': 'התחל',
    'landing.learnMore': 'למד עוד',
    'landing.features': 'תכונות',
    'landing.testimonials': 'המלצות',
    'landing.faq': 'שאלות נפוצות',
    'landing.backToHome': 'חזור לדף הבית',
    'landing.howItWorks': 'איך זה עובד',
    'landing.pricing': 'תמחור',
    'landing.signIn': 'התחבר',
    'landing.lovedByUsers': 'אהוב על ידי 10,000+ משתמשים',
    'landing.heroTitle1': 'תשובות שאתה יכול לסמוך עליהן.',
    'landing.heroTitle2': 'מקורות שאתה יכול לראות.',
    'landing.heroSubtitle1': 'ניתוח חוזים מבוסס בינה מלאכותית שחוסך לך זמן וכסף.',
    'landing.heroSubtitle2': 'הבן כל חוזה באנגלית פשוטה—ללא צורך בתואר במשפטים.',
    'landing.capabilityUnlimited': 'חוזים ללא הגבלה',
    'landing.capabilityFormats': 'PDF, DOCX, TXT',
    'landing.capabilityAI': 'ניתוח בינה מלאכותית',
    'landing.capabilityRisk': 'זיהוי סיכונים',
    'landing.statTime': 'זמן ניתוח ממוצע',
    'landing.statContracts': 'חוזים שניתחו',
    'landing.statUptime': 'זמינות',
    'landing.featureAITitle': 'ניתוח מבוסס בינה מלאכותית',
    'landing.featureAIDesc': 'טכנולוגיית בינה מלאכותית מתקדמת מנתחת את החוזים שלך תוך שניות, מחלצת מידע מפתח ומזהה בעיות פוטנציאליות.',
    'landing.featureAIBadge': 'תכונה מרכזית',
    'landing.featureRiskTitle': 'זיהוי סיכונים',
    'landing.featureRiskDesc': 'מסמן אוטומטית דגלים אדומים כמו סעיפי אי-תחרות, תנאי חידוש אוטומטי ובעיות אחריות לפני שאתה חותם.',
    'landing.featureRiskBadge': 'התראות חכמות',
    'landing.featurePlainTitle': 'סיכומים באנגלית פשוטה',
    'landing.featurePlainDesc': 'ז\'רגון משפטי מורכב מתורגם לשפה ברורה ומובנת כך שתדע בדיוק על מה אתה מסכים.',
    'landing.featurePlainBadge': 'קל להבנה',
    'landing.featureFastTitle': 'מהיר כבזק',
    'landing.featureFastDesc': 'קבל ניתוח חוזים מקיף תוך פחות מ-60 שניות. ללא המתנה, ללא עיכובים, רק תובנות מיידיות.',
    'landing.featureFastBadge': 'ממוצע 60 שניות',
    'landing.featureInsightsTitle': 'תובנות מפורטות',
    'landing.featureInsightsDesc': 'כל מונח משפטי וסעיף מוסבר בפירוט, עוזר לך להבין את הפרטים הקטנים ללא תואר במשפטים.',
    'landing.featureInsightsBadge': 'מקיף',
    'landing.featureSecureTitle': 'מאובטח ופרטי',
    'landing.featureSecureDesc': 'החוזים שלך מוצפנים ונשמרים בצורה מאובטחת. אנחנו לעולם לא משתפים את הנתונים שלך עם צדדים שלישיים.',
    'landing.featureSecureBadge': 'רמה ארגונית',
    'footer.privacy': 'מדיניות פרטיות',
    'footer.terms': 'תנאי שירות',
    'footer.contact': 'צור קשר',
    'footer.copyright': '© 2024 ContractIQ. כל הזכויות שמורות.',
  },
};

export const t = (key: TranslationKey, language?: Language): string => {
  const lang = language || useLanguageStore.getState().language;
  return translations[lang]?.[key] || translations.en[key] || key;
};

// Hook to use translations in components
export const useTranslation = () => {
  const language = useLanguageStore((state) => state.language);
  return (key: TranslationKey) => t(key, language);
};

export const getDirection = (language: Language): 'ltr' | 'rtl' => {
  return language === 'he' ? 'rtl' : 'ltr';
};
