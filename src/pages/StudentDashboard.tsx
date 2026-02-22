import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, BookOpen, Trophy, Clock, TrendingUp, LogOut, Search, FileText, Award, School, X, Info, Play, Calendar, CheckCircle, Eye, ChevronRight, Sparkles, Atom, Globe, ArrowLeft, RotateCw, Lock, Crown, Settings as SettingsIcon, MessageCircle, Zap, Flame, Medal, Target, Star, Rocket, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { apiService, QuizBundle, QuizAttempt, TimeAnalytics, Subject, SystemSettings } from "@/lib/api";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { WelcomeTutorial } from "@/components/WelcomeTutorial";
import { getIncompleteQuizzes, formatTimeRemaining, formatLastSavedTime, IncompleteQuiz } from "@/lib/quizProgress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { getMockLeaderboard, getMockStreakInfo } from "@/lib/mockLeaderboardData";
import type { LeaderboardEntry, StreakInfo } from "@/lib/api";
import { getActiveGoals, refreshGoalProgress, type StudyGoal } from "@/lib/goalsStore";
import { evaluateBadges, getRecentBadges, type EarnedBadge, type BadgeProgress, RARITY_STYLES } from "@/lib/badgesEngine";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser, isNewUser, setIsNewUser } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation(['dashboard', 'common']);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedMedium, setSelectedMedium] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [showPaperTypes, setShowPaperTypes] = useState<boolean>(false);
  const [selectedPaperType, setSelectedPaperType] = useState<string>("");
  const [showPaperBundles, setShowPaperBundles] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paperBundles, setPaperBundles] = useState<QuizBundle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [completedQuizzes, setCompletedQuizzes] = useState<QuizAttempt[]>([]);
  const [timeAnalytics, setTimeAnalytics] = useState<TimeAnalytics | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [incompleteQuizzes, setIncompleteQuizzes] = useState<IncompleteQuiz[]>([]);
  const [resumeQuizDialog, setResumeQuizDialog] = useState<{ open: boolean; quiz: IncompleteQuiz | null }>({ open: false, quiz: null });
  const [showWelcomeTutorial, setShowWelcomeTutorial] = useState<boolean>(false);
  
  // New states for enhanced quiz selection
  const [selectedQuizType, setSelectedQuizType] = useState<string>(""); // "scholarship", "al", "ol", or "" for regular
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [showSubjectSelection, setShowSubjectSelection] = useState<boolean>(false);
  const [showLessonwiseTopics, setShowLessonwiseTopics] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [showTermSelection, setShowTermSelection] = useState<boolean>(false);
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);
  
  // System settings state
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(true);

  // Leaderboard widget state
  const [leaderboardTop3, setLeaderboardTop3] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [streakDays, setStreakDays] = useState<number>(0);

  // Goals & badges widget state
  const [dashboardGoals, setDashboardGoals] = useState<StudyGoal[]>([]);
  const [recentBadges, setRecentBadges] = useState<EarnedBadge[]>([]);
  const [totalBadgesEarned, setTotalBadgesEarned] = useState<number>(0);

  // Show welcome tutorial for new users
  useEffect(() => {
    if (isNewUser) {
      setShowWelcomeTutorial(true);
    }
  }, [isNewUser]);

  const handleCloseTutorial = () => {
    setShowWelcomeTutorial(false);
    setIsNewUser(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Load subjects from API
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const data = await apiService.getAllSubjects();
        setSubjects(data);
      } catch (err: any) {
        console.error("Error loading subjects:", err);
        toast({
          title: t('dashboard:student.warningTitle'),
          description: t('dashboard:student.loadingSubjectsError'),
          variant: "destructive",
        });
      } finally {
        setLoadingSubjects(false);
      }
    };

    const loadSystemSettings = async () => {
      try {
        setSettingsLoading(true);
        const data = await apiService.getSystemSettings();
        setSystemSettings(data);
      } catch (err: any) {
        console.error("Error loading system settings:", err);
        // Set default values if loading fails
        setSystemSettings({
          id: '',
          enableScholarship: false,
          enableAL: true,
          enableOL: false,
          enableGradeSelection: false,
          updatedAt: new Date().toISOString()
        });
      } finally {
        setSettingsLoading(false);
      }
    };

    loadSubjects();
    loadSystemSettings();
  }, []);

  const handleGoClick = async () => {
    if (selectedGrade && selectedMedium && selectedSubject) {
      setIsLoading(true);
      setError("");
      try {
        const bundles = await apiService.getQuizBundles(selectedGrade, selectedMedium, selectedSubject, "");
        setPaperBundles(bundles);
        setShowPaperTypes(true);
      } catch (err: any) {
        setError(err.message || "Failed to load quiz bundles");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePaperTypeClick = async (paperTypeId: string, term?: string) => {
    setSelectedPaperType(paperTypeId);
    setIsLoading(true);
    setError("");
    try {
      // Determine grade and medium based on quiz type
      let grade = selectedGrade;
      let medium = selectedMedium;
      
      if (selectedQuizType === "scholarship") {
        grade = "grade-5";
        medium = selectedLanguage;
      } else if (selectedQuizType === "al") {
        grade = "grade-12";
        medium = selectedLanguage;
      } else if (selectedQuizType === "ol") {
        grade = "grade-11";
        medium = selectedLanguage;
      }
      
      // Build query parameters including term if provided
      const queryParams: any = {
        grade,
        medium,
        subject: selectedSubject,
        type: paperTypeId
      };
      
      if (term) {
        queryParams.term = term;
      }
      
      const bundles = await apiService.getQuizBundles(grade, medium, selectedSubject, paperTypeId, term);
      setPaperBundles(bundles);
      setShowPaperBundles(true);
    } catch (err: any) {
      setError(err.message || "Failed to load paper bundles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPaperTypes = () => {
    setShowPaperBundles(false);
    setSelectedPaperType("");
    setSelectedTerm("");
  };

  const handleBackToTermSelection = () => {
    setShowPaperBundles(false);
    setShowTermSelection(true);
    setSelectedTerm("");
  };

  const handleBackToSelection = () => {
    setShowPaperTypes(false);
    setShowPaperBundles(false);
    setSelectedPaperType("");
    setSearchQuery("");
    setSelectedQuizType("");
    setSelectedLanguage("");
    setShowSubjectSelection(false);
    setShowLessonwiseTopics(false);
    setShowTermSelection(false);
    setSelectedTopic("");
    setSelectedTerm("");
  };

  const handleBackToSubjectSelection = () => {
    setShowPaperTypes(false);
    setShowPaperBundles(false);
    setSelectedPaperType("");
    setShowSubjectSelection(true);
    setShowLessonwiseTopics(false);
    setShowTermSelection(false);
    setSelectedTopic("");
    setSelectedTerm("");
  };

  const handleBackToQuizTypeSelection = () => {
    setSelectedQuizType("");
    setShowSubjectSelection(false);
    setShowPaperTypes(false);
    setShowPaperBundles(false);
    setSelectedPaperType("");
    setSelectedSubject("");
    setSelectedLanguage("");
    setShowLessonwiseTopics(false);
    setSelectedTopic("");
  };

  const handleQuizTypeSelect = (quizType: string) => {
    // Check if the quiz type is enabled
    if (!systemSettings) return;
    
    if (quizType === "scholarship" && !systemSettings.enableScholarship) {
      toast({
        title: "Coming Soon",
        description: t('dashboard:student.comingSoonScholarship'),
        variant: "default",
      });
      return;
    }

    if (quizType === "al" && !systemSettings.enableAL) {
      toast({
        title: "Coming Soon",
        description: t('dashboard:student.comingSoonAL'),
        variant: "default",
      });
      return;
    }

    if (quizType === "ol" && !systemSettings.enableOL) {
      toast({
        title: "Coming Soon",
        description: t('dashboard:student.comingSoonOL'),
        variant: "default",
      });
      return;
    }
    
    setSelectedQuizType(quizType);
    setSelectedSubject("");
    setSelectedPaperType("");
    setShowPaperTypes(false);
    setShowPaperBundles(false);
    setShowLessonwiseTopics(false);
    setSelectedTopic("");
    
    if (quizType === "scholarship") {
      // For scholarship, go directly to paper types
      setShowPaperTypes(true);
    } else if (quizType === "al" || quizType === "ol") {
      // For A/L and O/L, show subject selection
      setShowSubjectSelection(true);
    }
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setShowSubjectSelection(false);
    setShowPaperTypes(true);
  };

  const handlePaperTypeSelect = async (paperTypeId: string) => {
    setSelectedPaperType(paperTypeId);
    
    if (paperTypeId === "quick-quiz") {
      // Navigate to Quick Quiz configuration page
      let grade = selectedGrade;
      let medium = selectedMedium;
      
      if (selectedQuizType === "scholarship") {
        grade = "grade-5";
        medium = selectedLanguage;
      } else if (selectedQuizType === "al") {
        grade = "grade-12";
        medium = selectedLanguage;
      } else if (selectedQuizType === "ol") {
        grade = "grade-11";
        medium = selectedLanguage;
      }
      
      navigate('/quick-quiz-config', {
        state: {
          grade: grade,
          medium: medium,
          subject: selectedSubject,
          quizType: selectedQuizType,
          language: selectedLanguage
        }
      });
    } else if (paperTypeId === "lessonwise") {
      // Show lessonwise topic selection (only for A/L and O/L with subjects)
      if (selectedSubject && (selectedQuizType === "al" || selectedQuizType === "ol")) {
        setShowLessonwiseTopics(true);
      }
    } else {
      // For scholarship, we need to set a default subject or handle it differently
      if (selectedQuizType === "scholarship") {
        // Scholarship doesn't have subjects, so we'll use a default or handle it in the API call
        setSelectedSubject("scholarship");
      }
      
      // Check if term selection is needed (grades 1-13, model-papers or school-papers)
      const needsTermSelection = !selectedQuizType && selectedGrade && 
        (paperTypeId === "model-papers" || paperTypeId === "school-papers");
      
      if (needsTermSelection) {
        // Show term selection
        setShowTermSelection(true);
      } else {
        // Load paper bundles directly
        await handlePaperTypeClick(paperTypeId);
      }
    }
  };

  const handleTermSelect = async (term: string) => {
    setSelectedTerm(term);
    setShowTermSelection(false);
    // Load paper bundles with selected term
    await handlePaperTypeClick(selectedPaperType, term);
  };

  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    setShowLessonwiseTopics(false);
    // Load bundles for the selected topic
    setIsLoading(true);
    setError("");
    try {
      const grade = selectedQuizType === "al" ? "grade-12" : selectedQuizType === "ol" ? "grade-11" : selectedGrade;
      const bundles = await apiService.getQuizBundles(grade, selectedLanguage, selectedSubject, "lessonwise");
      // Filter by topic if needed - you may need to add topic filtering logic here
      // For now, we'll show all lessonwise bundles
      setPaperBundles(bundles);
      setShowPaperBundles(true);
    } catch (err: any) {
      setError(err.message || "Failed to load quiz bundles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);
    if (value.trim() && selectedPaperType) {
      try {
        const bundles = await apiService.searchQuizzes(value);
        // Convert quiz search results to bundle format
        const searchBundles: QuizBundle[] = bundles.map(quiz => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          year: quiz.year.toString(),
          paperCount: 1,
          difficulty: quiz.difficulty,
          thumbnail: undefined,
          quizzes: [quiz]
        }));
        setPaperBundles(searchBundles);
      } catch (err: any) {
        setError(err.message || "Search failed");
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Fetch student statistics and incomplete quizzes on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const [quizzes, analytics] = await Promise.all([
          apiService.getCompletedQuizzes(),
          apiService.getTimeAnalytics()
        ]);
        setCompletedQuizzes(quizzes);
        setTimeAnalytics(analytics);
      } catch (err: any) {
        console.error("Error loading statistics:", err);
        // Don't show error to user, just use default values
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
    
    // Load incomplete quizzes from localStorage
    const incomplete = getIncompleteQuizzes();
    setIncompleteQuizzes(incomplete);
    
    // Load leaderboard preview data
    const loadLeaderboardPreview = async () => {
      try {
        const data = await apiService.getLeaderboard({ period: 'allTime', limit: 3 });
        setLeaderboardTop3(data.entries.slice(0, 3));
        setMyRank(data.myRank);
      } catch {
        const userId = user?.id ?? '';
        const userName = user?.fullName ?? user?.firstName ?? 'You';
        const mock = getMockLeaderboard({ period: 'allTime', limit: 50 }, userId, userName);
        setLeaderboardTop3(mock.entries.slice(0, 3));
        setMyRank(mock.myRank);
      }
      try {
        const streak = await apiService.getStreakInfo();
        setStreakDays(streak.currentStreak);
      } catch {
        setStreakDays(getMockStreakInfo().currentStreak);
      }
    };
    loadLeaderboardPreview();

    // Load goals & badges preview
    const loadGoalsAndBadges = async () => {
      try {
        const [quizResult, streakResult] = await Promise.allSettled([
          apiService.getCompletedQuizzes(),
          apiService.getStreakInfo(),
        ]);
        const quizzes = quizResult.status === 'fulfilled' ? quizResult.value : [];
        const streakData = streakResult.status === 'fulfilled' ? streakResult.value : getMockStreakInfo();
        refreshGoalProgress(quizzes, streakData);
        setDashboardGoals(getActiveGoals().slice(0, 3));
        const badgeResults = evaluateBadges(quizzes, streakData);
        setTotalBadgesEarned(badgeResults.filter((b) => b.earned).length);
        setRecentBadges(getRecentBadges(4));
      } catch {
        setDashboardGoals(getActiveGoals().slice(0, 3));
        setRecentBadges(getRecentBadges(4));
      }
    };
    loadGoalsAndBadges();
    
    // Refresh user data to get latest premium status
    refreshUser();
  }, []);

  // Refresh user data when window gains focus (e.g., coming back from admin panel)
  useEffect(() => {
    const handleFocus = () => {
      refreshUser();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Periodically refresh user data to sync premium status
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUser();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleStartQuiz = (quizId: string, quizTitle: string, resume: boolean = false) => {
    // Determine grade and medium based on quiz type
    let grade = selectedGrade;
    let medium = selectedMedium;
    
    if (selectedQuizType === "scholarship") {
      grade = "grade-5";
      medium = selectedLanguage;
    } else if (selectedQuizType === "al") {
      grade = "grade-12";
      medium = selectedLanguage;
    } else if (selectedQuizType === "ol") {
      grade = "grade-11";
      medium = selectedLanguage;
    }
    
    // Navigate to quiz page with quiz information
    navigate('/quiz', { 
      state: { 
        quizId, // Pass the individual quiz ID
        quizTitle, // Pass the individual quiz title
        grade: grade,
        medium: medium,
        subject: selectedSubject,
        paperType: selectedPaperType,
        quizType: selectedQuizType,
        language: selectedLanguage,
        topic: selectedTopic,
        term: selectedTerm
      } 
    });
  };

  const handleQuizClick = (quiz: any) => {
    // Check if this quiz has incomplete progress
    const incomplete = incompleteQuizzes.find(iq => iq.quizId === quiz.id);
    
    if (incomplete) {
      // Show resume dialog
      setResumeQuizDialog({ open: true, quiz: incomplete });
    } else {
      // Start normally
      handleStartQuiz(quiz.id, quiz.title);
    }
  };

  // Filter paper bundles based on search query
  const getFilteredBundles = () => {
    if (!searchQuery.trim()) return paperBundles;
    
    const query = searchQuery.toLowerCase().trim();
    return paperBundles.filter(bundle => 
      bundle.title.toLowerCase().includes(query) ||
      bundle.description.toLowerCase().includes(query) ||
      bundle.year.toLowerCase().includes(query) ||
      bundle.difficulty.toLowerCase().includes(query)
    );
  };

  // Static data for form options
  const grades = [
    { value: "grade-6", label: t('dashboard:student.grades.grade6') },
    { value: "grade-7", label: t('dashboard:student.grades.grade7') },
    { value: "grade-8", label: t('dashboard:student.grades.grade8') },
    { value: "grade-9", label: t('dashboard:student.grades.grade9') },
    { value: "grade-10", label: t('dashboard:student.grades.grade10') },
    { value: "grade-11", label: t('dashboard:student.grades.grade11') },
    { value: "grade-12", label: t('dashboard:student.grades.grade12') },
    { value: "grade-13", label: t('dashboard:student.grades.grade13') },
  ];

  const mediums = [
    { value: "sinhala", label: t('dashboard:student.languages.sinhala') },
    { value: "english", label: t('dashboard:student.languages.english') },
    { value: "tamil", label: t('dashboard:student.languages.tamil') },
  ];

  // Grade-specific subject lists
  const subjectsGrade6To9 = [
    { value: "ict", label: "ICT" },
    { value: "science", label: "Science" },
    { value: "mathematics", label: "Maths" },
    { value: "sinhala", label: "Sinhala" },
    { value: "buddhism", label: "Buddhism" },
    { value: "geography", label: "Geography" },
    { value: "civil-studies", label: "Civil Studies" },
    { value: "tamil", label: "Tamil" },
    { value: "health", label: "Health" },
    { value: "art", label: "Art" },
    { value: "dancing", label: "Dancing" },
    { value: "eastern-music", label: "Eastern Music" },
    { value: "history", label: "History" },
  ];

  const subjectsGrade10To11 = [
    { value: "ict", label: "ICT" },
    { value: "science", label: "Science" },
    { value: "mathematics", label: "Maths" },
    { value: "sinhala", label: "Sinhala" },
    { value: "buddhism", label: "Buddhism" },
    { value: "geography", label: "Geography" },
    { value: "civil-studies", label: "Civil Studies" },
    { value: "tamil", label: "Tamil" },
    { value: "health", label: "Health" },
    { value: "art", label: "Art" },
    { value: "dancing", label: "Dancing" },
    { value: "eastern-music", label: "Eastern Music" },
    { value: "history", label: "History" },
    { value: "english", label: "English" },
    { value: "commerce", label: "Commerce" },
  ];

  const subjectsGrade12To13 = [
    { value: "combined-mathematics", label: "Combined Maths" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "biology", label: "Bio" },
    { value: "ict", label: "ICT" },
    { value: "economics", label: "Economics" },
    { value: "business-studies", label: "Business Studies" },
    { value: "political-science", label: "Political Science" },
  ];

  // Get subjects based on selected grade
  const getSubjectsForGrade = (grade: string) => {
    if (!grade) return [];
    
    const gradeNumber = parseInt(grade.replace('grade-', ''));
    let category = "";
    
    if (gradeNumber >= 6 && gradeNumber <= 9) {
      category = "Grade 6-9";
    } else if (gradeNumber >= 10 && gradeNumber <= 11) {
      category = "Grade 10-11";
    } else if (gradeNumber >= 12 && gradeNumber <= 13) {
      category = "Grade 12-13";
    }
    
    // Get subjects from API data for the category
    const dynamicSubjects = subjects
      .filter(s => s.category === category && s.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(s => ({ value: s.value, label: s.name }));
    
    // If we have dynamic subjects, use them
    if (dynamicSubjects.length > 0) {
      return dynamicSubjects;
    }
    
    // Fallback to hardcoded subjects if API data not available yet
    if (gradeNumber >= 6 && gradeNumber <= 9) {
      return subjectsGrade6To9;
    } else if (gradeNumber >= 10 && gradeNumber <= 11) {
      return subjectsGrade10To11;
    } else if (gradeNumber >= 12 && gradeNumber <= 13) {
      return subjectsGrade12To13;
    }
    
    return [];
  };

  const paperTypes = [
    {
      id: "past-papers",
      title: t('dashboard:student.paperTypes.pastPapers'),
      description: t('dashboard:student.paperTypes.pastPapersDesc'),
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
      id: "model-papers",
      title: t('dashboard:student.paperTypes.modelPapers'),
      description: t('dashboard:student.paperTypes.modelPapersDesc'),
      icon: Award,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-200 dark:border-green-800"
    },
    {
      id: "school-papers",
      title: t('dashboard:student.paperTypes.schoolPapers'),
      description: t('dashboard:student.paperTypes.schoolPapersDesc'),
      icon: School,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      borderColor: "border-purple-200 dark:border-purple-800"
    },
    {
      id: "lessonwise",
      title: t('dashboard:student.paperTypes.lessonwise'),
      description: t('dashboard:student.paperTypes.lessonwiseDesc'),
      icon: BookOpen,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      borderColor: "border-orange-200 dark:border-orange-800"
    },
    {
      id: "quick-quiz",
      title: t('dashboard:student.paperTypes.quickQuiz'),
      description: t('dashboard:student.paperTypes.quickQuizDesc'),
      icon: Zap,
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-50 dark:bg-pink-950/30",
      borderColor: "border-pink-200 dark:border-pink-800"
    }
  ];

  const scholarshipPaperTypes = [
    {
      id: "past-papers",
      title: t('dashboard:student.paperTypes.pastPapers'),
      description: t('dashboard:student.paperTypes.pastPapersDesc'),
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
      id: "model-papers",
      title: t('dashboard:student.paperTypes.modelPapers'),
      description: t('dashboard:student.paperTypes.modelPapersDesc'),
      icon: Award,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-200 dark:border-green-800"
    }
  ];

  const olSubjects = [
    { value: "mother-language-sinhala", label: "Mother Language (Sinhala)" },
    { value: "mother-language-tamil", label: "Mother Language (Tamil)" },
    { value: "religion-buddhism", label: "Religion (Buddhism)" },
    { value: "religion-christianity", label: "Religion (Catholicism / Christianity)" },
    { value: "religion-islam", label: "Religion (Islam)" },
    { value: "religion-hinduism", label: "Religion (Hinduism)" },
    { value: "english", label: "English Language" },
    { value: "mathematics", label: "Mathematics" },
    { value: "science", label: "Science" },
    { value: "history", label: "History" }
  ];

  const alSubjects = [
    { value: "combined-mathematics", label: "Combined Maths" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "biology", label: "Bio" },
    { value: "ict", label: "ICT" },
    { value: "economics", label: "Economics" },
    { value: "business-studies", label: "Business Studies" },
    { value: "political-science", label: "Political Science" },
  ];

  // Get dynamic O/L subjects from API
  const getOLSubjects = () => {
    const dynamicSubjects = subjects
      .filter(s => s.category === "Grade 10-11" && s.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(s => ({ value: s.value, label: s.name }));
    
    return dynamicSubjects.length > 0 ? dynamicSubjects : olSubjects;
  };

  // Get dynamic A/L subjects from API
  const getALSubjects = () => {
    const dynamicSubjects = subjects
      .filter(s => s.category === "Grade 12-13" && s.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(s => ({ value: s.value, label: s.name }));
    
    return dynamicSubjects.length > 0 ? dynamicSubjects : alSubjects;
  };

  const physicsTopics = [
    { value: "waves", label: "Waves Related Questions" },
    { value: "mechanics", label: "Mechanics" },
    { value: "thermodynamics", label: "Thermodynamics" },
    { value: "optics", label: "Optics" },
    { value: "electricity", label: "Electricity & Magnetism" },
    { value: "modern-physics", label: "Modern Physics" }
  ];

  const chemistryTopics = [
    { value: "organic", label: "Organic Chemistry" },
    { value: "inorganic", label: "Inorganic Chemistry" },
    { value: "physical", label: "Physical Chemistry" },
    { value: "analytical", label: "Analytical Chemistry" }
  ];

  const combinedMathTopics = [
    { value: "algebra", label: "Algebra" },
    { value: "geometry", label: "Geometry" },
    { value: "trigonometry", label: "Trigonometry" },
    { value: "calculus", label: "Calculus" },
    { value: "statistics", label: "Statistics & Probability" }
  ];

  const biologyTopics = [
    { value: "cell-biology", label: "Cell Biology" },
    { value: "genetics", label: "Genetics" },
    { value: "ecology", label: "Ecology" },
    { value: "human-biology", label: "Human Biology" },
    { value: "plant-biology", label: "Plant Biology" }
  ];

  const languages = [
    { value: "sinhala", label: t('dashboard:student.languages.sinhala') },
    { value: "english", label: t('dashboard:student.languages.english') },
    { value: "tamil", label: t('dashboard:student.languages.tamil') }
  ];

  const getTopicsForSubject = (subject: string) => {
    switch (subject) {
      case "physics":
        return physicsTopics;
      case "chemistry":
        return chemistryTopics;
      case "combined-mathematics":
        return combinedMathTopics;
      case "biology":
        return biologyTopics;
      default:
        return [];
    }
  };

  // Get filtered paper types based on grade selection
  const getFilteredPaperTypes = () => {
    // If selecting by grade (not scholarship/A/L/O/L), filter for grades 6-13
    if (!selectedQuizType && selectedGrade) {
      const gradeNumber = parseInt(selectedGrade.replace('grade-', ''));
      if (gradeNumber >= 6 && gradeNumber <= 13) {
        // For grades 6-13, only show Model Papers and School Papers
        return paperTypes.filter(pt => pt.id === "model-papers" || pt.id === "school-papers");
      }
    }
    // For scholarship, return scholarship paper types
    if (selectedQuizType === "scholarship") {
      return scholarshipPaperTypes;
    }
    // For A/L, O/L, or other cases, return all paper types
    return paperTypes;
  };

  // Calculate statistics from fetched data
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const quizzesCompleted = completedQuizzes.length;
  const averageScore = completedQuizzes.length > 0
    ? Math.round(completedQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / completedQuizzes.length)
    : 0;
  const totalTimeSpent = timeAnalytics?.totalTime || completedQuizzes.reduce((sum, quiz) => sum + quiz.timeSpent, 0);
  
  // Calculate progress (could be based on goals or completion rate)
  // For now, using a simple calculation based on average score
  const progress = averageScore;

  const stats = [
    {
      label: t('dashboard:student.stats.quizzesCompleted'),
      value: statsLoading ? t('common:status.loading') : quizzesCompleted.toString(),
      icon: BookOpen,
      color: "text-primary"
    },
    {
      label: t('dashboard:student.stats.averageScore'),
      value: statsLoading ? t('common:status.loading') : `${averageScore}%`,
      icon: Trophy,
      color: "text-success"
    },
    {
      label: t('dashboard:student.stats.timeSpent'),
      value: statsLoading ? t('common:status.loading') : formatTime(totalTimeSpent),
      icon: Clock,
      color: "text-secondary"
    },
    {
      label: t('dashboard:student.stats.progress'),
      value: statsLoading ? t('common:status.loading') : `${progress}%`,
      icon: TrendingUp,
      color: "text-accent"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              // Navigate to dashboard based on user role
              if (user?.role === 'Admin' || user?.role === 2) {
                navigate('/admin-dashboard');
              } else if (user?.role === 'Teacher' || user?.role === 1) {
                navigate('/teacher-dashboard');
              } else {
                navigate('/student-dashboard');
              }
            }}
          >
            <div className="p-2 bg-gradient-hero rounded-xl shadow-elegant">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                {t('common:appName')}
              </span>
              <p className="text-xs text-muted-foreground">Smart Learning Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Premium Status Badge or Upgrade Button */}
            {user?.isPremium && user?.subscriptionEndDate && new Date(user.subscriptionEndDate) > new Date() ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-md">
                <Crown className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">
                  Premium Active
                </span>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/payment')}
                className="hidden sm:flex bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold shadow-lg"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            )}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">
                {t('dashboard:student.welcome', { name: user?.firstName })}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/contact-us')}
              className="btn-modern"
              title="Contact Us"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/settings')}
              className="btn-modern"
              title={t('common:buttons.settings')}
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
            <LanguageSwitcher />
            <DarkModeToggle />
            <Button variant="outline" onClick={handleLogout} className="btn-modern">
              <LogOut className="h-4 w-4 mr-2" />
              {t('common:buttons.logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-primary">Live Dashboard</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Welcome back! Ready to practice and improve your skills?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="group border-2 hover:shadow-hover transition-all bg-gradient-card card-hover overflow-hidden cursor-pointer"
              onClick={() => {
                if (stat.label === "Quizzes Completed") {
                  navigate('/completed-quizzes');
                } else if (stat.label === "Time Spent") {
                  navigate('/time-analytics');
                }
                // Add more navigation for other stats as needed
              }}
            >
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-hero rounded-full w-0 group-hover:w-full transition-all duration-1000"></div>
                  </div>
                  {(stat.label === "Quizzes Completed" || stat.label === "Time Spent") && (
                    <div className="mt-2 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to view details →
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leaderboard Preview Widget - Only show in dashboard view */}
        {!selectedQuizType && 
         !showPaperTypes && 
         !showPaperBundles && 
         !showSubjectSelection && 
         !showLessonwiseTopics && (
          <Card 
            className="border-2 shadow-elegant bg-gradient-card mb-12 cursor-pointer hover:shadow-hover transition-all group overflow-hidden"
            onClick={() => navigate('/leaderboard')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Left: Rank & Streak */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-center">
                    <div className="p-3 bg-gradient-hero rounded-xl shadow-elegant mb-2 group-hover:scale-105 transition-transform">
                      <Trophy className="h-7 w-7 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">#{myRank ?? '--'}</p>
                    <p className="text-xs text-muted-foreground">Your Rank</p>
                  </div>
                  <div className="w-px h-16 bg-border hidden lg:block" />
                  <div className="text-center">
                    <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-elegant mb-2 group-hover:scale-105 transition-transform">
                      <Flame className="h-7 w-7 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{streakDays}d</p>
                    <p className="text-xs text-muted-foreground">Streak</p>
                  </div>
                </div>

                {/* Center: Top 3 Mini List */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Medal className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold text-foreground">Top Performers</span>
                  </div>
                  <div className="space-y-2">
                    {leaderboardTop3.map((entry, idx) => (
                      <div key={entry.studentId} className="flex items-center gap-3">
                        <span className={`text-xs font-bold w-5 text-center ${
                          idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : "text-orange-500"
                        }`}>
                          #{idx + 1}
                        </span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                          idx === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-500" :
                          idx === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500" :
                          "bg-gradient-to-br from-orange-400 to-amber-500"
                        }`}>
                          {entry.studentName.charAt(0)}
                        </div>
                        <span className={`text-sm truncate flex-1 ${entry.isCurrentUser ? "font-bold text-primary" : "text-foreground"}`}>
                          {entry.studentName}
                          {entry.isCurrentUser && <span className="text-[10px] text-primary ml-1">(You)</span>}
                        </span>
                        <span className="text-sm font-semibold text-muted-foreground">{entry.score}%</span>
                      </div>
                    ))}
                    {leaderboardTop3.length === 0 && (
                      <p className="text-sm text-muted-foreground">No data yet</p>
                    )}
                  </div>
                </div>

                {/* Right: CTA */}
                <div className="flex-shrink-0">
                  <Button
                    className="bg-gradient-hero hover:opacity-90 transition-opacity btn-modern"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/leaderboard');
                    }}
                  >
                    View Full Leaderboard
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals & Badges Widget - Only show in dashboard view */}
        {!selectedQuizType &&
         !showPaperTypes &&
         !showPaperBundles &&
         !showSubjectSelection &&
         !showLessonwiseTopics && (
          <Card
            className="border-2 shadow-elegant bg-gradient-card mb-12 cursor-pointer hover:shadow-hover transition-all group overflow-hidden"
            onClick={() => navigate('/goals')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Active Goals */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">My Goals</span>
                    {dashboardGoals.length === 0 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto">
                        Set a goal
                      </Badge>
                    )}
                  </div>
                  {dashboardGoals.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardGoals.map((goal) => {
                        const pct = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
                        return (
                          <div key={goal.id} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-foreground font-medium truncate mr-2">{goal.title}</span>
                              <span className="text-muted-foreground whitespace-nowrap">{pct}%</span>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No active goals yet. Tap to create one!
                    </p>
                  )}
                </div>

                <div className="w-px bg-border hidden lg:block" />

                {/* Right: Recent Badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Badges</span>
                    {totalBadgesEarned > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-auto">
                        {totalBadgesEarned} earned
                      </Badge>
                    )}
                  </div>
                  {recentBadges.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {recentBadges.map((badge) => {
                        const style = RARITY_STYLES[badge.rarity];
                        const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
                          Rocket, BookOpen, Crown, Star, TrendingUp, GraduationCap,
                          Flame, Zap, Moon, Target, Trophy,
                        };
                        const Icon = IconMap[badge.icon] || Star;
                        return (
                          <div key={badge.id} className="flex flex-col items-center gap-1" title={badge.name}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${style.border} ${style.bg}`}>
                              <Icon className={`h-5 w-5 ${style.text}`} />
                            </div>
                            <span className="text-[10px] text-muted-foreground text-center leading-tight max-w-[60px] truncate">
                              {badge.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Complete quizzes to earn badges!
                    </p>
                  )}
                </div>

                {/* CTA Arrow */}
                <div className="flex items-center flex-shrink-0">
                  <Button
                    className="bg-gradient-hero hover:opacity-90 transition-opacity btn-modern"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/goals');
                    }}
                  >
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recently Completed Quizzes - Only show in dashboard view */}
        {completedQuizzes.length > 0 && 
         !selectedQuizType && 
         !showPaperTypes && 
         !showPaperBundles && 
         !showSubjectSelection && 
         !showLessonwiseTopics && (
          <Card className="border-2 shadow-elegant bg-gradient-card mb-12">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-hero rounded-lg">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl bg-gradient-hero bg-clip-text text-transparent">
                      Recently Completed Quizzes
                    </CardTitle>
                    <CardDescription>
                      Review your quiz performance and answers
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/completed-quizzes')}
                  className="btn-modern"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedQuizzes
                  .sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())
                  .slice(0, 3)
                  .map((quiz) => {
                    const formatQuizDate = (dateString: string) => {
                      const date = new Date(dateString);
                      return date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      });
                    };

                    const getScoreColor = (score: number) => {
                      if (score >= 90) return "text-green-600 bg-green-100";
                      if (score >= 80) return "text-blue-600 bg-blue-100";
                      if (score >= 70) return "text-yellow-600 bg-yellow-100";
                      return "text-red-600 bg-red-100";
                    };

                    return (
                      <Card key={quiz.id} className="border-2 hover:shadow-md transition-all">
                        <CardContent className="p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Quiz Info */}
                            <div className="flex-1">
                              <div className="flex items-start gap-4">
                                <div className="p-2 bg-gradient-hero rounded-lg">
                                  <BookOpen className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold mb-2">{quiz.quizTitle}</h3>
                                  <div className="flex flex-wrap gap-2 mb-2">
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
                                      {formatQuizDate(quiz.completedDate)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {formatTime(quiz.timeSpent)} / {formatTime(quiz.timeLimit)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Score and Details */}
                            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 items-center lg:items-end">
                              <div className="text-center">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold ${getScoreColor(quiz.score)}`}>
                                  <Trophy className="h-4 w-4" />
                                  {quiz.score}%
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {quiz.correctAnswers} / {quiz.totalQuestions} correct
                                </p>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/completed-quizzes')}
                                className="btn-modern"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Performance</span>
                              <span className="text-sm text-muted-foreground">{quiz.score}%</span>
                            </div>
                            <Progress value={quiz.score} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              
              {/* See More Button */}
              {completedQuizzes.length > 3 && (
                <div className="pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/completed-quizzes')}
                    className="w-full btn-modern"
                  >
                    See More
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz Selection Interface */}
        <Card className="border-2 shadow-elegant bg-gradient-card overflow-hidden">
          <CardHeader className="relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-hero"></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-hero rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl bg-gradient-hero bg-clip-text text-transparent">
                  Select Your Quiz
                </CardTitle>
                <CardDescription className="text-lg">
                  Choose your grade, medium, and subject to get started
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!selectedQuizType && !showPaperTypes ? (
              <div className="space-y-8">
                {/* New Quiz Type Selection Cards */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Choose Your Exam Type</h3>
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Scholarship Grade 5 Card */}
                    <Card 
                      className={`transition-all border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 ${
                        systemSettings?.enableScholarship 
                          ? 'cursor-pointer hover:shadow-lg hover:scale-105 hover:border-amber-300' 
                          : 'opacity-75 cursor-not-allowed relative'
                      }`}
                      onClick={() => systemSettings?.enableScholarship && handleQuizTypeSelect("scholarship")}
                    >
                      <CardContent className="p-6 text-center">
                        {!systemSettings?.enableScholarship && (
                          <div className="absolute top-2 right-2 z-10">
                            <Badge className="bg-orange-500 text-white shadow-md">
                              Coming Soon
                            </Badge>
                          </div>
                        )}
                        {systemSettings?.enableScholarship && (
                          <div className="absolute top-2 right-2 z-10">
                            <Badge className="bg-green-500 text-white shadow-md animate-pulse">
                              Available Now
                            </Badge>
                          </div>
                        )}
                        <div className={`p-4 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center ${
                          !systemSettings?.enableScholarship ? 'opacity-60' : ''
                        }`}>
                          <Sparkles className="h-10 w-10 text-white" />
                        </div>
                        <h4 className={`font-bold text-xl mb-2 text-amber-900 ${
                          !systemSettings?.enableScholarship ? 'opacity-60' : ''
                        }`}>Scholarship Grade 5</h4>
                        <p className={`text-sm text-amber-700 mb-3 ${
                          !systemSettings?.enableScholarship ? 'opacity-60' : ''
                        }`}>Practice for Grade 5 Scholarship Exam</p>
                        <div className={`text-xs text-amber-600 bg-amber-100 px-3 py-1 rounded-full inline-block ${
                          !systemSettings?.enableScholarship ? 'opacity-60' : ''
                        }`}>
                          Past & Model Papers
                        </div>
                      </CardContent>
                    </Card>

                    {/* A/L Card */}
                    <Card 
                      className={`transition-all border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 ${
                        systemSettings?.enableAL 
                          ? 'cursor-pointer hover:shadow-lg hover:scale-105 hover:border-blue-300' 
                          : 'opacity-75 cursor-not-allowed relative'
                      }`}
                      onClick={() => systemSettings?.enableAL && handleQuizTypeSelect("al")}
                    >
                      <CardContent className="p-6 text-center">
                        {!systemSettings?.enableAL && (
                          <div className="absolute top-2 right-2 z-10">
                            <Badge className="bg-orange-500 text-white shadow-md">
                              Coming Soon
                            </Badge>
                          </div>
                        )}
                        {systemSettings?.enableAL && (
                          <div className="absolute top-2 right-2 z-10">
                            <Badge className="bg-green-500 text-white shadow-md animate-pulse">
                              Available Now
                            </Badge>
                          </div>
                        )}
                        <div className={`p-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center ${
                          !systemSettings?.enableAL ? 'opacity-60' : ''
                        }`}>
                          <Atom className="h-10 w-10 text-white" />
                        </div>
                        <h4 className={`font-bold text-xl mb-2 text-blue-900 ${
                          !systemSettings?.enableAL ? 'opacity-60' : ''
                        }`}>A/L</h4>
                        <p className={`text-sm text-blue-700 mb-3 ${
                          !systemSettings?.enableAL ? 'opacity-60' : ''
                        }`}>Advanced Level Examination</p>
                        <div className={`text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block ${
                          !systemSettings?.enableAL ? 'opacity-60' : ''
                        }`}>
                          Physics, Chemistry, Math, Biology
                        </div>
                      </CardContent>
                    </Card>

                    {/* O/L Card */}
                    <Card 
                      className={`transition-all border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 ${
                        systemSettings?.enableOL 
                          ? 'cursor-pointer hover:shadow-lg hover:scale-105 hover:border-green-300' 
                          : 'opacity-75 cursor-not-allowed relative'
                      }`}
                      onClick={() => systemSettings?.enableOL && handleQuizTypeSelect("ol")}
                    >
                      <CardContent className="p-6 text-center">
                        {!systemSettings?.enableOL && (
                          <div className="absolute top-2 right-2 z-10">
                            <Badge className="bg-orange-500 text-white shadow-md">
                              Coming Soon
                            </Badge>
                          </div>
                        )}
                        {systemSettings?.enableOL && (
                          <div className="absolute top-2 right-2 z-10">
                            <Badge className="bg-green-500 text-white shadow-md animate-pulse">
                              Available Now
                            </Badge>
                          </div>
                        )}
                        <div className={`p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center ${
                          !systemSettings?.enableOL ? 'opacity-60' : ''
                        }`}>
                          <Globe className="h-10 w-10 text-white" />
                        </div>
                        <h4 className={`font-bold text-xl mb-2 text-green-900 ${
                          !systemSettings?.enableOL ? 'opacity-60' : ''
                        }`}>O/L</h4>
                        <p className={`text-sm text-green-700 mb-3 ${
                          !systemSettings?.enableOL ? 'opacity-60' : ''
                        }`}>Ordinary Level Examination</p>
                        <div className={`text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full inline-block ${
                          !systemSettings?.enableOL ? 'opacity-60' : ''
                        }`}>
                          Multiple Subjects Available
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-background text-muted-foreground">OR</span>
                  </div>
                </div>

                {/* Regular Grade Selection Form - Coming Soon */}
                <div className={`relative min-h-[350px] ${!systemSettings?.enableGradeSelection ? '' : ''}`}>
                  <h3 className="text-xl font-semibold mb-4 text-center">Select by Grade</h3>
                  
                  {/* Coming Soon Overlay - only show if disabled */}
                  {!systemSettings?.enableGradeSelection && (
                    <div className="absolute left-0 right-0 top-12 bottom-0 bg-slate-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10 min-h-[300px]">
                      <div className="text-center text-white p-6">
                        <Lock className="h-16 w-16 mx-auto mb-4 text-orange-400" />
                        <h4 className="font-bold text-2xl mb-3">Coming Soon!</h4>
                        <p className="text-base mb-2 opacity-90 max-w-md">
                          Grade-wise quiz selection is currently under development.
                        </p>
                        <p className="text-sm opacity-75 mb-4">
                          Please use the available categories above to access quizzes.
                        </p>
                        <Badge className="bg-orange-500 text-white shadow-md px-4 py-2">
                          Feature Coming Soon
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Form - disabled if setting is off */}
                  <div className={systemSettings?.enableGradeSelection ? '' : 'opacity-30 pointer-events-none'}>
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Grade Selection */}
                      <div className="space-y-3 group">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          Grade
                        </label>
                        <Select 
                          value={selectedGrade} 
                          onValueChange={(value) => {
                            setSelectedGrade(value);
                            setSelectedSubject(""); // Reset subject when grade changes
                          }}
                          disabled={!systemSettings?.enableGradeSelection}
                        >
                          <SelectTrigger className="w-full input-modern border-2 focus:border-primary/50">
                            <SelectValue placeholder="Select Grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {grades.map((grade) => (
                              <SelectItem key={grade.value} value={grade.value}>
                                {grade.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Medium Selection */}
                      <div className="space-y-3 group">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <div className="w-2 h-2 bg-secondary rounded-full"></div>
                          Medium
                        </label>
                        <Select 
                          value={selectedMedium} 
                          onValueChange={setSelectedMedium}
                          disabled={!systemSettings?.enableGradeSelection}
                        >
                          <SelectTrigger className="w-full input-modern border-2 focus:border-secondary/50">
                            <SelectValue placeholder="Select Medium" />
                          </SelectTrigger>
                          <SelectContent>
                            {mediums.map((medium) => (
                              <SelectItem key={medium.value} value={medium.value}>
                                {medium.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Subject Selection */}
                      <div className="space-y-3 group">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                          Subject
                        </label>
                        <Select 
                          value={selectedSubject} 
                          onValueChange={setSelectedSubject}
                          disabled={!selectedGrade || !systemSettings?.enableGradeSelection}
                        >
                          <SelectTrigger className="w-full input-modern border-2 focus:border-accent/50">
                            <SelectValue placeholder={selectedGrade ? "Select Subject" : "Select Grade First"} />
                          </SelectTrigger>
                          <SelectContent>
                            {getSubjectsForGrade(selectedGrade).map((subject) => (
                              <SelectItem key={subject.value} value={subject.value}>
                                {subject.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Go Button */}
                    <div className="flex justify-center pt-6">
                      <Button 
                        onClick={handleGoClick}
                        disabled={!selectedGrade || !selectedMedium || !selectedSubject || !systemSettings?.enableGradeSelection}
                        className="bg-gradient-hero hover:opacity-90 transition-opacity px-12 py-6 text-lg font-semibold btn-modern shadow-elegant hover:shadow-hover"
                        size="lg"
                      >
                        <Search className="h-5 w-5 mr-3" />
                        Start Your Journey
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : showSubjectSelection ? (
              <div className="space-y-6">
                {/* Language Selection */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Select Language</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {languages.map((lang) => (
                      <Button
                        key={lang.value}
                        variant={selectedLanguage === lang.value ? "default" : "outline"}
                        onClick={() => setSelectedLanguage(lang.value)}
                        className={`transition-all ${
                          selectedLanguage === lang.value 
                            ? "bg-gradient-hero text-white" 
                            : "hover:bg-primary/10"
                        }`}
                      >
                        {lang.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Subject Selection */}
                {selectedLanguage && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Select Subject for {selectedQuizType === "al" ? "A/L" : "O/L"}
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(selectedQuizType === "al" ? getALSubjects() : getOLSubjects()).map((subject) => (
                        <Card
                          key={subject.value}
                          className="cursor-pointer transition-all hover:shadow-lg border-2 hover:scale-105 hover:border-primary"
                          onClick={() => handleSubjectSelect(subject.value)}
                        >
                          <CardContent className="p-6 text-center">
                            <BookOpen className="h-8 w-8 mx-auto mb-3 text-primary" />
                            <h4 className="font-semibold">{subject.label}</h4>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Back Button */}
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={handleBackToQuizTypeSelection}
                    className="px-6"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Quiz Types
                  </Button>
                </div>
              </div>
            ) : showLessonwiseTopics ? (
              <div className="space-y-6">
                {/* Selection Summary */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Selected Options:</h3>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                      {selectedQuizType === "al" ? "A/L" : selectedQuizType === "ol" ? "O/L" : "Scholarship"}
                    </span>
                    <span className="bg-secondary/10 text-secondary px-2 py-1 rounded">
                      {languages.find(l => l.value === selectedLanguage)?.label}
                    </span>
                    <span className="bg-accent/10 text-accent px-2 py-1 rounded">
                      {(selectedQuizType === "al" ? alSubjects : olSubjects).find(s => s.value === selectedSubject)?.label}
                    </span>
                    <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded">
                      Lessonwise Select
                    </span>
                  </div>
                </div>

                {/* Topic Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Topic</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getTopicsForSubject(selectedSubject).map((topic) => (
                      <Card
                        key={topic.value}
                        className="cursor-pointer transition-all hover:shadow-lg border-2 hover:scale-105 hover:border-primary"
                        onClick={() => handleTopicSelect(topic.value)}
                      >
                        <CardContent className="p-6 text-center">
                          <BookOpen className="h-8 w-8 mx-auto mb-3 text-primary" />
                          <h4 className="font-semibold">{topic.label}</h4>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Back Button */}
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={handleBackToSubjectSelection}
                    className="px-6"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Paper Types
                  </Button>
                </div>
              </div>
            ) : showPaperBundles ? (
              <div className="space-y-6">
                {/* Selection Summary */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Selected Options:</h3>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {selectedQuizType ? (
                      <>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                          {selectedQuizType === "scholarship" ? "Scholarship Grade 5" : 
                           selectedQuizType === "al" ? "A/L" : "O/L"}
                        </span>
                        {selectedLanguage && (
                          <span className="bg-secondary/10 text-secondary px-2 py-1 rounded">
                            {languages.find(l => l.value === selectedLanguage)?.label}
                          </span>
                        )}
                        {selectedSubject && (
                          <span className="bg-accent/10 text-accent px-2 py-1 rounded">
                            {(selectedQuizType === "al" ? alSubjects : olSubjects).find(s => s.value === selectedSubject)?.label}
                          </span>
                        )}
                        {selectedTopic && (
                          <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded">
                            {getTopicsForSubject(selectedSubject).find(t => t.value === selectedTopic)?.label}
                          </span>
                        )}
                        <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded">
                          {(selectedQuizType === "scholarship" ? scholarshipPaperTypes : paperTypes).find(p => p.id === selectedPaperType)?.title}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                          {grades.find(g => g.value === selectedGrade)?.label}
                        </span>
                        <span className="bg-secondary/10 text-secondary px-2 py-1 rounded">
                          {mediums.find(m => m.value === selectedMedium)?.label}
                        </span>
                        <span className="bg-accent/10 text-accent px-2 py-1 rounded">
                          {getSubjectsForGrade(selectedGrade).find(s => s.value === selectedSubject)?.label}
                        </span>
                        <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded">
                          {paperTypes.find(p => p.id === selectedPaperType)?.title}
                        </span>
                        {selectedTerm && (
                          <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
                            {selectedTerm === "1st-term" ? "1st Term" : selectedTerm === "2nd-term" ? "2nd Term" : "3rd Term"}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Paper Bundles */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h3 className="text-lg font-semibold">
                      Available {paperTypes.find(p => p.id === selectedPaperType)?.title}
                    </h3>
                    
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search papers by title, year, difficulty..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSearch}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Search Results Count */}
                  {searchQuery && (
                    <div className="mb-4 text-sm text-muted-foreground">
                      {getFilteredBundles().length} result{getFilteredBundles().length !== 1 ? 's' : ''} found for "{searchQuery}"
                    </div>
                  )}

                  {/* Loading State */}
                  {isLoading && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading quiz bundles...</p>
                    </div>
                  )}

                  {/* Error State */}
                  {error && (
                    <div className="text-center py-12">
                      <div className="text-red-600 mb-4">
                        <X className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-lg font-semibold">Error loading data</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                      </div>
                      <Button onClick={() => window.location.reload()} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  )}

                  {/* Paper Bundles Grid */}
                  {!isLoading && !error && (
                    <>
                      {getFilteredBundles().length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {getFilteredBundles().map((bundle) => {
                            // Get colors based on paper type
                            const paperType = paperTypes.find(p => p.id === selectedPaperType) || paperTypes[0];
                            const bundleBorderColor = paperType?.borderColor || "border-blue-200";
                            const bundleBgColor = paperType?.bgColor || "bg-blue-50";
                            
                            // Render each quiz in the bundle
                            return bundle.quizzes && bundle.quizzes.length > 0 ? (
                              bundle.quizzes.map((quiz, quizIndex) => {
                                const incomplete = incompleteQuizzes.find(iq => iq.quizId === quiz.id);
                                const isIncomplete = !!incomplete;
                                
                                // Check if user has active premium
                                const hasPremium = user?.isPremium && 
                                  user?.subscriptionEndDate && 
                                  new Date(user.subscriptionEndDate) > new Date();
                                
                                // Quiz is locked if marked as locked AND user doesn't have premium
                                const isLocked = (quiz.isLocked || false) && !hasPremium;
                                const isFree = quiz.isFree !== undefined ? quiz.isFree : true;
                                
                                return (
                                <Card 
                                  key={quiz.id}
                                  className={`transition-all border-2 ${bundleBorderColor} ${bundleBgColor} ${
                                    isLocked 
                                      ? 'opacity-75 cursor-not-allowed' 
                                      : 'cursor-pointer hover:shadow-lg hover:scale-105'
                                  } ${isIncomplete ? 'border-orange-400 border-2' : ''} ${
                                    isLocked ? 'relative' : ''
                                  }`}
                                  onClick={() => !isLocked && handleQuizClick(quiz)}
                                >
                                  {/* Lock Overlay for Locked Quizzes */}
                                  {isLocked && (
                                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                                      <div className="text-center text-white p-6">
                                        <Lock className="h-12 w-12 mx-auto mb-3 text-yellow-400" />
                                        <h4 className="font-bold text-lg mb-2">Premium Content</h4>
                                        <p className="text-sm mb-3 opacity-90">
                                          Unlock this quiz with premium access
                                        </p>
                                        <Button 
                                          size="sm" 
                                          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/payment');
                                          }}
                                        >
                                          <Crown className="h-4 w-4 mr-2" />
                                          Upgrade Now
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <CardContent className="p-6">
                                    {/* Free Badge */}
                                    {!isLocked && isFree && quizIndex < 4 && (
                                      <div className="absolute top-3 right-3">
                                        <Badge className="bg-green-500 text-white">
                                          FREE
                                        </Badge>
                                      </div>
                                    )}
                                    
                                    {/* Thumbnail placeholder - future implementation */}
                                    {bundle.thumbnail ? (
                                      <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                                        <img 
                                          src={bundle.thumbnail} 
                                          alt={quiz.title}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      </div>
                                    ) : (
                                      <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                                        <FileText className="h-12 w-12 text-muted-foreground" />
                                      </div>
                                    )}
                                    
                                    <div className="space-y-2">
                                      <div className="flex items-start justify-between gap-2">
                                        <h4 className={`font-semibold text-lg ${isIncomplete ? 'font-bold' : ''}`}>
                                          {quiz.title}
                                        </h4>
                                        {isIncomplete && (
                                          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-xs whitespace-nowrap">
                                            In Progress
                                          </Badge>
                                        )}
                                      </div>
                                      {isIncomplete && incomplete && (
                                        <div className="space-y-1 text-sm bg-orange-50 p-2 rounded border border-orange-200">
                                          <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Progress:</span>
                                            <span className="font-semibold text-orange-700">
                                              Q{incomplete.currentQuestionIndex + 1}/{incomplete.totalQuestions}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              Time:
                                            </span>
                                            <span className="font-semibold text-orange-700">
                                              {formatTimeRemaining(incomplete.timeRemaining)}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Last saved:</span>
                                            <span className="text-xs text-orange-600">
                                              {formatLastSavedTime(incomplete.lastSavedAt)}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      <p className="text-sm text-muted-foreground">{quiz.description || bundle.description}</p>
                                      
                                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span>Year: {bundle.year}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          bundle.difficulty === 'Beginner' ? 'bg-green-100 text-green-600' :
                                          bundle.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-600' :
                                          bundle.difficulty === 'Advanced' ? 'bg-red-100 text-red-600' :
                                          'bg-gray-100 text-gray-600'
                                        }`}>
                                          {bundle.difficulty}
                                        </span>
                                      </div>
                                      
                                      <div className="space-y-3 pt-2">
                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            className="text-xs flex-1"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleQuizClick(quiz);
                                            }}
                                          >
                                            {isIncomplete ? (
                                              <>
                                                <RotateCw className="h-3 w-3 mr-1" />
                                                Continue
                                              </>
                                            ) : (
                                              <>
                                                <Play className="h-3 w-3 mr-1" />
                                                Start Quiz
                                              </>
                                            )}
                                          </Button>
                                          
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="text-xs"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <Info className="h-3 w-3" />
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md">
                                              <DialogHeader>
                                                <DialogTitle>{quiz.title}</DialogTitle>
                                                <DialogDescription>
                                                  Quiz Information
                                                </DialogDescription>
                                              </DialogHeader>
                                              <div className="space-y-4">
                                                <div>
                                                  <h4 className="font-semibold text-sm mb-2">Description</h4>
                                                  <p className="text-sm text-muted-foreground">{quiz.description || bundle.description}</p>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                  <div>
                                                    <span className="font-medium">Year:</span>
                                                    <p className="text-muted-foreground">{bundle.year}</p>
                                                  </div>
                                                  <div>
                                                    <span className="font-medium">Difficulty:</span>
                                                    <p className="text-muted-foreground">{bundle.difficulty}</p>
                                                  </div>
                                                  <div>
                                                    <span className="font-medium">Time Limit:</span>
                                                    <p className="text-muted-foreground">{quiz.timeLimit || 60} minutes</p>
                                                  </div>
                                                  <div>
                                                    <span className="font-medium">Questions:</span>
                                                    <p className="text-muted-foreground">{quiz.questionCount || 'N/A'}</p>
                                                  </div>
                                                </div>
                                                
                                                <div className="pt-4 border-t">
                                                  <h4 className="font-semibold text-sm mb-2">Instructions</h4>
                                                  <ul className="text-sm text-muted-foreground space-y-1">
                                                    <li>• Read each question carefully</li>
                                                    <li>• Select the best answer</li>
                                                    <li>• You can review your answers before submitting</li>
                                                    <li>• Timer will start when you begin the quiz</li>
                                                  </ul>
                                                </div>
                                              </div>
                                            </DialogContent>
                                          </Dialog>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                );
                              })
                            ) : (
                              // Fallback: show bundle if no quizzes
                              <Card 
                                key={bundle.id}
                                className={`cursor-pointer transition-all hover:shadow-lg border-2 ${bundleBorderColor} ${bundleBgColor} hover:scale-105`}
                              >
                                <CardContent className="p-6">
                                  <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                                    <FileText className="h-12 w-12 text-muted-foreground" />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-lg">{bundle.title}</h4>
                                    <p className="text-sm text-muted-foreground">{bundle.description}</p>
                                    
                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                      <span>Year: {bundle.year}</span>
                                      <span>{bundle.paperCount} papers</span>
                                    </div>
                                    
                                    <div className="space-y-3 pt-2">
                                      <div className="flex items-center justify-between">
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          bundle.difficulty === 'Beginner' ? 'bg-green-100 text-green-600' :
                                          bundle.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-600' :
                                          bundle.difficulty === 'Advanced' ? 'bg-red-100 text-red-600' :
                                          'bg-gray-100 text-gray-600'
                                        }`}>
                                          {bundle.difficulty}
                                        </span>
                                      </div>
                                      
                                      <p className="text-xs text-muted-foreground text-center">
                                        No quizzes available in this bundle
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg mb-2">No papers found</p>
                          <p className="text-sm mb-4">
                            {searchQuery ? `No results found for "${searchQuery}"` : "No papers available for this category"}
                          </p>
                          {searchQuery && (
                            <Button variant="outline" onClick={clearSearch} className="mt-2">
                              Clear Search
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Back Button */}
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={selectedTerm ? handleBackToTermSelection : handleBackToPaperTypes}
                    className="px-6"
                  >
                    {selectedTerm ? "Back to Term Selection" : "Back to Paper Types"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Language Selection for Scholarship */}
                {selectedQuizType === "scholarship" && !selectedLanguage && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Select Language</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {languages.map((lang) => (
                        <Button
                          key={lang.value}
                          variant={selectedLanguage === lang.value ? "default" : "outline"}
                          onClick={() => setSelectedLanguage(lang.value)}
                          className={`transition-all ${
                            selectedLanguage === lang.value 
                              ? "bg-gradient-hero text-white" 
                              : "hover:bg-primary/10"
                          }`}
                        >
                          {lang.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selection Summary */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Selected Options:</h3>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {selectedQuizType ? (
                      <>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                          {selectedQuizType === "scholarship" ? "Scholarship Grade 5" : 
                           selectedQuizType === "al" ? "A/L" : "O/L"}
                        </span>
                        {selectedLanguage && (
                          <span className="bg-secondary/10 text-secondary px-2 py-1 rounded">
                            {languages.find(l => l.value === selectedLanguage)?.label}
                          </span>
                        )}
                        {selectedSubject && (
                          <span className="bg-accent/10 text-accent px-2 py-1 rounded">
                            {(selectedQuizType === "al" ? alSubjects : olSubjects).find(s => s.value === selectedSubject)?.label}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                          {grades.find(g => g.value === selectedGrade)?.label}
                        </span>
                        <span className="bg-secondary/10 text-secondary px-2 py-1 rounded">
                          {mediums.find(m => m.value === selectedMedium)?.label}
                        </span>
                        <span className="bg-accent/10 text-accent px-2 py-1 rounded">
                          {getSubjectsForGrade(selectedGrade).find(s => s.value === selectedSubject)?.label}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Paper Type Selection */}
                {!showTermSelection && ((selectedQuizType === "scholarship" && selectedLanguage) || 
                  ((selectedQuizType === "al" || selectedQuizType === "ol") && selectedSubject) || 
                  (!selectedQuizType && selectedGrade && selectedMedium && selectedSubject)) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Choose Paper Type</h3>
                    <div className={`grid gap-4 ${getFilteredPaperTypes().length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
                      {getFilteredPaperTypes().map((paperType) => (
                        <Card 
                          key={paperType.id}
                          className={`cursor-pointer transition-all hover:shadow-lg border-2 ${paperType.borderColor} ${paperType.bgColor} hover:scale-105`}
                          onClick={() => handlePaperTypeSelect(paperType.id)}
                        >
                          <CardContent className="p-6 text-center">
                            <paperType.icon className={`h-12 w-12 mx-auto mb-3 ${paperType.color}`} />
                            <h4 className="font-semibold text-lg mb-2 text-foreground">{paperType.title}</h4>
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground/80 mb-3">{paperType.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Term Selection */}
                {showTermSelection && (
                  <div className="space-y-6">
                    {/* Selection Summary */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Selected Options:</h3>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                          {grades.find(g => g.value === selectedGrade)?.label}
                        </span>
                        <span className="bg-secondary/10 text-secondary px-2 py-1 rounded">
                          {mediums.find(m => m.value === selectedMedium)?.label}
                        </span>
                        <span className="bg-accent/10 text-accent px-2 py-1 rounded">
                          {getSubjectsForGrade(selectedGrade).find(s => s.value === selectedSubject)?.label}
                        </span>
                        <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded">
                          {paperTypes.find(p => p.id === selectedPaperType)?.title}
                        </span>
                      </div>
                    </div>

                    {/* Term Selection Cards */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Select Term</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        {[
                          { value: "1st-term", label: "1st Term", icon: "1️⃣", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-950/30", borderColor: "border-blue-200 dark:border-blue-800" },
                          { value: "2nd-term", label: "2nd Term", icon: "2️⃣", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-950/30", borderColor: "border-green-200 dark:border-green-800" },
                          { value: "3rd-term", label: "3rd Term", icon: "3️⃣", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-950/30", borderColor: "border-purple-200 dark:border-purple-800" }
                        ].map((term) => (
                          <Card 
                            key={term.value}
                            className={`cursor-pointer transition-all hover:shadow-lg border-2 ${term.borderColor} ${term.bgColor} hover:scale-105`}
                            onClick={() => handleTermSelect(term.value)}
                          >
                            <CardContent className="p-6 text-center">
                              <div className="text-4xl mb-3">{term.icon}</div>
                              <h4 className="font-semibold text-lg mb-2 text-foreground">{term.label}</h4>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Back Button */}
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={showTermSelection ? () => {
                      setShowTermSelection(false);
                      setSelectedPaperType("");
                    } : selectedQuizType ? (selectedSubject ? handleBackToSubjectSelection : handleBackToQuizTypeSelection) : handleBackToSelection}
                    className="px-6"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {showTermSelection ? "Back to Paper Types" : selectedQuizType ? (selectedSubject ? "Back to Subjects" : "Back to Quiz Types") : "Back to Selection"}
                  </Button>
                </div>
            </div>
            )}
          </CardContent>
        </Card>

        {/* Resume Quiz Dialog */}
        <AlertDialog 
          open={resumeQuizDialog.open} 
          onOpenChange={(open) => setResumeQuizDialog({ open, quiz: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Continue Your Quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                You have an incomplete quiz attempt. Would you like to continue from where you left off?
                {resumeQuizDialog.quiz && (
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-semibold">
                        Question {resumeQuizDialog.quiz.currentQuestionIndex + 1} of {resumeQuizDialog.quiz.totalQuestions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Time Remaining:</span>
                      <span className="font-semibold">
                        {formatTimeRemaining(resumeQuizDialog.quiz.timeRemaining)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Saved:</span>
                      <span className="font-semibold">
                        {formatLastSavedTime(resumeQuizDialog.quiz.lastSavedAt)}
                      </span>
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                if (resumeQuizDialog.quiz) {
                  handleStartQuiz(resumeQuizDialog.quiz.quizId, resumeQuizDialog.quiz.quizTitle, false);
                }
                setResumeQuizDialog({ open: false, quiz: null });
              }}>
                Start Fresh
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (resumeQuizDialog.quiz) {
                  handleStartQuiz(resumeQuizDialog.quiz.quizId, resumeQuizDialog.quiz.quizTitle, true);
                }
                setResumeQuizDialog({ open: false, quiz: null });
              }}>
                <RotateCw className="h-4 w-4 mr-2" />
                Continue Quiz
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {/* Welcome Tutorial for New Users */}
      <WelcomeTutorial 
        isOpen={showWelcomeTutorial}
        onClose={handleCloseTutorial}
        userName={user?.firstName}
      />
    </div>
  );
};

export default StudentDashboard;
