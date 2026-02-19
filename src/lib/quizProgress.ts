// Utility functions for managing quiz progress in localStorage

export interface QuizProgress {
  quizId: string;
  attemptId: string;
  quizTitle: string;
  currentQuestionIndex: number;
  selectedAnswers: { [questionId: string]: number };
  flaggedQuestions?: string[];
  timeRemaining: number; // in seconds
  initialTimeLimit: number; // in minutes
  totalQuestions: number;
  quizStartTime: string; // ISO string
  lastSavedAt: string; // ISO string
  quizData: {
    grade: string;
    medium: string;
    subject: string;
    paperType: string;
    quizType?: string;
    language?: string;
    topic?: string;
    term?: string;
  };
}

const STORAGE_KEY_PREFIX = 'quiz_progress_';
const INCOMPLETE_QUIZZES_KEY = 'incomplete_quizzes';

/**
 * Get storage key for a specific quiz
 */
const getStorageKey = (quizId: string): string => {
  return `${STORAGE_KEY_PREFIX}${quizId}`;
};

/**
 * Save quiz progress to localStorage
 */
export const saveQuizProgress = (progress: QuizProgress): void => {
  try {
    const key = getStorageKey(progress.quizId);
    const progressWithTimestamp = {
      ...progress,
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(progressWithTimestamp));

    // Also save to incomplete quizzes list
    const incompleteQuizzes = getIncompleteQuizzes();
    const existingIndex = incompleteQuizzes.findIndex(
      (q) => q.quizId === progress.quizId
    );

    const incompleteQuiz = {
      quizId: progress.quizId,
      quizTitle: progress.quizTitle,
      lastSavedAt: progressWithTimestamp.lastSavedAt,
      timeRemaining: progress.timeRemaining,
      currentQuestionIndex: progress.currentQuestionIndex,
      totalQuestions: progress.totalQuestions,
      quizData: progress.quizData,
    };

    if (existingIndex >= 0) {
      incompleteQuizzes[existingIndex] = incompleteQuiz;
    } else {
      incompleteQuizzes.push(incompleteQuiz);
    }

    localStorage.setItem(INCOMPLETE_QUIZZES_KEY, JSON.stringify(incompleteQuizzes));
  } catch (error) {
    console.error('Error saving quiz progress:', error);
  }
};

/**
 * Load quiz progress from localStorage
 */
export const loadQuizProgress = (quizId: string): QuizProgress | null => {
  try {
    const key = getStorageKey(quizId);
    const data = localStorage.getItem(key);
    if (!data) return null;

    const progress = JSON.parse(data) as QuizProgress;
    
    // Check if progress is too old (more than 7 days)
    const lastSaved = new Date(progress.lastSavedAt);
    const daysSinceSaved = (Date.now() - lastSaved.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceSaved > 7) {
      clearQuizProgress(quizId);
      return null;
    }

    return progress;
  } catch (error) {
    console.error('Error loading quiz progress:', error);
    return null;
  }
};

/**
 * Clear quiz progress from localStorage
 */
export const clearQuizProgress = (quizId: string): void => {
  try {
    const key = getStorageKey(quizId);
    localStorage.removeItem(key);

    // Remove from incomplete quizzes list
    const incompleteQuizzes = getIncompleteQuizzes();
    const filtered = incompleteQuizzes.filter((q) => q.quizId !== quizId);
    localStorage.setItem(INCOMPLETE_QUIZZES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error clearing quiz progress:', error);
  }
};

/**
 * Get all incomplete quizzes
 */
export interface IncompleteQuiz {
  quizId: string;
  quizTitle: string;
  lastSavedAt: string;
  timeRemaining: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  quizData: QuizProgress['quizData'];
}

export const getIncompleteQuizzes = (): IncompleteQuiz[] => {
  try {
    const data = localStorage.getItem(INCOMPLETE_QUIZZES_KEY);
    if (!data) return [];

    const quizzes = JSON.parse(data) as IncompleteQuiz[];
    
    // Filter out old quizzes (more than 7 days)
    const now = Date.now();
    const validQuizzes = quizzes.filter((quiz) => {
      const lastSaved = new Date(quiz.lastSavedAt);
      const daysSinceSaved = (now - lastSaved.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceSaved <= 7;
    });

    // Update storage if any were filtered out
    if (validQuizzes.length !== quizzes.length) {
      localStorage.setItem(INCOMPLETE_QUIZZES_KEY, JSON.stringify(validQuizzes));
    }

    return validQuizzes;
  } catch (error) {
    console.error('Error getting incomplete quizzes:', error);
    return [];
  }
};

/**
 * Format time remaining for display
 */
export const formatTimeRemaining = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

/**
 * Format last saved time for display
 */
export const formatLastSavedTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

