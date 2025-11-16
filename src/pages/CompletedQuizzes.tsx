import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Clock, 
  Trophy, 
  Calendar, 
  BookOpen, 
  Target,
  TrendingUp,
  Star,
  Award,
  CheckCircle,
  Eye,
  XCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, QuizAttempt } from "@/lib/api";

const CompletedQuizzes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filterBy, setFilterBy] = useState<string>("all");
  const [completedQuizzes, setCompletedQuizzes] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedQuiz, setSelectedQuiz] = useState<QuizAttempt | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Fetch completed quizzes on component mount
  useEffect(() => {
    const fetchCompletedQuizzes = async () => {
      try {
        setIsLoading(true);
        const quizzes = await apiService.getCompletedQuizzes();
        console.log("Fetched completed quizzes:", quizzes);
        // Log if any quizzes have questions
        quizzes.forEach((quiz, index) => {
          if (quiz.questions && quiz.questions.length > 0) {
            console.log(`Quiz ${index} (${quiz.quizTitle}) has ${quiz.questions.length} questions`);
          } else {
            console.log(`Quiz ${index} (${quiz.quizTitle}) has no questions in initial fetch`);
          }
        });
        setCompletedQuizzes(quizzes);
      } catch (err: any) {
        setError(err.message || "Failed to load completed quizzes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedQuizzes();
  }, []);

  const filteredQuizzes = filterBy === "all" 
    ? completedQuizzes 
    : completedQuizzes.filter(quiz => quiz.type.toLowerCase().includes(filterBy.toLowerCase()));

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <Trophy className="h-4 w-4" />;
    if (score >= 80) return <Award className="h-4 w-4" />;
    if (score >= 70) return <Star className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const averageScore = completedQuizzes.length > 0 
    ? Math.round(completedQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / completedQuizzes.length)
    : 0;

  const totalTimeSpent = completedQuizzes.reduce((sum, quiz) => sum + quiz.timeSpent, 0);

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/student-dashboard')}
                className="btn-modern"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  Completed Quizzes
                </h1>
                <p className="text-muted-foreground">Your quiz history and performance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-elegant bg-gradient-card">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">
                {completedQuizzes.length}
              </div>
              <p className="text-sm text-muted-foreground">Quizzes Completed</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-elegant bg-gradient-card">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-green-100 rounded-xl w-fit mx-auto mb-3">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {averageScore}%
              </div>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-elegant bg-gradient-card">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {formatTime(totalTimeSpent)}
              </div>
              <p className="text-sm text-muted-foreground">Total Time Spent</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-elegant bg-gradient-card">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-purple-100 rounded-xl w-fit mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {completedQuizzes.length > 0 
                  ? Math.round(completedQuizzes.filter(q => q.score >= 80).length / completedQuizzes.length * 100)
                  : 0}%
              </div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Options */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filterBy === "all" ? "default" : "outline"}
            onClick={() => setFilterBy("all")}
            className="btn-modern"
          >
            All Quizzes
          </Button>
          <Button
            variant={filterBy === "past" ? "default" : "outline"}
            onClick={() => setFilterBy("past")}
            className="btn-modern"
          >
            Past Papers
          </Button>
          <Button
            variant={filterBy === "model" ? "default" : "outline"}
            onClick={() => setFilterBy("model")}
            className="btn-modern"
          >
            Model Papers
          </Button>
          <Button
            variant={filterBy === "school" ? "default" : "outline"}
            onClick={() => setFilterBy("school")}
            className="btn-modern"
          >
            School Papers
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading completed quizzes...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <BookOpen className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Error loading data</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Quiz History */}
        {!isLoading && !error && (
          <>
            {filteredQuizzes.length > 0 ? (
              <div className="space-y-4">
                {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} className="border-2 shadow-elegant bg-gradient-card card-hover">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Quiz Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-hero rounded-xl">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{quiz.quizTitle}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {quiz.grade}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {quiz.medium}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {quiz.subject}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              quiz.difficulty === 'Advanced' ? 'border-red-200 text-red-600' :
                              quiz.difficulty === 'Intermediate' ? 'border-yellow-200 text-yellow-600' :
                              'border-green-200 text-green-600'
                            }`}
                          >
                            {quiz.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(quiz.completedDate)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(quiz.timeSpent)} / {formatTime(quiz.timeLimit)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score and Performance */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold ${getScoreColor(quiz.score)}`}>
                        {getScoreIcon(quiz.score)}
                        {quiz.score}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {quiz.correctAnswers}/{quiz.totalQuestions} correct
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {quiz.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Performance</span>
                    <span className="text-sm text-muted-foreground">{quiz.score}%</span>
                  </div>
                  <Progress 
                    value={quiz.score} 
                    className="h-2"
                  />
                </div>

                {/* View Answers Button */}
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={async () => {
                      setLoadingDetails(true);
                      setSelectedQuiz(null); // Clear previous selection
                      try {
                        // First check if questions are already available in the quiz object
                        if (quiz.questions && quiz.questions.length > 0) {
                          console.log("Using questions from initial fetch:", quiz.questions.length);
                          setSelectedQuiz(quiz);
                          setLoadingDetails(false);
                          return;
                        }

                        // If not, try to fetch detailed quiz attempt with questions
                        console.log("Fetching quiz details for attempt:", quiz.id);
                        const detailedQuiz = await apiService.getQuizAttemptDetails(quiz.id);
                        console.log("Fetched quiz details:", detailedQuiz);
                        console.log("Questions count:", detailedQuiz.questions?.length || 0);
                        
                        if (detailedQuiz.questions && detailedQuiz.questions.length > 0) {
                          setSelectedQuiz(detailedQuiz);
                        } else {
                          // If still no questions, show the quiz with empty questions array
                          console.warn("No questions found in detailed quiz response");
                          setSelectedQuiz({ ...quiz, questions: [] });
                        }
                      } catch (err: any) {
                        console.error("Error loading quiz details:", err);
                        console.error("Error details:", {
                          message: err.message,
                          status: err.status,
                          response: err.errorResponse
                        });
                        
                        // Check if the quiz already has questions
                        if (quiz.questions && quiz.questions.length > 0) {
                          console.log("Using questions from initial quiz object as fallback");
                          setSelectedQuiz(quiz);
                        } else {
                          // Show error message to user
                          setError(err.message || "Failed to load quiz details. Please ensure the backend endpoint GET /api/quizattempt/{attemptId} is implemented.");
                          // Still show the quiz but with a message that details aren't available
                          setSelectedQuiz({ ...quiz, questions: [] });
                        }
                      } finally {
                        setLoadingDetails(false);
                      }
                    }}
                    variant="outline"
                    className="btn-modern"
                    disabled={loadingDetails}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {loadingDetails ? "Loading..." : "View Answers"}
                  </Button>
                </div>
              </CardContent>
            </Card>
                ))}
              </div>
            ) : (
              <Card className="border-2 shadow-elegant bg-gradient-card">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No quizzes found</h3>
                  <p className="text-muted-foreground mb-4">
                    {filterBy === "all" 
                      ? "You haven't completed any quizzes yet." 
                      : `No ${filterBy} quizzes completed yet.`
                    }
                  </p>
                  <Button 
                    onClick={() => navigate('/student-dashboard')}
                    className="btn-modern"
                  >
                    Start Your First Quiz
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Quiz Detail Dialog */}
        <Dialog open={!!selectedQuiz && !loadingDetails} onOpenChange={() => {
          if (!loadingDetails) {
            setSelectedQuiz(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedQuiz?.quizTitle}</DialogTitle>
              <DialogDescription>
                Quiz completed on {selectedQuiz ? formatDate(selectedQuiz.completedDate) : ""}
              </DialogDescription>
            </DialogHeader>
            {selectedQuiz && selectedQuiz.questions && selectedQuiz.questions.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Score</div>
                    <div className={`text-2xl font-bold ${getScoreTextColor(selectedQuiz.score)}`}>
                      {selectedQuiz.score}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Correct Answers</div>
                    <div className="text-2xl font-bold">
                      {selectedQuiz.correctAnswers} / {selectedQuiz.totalQuestions}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Time Spent</div>
                    <div className="text-2xl font-bold">
                      {formatTime(selectedQuiz.timeSpent)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Question Review</h3>
                  {selectedQuiz.questions.map((question, index) => (
                    <Card key={question.id || index} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-semibold">Question {index + 1}</span>
                          {question.isCorrect ? (
                            <Badge className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Correct
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Incorrect
                            </Badge>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          {question.questionText && (
                            <p className="font-medium mb-2">{question.questionText}</p>
                          )}
                          {question.questionImage && (
                            <div className="mb-2">
                              <img 
                                src={question.questionImage} 
                                alt="Question" 
                                className="max-w-full h-auto rounded-lg border border-border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          {question.options && question.options.map((option, optionIndex) => {
                            const isSelected = question.selectedAnswerIndex === optionIndex;
                            const isCorrect = question.correctAnswerIndex === optionIndex;
                            const optionImage = question.optionImages?.[optionIndex];

                            return (
                              <div
                                key={optionIndex}
                                className={`p-3 rounded-lg border-2 flex items-start gap-2 ${
                                  isCorrect
                                    ? "border-green-500 bg-green-100"
                                    : isSelected && !isCorrect
                                    ? "border-red-500 bg-red-100"
                                    : "border-gray-200 bg-white"
                                }`}
                              >
                                {isCorrect && (
                                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                )}
                                {isSelected && !isCorrect && (
                                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                )}
                                {!isSelected && !isCorrect && (
                                  <div className="w-5 h-5 border-2 border-gray-400 rounded-full flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
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
                                        className="max-w-full h-auto max-h-48 rounded-lg border border-border"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                                {isCorrect && (
                                  <Badge className="bg-green-600 ml-auto flex-shrink-0">Correct</Badge>
                                )}
                                {isSelected && !isCorrect && (
                                  <Badge variant="destructive" className="ml-auto flex-shrink-0">
                                    Selected
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {question.explanation && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                            <p className="text-sm text-blue-800">{question.explanation}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {selectedQuiz && (!selectedQuiz.questions || selectedQuiz.questions.length === 0) && (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">Question details are not available for this quiz.</p>
                <p className="text-xs text-muted-foreground">
                  The backend endpoint GET /api/quizattempt/{selectedQuiz.id} should return questions array.
                </p>
              </div>
            )}
            {loadingDetails && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading quiz details...</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CompletedQuizzes;
