import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  GraduationCap,
  Mail,
  Calendar,
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Clock as ClockIcon
} from "lucide-react";
import { apiService, StudentDetail, QuizAttempt } from "@/lib/api";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

const StudentProfile = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (studentId) {
      loadStudentDetail();
    }
  }, [studentId]);

  const loadStudentDetail = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiService.getStudentDetail(studentId!);
      setStudent(data);
    } catch (err: any) {
      setError(err.message || "Failed to load student details");
      console.error("Error loading student detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error || "Student not found"}</p>
            <Button onClick={() => navigate("/admin-dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin-dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Student Info Card */}
        <Card className="mb-8 border-2 shadow-elegant bg-gradient-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <GraduationCap className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl mb-2">{student.fullName}</CardTitle>
                  <CardDescription className="text-base">
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {student.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Joined: {formatDate(student.createdAt)}
                      </div>
                    </div>
                  </CardDescription>
                </div>
              </div>
              {student.isActive ? (
                <Badge className="bg-green-600 text-white px-4 py-2">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="px-4 py-2">
                  <UserX className="h-4 w-4 mr-2" />
                  Inactive
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary">{student.totalQuizzes}</div>
                <div className="text-sm text-muted-foreground">Total Quizzes</div>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className={`text-3xl font-bold ${getScoreColor(student.averageScore)}`}>
                  {student.averageScore.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600">
                  {student.quizAttempts.reduce((sum, q) => sum + q.correctAnswers, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Correct</div>
              </div>
              <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600">
                  {student.lastActivityDate ? formatDate(student.lastActivityDate) : "Never"}
                </div>
                <div className="text-sm text-muted-foreground">Last Activity</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz History */}
        <Card className="border-2 shadow-elegant bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Quiz History
            </CardTitle>
            <CardDescription>
              {student.quizAttempts.length === 0
                ? "No quiz attempts yet"
                : `${student.quizAttempts.length} quiz attempt${student.quizAttempts.length !== 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {student.quizAttempts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No quiz attempts</p>
                <p className="text-sm">This student hasn't completed any quizzes yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {student.quizAttempts
                  .sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())
                  .map((quiz) => (
                    <Card
                      key={quiz.id}
                      className="border-2 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedQuiz(quiz)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">{quiz.quizTitle}</h3>
                              <Badge variant={getScoreBadgeVariant(quiz.score)}>
                                {quiz.score}% Score
                              </Badge>
                            </div>
                            <div className="grid md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Subject:</span> {quiz.subject}
                              </div>
                              <div>
                                <span className="font-medium">Grade:</span> {quiz.grade}
                              </div>
                              <div>
                                <span className="font-medium">Type:</span> {quiz.type}
                              </div>
                              <div>
                                <span className="font-medium">Completed:</span> {formatDate(quiz.completedDate)}
                              </div>
                            </div>
                            <div className="flex items-center gap-6 mt-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">
                                  {quiz.correctAnswers} / {quiz.totalQuestions} Correct
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">
                                  {formatTime(quiz.timeSpent)} / {quiz.timeLimit} min
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" onClick={() => setSelectedQuiz(quiz)}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quiz Detail Dialog */}
      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedQuiz?.quizTitle}</DialogTitle>
            <DialogDescription>
              Quiz completed on {selectedQuiz ? formatDate(selectedQuiz.completedDate) : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedQuiz && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Score</div>
                  <div className={`text-2xl font-bold ${getScoreColor(selectedQuiz.score)}`}>
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
                  <Card key={question.id} className="border-2">
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
                        {question.options.map((option, optionIndex) => {
                          // Support both single and multiple correct answers
                          const correctIndexes = question.correctAnswerIndexes || [question.correctAnswerIndex];
                          const selectedIndexes = question.selectedAnswerIndexes || [question.selectedAnswerIndex];
                          
                          const isSelected = selectedIndexes.includes(optionIndex);
                          const isCorrect = correctIndexes.includes(optionIndex);
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
                                <Badge className="bg-green-600 ml-auto flex-shrink-0">
                                  {correctIndexes.length > 1 ? `Correct (${correctIndexes.indexOf(optionIndex) + 1}/${correctIndexes.length})` : 'Correct'}
                                </Badge>
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentProfile;

