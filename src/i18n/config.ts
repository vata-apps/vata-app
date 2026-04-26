import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enFamilies from './locales/en/families.json';
import enHome from './locales/en/home.json';
import enIndividuals from './locales/en/individuals.json';
import enRepositories from './locales/en/repositories.json';
import enSources from './locales/en/sources.json';
import enWorkspace from './locales/en/workspace.json';
import frCommon from './locales/fr/common.json';
import frFamilies from './locales/fr/families.json';
import frHome from './locales/fr/home.json';
import frIndividuals from './locales/fr/individuals.json';
import frRepositories from './locales/fr/repositories.json';
import frSources from './locales/fr/sources.json';
import frWorkspace from './locales/fr/workspace.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        families: enFamilies,
        home: enHome,
        individuals: enIndividuals,
        repositories: enRepositories,
        sources: enSources,
        workspace: enWorkspace,
      },
      fr: {
        common: frCommon,
        families: frFamilies,
        home: frHome,
        individuals: frIndividuals,
        repositories: frRepositories,
        sources: frSources,
        workspace: frWorkspace,
      },
    },
    defaultNS: 'common',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'vata-language',
      caches: ['localStorage'],
    },
  });

export default i18n;
