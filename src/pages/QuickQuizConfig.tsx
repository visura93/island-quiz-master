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
      // Navigate to quiz page with quick quiz configuration
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
        title: "Error",
        description: error.message || "Failed to start quick quiz",
        variant: "destructive"
      });
    }
  };
  
  const handleBackToDashboard = () => {
    navigate('/student-dashboard');
  };
  
  const getQuizTypeLabel = () => {
    if (quizType === "scholarship") return "Scholarship Grade 5";
    if (quizType === "al") return "A/L";
    if (quizType === "ol") return "O/L";
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
                Island First
              </span>
              <p className="text-xs text-muted-foreground">Smart Learning Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">
                Welcome, {user?.firstName}!
              </span>
            </div>
            <DarkModeToggle />
            <Button 
              variant="outline" 
              onClick={handleBackToDashboard}
              className="btn-modern"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-950/30 rounded-full mb-4">
            <Zap className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            <span className="text-sm font-medium text-pink-600 dark:text-pink-400">Quick Quiz Configuration</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Configure Your Quick Quiz
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Customize your random question quiz with your preferred settings
          </p>
        </div>

        {/* Selected Options Summary */}
        <Card className="border-2 shadow-elegant bg-gradient-card mb-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Selected Options
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
                  Quiz Settings
                </CardTitle>
                <CardDescription>
                  Configure the number of questions, time limit, and question sources
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
                  Number of Questions
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
                <span>10 questions</span>
                <span>50 questions</span>
              </div>
            </div>

            {/* Time Limit */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Time Limit
                </Label>
                <Badge variant="outline" className="text-lg font-bold px-4 py-1">
                  {config.timeLimit} min
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
                <span>15 minutes</span>
                <span>120 minutes</span>
              </div>
            </div>

            {/* Questions From */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                Questions From
              </Label>
              <Select value={config.questionsFrom} onValueChange={handleQuestionsFromChange}>
                <SelectTrigger className="w-full input-modern border-2">
                  <SelectValue placeholder="Select question source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources (Recommended)</SelectItem>
                  <SelectItem value="past-papers">Past Papers Only</SelectItem>
                  <SelectItem value="model-papers">Model Papers Only</SelectItem>
                  <SelectItem value="school-papers">School Papers Only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose which question banks to randomly select from
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
                    Quick Quiz Information
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Questions are randomly selected from available question banks</li>
                    <li>• Each quiz is unique and never the same twice</li>
                    <li>• Perfect for quick practice sessions and testing your knowledge</li>
                    <li>• You can take as many quick quizzes as you want</li>
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
                Quick Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuickQuizConfig;
