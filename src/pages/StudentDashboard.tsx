import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, BookOpen, Trophy, Clock, TrendingUp, LogOut, Search, FileText, Award, School, X, Info, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { apiService, QuizBundle, QuizAttempt, TimeAnalytics } from "@/lib/api";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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

  const handlePaperTypeClick = async (paperTypeId: string) => {
    setSelectedPaperType(paperTypeId);
    setIsLoading(true);
    setError("");
    try {
      const bundles = await apiService.getQuizBundles(selectedGrade, selectedMedium, selectedSubject, paperTypeId);
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
  };

  const handleBackToSelection = () => {
    setShowPaperTypes(false);
    setShowPaperBundles(false);
    setSelectedPaperType("");
    setSearchQuery("");
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

  // Fetch student statistics on component mount
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
  }, []);

  const handleStartQuiz = (bundleId: string, bundleTitle: string) => {
    // Navigate to quiz page with bundle information
    navigate('/quiz', { 
      state: { 
        bundleId, 
        bundleTitle,
        grade: selectedGrade,
        medium: selectedMedium,
        subject: selectedSubject,
        paperType: selectedPaperType
      } 
    });
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
    { value: "grade-6", label: "Grade 6" },
    { value: "grade-7", label: "Grade 7" },
    { value: "grade-8", label: "Grade 8" },
    { value: "grade-9", label: "Grade 9" },
    { value: "grade-10", label: "Grade 10" },
    { value: "grade-11", label: "Grade 11" },
    { value: "grade-12", label: "Grade 12" },
    { value: "grade-13", label: "Grade 13" },
  ];

  const mediums = [
    { value: "sinhala", label: "Sinhala" },
    { value: "english", label: "English" },
    { value: "tamil", label: "Tamil" },
  ];

  const subjects = [
    { value: "mathematics", label: "Mathematics" },
    { value: "science", label: "Science" },
    { value: "english", label: "English" },
    { value: "sinhala", label: "Sinhala" },
    { value: "history", label: "History" },
    { value: "geography", label: "Geography" },
    { value: "ict", label: "ICT" },
    { value: "commerce", label: "Commerce" },
  ];

  const paperTypes = [
    {
      id: "past-papers",
      title: "Past Papers",
      description: "Official past papers from previous years",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      id: "model-papers",
      title: "Model Papers",
      description: "Practice papers designed by experts",
      icon: Award,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      id: "school-papers",
      title: "School Papers",
      description: "Papers from various schools",
      icon: School,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

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
      label: "Quizzes Completed", 
      value: statsLoading ? "..." : quizzesCompleted.toString(), 
      icon: BookOpen, 
      color: "text-primary" 
    },
    { 
      label: "Average Score", 
      value: statsLoading ? "..." : `${averageScore}%`, 
      icon: Trophy, 
      color: "text-success" 
    },
    { 
      label: "Time Spent", 
      value: statsLoading ? "..." : formatTime(totalTimeSpent), 
      icon: Clock, 
      color: "text-secondary" 
    },
    { 
      label: "Progress", 
      value: statsLoading ? "..." : `${progress}%`, 
      icon: TrendingUp, 
      color: "text-accent" 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
            <Button variant="outline" onClick={handleLogout} className="btn-modern">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
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
            {!showPaperTypes ? (
              <div className="space-y-6">
                {/* Selection Form */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Grade Selection */}
                  <div className="space-y-3 group">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Grade
                    </label>
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
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
                    <Select value={selectedMedium} onValueChange={setSelectedMedium}>
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
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="w-full input-modern border-2 focus:border-accent/50">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
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
                    disabled={!selectedGrade || !selectedMedium || !selectedSubject}
                    className="bg-gradient-hero hover:opacity-90 transition-opacity px-12 py-6 text-lg font-semibold btn-modern shadow-elegant hover:shadow-hover"
                    size="lg"
                  >
                    <Search className="h-5 w-5 mr-3" />
                    Start Your Journey
                  </Button>
                </div>
              </div>
            ) : showPaperBundles ? (
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
                      {subjects.find(s => s.value === selectedSubject)?.label}
                    </span>
                    <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded">
                      {paperTypes.find(p => p.id === selectedPaperType)?.title}
                    </span>
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
                          {getFilteredBundles().map((bundle) => (
                      <Card 
                        key={bundle.id}
                        className={`cursor-pointer transition-all hover:shadow-lg border-2 ${bundle.borderColor} ${bundle.bgColor} hover:scale-105`}
                        onClick={() => {
                          // TODO: Navigate to specific bundle or show papers
                          console.log(`Selected bundle: ${bundle.title}`);
                        }}
                      >
                        <CardContent className="p-6">
                          {/* Thumbnail placeholder - future implementation */}
                          {bundle.thumbnail ? (
                            <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                              <img 
                                src={bundle.thumbnail} 
                                alt={bundle.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                              <FileText className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <h4 className="font-semibold text-lg">{bundle.title}</h4>
                            <p className="text-sm text-muted-foreground">{bundle.description}</p>
                            
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>Year: {bundle.year}</span>
                              <span>{bundle.paperCount} papers</span>
                            </div>
                            
                            <div className="space-y-3">
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
                              
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="text-xs flex-1"
                                  onClick={() => handleStartQuiz(bundle.id, bundle.title)}
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Start Quiz
                                </Button>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-xs">
                                      <Info className="h-3 w-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>{bundle.title}</DialogTitle>
                                      <DialogDescription>
                                        Quiz Information
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-semibold text-sm mb-2">Description</h4>
                                        <p className="text-sm text-muted-foreground">{bundle.description}</p>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="font-medium">Year:</span>
                                          <p className="text-muted-foreground">{bundle.year}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium">Papers:</span>
                                          <p className="text-muted-foreground">{bundle.paperCount} papers</p>
                                        </div>
                                        <div>
                                          <span className="font-medium">Difficulty:</span>
                                          <p className="text-muted-foreground">{bundle.difficulty}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium">Duration:</span>
                                          <p className="text-muted-foreground">60 minutes</p>
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
                          ))}
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
                    onClick={handleBackToPaperTypes}
                    className="px-6"
                  >
                    Back to Paper Types
                  </Button>
                </div>
              </div>
            ) : (
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
                      {subjects.find(s => s.value === selectedSubject)?.label}
                    </span>
                  </div>
                </div>

                {/* Paper Type Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Choose Paper Type</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {paperTypes.map((paperType) => (
                      <Card 
                        key={paperType.id}
                        className={`cursor-pointer transition-all hover:shadow-lg border-2 ${paperType.borderColor} ${paperType.bgColor} hover:scale-105`}
                        onClick={() => handlePaperTypeClick(paperType.id)}
                      >
                        <CardContent className="p-6 text-center">
                          <paperType.icon className={`h-12 w-12 mx-auto mb-3 ${paperType.color}`} />
                          <h4 className="font-semibold text-lg mb-2">{paperType.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{paperType.description}</p>
                          <div className="text-xs text-muted-foreground">
                            {paperType.count} papers available
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Back Button */}
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={handleBackToSelection}
                    className="px-6"
                  >
                    Back to Selection
                  </Button>
                </div>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
