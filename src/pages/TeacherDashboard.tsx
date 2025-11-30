import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Plus, Users, FileText, DollarSign, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const stats = [
    { label: "Total MCQs", value: "0", icon: FileText, color: "text-primary" },
    { label: "Active Students", value: "0", icon: Users, color: "text-secondary" },
    { label: "Earnings", value: "$0", icon: DollarSign, color: "text-success" },
  ];

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
            <h1 className="text-4xl font-bold mb-2">Teacher Dashboard</h1>
            <p className="text-muted-foreground text-lg">Manage your MCQ collections</p>
          </div>
          <Button className="bg-gradient-hero hover:opacity-90 transition-opacity">
            <Plus className="h-5 w-5 mr-2" />
            Create MCQ Set
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-2 hover:shadow-hover transition-all bg-gradient-card">
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

        {/* MCQ Collections */}
        <Card className="border-2 shadow-elegant bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl">Your MCQ Collections</CardTitle>
            <CardDescription>Create and manage your question sets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No MCQ sets created yet</p>
              <p className="text-sm mb-6">Start creating your first MCQ collection</p>
              <Button className="bg-gradient-hero hover:opacity-90 transition-opacity">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Set
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
