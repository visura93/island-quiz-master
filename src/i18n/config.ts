import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enQuiz from './locales/en/quiz.json';
import enLanding from './locales/en/landing.json';
import enProfile from './locales/en/profile.json';
import enSocial from './locales/en/social.json';
import enResults from './locales/en/results.json';
import enAdmin from './locales/en/admin.json';
import enPayment from './locales/en/payment.json';
import enTutorial from './locales/en/tutorial.json';

// Sinhala
import siCommon from './locales/si/common.json';
import siAuth from './locales/si/auth.json';
import siDashboard from './locales/si/dashboard.json';
import siQuiz from './locales/si/quiz.json';
import siLanding from './locales/si/landing.json';
import siProfile from './locales/si/profile.json';
import siSocial from './locales/si/social.json';
import siResults from './locales/si/results.json';
import siAdmin from './locales/si/admin.json';
import siPayment from './locales/si/payment.json';
import siTutorial from './locales/si/tutorial.json';

// Tamil
import taCommon from './locales/ta/common.json';
import taAuth from './locales/ta/auth.json';
import taDashboard from './locales/ta/dashboard.json';
import taQuiz from './locales/ta/quiz.json';
import taLanding from './locales/ta/landing.json';
import taProfile from './locales/ta/profile.json';
import taSocial from './locales/ta/social.json';
import taResults from './locales/ta/results.json';
import taAdmin from './locales/ta/admin.json';
import taPayment from './locales/ta/payment.json';
import taTutorial from './locales/ta/tutorial.json';

export const SUPPORTED_LANGUAGES = ['en', 'si', 'ta'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const NAMESPACES = ['common', 'auth', 'dashboard', 'quiz', 'landing', 'profile', 'social', 'results', 'admin', 'payment', 'tutorial'] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        dashboard: enDashboard,
        quiz: enQuiz,
        landing: enLanding,
        profile: enProfile,
        social: enSocial,
        results: enResults,
        admin: enAdmin,
        payment: enPayment,
        tutorial: enTutorial,
      },
      si: {
        common: siCommon,
        auth: siAuth,
        dashboard: siDashboard,
        quiz: siQuiz,
        landing: siLanding,
        profile: siProfile,
        social: siSocial,
        results: siResults,
        admin: siAdmin,
        payment: siPayment,
        tutorial: siTutorial,
      },
      ta: {
        common: taCommon,
        auth: taAuth,
        dashboard: taDashboard,
        quiz: taQuiz,
        landing: taLanding,
        profile: taProfile,
        social: taSocial,
        results: taResults,
        admin: taAdmin,
        payment: taPayment,
        tutorial: taTutorial,
      },
    },
    lng: (localStorage.getItem('language') as SupportedLanguage) ?? 'en',
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: 'common',
    ns: NAMESPACES,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
  });

export default i18n;
