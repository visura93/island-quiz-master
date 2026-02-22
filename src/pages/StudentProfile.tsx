import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Clock as ClockIcon,
  CreditCard,
  Plus,
  DollarSign,
  Crown
} from "lucide-react";
import { apiService, StudentDetail, QuizAttempt, PaymentRecord, UpdateStudentPremiumRequest, CreatePaymentRequest } from "@/lib/api";
import { OptimizedImage } from "@/components/OptimizedImage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const StudentProfile = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation(['profile', 'common']);
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Premium Management State
  const [isPremiumToggle, setIsPremiumToggle] = useState<boolean>(false);
  const [savingPremium, setSavingPremium] = useState<boolean>(false);

  // Payment Management State
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentCurrency, setPaymentCurrency] = useState<string>("LKR");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [paymentMonths, setPaymentMonths] = useState<number>(3);
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [savingPayment, setSavingPayment] = useState<boolean>(false);

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
      setIsPremiumToggle(data.isPremium || false);
    } catch (err: any) {
      setError(err.message || t('profile:studentProfile.failedLoadStudent'));
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

  const handlePremiumToggle = async (enabled: boolean) => {
    if (!student || !studentId) return;

    try {
      setSavingPremium(true);
      const request: UpdateStudentPremiumRequest = {
        isPremium: enabled,
        subscriptionMonths: enabled ? 3 : 0, // Default 3 months when enabling
      };

      const updated = await apiService.updateStudentPremium(studentId, request);
      setStudent(updated);
      setIsPremiumToggle(enabled);

      toast({
        title: t('common:feedback.successTitle'),
        description: enabled ? t('profile:studentProfile.premiumEnabled') : t('profile:studentProfile.premiumDisabled'),
      });
    } catch (err: any) {
      toast({
        title: t('common:feedback.errorTitle'),
        description: err.message || t('profile:studentProfile.failedUpdatePremium'),
        variant: "destructive",
      });
      // Revert toggle on error
      setIsPremiumToggle(!enabled);
    } finally {
      setSavingPremium(false);
    }
  };

  const handleOpenPaymentDialog = () => {
    setPaymentAmount(0);
    setPaymentCurrency("LKR");
    setPaymentMethod("Cash");
    setPaymentMonths(3);
    setPaymentNotes("");
    setPaymentDialogOpen(true);
  };

  const handleSavePayment = async () => {
    if (!student || !studentId) return;

    if (paymentAmount <= 0) {
      toast({
        title: t('common:feedback.errorTitle'),
        description: t('profile:studentProfile.validationAmountError'),
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingPayment(true);
      const request: CreatePaymentRequest = {
        studentId: studentId,
        amount: paymentAmount,
        currency: paymentCurrency,
        paymentMethod: paymentMethod,
        subscriptionMonths: paymentMonths,
        notes: paymentNotes || undefined,
      };

      await apiService.createPaymentRecord(request);

      toast({
        title: t('common:feedback.successTitle'),
        description: t('profile:studentProfile.paymentRecorded'),
      });

      setPaymentDialogOpen(false);
      loadStudentDetail(); // Reload student data
    } catch (err: any) {
      toast({
        title: t('common:feedback.errorTitle'),
        description: err.message || t('profile:studentProfile.failedRecordPayment'),
        variant: "destructive",
      });
    } finally {
      setSavingPayment(false);
    }
  };

  const getPremiumStatus = () => {
    if (!student?.isPremium || !student.subscriptionEndDate) {
      return { badge: <Badge variant="outline">{t('profile:studentProfile.regularAccount')}</Badge>, color: "text-gray-600" };
    }

    const endDate = new Date(student.subscriptionEndDate);
    const now = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining > 30) {
      return {
        badge: <Badge className="bg-green-600"><Crown className="h-3 w-3 mr-1" />{t('profile:studentProfile.premiumDaysLeft', { days: daysRemaining })}</Badge>,
        color: "text-green-600"
      };
    } else if (daysRemaining > 0) {
      return {
        badge: <Badge className="bg-yellow-600"><Crown className="h-3 w-3 mr-1" />{t('profile:studentProfile.premiumExpiring', { days: daysRemaining })}</Badge>,
        color: "text-yellow-600"
      };
    } else {
      return {
        badge: <Badge variant="destructive">{t('profile:studentProfile.expired')}</Badge>,
        color: "text-red-600"
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('profile:studentProfile.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error || t('profile:studentProfile.notFound')}</p>
            <Button onClick={() => navigate("/admin-dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('profile:studentProfile.backToDashboard')}
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin-dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('profile:studentProfile.backToDashboard')}
          </Button>
          <LanguageSwitcher />
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
                        {t('profile:studentProfile.joined', { date: formatDate(student.createdAt) })}
                      </div>
                    </div>
                  </CardDescription>
                </div>
              </div>
              {student.isActive ? (
                <Badge className="bg-green-600 text-white px-4 py-2">
                  <UserCheck className="h-4 w-4 mr-2" />
                  {t('profile:studentProfile.active')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="px-4 py-2">
                  <UserX className="h-4 w-4 mr-2" />
                  {t('profile:studentProfile.inactive')}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary">{student.totalQuizzes}</div>
                <div className="text-sm text-muted-foreground">{t('profile:studentProfile.totalQuizzes')}</div>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className={`text-3xl font-bold ${getScoreColor(student.averageScore)}`}>
                  {student.averageScore.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">{t('profile:studentProfile.averageScore')}</div>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600">
                  {student.quizAttempts.reduce((sum, q) => sum + q.correctAnswers, 0)}
                </div>
                <div className="text-sm text-muted-foreground">{t('profile:studentProfile.totalCorrect')}</div>
              </div>
              <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600">
                  {student.lastActivityDate ? formatDate(student.lastActivityDate) : t('profile:studentProfile.never')}
                </div>
                <div className="text-sm text-muted-foreground">{t('profile:studentProfile.lastActivity')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Management Card */}
        <Card className="mb-8 border-2 shadow-elegant bg-gradient-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Crown className="h-6 w-6 text-primary" />
                  {t('profile:studentProfile.premiumManagement')}
                </CardTitle>
                <CardDescription>
                  {t('profile:studentProfile.premiumManagementDesc')}
                </CardDescription>
              </div>
              <Button onClick={handleOpenPaymentDialog} className="bg-gradient-hero">
                <Plus className="h-4 w-4 mr-2" />
                {t('profile:studentProfile.addPayment')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Premium Toggle Section */}
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold">{t('profile:studentProfile.premiumAccess')}</h3>
                    {getPremiumStatus().badge}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isPremiumToggle
                      ? t('profile:studentProfile.premiumEnabledDesc')
                      : t('profile:studentProfile.premiumDisabledDesc')}
                  </p>
                  {student?.subscriptionEndDate && isPremiumToggle && (
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="font-medium">{t('profile:studentProfile.startDate')}</span>{" "}
                        <span className="text-muted-foreground">
                          {student.subscriptionStartDate ? formatDate(student.subscriptionStartDate) : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">{t('profile:studentProfile.endDate')}</span>{" "}
                        <span className="text-muted-foreground">
                          {formatDate(student.subscriptionEndDate)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="premium-toggle" className="text-base font-medium">
                    {isPremiumToggle ? t('profile:studentProfile.enabled') : t('profile:studentProfile.disabled')}
                  </Label>
                  <Switch
                    id="premium-toggle"
                    checked={isPremiumToggle}
                    onCheckedChange={handlePremiumToggle}
                    disabled={savingPremium}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {student.paymentHistory?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">{t('profile:studentProfile.totalPayments')}</div>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-bold text-green-600">
                  {student.subscriptionStartDate ? formatDate(student.subscriptionStartDate) : "N/A"}
                </div>
                <div className="text-sm text-muted-foreground">{t('profile:studentProfile.premiumSince')}</div>
              </div>
              <div className="text-center p-4 bg-orange-500/10 rounded-lg">
                <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-sm font-bold text-orange-600">
                  {student.subscriptionEndDate ? formatDate(student.subscriptionEndDate) : "N/A"}
                </div>
                <div className="text-sm text-muted-foreground">{t('profile:studentProfile.premiumUntil')}</div>
              </div>
            </div>

            {/* Payment History */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                {t('profile:studentProfile.paymentHistory')}
              </h3>
              {!student.paymentHistory || student.paymentHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">{t('profile:studentProfile.noPaymentRecords')}</p>
                  <p className="text-sm">{t('profile:studentProfile.noPaymentDesc')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {student.paymentHistory
                    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                    .map((payment) => (
                      <Card key={payment.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-green-500/10 rounded">
                                <DollarSign className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-lg">
                                  {payment.currency} {payment.amount.toLocaleString()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {payment.paymentMethod} • {payment.subscriptionMonths} {payment.subscriptionMonths !== 1 ? t('profile:studentProfile.months', { count: payment.subscriptionMonths }) : t('profile:studentProfile.month', { count: 1 })}
                                </div>
                                {payment.notes && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {t('profile:studentProfile.note', { note: payment.notes })}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={payment.status === "completed" ? "default" : "secondary"}
                                className="mb-2"
                              >
                                {payment.status}
                              </Badge>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(payment.paymentDate)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quiz History */}
        <Card className="border-2 shadow-elegant bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              {t('profile:studentProfile.quizHistory')}
            </CardTitle>
            <CardDescription>
              {student.quizAttempts.length === 0
                ? t('profile:studentProfile.noQuizAttempts')
                : t('profile:studentProfile.quizAttemptCount', { count: student.quizAttempts.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {student.quizAttempts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">{t('profile:studentProfile.noQuizAttemptsDesc')}</p>
                <p className="text-sm">{t('profile:studentProfile.noQuizCompletedDesc')}</p>
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
                                {quiz.score}% {t('profile:studentProfile.score')}
                              </Badge>
                            </div>
                            <div className="grid md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">{t('profile:studentProfile.subject')}</span> {quiz.subject}
                              </div>
                              <div>
                                <span className="font-medium">{t('profile:studentProfile.grade')}</span> {quiz.grade}
                              </div>
                              <div>
                                <span className="font-medium">{t('profile:studentProfile.type')}</span> {quiz.type}
                              </div>
                              <div>
                                <span className="font-medium">{t('profile:studentProfile.completed')}</span> {formatDate(quiz.completedDate)}
                              </div>
                            </div>
                            <div className="flex items-center gap-6 mt-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">
                                  {quiz.correctAnswers} / {quiz.totalQuestions} {t('profile:studentProfile.correctLabel')}
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
                            {t('profile:studentProfile.viewDetails')}
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
              {selectedQuiz ? t('profile:studentProfile.quizCompleted', { date: formatDate(selectedQuiz.completedDate) }) : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedQuiz && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">{t('profile:studentProfile.score')}</div>
                  <div className={`text-2xl font-bold ${getScoreColor(selectedQuiz.score)}`}>
                    {selectedQuiz.score}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('profile:studentProfile.correctAnswers')}</div>
                  <div className="text-2xl font-bold">
                    {selectedQuiz.correctAnswers} / {selectedQuiz.totalQuestions}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('profile:studentProfile.timeSpent')}</div>
                  <div className="text-2xl font-bold">
                    {formatTime(selectedQuiz.timeSpent)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t('profile:studentProfile.questionReview')}</h3>
                {selectedQuiz.questions.map((question, index) => (
                  <Card key={question.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-semibold">{t('profile:studentProfile.question', { number: index + 1 })}</span>
                        {question.isCorrect ? (
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t('profile:studentProfile.correctLabel')}
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            {t('profile:studentProfile.incorrectLabel')}
                          </Badge>
                        )}
                      </div>

                      <div className="mb-4">
                        {question.questionText && (
                          <p className="font-medium mb-2">{question.questionText}</p>
                        )}
                        {question.questionImage && (
                          <div className="mb-2">
                            <OptimizedImage
                              src={question.questionImage}
                              alt="Question"
                              className="max-w-full h-auto rounded-lg border border-border"
                              skeletonHeight="150px"
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
                                    <OptimizedImage
                                      src={optionImage}
                                      alt={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                      className="max-w-full h-auto max-h-48 rounded-lg border border-border"
                                      skeletonHeight="100px"
                                    />
                                  </div>
                                )}
                              </div>
                              {isCorrect && (
                                <Badge className="bg-green-600 ml-auto flex-shrink-0">
                                  {correctIndexes.length > 1 ? `${t('profile:studentProfile.correctLabel')} (${correctIndexes.indexOf(optionIndex) + 1}/${correctIndexes.length})` : t('profile:studentProfile.correctLabel')}
                                </Badge>
                              )}
                              {isSelected && !isCorrect && (
                                <Badge variant="destructive" className="ml-auto flex-shrink-0">
                                  {t('profile:studentProfile.selected')}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm font-semibold text-blue-900 mb-1">{t('profile:studentProfile.explanation')}</p>
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

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('profile:studentProfile.recordPayment')}</DialogTitle>
            <DialogDescription>
              {t('profile:studentProfile.recordPaymentDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t('profile:studentProfile.paymentAmount')}</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                placeholder={t('profile:studentProfile.enterAmount')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{t('profile:studentProfile.currency')}</Label>
              <Select value={paymentCurrency} onValueChange={setPaymentCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LKR">LKR (Sri Lankan Rupee)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">{t('profile:studentProfile.paymentMethod')}</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="Online Payment">Online Payment</SelectItem>
                  <SelectItem value="Mobile Payment">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMonths">{t('profile:studentProfile.premiumDuration')}</Label>
              <Select
                value={paymentMonths.toString()}
                onValueChange={(value) => setPaymentMonths(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t('profile:studentProfile.month', { count: 1 })}</SelectItem>
                  <SelectItem value="3">{t('profile:studentProfile.months', { count: 3 })}</SelectItem>
                  <SelectItem value="6">{t('profile:studentProfile.months', { count: 6 })}</SelectItem>
                  <SelectItem value="12">{t('profile:studentProfile.months', { count: 12 })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentNotes">{t('profile:studentProfile.notesOptional')}</Label>
              <Textarea
                id="paymentNotes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder={t('profile:studentProfile.notesPlaceholder')}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              {t('common:buttons.cancel')}
            </Button>
            <Button onClick={handleSavePayment} disabled={savingPayment}>
              {savingPayment ? t('profile:studentProfile.recording') : t('profile:studentProfile.recordPaymentBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentProfile;
