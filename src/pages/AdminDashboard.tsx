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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [students, setStudents] = useState<StudentActivity[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentActivity[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

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
    { label: "Total Students", value: totalStudents.toString(), icon: Users, color: "text-primary" },
    { label: "Active Students", value: activeStudents.toString(), icon: UserCheck, color: "text-green-600" },
    { label: "Total Quizzes", value: totalQuizzes.toString(), icon: BookOpen, color: "text-secondary" },
    { label: "Avg Score", value: averageScore.toFixed(1) + "%", icon: TrendingUp, color: "text-accent" },
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
              Island First
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.firstName}!
            </span>
            <DarkModeToggle />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground text-lg">Manage students and view their activity</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate("/admin/create-quiz")}
              className="bg-gradient-hero hover:opacity-90 transition-opacity"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Quiz
            </Button>
            <Button variant="outline">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className={`border-2 hover:shadow-hover transition-all bg-gradient-card ${
                stat.label === "Total Quizzes" ? "cursor-pointer hover:scale-105" : ""
              }`}
              onClick={() => {
                if (stat.label === "Total Quizzes") {
                  navigate("/admin/quizzes");
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
                Manage Subjects
              </CardTitle>
              <CardDescription>
                Configure subjects, free quiz counts, and payment settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-500" />
                    Add, edit, or remove subjects
                  </li>
                  <li className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-500" />
                    Configure free quiz counts per subject
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    Control quiz access and payment requirements
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
                Manage Quizzes
              </CardTitle>
              <CardDescription>
                View, edit, and manage all quizzes in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-500" />
                    Create new quizzes
                  </li>
                  <li className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-500" />
                    Edit existing quizzes
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-500" />
                    View all quiz details
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
              Student Activity
            </CardTitle>
            <CardDescription>View and manage student profiles and quiz activities</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or email..."
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
                <p className="text-muted-foreground">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No students found</p>
                <p className="text-sm">
                  {searchQuery ? "Try adjusting your search query" : "No students registered yet"}
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
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <UserX className="h-3 w-3 mr-1" />
                                  Inactive
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
                                Joined: {formatDate(student.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8 mr-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{student.totalQuizzes}</div>
                            <div className="text-xs text-muted-foreground">Quizzes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {student.averageScore.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Avg Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-muted-foreground">
                              {student.lastActivityDate ? formatDate(student.lastActivityDate) : "Never"}
                            </div>
                            <div className="text-xs text-muted-foreground">Last Activity</div>
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
    </div>
  );
};

export default AdminDashboard;
