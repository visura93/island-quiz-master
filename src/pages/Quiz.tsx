import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Circle, 
  Play, 
  Pause,
  RotateCcw,
  BookOpen,
  XCircle,
  RotateCw,
  Maximize2,
  X as CloseIcon,
  Flag,
  AlertTriangle,
  Keyboard,
  HelpCircle
} from "lucide-react";
import { useQuizKeyboard } from "@/hooks/useQuizKeyboard";
import { useQuizSounds } from "@/hooks/useQuizSounds";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatTimeRemaining, formatLastSavedTime } from "@/lib/quizProgress";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, Question, QuizAnswer } from "@/lib/api";
import { OptimizedImage } from "@/components/OptimizedImage";
import { 
  saveQuizProgress, 
  loadQuizProgress, 
  clearQuizProgress,
  QuizProgress 
} from "@/lib/quizProgress";

interface QuizState {
  bundleId?: string;
  bundleTitle?: string;
  quizId?: string; // Individual quiz ID
  quizTitle?: string; // Individual quiz title
  grade: string;
  medium: string;
  subject: string;
  paperType: string;
  quizType?: string;
  language?: string;
  topic?: string;
  isQuickQuiz?: boolean; // Flag for Quick Quiz
  questionCount?: number; // For Quick Quiz
  timeLimit?: number; // For Quick Quiz
  questionsFrom?: string; // For Quick Quiz
}

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const quizData = location.state as QuizState;
  const pendingSubmissions = useRef<Promise<void>[]>([]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [selectedMultipleAnswers, setSelectedMultipleAnswers] = useState<{ [key: string]: number[] }>({}); // For multiple answers
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [attemptId, setAttemptId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [quizResult, setQuizResult] = useState<any>(null);
  const [initialQuestionCount, setInitialQuestionCount] = useState(0);
  const [initialTimeLimit, setInitialTimeLimit] = useState(0); // in minutes
  const [loadingQuizInfo, setLoadingQuizInfo] = useState(true);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [shouldResume, setShouldResume] = useState(false);
  const [savedProgress, setSavedProgress] = useState<QuizProgress | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [showReviewScreen, setShowReviewScreen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length > 0 ? questions.length : initialQuestionCount;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const { playClickSound, playCompletionSound, playTimerWarning } = useQuizSounds();

  // Check for saved progress and load quiz information when component mounts
  useEffect(() => {
    const loadQuizInfo = async () => {
      if (!quizData) return;
      
      try {
        setLoadingQuizInfo(true);
        
        // For Quick Quiz, set the title and skip loading from database
        if (quizData.isQuickQuiz) {
          setQuizTitle("Quick Quiz");
          setInitialQuestionCount(quizData.questionCount || 20);
          setInitialTimeLimit(quizData.timeLimit || 30);
          setLoadingQuizInfo(false);
          return;
        }
        
        // Check for saved progress
        if (quizData.quizId) {
          const saved = loadQuizProgress(quizData.quizId);
          if (saved) {
            setSavedProgress(saved);
            // Don't auto-resume, let user decide via dialog
          }
        }
        
        // If we have a quizId, load the quiz directly
        if (quizData.quizId) {
          const quiz = await apiService.getQuiz(quizData.quizId);
          setInitialQuestionCount(quiz.questionCount || 0);
          setInitialTimeLimit(quiz.timeLimit || 0);
          setQuizTitle(quiz.title || quizData.quizTitle || "");
        } else if (quizData.bundleId) {
          // Fallback: Get the bundle to find the quiz details (for backward compatibility)
          const bundles = await apiService.getQuizBundles(
            quizData.grade || "",
            quizData.medium || "",
            quizData.subject || "",
            quizData.paperType || ""
          );

          const bundle = bundles.find(b => b.id === quizData.bundleId);
          if (bundle && bundle.quizzes && bundle.quizzes.length > 0) {
            const quiz = bundle.quizzes[0];
            setInitialQuestionCount(quiz.questionCount || 0);
            setInitialTimeLimit(quiz.timeLimit || 0);
            setQuizTitle(quiz.title || quizData.bundleTitle || "");
          }
        }
      } catch (err: any) {
        console.error("Error loading quiz info:", err);
        setError(err.message || "Failed to load quiz information");
      } finally {
        setLoadingQuizInfo(false);
      }
    };

    loadQuizInfo();
  }, [quizData]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  // Save progress periodically while quiz is in progress
  useEffect(() => {
    if (!isQuizStarted || !attemptId || !quizData.quizId) return;

    const saveInterval = setInterval(() => {
      const progress: QuizProgress = {
        quizId: quizData.quizId!,
        attemptId,
        quizTitle,
        currentQuestionIndex,
        selectedAnswers,
        flaggedQuestions: Array.from(flaggedQuestions),
        timeRemaining,
        initialTimeLimit,
        totalQuestions,
        quizStartTime: quizStartTime?.toISOString() || new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
        quizData: {
          grade: quizData.grade,
          medium: quizData.medium,
          subject: quizData.subject,
          paperType: quizData.paperType,
          quizType: quizData.quizType,
          language: quizData.language,
          topic: quizData.topic,
          term: (quizData as any).term,
        },
      };
      saveQuizProgress(progress);
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [isQuizStarted, attemptId, quizData, quizTitle, currentQuestionIndex, selectedAnswers, flaggedQuestions, timeRemaining, initialTimeLimit, totalQuestions, quizStartTime]);

  // Prefetch images for the next question
  useEffect(() => {
    if (!isQuizStarted || questions.length === 0) return;
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= questions.length) return;
    const nextQ = questions[nextIndex];
    if (nextQ.questionImage) {
      const img = new Image();
      img.src = nextQ.questionImage;
    }
    nextQ.optionImages?.forEach((url) => {
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [currentQuestionIndex, isQuizStarted, questions]);

  // Save progress on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isQuizStarted && attemptId && quizData.quizId) {
        const progress: QuizProgress = {
          quizId: quizData.quizId,
          attemptId,
          quizTitle,
          currentQuestionIndex,
          selectedAnswers,
          flaggedQuestions: Array.from(flaggedQuestions),
          timeRemaining,
          initialTimeLimit,
          totalQuestions,
          quizStartTime: quizStartTime?.toISOString() || new Date().toISOString(),
          lastSavedAt: new Date().toISOString(),
          quizData: {
            grade: quizData.grade,
            medium: quizData.medium,
            subject: quizData.subject,
            paperType: quizData.paperType,
            quizType: quizData.quizType,
            language: quizData.language,
            topic: quizData.topic,
            term: (quizData as any).term,
          },
        };
        saveQuizProgress(progress);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isQuizStarted, attemptId, quizData, quizTitle, currentQuestionIndex, selectedAnswers, flaggedQuestions, timeRemaining, initialTimeLimit, totalQuestions, quizStartTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine if timer should display in red (warning state)
  const shouldShowWarning = () => {
    if (initialTimeLimit < 5) {
      return timeRemaining <= 20;
    } else {
      return timeRemaining <= 60;
    }
  };

  const timerWarningFired = useRef(false);
  useEffect(() => {
    if (isQuizStarted && isTimerRunning && shouldShowWarning() && !timerWarningFired.current) {
      timerWarningFired.current = true;
      playTimerWarning();
    }
    if (!shouldShowWarning()) {
      timerWarningFired.current = false;
    }
  }, [timeRemaining, isQuizStarted, isTimerRunning]);

  const handleStartQuiz = async (resumeFromSaved: boolean = false) => {
    try {
      setLoading(true);
      setError("");

      // Check if this is a Quick Quiz
      if (quizData.isQuickQuiz && !resumeFromSaved) {
        // Start Quick Quiz with custom configuration
        const response = await apiService.startQuickQuiz({
          grade: quizData.grade,
          medium: quizData.medium,
          subject: quizData.subject,
          questionCount: quizData.questionCount || 20,
          timeLimit: quizData.timeLimit || 30,
          questionsFrom: quizData.questionsFrom || "all"
        });

        // Set the quiz data
        setQuestions(response.questions);
        setInitialTimeLimit(response.timeLimit || 0);
        setTimeRemaining(response.timeLimit * 60); // Convert minutes to seconds
        setAttemptId(response.attemptId);
        setQuizTitle(response.title || "Quick Quiz");
        setQuizStartTime(new Date());
        setIsQuizStarted(true);
        setIsTimerRunning(true);
        setLoading(false);
        return;
      }

      // Use quizId directly if available, otherwise get from bundle
      let quizId: string;
      
      if (quizData.quizId) {
        quizId = quizData.quizId;
      } else if (quizData.bundleId) {
        // Fallback: Get the first quiz from the bundle (for backward compatibility)
        const bundles = await apiService.getQuizBundles(
          quizData.grade || "",
          quizData.medium || "",
          quizData.subject || "",
          quizData.paperType || ""
        );

        const bundle = bundles.find(b => b.id === quizData.bundleId);
        if (!bundle || !bundle.quizzes || bundle.quizzes.length === 0) {
          setError("No quizzes found in this bundle");
          return;
        }

        // Get the first quiz ID from the bundle
        quizId = bundle.quizzes[0].id;
      } else {
        setError("No quiz ID or bundle ID provided");
        return;
      }

      // If resuming, restore from saved progress
      if (resumeFromSaved && savedProgress) {
        // Start the quiz to get fresh questions and new attemptId
        const response = await apiService.startQuiz(quizId);
        setQuestions(response.questions);
        
        // Restore saved state (use new attemptId from response, but restore progress)
        setAttemptId(response.attemptId); // Use new attemptId
        // Restore question index (clamp to valid range)
        const savedIndex = Math.min(savedProgress.currentQuestionIndex, response.questions.length - 1);
        setCurrentQuestionIndex(savedIndex);
        
        // Restore selected answers (only if question IDs match)
        const restoredAnswers: { [key: string]: number } = {};
        savedProgress.selectedAnswers && Object.entries(savedProgress.selectedAnswers).forEach(([questionId, answerIndex]) => {
          // Try to find matching question by checking if the question at the saved index matches
          // For simplicity, we'll restore answers that match question IDs in the new question set
          const question = response.questions.find(q => q.id === questionId);
          if (question) {
            restoredAnswers[questionId] = answerIndex;
          }
        });
        setSelectedAnswers(restoredAnswers);
        
        if (savedProgress.flaggedQuestions && savedProgress.flaggedQuestions.length > 0) {
          const restoredFlags = new Set(
            savedProgress.flaggedQuestions.filter(id => response.questions.some(q => q.id === id))
          );
          setFlaggedQuestions(restoredFlags);
        }
        
        // Restore time remaining (but don't exceed the new time limit)
        const newTimeLimit = response.timeLimit * 60; // Convert to seconds
        const savedTimeRemaining = Math.min(savedProgress.timeRemaining, newTimeLimit);
        setTimeRemaining(savedTimeRemaining);
        setInitialTimeLimit(response.timeLimit);
        setQuizStartTime(new Date(savedProgress.quizStartTime));
        setQuizTitle(response.title);
        setIsQuizStarted(true);
        setIsTimerRunning(true);
        setShouldResume(false);
        setSavedProgress(null);
      } else {
        // Start fresh quiz
        // Clear any existing progress
        if (quizId) {
          clearQuizProgress(quizId);
        }

        // Start the quiz and get questions and time limit from database
        const response = await apiService.startQuiz(quizId);

        // Set the quiz data (already sorted by backend)
        setQuestions(response.questions);
        setInitialTimeLimit(response.timeLimit || 0); // Store time limit in minutes
        setTimeRemaining(response.timeLimit * 60); // Convert minutes to seconds
        setAttemptId(response.attemptId);
        setQuizTitle(response.title);
        setQuizStartTime(new Date()); // Record when quiz started
        setIsQuizStarted(true);
        setIsTimerRunning(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to start quiz");
      console.error("Error starting quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answerIndex: number) => {
    if (!currentQuestion || !attemptId) return;

    playClickSound();

    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));

    // Submit answer to backend and track the promise
    const submissionPromise = (async () => {
      try {
        await apiService.submitAnswer(attemptId, currentQuestion.id, answerIndex);
      } catch (err) {
        console.error("Error submitting answer:", err);
        // Don't block UI on submit error, just log it
      }
    })();
    
    // Track pending submission
    pendingSubmissions.current.push(submissionPromise);
    
    // Clean up after completion
    submissionPromise.finally(() => {
      pendingSubmissions.current = pendingSubmissions.current.filter(p => p !== submissionPromise);
    });
  };

  const handleMultipleAnswerToggle = async (answerIndex: number) => {
    if (!currentQuestion || !attemptId) return;

    setSelectedMultipleAnswers(prev => {
      const currentAnswers = prev[currentQuestion.id] || [];
      let newAnswers: number[];
      
      if (currentAnswers.includes(answerIndex)) {
        // Remove answer
        newAnswers = currentAnswers.filter(idx => idx !== answerIndex);
      } else {
        // Add answer
        newAnswers = [...currentAnswers, answerIndex].sort((a, b) => a - b);
      }
      
      return {
        ...prev,
        [currentQuestion.id]: newAnswers
      };
    });

    // Submit multiple answers to backend and track the promise
    const submissionPromise = (async () => {
      try {
        const currentAnswers = selectedMultipleAnswers[currentQuestion.id] || [];
        const newAnswers = currentAnswers.includes(answerIndex)
          ? currentAnswers.filter(idx => idx !== answerIndex)
          : [...currentAnswers, answerIndex].sort((a, b) => a - b);
        
        await apiService.submitAnswer(
          attemptId, 
          currentQuestion.id, 
          newAnswers[0] || 0, // First answer as primary (for backward compatibility)
          newAnswers
        );
      } catch (err) {
        console.error("Error submitting answer:", err);
      }
    })();
    
    // Track pending submission
    pendingSubmissions.current.push(submissionPromise);
    
    // Clean up after completion
    submissionPromise.finally(() => {
      pendingSubmissions.current = pendingSubmissions.current.filter(p => p !== submissionPromise);
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  };

  const stableAnswerSelect = useCallback((idx: number) => handleAnswerSelect(idx), [currentQuestion, attemptId]);

  useQuizKeyboard({
    enabled: isQuizStarted && !showResults && !showReviewScreen && !showSubmitDialog && !fullscreenImage && isTimerRunning,
    optionCount: currentQuestion?.options?.length ?? 0,
    isLastQuestion: currentQuestionIndex >= totalQuestions - 1,
    onSelectAnswer: stableAnswerSelect,
    onNext: handleNextQuestion,
    onPrevious: handlePreviousQuestion,
    onFlag: handleToggleFlag,
    onSubmit: () => setShowReviewScreen(true),
  });

  const handleNavigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowReviewScreen(false);
  };

  const handleSubmitQuiz = async () => {
    setShowSubmitDialog(false);
    setShowReviewScreen(false);
    setIsTimerRunning(false);
    
    try {
      // Wait for all pending answer submissions to complete
      if (pendingSubmissions.current.length > 0) {
        await Promise.all(pendingSubmissions.current);
      }
      
      // Complete the quiz on backend and get results
      if (attemptId) {
        // Calculate time spent in seconds
        let timeSpentInSeconds = 0;
        
        if (quizStartTime) {
          // Calculate based on actual elapsed time
          const endTime = new Date();
          timeSpentInSeconds = Math.max(0, Math.floor((endTime.getTime() - quizStartTime.getTime()) / 1000));
        } else {
          // Fallback: Calculate based on timer (initial time limit - time remaining)
          const totalTimeInSeconds = initialTimeLimit * 60;
          timeSpentInSeconds = Math.max(0, totalTimeInSeconds - timeRemaining);
        }
        
        // Ensure at least 1 second if quiz was started (to avoid 0)
        if (timeSpentInSeconds === 0 && isQuizStarted) {
          timeSpentInSeconds = 1;
        }
        
        const result = await apiService.completeQuiz(attemptId, timeSpentInSeconds);
        setQuizResult(result);
        playCompletionSound();
        
        // Clear saved progress when quiz is completed
        if (quizData.quizId) {
          clearQuizProgress(quizData.quizId);
        }
      }
      setShowResults(true);
    } catch (err) {
      console.error("Error completing quiz:", err);
      setShowResults(true);
    }
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    // Reset to original time limit (convert from minutes to seconds if needed)
    // We'll need to store the original time limit
    setIsTimerRunning(false);
  };

  const getScore = () => {
    // Get score from backend result
    if (quizResult) {
      return quizResult.score || 0;
    }
    return 0;
  };

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
          <p className="text-muted-foreground mb-4">Please select a quiz from the dashboard.</p>
          <Button onClick={() => navigate('/student-dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/student-dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = getScore();
    const questionResults: QuizAnswer[] = quizResult?.questions || [];
    
    return (
      <div className="min-h-screen bg-gradient-mesh">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
              <CardDescription>Here are your results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Section */}
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">{score}%</div>
                <p className="text-lg text-muted-foreground">Your Score</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{quizResult?.correctAnswers || Object.keys(selectedAnswers).length}</div>
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">{quizResult?.totalQuestions || totalQuestions}</div>
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                </div>
              </div>

              {/* Question-by-Question Breakdown */}
              {questionResults.length > 0 && (
                <div className="space-y-4 mt-8">
                  <h3 className="text-xl font-semibold">Question Review</h3>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {questionResults.map((questionResult, index) => (
                      <Card 
                        key={questionResult.id || index} 
                        className={`border-2 ${
                          questionResult.isCorrect 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-lg">Question {index + 1}</span>
                              {questionResult.isCorrect ? (
                                <Badge className="bg-green-600">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Correct
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Incorrect
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            {questionResult.questionText && (
                              <p className="font-medium mb-2">{questionResult.questionText}</p>
                            )}
                            {questionResult.questionImage && (
                              <div className="mb-2 relative group">
                                <OptimizedImage 
                                  src={questionResult.questionImage} 
                                  alt="Question" 
                                  className="max-w-full h-auto max-h-96 rounded-lg border-2 border-border shadow-md cursor-pointer hover:border-primary transition-all"
                                  onImageClick={() => setFullscreenImage(questionResult.questionImage || null)}
                                  skeletonHeight="200px"
                                />
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFullscreenImage(questionResult.questionImage || null);
                                  }}
                                >
                                  <Maximize2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            {questionResult.options.map((option, optionIndex) => {
                              // Support both single and multiple correct answers
                              const correctIndexes = questionResult.correctAnswerIndexes || [questionResult.correctAnswerIndex];
                              const selectedIndexes = questionResult.selectedAnswerIndexes || [questionResult.selectedAnswerIndex];
                              
                              const isSelected = selectedIndexes.includes(optionIndex);
                              const isCorrect = correctIndexes.includes(optionIndex);
                              const optionImage = questionResult.optionImages?.[optionIndex];
                              
                              return (
                                <div
                                  key={optionIndex}
                                  className={`p-3 rounded-lg border-2 flex items-start gap-2 ${
                                    isCorrect
                                      ? 'border-green-500 bg-green-100'
                                      : isSelected && !isCorrect
                                      ? 'border-red-500 bg-red-100'
                                      : 'border-gray-200 bg-white'
                                  }`}
                                >
                                  {isCorrect && (
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  )}
                                  {isSelected && !isCorrect && (
                                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                  )}
                                  {!isSelected && !isCorrect && (
                                    <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                  )}
                                  <div className={`flex-1 ${
                                    isCorrect
                                      ? 'font-semibold text-green-900'
                                      : isSelected && !isCorrect
                                      ? 'font-semibold text-red-900'
                                      : 'text-gray-700'
                                  }`}>
                                    {option && (
                                      <span className="block mb-2">
                                    {String.fromCharCode(65 + optionIndex)}. {option}
                                  </span>
                                    )}
                                    {optionImage && (
                                      <div className="mt-2">
                                        <OptimizedImage 
                                          src={optionImage} 
                                          alt={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                          className="max-w-full h-auto max-h-64 rounded-lg border border-border"
                                          skeletonHeight="120px"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  {isCorrect && (
                                    <Badge className="bg-green-600 ml-auto flex-shrink-0">
                                      {correctIndexes.length > 1 ? `Correct (${correctIndexes.indexOf(optionIndex) + 1}/${correctIndexes.length})` : 'Correct Answer'}
                                    </Badge>
                                  )}
                                  {isSelected && !isCorrect && (
                                    <Badge variant="destructive" className="ml-auto flex-shrink-0">Your Answer</Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {questionResult.selectedAnswerIndex === -1 && (
                            <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
                              <strong>Note:</strong> You did not answer this question.
                            </div>
                          )}
                          
                          {questionResult.explanation && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                              <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                              <p className="text-sm text-blue-800">{questionResult.explanation}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4 pt-4 border-t">
                <Button 
                  onClick={() => navigate('/student-dashboard')} 
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                >
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isQuizStarted) {
  return (
    <div className="min-h-screen bg-gradient-mesh">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-2 shadow-elegant bg-gradient-card overflow-hidden">
          <CardHeader className="text-center relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-hero"></div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-hero rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-4xl bg-gradient-hero bg-clip-text text-transparent">
                  {quizTitle || quizData.bundleTitle}
                </CardTitle>
                <CardDescription className="text-lg">Get ready to test your knowledge!</CardDescription>
              </div>
            </div>
          </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="p-6 bg-primary/10 rounded-xl border-2 border-primary/20">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {loadingQuizInfo ? "..." : totalQuestions}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Questions</p>
                </div>
                <div className="p-6 bg-secondary/10 rounded-xl border-2 border-secondary/20">
                  <div className="text-4xl font-bold text-secondary mb-2">
                    {loadingQuizInfo 
                      ? "..." 
                      : initialTimeLimit > 0 
                        ? `${initialTimeLimit} min` 
                        : "N/A"}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Time Limit</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-6 border-2 border-muted">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Quiz Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="font-medium">Grade:</span> 
                    <span className="text-primary font-semibold">{quizData.grade}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="font-medium">Medium:</span> 
                    <span className="text-secondary font-semibold">{quizData.medium}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="font-medium">Subject:</span> 
                    <span className="text-accent font-semibold">{quizData.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                    <span className="font-medium">Type:</span> 
                    <span className="text-muted-foreground font-semibold">{quizData.paperType}</span>
                  </div>
                </div>
              </div>

              {/* Resume Quiz Dialog */}
              {savedProgress && (
                <AlertDialog open={!!savedProgress && !shouldResume} onOpenChange={(open) => {
                  if (!open) {
                    setSavedProgress(null);
                  }
                }}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Continue Your Quiz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You have an incomplete quiz attempt. Would you like to continue from where you left off?
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Progress:</span>
                            <span className="font-semibold">
                              Question {savedProgress.currentQuestionIndex + 1} of {savedProgress.totalQuestions}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Time Remaining:</span>
                            <span className="font-semibold">
                              {formatTimeRemaining(savedProgress.timeRemaining)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Last Saved:</span>
                            <span className="font-semibold">
                              {formatLastSavedTime(savedProgress.lastSavedAt)}
                            </span>
                          </div>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => {
                        if (quizData.quizId) {
                          clearQuizProgress(quizData.quizId);
                        }
                        setSavedProgress(null);
                      }}>
                        Start Fresh
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        setShouldResume(true);
                        handleStartQuiz(true);
                      }}>
                        <RotateCw className="h-4 w-4 mr-2" />
                        Continue Quiz
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <div className="space-y-4">
                {savedProgress ? (
                  <>
                    <Button 
                      onClick={() => {
                        setShouldResume(true);
                        handleStartQuiz(true);
                      }}
                      disabled={loading}
                      className="w-full bg-gradient-hero hover:opacity-90 btn-modern shadow-elegant hover:shadow-hover"
                      size="lg"
                    >
                      <RotateCw className="h-5 w-5 mr-2" />
                      {loading ? "Resuming Quiz..." : "Continue Quiz"}
                    </Button>
                    <Button 
                      onClick={() => {
                        if (quizData.quizId) {
                          clearQuizProgress(quizData.quizId);
                        }
                        setSavedProgress(null);
                        handleStartQuiz(false);
                      }}
                      disabled={loading}
                      variant="outline"
                      className="w-full btn-modern"
                      size="lg"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      {loading ? "Starting..." : "Start Fresh Quiz"}
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => handleStartQuiz(false)}
                    disabled={loading}
                    className="w-full bg-gradient-hero hover:opacity-90 btn-modern shadow-elegant hover:shadow-hover"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {loading ? "Starting Quiz..." : "Start Quiz"}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/student-dashboard')} 
                  className="w-full btn-modern"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-background/80 backdrop-blur-sm rounded-xl p-6 border-2 shadow-elegant">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/student-dashboard')}
              className="btn-modern"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                {quizTitle || quizData.bundleTitle}
              </h1>
              <p className="text-muted-foreground text-lg">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-colors ${
              shouldShowWarning() 
                ? 'bg-red-100 border-red-400 animate-pulse' 
                : 'bg-primary/10 border-primary/20'
            }`}>
              <Clock className={`h-5 w-5 ${shouldShowWarning() ? 'text-red-600' : 'text-primary'}`} />
              <span className={`font-mono text-xl font-bold ${shouldShowWarning() ? 'text-red-600' : 'text-primary'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePauseTimer}
                className="btn-modern"
              >
                {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResetTimer}
                className="btn-modern"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Progress</span>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3 bg-muted" />
        </div>

        <div className="flex gap-6 max-w-6xl mx-auto">
          {/* Question Navigator Sidebar */}
          {!showReviewScreen && questions.length > 0 && (
            <div className="hidden lg:block w-56 flex-shrink-0">
              <Card className="sticky top-8 border-2 shadow-elegant bg-gradient-card overflow-hidden">
                <CardHeader className="pb-3 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-hero"></div>
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {questions.map((q, i) => {
                      const isAnswered = selectedAnswers[q.id] !== undefined;
                      const isFlagged = flaggedQuestions.has(q.id);
                      const isCurrent = i === currentQuestionIndex;

                      let btnClass = 'bg-muted/60 text-muted-foreground hover:bg-muted';
                      if (isFlagged) {
                        btnClass = 'bg-amber-400 text-white hover:bg-amber-500 shadow-sm';
                      } else if (isAnswered) {
                        btnClass = 'bg-green-500 text-white hover:bg-green-600 shadow-sm';
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(i)}
                          className={`relative w-9 h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${btnClass} ${
                            isCurrent ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''
                          }`}
                        >
                          {i + 1}
                          {isFlagged && (
                            <Flag className="absolute -top-1 -right-1 h-2.5 w-2.5 text-amber-800 fill-amber-300" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="space-y-1.5 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500"></div>
                      <span className="text-xs text-muted-foreground">Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-amber-400"></div>
                      <span className="text-xs text-muted-foreground">Flagged</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-muted/60 border border-border"></div>
                      <span className="text-xs text-muted-foreground">Not Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded border-2 border-primary"></div>
                      <span className="text-xs text-muted-foreground">Current</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {showReviewScreen ? (
              /* Review Screen */
              <Card className="border-2 shadow-elegant bg-gradient-card overflow-hidden">
                <CardHeader className="relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-hero"></div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="p-2 bg-gradient-hero rounded-lg">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      Review Your Answers
                    </CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => setShowReviewScreen(false)}
                      className="btn-modern"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Quiz
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary Stats */}
                  {(() => {
                    const answeredCount = questions.filter(q => selectedAnswers[q.id] !== undefined).length;
                    const unansweredCount = questions.length - answeredCount;
                    const flaggedCount = flaggedQuestions.size;
                    return (
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                          <div className="text-2xl font-bold text-green-700">{answeredCount}</div>
                          <p className="text-sm font-medium text-green-600">Answered</p>
                        </div>
                        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                          <div className="text-2xl font-bold text-red-700">{unansweredCount}</div>
                          <p className="text-sm font-medium text-red-600">Not Answered</p>
                        </div>
                        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                          <div className="text-2xl font-bold text-amber-700">{flaggedCount}</div>
                          <p className="text-sm font-medium text-amber-600">Flagged</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Question List */}
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {questions.map((question, index) => {
                      const isAnswered = selectedAnswers[question.id] !== undefined;
                      const isFlagged = flaggedQuestions.has(question.id);
                      const answerLetter = isAnswered
                        ? String.fromCharCode(65 + selectedAnswers[question.id])
                        : null;

                      let rowClass = 'border-border bg-background hover:bg-muted/50';
                      if (isFlagged) {
                        rowClass = 'border-amber-300 bg-amber-50 hover:bg-amber-100';
                      } else if (!isAnswered) {
                        rowClass = 'border-red-300 bg-red-50 hover:bg-red-100';
                      } else {
                        rowClass = 'border-green-200 bg-green-50/50 hover:bg-green-50';
                      }

                      const numberBadgeClass = isFlagged
                        ? 'bg-amber-500 text-white'
                        : !isAnswered
                        ? 'bg-red-500 text-white'
                        : 'bg-green-600 text-white';

                      return (
                        <button
                          key={question.id}
                          onClick={() => handleNavigateToQuestion(index)}
                          className={`w-full p-4 text-left border-2 rounded-xl transition-all hover:shadow-md flex items-center justify-between gap-3 ${rowClass}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-base flex-shrink-0 shadow-sm ${numberBadgeClass}`}>
                              {index + 1}
                            </div>
                            <span className="text-muted-foreground font-medium">-</span>
                            {isFlagged ? (
                              <div className="flex items-center gap-2">
                                <Flag className="h-4 w-4 text-amber-600 fill-amber-500" />
                                <span className="font-semibold text-amber-700">
                                  Flag - Need to retry
                                </span>
                              </div>
                            ) : isAnswered ? (
                              <span className="font-bold text-green-700 text-lg">({answerLetter})</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span className="font-semibold text-red-600">Not Answered</span>
                              </div>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Submit Now */}
                  <div className="pt-6 border-t space-y-3">
                    <Button
                      onClick={() => setShowSubmitDialog(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white btn-modern shadow-elegant hover:shadow-hover"
                      size="lg"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Submit Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReviewScreen(false)}
                      className="w-full btn-modern"
                      size="lg"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Question Card */
              <Card className="border-2 shadow-elegant bg-gradient-card overflow-hidden">
                <CardHeader className="relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-hero"></div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="p-2 bg-gradient-hero rounded-lg">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      Question {currentQuestionIndex + 1}
                    </CardTitle>
                    {currentQuestion && (
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleToggleFlag}
                              className={`btn-modern transition-all ${
                                flaggedQuestions.has(currentQuestion.id)
                                  ? 'bg-amber-100 border-amber-400 text-amber-700 hover:bg-amber-200 hover:text-amber-800'
                                  : 'hover:border-amber-300 hover:text-amber-600'
                              }`}
                            >
                              <Flag className={`h-4 w-4 mr-1.5 ${
                                flaggedQuestions.has(currentQuestion.id) ? 'fill-amber-500' : ''
                              }`} />
                              {flaggedQuestions.has(currentQuestion.id) ? 'Flagged' : 'Flag'}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>{flaggedQuestions.has(currentQuestion.id)
                              ? 'Unflag this question'
                              : 'Flag this question and come back to it later'
                            }</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentQuestion ? (
                    <div>
                      <div className="mb-6">
                        {currentQuestion.questionText && (
                          <h2 className="text-xl font-semibold mb-4 text-foreground">{currentQuestion.questionText}</h2>
                        )}
                        {currentQuestion.questionImage && (
                          <div className="mb-4 relative group">
                            <OptimizedImage 
                              src={currentQuestion.questionImage} 
                              alt="Question" 
                              priority
                              className="max-w-full h-auto max-h-[500px] w-auto mx-auto rounded-lg border-2 border-border shadow-md cursor-pointer hover:border-primary transition-all"
                              onImageClick={() => setFullscreenImage(currentQuestion.questionImage || null)}
                              skeletonHeight="300px"
                            />
                            <Button
                              size="sm"
                              variant="secondary"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setFullscreenImage(currentQuestion.questionImage || null)}
                            >
                              <Maximize2 className="h-4 w-4 mr-1" />
                              View Full Size
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {currentQuestion.options.map((option, index) => {
                          const optionImage = currentQuestion.optionImages?.[index];
                          return (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            className={`w-full p-6 text-left border-2 rounded-xl transition-all hover:shadow-md card-hover ${
                              selectedAnswers[currentQuestion.id] === index
                                ? 'border-primary bg-primary/5 shadow-elegant'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              {selectedAnswers[currentQuestion.id] === index ? (
                                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                              ) : (
                                  <Circle className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                              )}
                                <div className="flex-1">
                                  {option && (
                                    <span className="text-lg font-medium block mb-2">{option}</span>
                                  )}
                                  {optionImage && (
                                    <div className="mt-2 relative group">
                                      <OptimizedImage 
                                        src={optionImage} 
                                        alt={`Option ${index + 1}`}
                                        className="max-w-full h-auto max-h-96 rounded-lg border border-border cursor-pointer hover:border-primary transition-all"
                                        onImageClick={(e) => {
                                          e.stopPropagation();
                                          setFullscreenImage(optionImage);
                                        }}
                                        skeletonHeight="150px"
                                      />
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setFullscreenImage(optionImage);
                                        }}
                                      >
                                        <Maximize2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                            </div>
                          </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading question...</p>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between items-center pt-6 border-t">
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="btn-modern"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    <div className="flex gap-3">
                      {/* Keyboard shortcuts help */}
                      <div className="relative">
                        <TooltipProvider delayDuration={0}>
                          <Tooltip open={showShortcutsHelp} onOpenChange={setShowShortcutsHelp}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={() => setShowShortcutsHelp(prev => !prev)}
                              >
                                <Keyboard className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="w-56 p-3">
                              <p className="font-semibold text-sm mb-2">Keyboard Shortcuts</p>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between"><span>Select answer</span><span className="font-mono bg-muted px-1 rounded">1-5</span></div>
                                <div className="flex justify-between"><span>Previous question</span><span className="font-mono bg-muted px-1 rounded">&larr;</span></div>
                                <div className="flex justify-between"><span>Next question</span><span className="font-mono bg-muted px-1 rounded">&rarr;</span></div>
                                <div className="flex justify-between"><span>Flag question</span><span className="font-mono bg-muted px-1 rounded">F</span></div>
                                <div className="flex justify-between"><span>Next / Submit</span><span className="font-mono bg-muted px-1 rounded">Enter</span></div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <Button 
                        onClick={() => setShowReviewScreen(true)}
                        variant="outline"
                        className="bg-green-600 hover:bg-green-700 text-white border-green-600 btn-modern"
                        size="lg"
                      >
                        Submit Quiz
                      </Button>
                      
                      {currentQuestionIndex < totalQuestions - 1 && (
                        <Button 
                          onClick={handleNextQuestion}
                          className="btn-modern shadow-elegant"
                          size="lg"
                        >
                          Next
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Submit Confirmation Dialog */}
        <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit your quiz? This action cannot be undone. 
                Make sure you've reviewed all your answers before submitting.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleSubmitQuiz}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Fullscreen Image Modal */}
        {fullscreenImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 border-white/20"
              onClick={() => setFullscreenImage(null)}
            >
              <CloseIcon className="h-4 w-4 text-white" />
            </Button>
            <img 
              src={fullscreenImage} 
              alt="Fullscreen view" 
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
