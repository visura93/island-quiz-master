import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface QuizPreferences {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

interface QuizPreferencesContextType extends QuizPreferences {
  toggleSound: () => void;
  toggleHaptic: () => void;
}

const STORAGE_KEY = 'quiz-preferences';

const defaults: QuizPreferences = {
  soundEnabled: true,
  hapticEnabled: true,
};

function loadPreferences(): QuizPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {
    // corrupted data – fall through
  }
  return defaults;
}

const QuizPreferencesContext = createContext<QuizPreferencesContextType | undefined>(undefined);

export const useQuizPreferences = () => {
  const ctx = useContext(QuizPreferencesContext);
  if (!ctx) throw new Error('useQuizPreferences must be used within QuizPreferencesProvider');
  return ctx;
};

export const QuizPreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<QuizPreferences>(loadPreferences);

  const persist = useCallback((next: QuizPreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const toggleSound = useCallback(() => {
    setPrefs(prev => {
      const next = { ...prev, soundEnabled: !prev.soundEnabled };
      persist(next);
      return next;
    });
  }, [persist]);

  const toggleHaptic = useCallback(() => {
    setPrefs(prev => {
      const next = { ...prev, hapticEnabled: !prev.hapticEnabled };
      persist(next);
      return next;
    });
  }, [persist]);

  return (
    <QuizPreferencesContext.Provider value={{ ...prefs, toggleSound, toggleHaptic }}>
      {children}
    </QuizPreferencesContext.Provider>
  );
};
