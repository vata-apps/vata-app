import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

import enCommon from './locales/en/common.json';
import enTrees from './locales/en/trees.json';
import enIndividuals from './locales/en/individuals.json';
import enFamilies from './locales/en/families.json';
import enEvents from './locales/en/events.json';
import enPlaces from './locales/en/places.json';
import frCommon from './locales/fr/common.json';
import frTrees from './locales/fr/trees.json';
import frIndividuals from './locales/fr/individuals.json';
import frFamilies from './locales/fr/families.json';
import frEvents from './locales/fr/events.json';
import frPlaces from './locales/fr/places.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        trees: enTrees,
        individuals: enIndividuals,
        families: enFamilies,
        events: enEvents,
        places: enPlaces,
      },
      fr: {
        common: frCommon,
        trees: frTrees,
        individuals: frIndividuals,
        families: frFamilies,
        events: frEvents,
        places: frPlaces,
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
