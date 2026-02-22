import React, { useEffect, useState } from 'react';
import { X, Moon, Sun, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface WelcomeTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const WelcomeTutorial: React.FC<WelcomeTutorialProps> = ({
  isOpen,
  onClose,
  userName = 'there',
}) => {
  const { isDark } = useTheme();
  const { t } = useTranslation('tutorial');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Reset to first step when opened
      setStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = [
    {
      title: t('steps.step1.title', { name: userName }),
      content: (
        <>
          <p className="text-muted-foreground mb-4">
            {t('steps.step1.content1')}
          </p>
          <p className="text-muted-foreground">
            {t('steps.step1.content2')}
          </p>
        </>
      ),
      icon: <Info className="h-6 w-6 text-primary" />,
    },
    {
      title: t('steps.step2.title'),
      content: (
        <>
          <p className="text-muted-foreground mb-4">
            {t('steps.step2.content1')}
          </p>
          <p className="text-muted-foreground mb-4">
            {t('steps.step2.content2')}
          </p>
          <div className="flex items-center gap-4 p-4 bg-accent/20 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t('steps.step2.lookFor')}</span>
              <div className="relative h-9 w-9 rounded-lg border-2 border-primary bg-background flex items-center justify-center">
                {isDark ? (
                  <Moon className="h-4 w-4 text-primary" />
                ) : (
                  <Sun className="h-4 w-4 text-primary" />
                )}
              </div>
            </div>
          </div>
        </>
      ),
      icon: <Moon className="h-6 w-6 text-primary" />,
    },
    {
      title: t('steps.step3.title'),
      content: (
        <>
          <p className="text-muted-foreground mb-4">
            {t('steps.step3.content')}
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg border border-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                1
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                {t('steps.step3.step1')}
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg border border-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                {isDark ? t('steps.step3.step2Moon') : t('steps.step3.step2Sun')}
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg border border-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                {t('steps.step3.step3')}
              </p>
            </div>
          </div>
        </>
      ),
      icon: <Sun className="h-6 w-6 text-primary" />,
    },
    {
      title: t('steps.step4.title'),
      content: (
        <>
          <p className="text-muted-foreground mb-4">
            {t('steps.step4.content1')}
          </p>
          <p className="text-muted-foreground mb-4">
            {t('steps.step4.content2')}
          </p>
          <p className="text-sm text-muted-foreground italic">
            {t('steps.step4.content3')}
          </p>
        </>
      ),
      icon: <Info className="h-6 w-6 text-primary" />,
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const isFirstStep = step === 0;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-card border border-border rounded-xl shadow-2xl p-6 m-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                {currentStep.icon}
              </div>
              <h2 className="text-2xl font-semibold text-foreground">
                {currentStep.title}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-lg"
              aria-label={t('ariaClose')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-6 min-h-[200px]">{currentStep.content}</div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                  index === step
                    ? 'bg-primary'
                    : index < step
                    ? 'bg-primary/50'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t('buttons.skipTutorial')}
            </Button>
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="px-6"
                >
                  {t('buttons.back')}
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="px-6"
              >
                {isLastStep ? t('buttons.getStarted') : t('buttons.next')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
