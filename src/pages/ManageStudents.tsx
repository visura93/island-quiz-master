import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ArrowLeft, 
  Search,
  Eye,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  GraduationCap,
  Award,
  Clock,
  CreditCard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiService, StudentActivity } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const ManageStudents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentActivity[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentActivity[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all"); // all, active, inactive, subscribed

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students, filterStatus]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiService.getAllStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (err: any) {
      setError(err.message || "Failed to load students");
      toast({
        title: "Error",
        description: err.message || "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Filter by status
    if (filterStatus === "active") {
      filtered = filtered.filter(s => s.isActive);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter(s => !s.isActive);
    } else if (filterStatus === "subscribed") {
      filtered = filtered.filter(s => s.isPremium && s.subscriptionEndDate && new Date(s.subscriptionEndDate) > new Date());
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.fullName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.firstName.toLowerCase().includes(query) ||
          student.lastName.toLowerCase().includes(query)
      );
    }

    setFilteredStudents(filtered);
  };

  const handleViewStudent = (studentId: string) => {
    navigate(`/admin/student/${studentId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSubscriptionBadge = (student: StudentActivity) => {
    if (!student.isPremium || !student.subscriptionEndDate) {
      return <Badge variant="outline">Regular</Badge>;
    }

    const endDate = new Date(student.subscriptionEndDate);
    const now = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining > 30) {
      return <Badge className="bg-green-600">Premium ({daysRemaining}d)</Badge>;
    } else if (daysRemaining > 0) {
      return <Badge className="bg-yellow-600">Premium - Expiring ({daysRemaining}d)</Badge>;
    } else {
      return <Badge variant="destructive">Expired</Badge>;
    }
  };

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.isActive).length;
  const premiumStudents = students.filter(s => 
    s.isPremium && 
    s.subscriptionEndDate && 
    new Date(s.subscriptionEndDate) > new Date()
  ).length;
  const averageScore = students.length > 0
    ? students.reduce((sum, s) => sum + s.averageScore, 0) / students.length
    : 0;

  const stats = [
    { label: "Total Students", value: totalStudents.toString(), icon: Users, color: "text-primary" },
    { label: "Active Students", value: activeStudents.toString(), icon: UserCheck, color: "text-green-600" },
    { label: "Premium", value: premiumStudents.toString(), icon: CreditCard, color: "text-blue-600" },
    { label: "Avg Score", value: averageScore.toFixed(1) + "%", icon: Award, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/admin-dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
              </Button>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Manage Students</h1>
              </div>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-2 shadow-lg bg-gradient-card">
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

        {/* Filters and Search */}
        <Card className="mb-6 border-2 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "active" ? "default" : "outline"}
                  onClick={() => setFilterStatus("active")}
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === "subscribed" ? "default" : "outline"}
                  onClick={() => setFilterStatus("subscribed")}
                >
                  Premium
                </Button>
                <Button
                  variant={filterStatus === "inactive" ? "default" : "outline"}
                  onClick={() => setFilterStatus("inactive")}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card className="border-2 shadow-elegant bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Student Directory
            </CardTitle>
            <CardDescription>
              {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                              {getSubscriptionBadge(student)}
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
                          View Profile
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

export default ManageStudents;
