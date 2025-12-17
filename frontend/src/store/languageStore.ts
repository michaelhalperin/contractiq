import { create } from 'zustand';
import type { Language } from '../../../shared/types';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  initializeLanguage: (userLanguage?: Language) => void;
}

// Load from localStorage
const loadFromStorage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem('language');
    if (stored && (stored === 'en' || stored === 'he')) {
      return stored as Language;
    }
  } catch (e) {
    console.warn('Failed to load language from localStorage', e);
  }
  return 'en';
};

// Save to localStorage
const saveToStorage = (language: Language) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('language', language);
    // Update document direction
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  } catch (e) {
    console.warn('Failed to save language to localStorage', e);
  }
};

export const useLanguageStore = create<LanguageState>((set) => {
  const initialState = loadFromStorage();
  
  // Apply initial language settings
  if (typeof window !== 'undefined') {
    saveToStorage(initialState);
  }

  return {
    language: initialState,
    setLanguage: (language: Language) => {
      set({ language });
      saveToStorage(language);
    },
    initializeLanguage: (userLanguage?: Language) => {
      // Use user's saved language if available, otherwise use persisted language
      const languageToUse = userLanguage || loadFromStorage();
      set({ language: languageToUse });
      saveToStorage(languageToUse);
    },
  };
});

// Initialize on load
if (typeof window !== 'undefined') {
  const store = useLanguageStore.getState();
  saveToStorage(store.language);
}

