import { useEffect } from 'react';

interface UseQuizKeyboardOptions {
  enabled: boolean;
  optionCount: number;
  isLastQuestion: boolean;
  onSelectAnswer: (index: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onFlag: () => void;
  onSubmit: () => void;
}

export function useQuizKeyboard({
  enabled,
  optionCount,
  isLastQuestion,
  onSelectAnswer,
  onNext,
  onPrevious,
  onFlag,
  onSubmit,
}: UseQuizKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Ignore if any modifier key is held (Ctrl/Cmd/Alt) to avoid clashing with browser shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5': {
          const idx = Number(e.key) - 1;
          if (idx < optionCount) {
            e.preventDefault();
            onSelectAnswer(idx);
          }
          break;
        }
        case 'ArrowLeft':
          e.preventDefault();
          onPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNext();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          onFlag();
          break;
        case 'Enter':
          e.preventDefault();
          if (isLastQuestion) {
            onSubmit();
          } else {
            onNext();
          }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, optionCount, isLastQuestion, onSelectAnswer, onNext, onPrevious, onFlag, onSubmit]);
}
