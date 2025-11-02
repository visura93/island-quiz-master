import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  CheckCircle
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

  // Fetch completed quizzes on component mount
  useEffect(() => {
    const fetchCompletedQuizzes = async () => {
      try {
        setIsLoading(true);
        const quizzes = await apiService.getCompletedQuizzes();
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
                        <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
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
                            {formatTime(quiz.timeTaken)} / {formatTime(quiz.timeLimit)}
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
      </div>
    </div>
  );
};

export default CompletedQuizzes;
