import { useState, useEffect } from "react";
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
  XCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, Question, QuizAnswer } from "@/lib/api";

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
}

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const quizData = location.state as QuizState;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
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

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length > 0 ? questions.length : initialQuestionCount;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // Load quiz information when component mounts
  useEffect(() => {
    const loadQuizInfo = async () => {
      if (!quizData) return;
      
      try {
        setLoadingQuizInfo(true);
        
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
      // If time limit is less than 5 minutes, show red when ≤ 20 seconds remain
      return timeRemaining <= 20;
    } else {
      // If time limit is ≥ 5 minutes, show red when ≤ 60 seconds (1 minute) remain
      return timeRemaining <= 60;
    }
  };

  const handleStartQuiz = async () => {
    try {
      setLoading(true);
      setError("");

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
    } catch (err: any) {
      setError(err.message || "Failed to start quiz");
      console.error("Error starting quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answerIndex: number) => {
    if (!currentQuestion || !attemptId) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));

    // Submit answer to backend
    try {
      await apiService.submitAnswer(attemptId, currentQuestion.id, answerIndex);
    } catch (err) {
      console.error("Error submitting answer:", err);
      // Don't block UI on submit error, just log it
    }
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

  const handleSubmitQuiz = async () => {
    setIsTimerRunning(false);
    
    try {
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
      }
      setShowResults(true);
    } catch (err) {
      console.error("Error completing quiz:", err);
      // Still show results even if completion fails
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
                              <div className="mb-2">
                                <img 
                                  src={questionResult.questionImage} 
                                  alt="Question" 
                                  className="max-w-full h-auto rounded-lg border-2 border-border shadow-md"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            {questionResult.options.map((option, optionIndex) => {
                              const isSelected = questionResult.selectedAnswerIndex === optionIndex;
                              const isCorrect = questionResult.correctAnswerIndex === optionIndex;
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
                                        <img 
                                          src={optionImage} 
                                          alt={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                          className="max-w-full h-auto max-h-64 rounded-lg border border-border"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  {isCorrect && (
                                    <Badge className="bg-green-600 ml-auto flex-shrink-0">Correct Answer</Badge>
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

              <div className="space-y-4">
                <Button 
                  onClick={handleStartQuiz}
                  disabled={loading}
                  className="w-full bg-gradient-hero hover:opacity-90 btn-modern shadow-elegant hover:shadow-hover"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  {loading ? "Starting Quiz..." : "Start Quiz"}
                </Button>
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

        {/* Question Card */}
        <Card className="max-w-4xl mx-auto border-2 shadow-elegant bg-gradient-card overflow-hidden">
          <CardHeader className="relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-hero"></div>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-gradient-hero rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              Question {currentQuestionIndex + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion ? (
              <div>
                <div className="mb-6">
                  {currentQuestion.questionText && (
                    <h2 className="text-xl font-semibold mb-4 text-foreground">{currentQuestion.questionText}</h2>
                  )}
                  {currentQuestion.questionImage && (
                    <div className="mb-4">
                      <img 
                        src={currentQuestion.questionImage} 
                        alt="Question" 
                        className="max-w-full h-auto rounded-lg border-2 border-border shadow-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
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
                              <div className="mt-2">
                                <img 
                                  src={optionImage} 
                                  alt={`Option ${index + 1}`}
                                  className="max-w-full h-auto max-h-64 rounded-lg border border-border"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
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
            <div className="flex justify-between pt-6 border-t">
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
                {currentQuestionIndex === totalQuestions - 1 ? (
                  <Button 
                    onClick={handleSubmitQuiz}
                    className="bg-green-600 hover:bg-green-700 btn-modern shadow-elegant"
                    size="lg"
                  >
                    Submit Quiz
                  </Button>
                ) : (
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
      </div>
    </div>
  );
};

export default Quiz;
