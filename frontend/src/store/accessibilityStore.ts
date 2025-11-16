import { create } from 'zustand';

interface AccessibilityState {
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  setFontSize: (size: 'small' | 'normal' | 'large' | 'extra-large') => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  reset: () => void;
}

const defaultState = {
  fontSize: 'normal' as const,
  highContrast: false,
  reducedMotion: false,
};

// Load from localStorage
const loadFromStorage = () => {
  if (typeof window === 'undefined') return defaultState;
  try {
    const stored = localStorage.getItem('accessibility-settings');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load accessibility settings from localStorage', e);
  }
  return defaultState;
};

// Save to localStorage (only save state properties, not methods)
const saveToStorage = (state: Pick<AccessibilityState, 'fontSize' | 'highContrast' | 'reducedMotion'>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('accessibility-settings', JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save accessibility settings to localStorage', e);
  }
};

export const useAccessibilityStore = create<AccessibilityState>((set) => {
  const initialState = loadFromStorage();
  
  // Apply initial settings
  if (typeof window !== 'undefined') {
    applyFontSize(initialState.fontSize);
    applyHighContrast(initialState.highContrast);
    applyReducedMotion(initialState.reducedMotion);
  }

  return {
    ...initialState,
    setFontSize: (size) => {
      set((state) => {
        const newState = { ...state, fontSize: size };
        saveToStorage({ fontSize: size, highContrast: state.highContrast, reducedMotion: state.reducedMotion });
        applyFontSize(size);
        return newState;
      });
    },
    setHighContrast: (enabled) => {
      set((state) => {
        const newState = { ...state, highContrast: enabled };
        saveToStorage({ fontSize: state.fontSize, highContrast: enabled, reducedMotion: state.reducedMotion });
        applyHighContrast(enabled);
        return newState;
      });
    },
    setReducedMotion: (enabled) => {
      set((state) => {
        const newState = { ...state, reducedMotion: enabled };
        saveToStorage({ fontSize: state.fontSize, highContrast: state.highContrast, reducedMotion: enabled });
        applyReducedMotion(enabled);
        return newState;
      });
    },
    reset: () => {
      saveToStorage(defaultState);
      applyFontSize('normal');
      applyHighContrast(false);
      applyReducedMotion(false);
      set(defaultState);
    },
  };
});

// Apply font size changes
function applyFontSize(size: 'small' | 'normal' | 'large' | 'extra-large') {
  const root = document.documentElement;
  const body = document.body;
  
  // Remove previous font size classes
  body.removeAttribute('data-font-size');
  
  // Set multiplier for CSS calculations
  const multipliers = {
    small: '0.875',
    normal: '1',
    large: '1.125',
    'extra-large': '1.25',
  };
  
  root.style.setProperty('--accessibility-font-size-multiplier', multipliers[size]);
  
  // Set base font size on html element
  const baseSizes = {
    small: '87.5%',
    normal: '100%',
    large: '112.5%',
    'extra-large': '125%',
  };
  
  root.style.fontSize = baseSizes[size];
  
  // Also set data attribute for more specific targeting
  if (size !== 'normal') {
    body.setAttribute('data-font-size', size);
  }
}

// Apply high contrast mode
function applyHighContrast(enabled: boolean) {
  const root = document.documentElement;
  if (enabled) {
    root.classList.add('high-contrast');
    root.style.setProperty('--contrast-bg', '#000000');
    root.style.setProperty('--contrast-text', '#ffffff');
    root.style.setProperty('--contrast-border', '#ffffff');
  } else {
    root.classList.remove('high-contrast');
    root.style.removeProperty('--contrast-bg');
    root.style.removeProperty('--contrast-text');
    root.style.removeProperty('--contrast-border');
  }
}

// Apply reduced motion
function applyReducedMotion(enabled: boolean) {
  const root = document.documentElement;
  if (enabled) {
    root.classList.add('reduced-motion');
    root.style.setProperty('--motion-duration', '0.01ms');
  } else {
    root.classList.remove('reduced-motion');
    root.style.removeProperty('--motion-duration');
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  const store = useAccessibilityStore.getState();
  applyFontSize(store.fontSize);
  applyHighContrast(store.highContrast);
  applyReducedMotion(store.reducedMotion);
}

