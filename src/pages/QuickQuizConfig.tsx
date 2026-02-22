import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Zap, ArrowLeft, Play, Clock, HelpCircle, BookOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface QuickQuizConfig {
  questionCount: number;
  timeLimit: number;
  questionsFrom: string;
}

const QuickQuizConfig = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation(['quiz', 'common', 'dashboard']);

  // Get the passed state
  const { grade, medium, subject, quizType, language } = location.state || {};

  // Configuration state with defaults
  const [config, setConfig] = useState<QuickQuizConfig>({
    questionCount: 20,
    timeLimit: 30,
    questionsFrom: "all"
  });

  const questionOptions = [10, 15, 20, 25, 30, 40, 50];
  const timeOptions = [15, 20, 30, 45, 60, 90, 120];

  const handleQuestionCountChange = (value: number[]) => {
    setConfig(prev => ({ ...prev, questionCount: value[0] }));
  };

  const handleTimeLimitChange = (value: number[]) => {
    setConfig(prev => ({ ...prev, timeLimit: value[0] }));
  };

  const handleQuestionsFromChange = (value: string) => {
    setConfig(prev => ({ ...prev, questionsFrom: value }));
  };

  const handleQuickStart = async () => {
    try {
      navigate('/quiz', {
        state: {
          isQuickQuiz: true,
          questionCount: config.questionCount,
          timeLimit: config.timeLimit,
          questionsFrom: config.questionsFrom,
          grade: grade,
          medium: medium || language,
          subject: subject,
          quizType: quizType,
          language: language,
          paperType: "quick-quiz"
        }
      });
    } catch (error: any) {
      toast({
        title: t('common:feedback.errorTitle'),
        description: error.message || t('quiz:quickQuizConfig.error'),
        variant: "destructive"
      });
    }
  };

  const handleBackToDashboard = () => {
    navigate('/student-dashboard');
  };

  const getQuizTypeLabel = () => {
    if (quizType === "scholarship") return "Scholarship Grade 5";
    if (quizType === "al") return t('dashboard:student.quizTypes.al');
    if (quizType === "ol") return t('dashboard:student.quizTypes.ol');
    return `Grade ${grade?.replace('grade-', '')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleBackToDashboard}
          >
            <div className="p-2 bg-gradient-hero rounded-xl shadow-elegant">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                {t('common:appName')}
              </span>
              <p className="text-xs text-muted-foreground">{t('common:taglineShort')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">
                {t('dashboard:student.welcome', { name: user?.firstName })}
              </span>
            </div>
            <LanguageSwitcher />
            <DarkModeToggle />
            <Button
              variant="outline"
              onClick={handleBackToDashboard}
              className="btn-modern"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common:buttons.back')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-950/30 rounded-full mb-4">
            <Zap className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            <span className="text-sm font-medium text-pink-600 dark:text-pink-400">{t('quiz:quickQuizConfig.title')}</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            {t('quiz:quickQuizConfig.configureTitle')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('quiz:quickQuizConfig.configureSubtitle')}
          </p>
        </div>

        {/* Selected Options Summary */}
        <Card className="border-2 shadow-elegant bg-gradient-card mb-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t('quiz:quickQuizConfig.selectedOptions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm px-3 py-1">
                {getQuizTypeLabel()}
              </Badge>
              {(medium || language) && (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {medium || language}
                </Badge>
              )}
              {subject && (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {subject}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Card */}
        <Card className="border-2 shadow-elegant bg-gradient-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-hero rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-hero bg-clip-text text-transparent">
                  {t('quiz:quickQuizConfig.quizSettings')}
                </CardTitle>
                <CardDescription>
                  {t('quiz:quickQuizConfig.quizSettingsDesc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Question Count */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  {t('quiz:quickQuizConfig.questionCount')}
                </Label>
                <Badge variant="outline" className="text-lg font-bold px-4 py-1">
                  {config.questionCount}
                </Badge>
              </div>
              <Slider
                value={[config.questionCount]}
                onValueChange={handleQuestionCountChange}
                min={10}
                max={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10 {t('quiz:quickQuizConfig.questions')}</span>
                <span>50 {t('quiz:quickQuizConfig.questions')}</span>
              </div>
            </div>

            {/* Time Limit */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {t('quiz:quickQuizConfig.timeLimit')}
                </Label>
                <Badge variant="outline" className="text-lg font-bold px-4 py-1">
                  {config.timeLimit} {t('quiz:quickQuizConfig.minutes')}
                </Badge>
              </div>
              <Slider
                value={[config.timeLimit]}
                onValueChange={handleTimeLimitChange}
                min={15}
                max={120}
                step={15}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>15 {t('quiz:quickQuizConfig.minutes')}</span>
                <span>120 {t('quiz:quickQuizConfig.minutes')}</span>
              </div>
            </div>

            {/* Questions From */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                {t('quiz:quickQuizConfig.questionsFrom')}
              </Label>
              <Select value={config.questionsFrom} onValueChange={handleQuestionsFromChange}>
                <SelectTrigger className="w-full input-modern border-2">
                  <SelectValue placeholder={t('quiz:quickQuizConfig.selectSource')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('quiz:quickQuizConfig.allSources')}</SelectItem>
                  <SelectItem value="past-papers">{t('quiz:quickQuizConfig.pastPapersOnly')}</SelectItem>
                  <SelectItem value="model-papers">{t('quiz:quickQuizConfig.modelPapersOnly')}</SelectItem>
                  <SelectItem value="school-papers">{t('quiz:quickQuizConfig.schoolPapersOnly')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {t('quiz:quickQuizConfig.sourceHint')}
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    {t('quiz:quickQuizConfig.infoTitle')}
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• {t('quiz:quickQuizConfig.info1')}</li>
                    <li>• {t('quiz:quickQuizConfig.info2')}</li>
                    <li>• {t('quiz:quickQuizConfig.info3')}</li>
                    <li>• {t('quiz:quickQuizConfig.info4')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Start Button */}
            <div className="pt-4">
              <Button
                onClick={handleQuickStart}
                className="w-full bg-gradient-hero hover:opacity-90 transition-opacity py-6 text-lg font-semibold btn-modern shadow-elegant hover:shadow-hover"
                size="lg"
              >
                <Play className="h-5 w-5 mr-3" />
                {t('quiz:quickQuizConfig.quickStart')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuickQuizConfig;
