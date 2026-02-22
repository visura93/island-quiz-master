import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Settings, 
  Shield, 
  LogOut, 
  Search,
  Eye,
  TrendingUp,
  Clock,
  Award,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { apiService, StudentActivity } from "@/lib/api";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { WelcomeTutorial } from "@/components/WelcomeTutorial";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isNewUser, setIsNewUser } = useAuth();
  const { t } = useTranslation(['dashboard', 'common']);
  const [students, setStudents] = useState<StudentActivity[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentActivity[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showWelcomeTutorial, setShowWelcomeTutorial] = useState<boolean>(false);

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

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiService.getAllStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (err: any) {
      setError(err.message || "Failed to load students");
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.fullName.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  };

  const handleViewStudent = (studentId: string) => {
    navigate(`/admin/student/${studentId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.isActive).length;
  const totalQuizzes = students.reduce((sum, s) => sum + s.totalQuizzes, 0);
  const averageScore = students.length > 0
    ? students.reduce((sum, s) => sum + s.averageScore, 0) / students.length
    : 0;

  const stats = [
    { label: t('dashboard:admin.stats.totalStudents'), value: totalStudents.toString(), icon: Users, color: "text-primary" },
    { label: t('dashboard:admin.stats.activeStudents'), value: activeStudents.toString(), icon: UserCheck, color: "text-green-600" },
    { label: t('dashboard:admin.stats.totalQuizzes'), value: totalQuizzes.toString(), icon: BookOpen, color: "text-secondary" },
    { label: t('dashboard:admin.stats.avgScore', 'Avg Score'), value: averageScore.toFixed(1) + "%", icon: TrendingUp, color: "text-accent" },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
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
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              {t('common:appName')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {t('dashboard:admin.welcome', { name: user?.firstName, defaultValue: `Welcome, ${user?.firstName}!` })}
            </span>
            <LanguageSwitcher />
            <DarkModeToggle />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {t('common:buttons.logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t('dashboard:admin.title')}</h1>
            <p className="text-muted-foreground text-lg">{t('dashboard:admin.subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate("/admin/create-quiz")}
              className="bg-gradient-hero hover:opacity-90 transition-opacity"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t('dashboard:admin.createQuiz', 'Create Quiz')}
            </Button>
            <Button variant="outline">
              <Settings className="h-5 w-5 mr-2" />
              {t('common:buttons.settings')}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className={`border-2 hover:shadow-hover transition-all bg-gradient-card ${
                (stat.label === t('dashboard:admin.stats.totalQuizzes') || stat.label === t('dashboard:admin.stats.totalStudents')) ? "cursor-pointer hover:scale-105" : ""
              }`}
              onClick={() => {
                if (stat.label === t('dashboard:admin.stats.totalQuizzes')) {
                  navigate("/admin/quizzes");
                } else if (stat.label === t('dashboard:admin.stats.totalStudents')) {
                  navigate("/admin/manage-students");
                }
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-10 w-10 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card 
            className="border-2 hover:shadow-lg transition-all cursor-pointer bg-gradient-card hover:scale-105"
            onClick={() => navigate("/admin/manage-subjects")}
          >
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                {t('dashboard:admin.manageSubjects', 'Manage Subjects')}
              </CardTitle>
              <CardDescription>
                {t('dashboard:admin.manageSubjectsDesc', 'Configure subjects, free quiz counts, and payment settings')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-500" />
                    {t('dashboard:admin.subjectActions.addEditRemove', 'Add, edit, or remove subjects')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-500" />
                    {t('dashboard:admin.subjectActions.configureQuizCounts', 'Configure free quiz counts per subject')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    {t('dashboard:admin.subjectActions.controlAccess', 'Control quiz access and payment requirements')}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-2 hover:shadow-lg transition-all cursor-pointer bg-gradient-card hover:scale-105"
            onClick={() => navigate("/admin/quizzes")}
          >
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                {t('dashboard:admin.manageQuizzes', 'Manage Quizzes')}
              </CardTitle>
              <CardDescription>
                {t('dashboard:admin.manageQuizzesDesc', 'View, edit, and manage all quizzes in the system')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-500" />
                    {t('dashboard:admin.quizActions.create', 'Create new quizzes')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-500" />
                    {t('dashboard:admin.quizActions.edit', 'Edit existing quizzes')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-500" />
                    {t('dashboard:admin.quizActions.viewAll', 'View all quiz details')}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Activity Section */}
        <Card className="border-2 shadow-elegant bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              {t('dashboard:admin.studentActivity', 'Student Activity')}
            </CardTitle>
            <CardDescription>{t('dashboard:admin.studentActivityDesc', 'View and manage student profiles and quiz activities')}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={t('dashboard:admin.searchStudentsPlaceholder', 'Search students by name or email...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t('dashboard:admin.loadingStudents', 'Loading students...')}</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">{t('dashboard:admin.noStudentsFound', 'No students found')}</p>
                <p className="text-sm">
                  {searchQuery ? t('dashboard:admin.adjustSearch', 'Try adjusting your search query') : t('dashboard:admin.noStudentsYet', 'No students registered yet')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <Card
                    key={student.id}
                    className="border-2 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleViewStudent(student.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <GraduationCap className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">{student.fullName}</h3>
                              {student.isActive ? (
                                <Badge className="bg-green-600">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  {t('dashboard:admin.active', 'Active')}
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <UserX className="h-3 w-3 mr-1" />
                                  {t('dashboard:admin.inactive', 'Inactive')}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {student.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {t('dashboard:admin.joined', 'Joined')}: {formatDate(student.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8 mr-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{student.totalQuizzes}</div>
                            <div className="text-xs text-muted-foreground">{t('dashboard:admin.quizzes', 'Quizzes')}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {student.averageScore.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">{t('dashboard:admin.avgScore', 'Avg Score')}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-muted-foreground">
                              {student.lastActivityDate ? formatDate(student.lastActivityDate) : t('dashboard:admin.never', 'Never')}
                            </div>
                            <div className="text-xs text-muted-foreground">{t('dashboard:admin.lastActivity', 'Last Activity')}</div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewStudent(student.id);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t('dashboard:admin.viewDetails', 'View Details')}
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
      
      {/* Welcome Tutorial for New Users */}
      <WelcomeTutorial 
        isOpen={showWelcomeTutorial}
        onClose={handleCloseTutorial}
        userName={user?.firstName}
      />
    </div>
  );
};

export default AdminDashboard;
