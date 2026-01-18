import React, { useEffect, useState } from 'react';
import { X, Moon, Sun, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

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
      title: `Welcome, ${userName}! 🎉`,
      content: (
        <>
          <p className="text-muted-foreground mb-4">
            We're excited to have you here! Let's take a quick tour to help you get started.
          </p>
          <p className="text-muted-foreground">
            This will only take a moment, and you can skip it anytime.
          </p>
        </>
      ),
      icon: <Info className="h-6 w-6 text-primary" />,
    },
    {
      title: 'Dark Mode is Active 🌙',
      content: (
        <>
          <p className="text-muted-foreground mb-4">
            We've set your interface to <span className="font-semibold text-foreground">Dark Mode</span> by default to reduce eye strain and save battery life.
          </p>
          <p className="text-muted-foreground mb-4">
            You can switch between dark and light themes anytime by clicking the theme toggle button.
          </p>
          <div className="flex items-center gap-4 p-4 bg-accent/20 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Look for this button:</span>
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
      title: 'Where to Find It 📍',
      content: (
        <>
          <p className="text-muted-foreground mb-4">
            The theme toggle button is located in the <span className="font-semibold text-foreground">top-right corner</span> of your screen, next to your profile information.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg border border-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                1
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                Look at the top navigation bar on any page
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg border border-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                Find the {isDark ? 'moon' : 'sun'} icon button on the right side
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg border border-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                Click it to switch between dark and light modes
              </p>
            </div>
          </div>
        </>
      ),
      icon: <Sun className="h-6 w-6 text-primary" />,
    },
    {
      title: "You're All Set! ✨",
      content: (
        <>
          <p className="text-muted-foreground mb-4">
            That's it! You're ready to start using the platform.
          </p>
          <p className="text-muted-foreground mb-4">
            Remember, you can always change your theme preference using the toggle button in the top-right corner.
          </p>
          <p className="text-sm text-muted-foreground italic">
            Happy learning! 📚
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
              aria-label="Close tutorial"
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
              Skip Tutorial
            </Button>
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="px-6"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="px-6"
              >
                {isLastStep ? 'Get Started' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
