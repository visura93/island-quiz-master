import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Search, 
  Edit, 
  Trash2, 
  Plus,
  BookOpen,
  Eye,
  X
} from "lucide-react";
import { apiService, Quiz } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ViewQuizzes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation(['admin', 'common']);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [searchQuery, quizzes]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiService.getAllQuizzes();
      setQuizzes(data);
      setFilteredQuizzes(data);
    } catch (err: any) {
      setError(err.message || t('admin:viewQuizzes.loadError'));
      console.error("Error loading quizzes:", err);
      toast({
        title: t('common:feedback.errorTitle'),
        description: err.message || t('admin:viewQuizzes.loadError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzes = () => {
    if (!searchQuery.trim()) {
      setFilteredQuizzes(quizzes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = quizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(query) ||
        quiz.description.toLowerCase().includes(query) ||
        quiz.subject.toLowerCase().includes(query) ||
        quiz.grade.toLowerCase().includes(query) ||
        quiz.medium.toLowerCase().includes(query) ||
        quiz.type.toLowerCase().includes(query) ||
        quiz.difficulty.toLowerCase().includes(query)
    );
    setFilteredQuizzes(filtered);
  };

  const handleEditQuiz = (quizId: string) => {
    navigate(`/admin/edit-quiz/${quizId}`);
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;

    try {
      await apiService.deleteQuiz(quizToDelete.id);
      toast({
        title: t('common:feedback.successTitle'),
        description: t('admin:viewQuizzes.deleteSuccess'),
      });
      await loadQuizzes();
    } catch (err: any) {
      toast({
        title: t('common:feedback.errorTitle'),
        description: err.message || t('common:status.error'),
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/admin-dashboard")} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common:buttons.back')}
            </Button>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t('admin:viewQuizzes.title')}</h1>
            <p className="text-muted-foreground text-lg">{t('admin:viewQuizzes.title')}</p>
          </div>
          <Button 
            onClick={() => navigate("/admin/create-quiz")}
            className="bg-gradient-hero hover:opacity-90 transition-opacity"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('admin:createQuiz.title')}
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="border-2 shadow-elegant bg-gradient-card mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={t('admin:viewQuizzes.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-2 border-red-200 bg-red-50 mb-6">
            <CardContent className="p-4">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('common:status.loading')}</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <Card className="border-2 shadow-elegant bg-gradient-card">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? "No quizzes found" : "No quizzes yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Try adjusting your search query" 
                  : "Create your first quiz to get started"}
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate("/admin/create-quiz")}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin:createQuiz.title')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card 
                key={quiz.id} 
                className="border-2 hover:shadow-lg transition-all bg-gradient-card"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 line-clamp-2">{quiz.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{quiz.grade}</Badge>
                    <Badge variant="outline">{quiz.medium}</Badge>
                    <Badge variant="outline">{quiz.subject}</Badge>
                    <Badge variant="outline">{quiz.type}</Badge>
                    <Badge className={getDifficultyColor(quiz.difficulty)}>
                      {quiz.difficulty}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Year:</span>
                      <p className="font-medium">{quiz.year}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time Limit:</span>
                      <p className="font-medium">{quiz.timeLimit} min</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Questions:</span>
                      <p className="font-medium">{quiz.questionCount}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p className="font-medium">
                        {quiz.isActive ? (
                          <Badge className="bg-green-600">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Created: {formatDate(quiz.createdAt)}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditQuiz(quiz.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t('common:buttons.edit')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteQuiz(quiz)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin:viewQuizzes.deleteConfirm')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('admin:viewQuizzes.deleteConfirmDesc')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                {t('common:buttons.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ViewQuizzes;

