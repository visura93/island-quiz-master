import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Trophy, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Quizzes Completed", value: "0", icon: BookOpen, color: "text-primary" },
    { label: "Average Score", value: "0%", icon: Trophy, color: "text-success" },
    { label: "Time Spent", value: "0h", icon: Clock, color: "text-secondary" },
    { label: "Progress", value: "0%", icon: TrendingUp, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Island First
            </span>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Student Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome back! Ready to practice?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Available Quizzes */}
        <Card className="border-2 shadow-elegant bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl">Available Quizzes</CardTitle>
            <CardDescription>Browse and start practicing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No quizzes available yet</p>
              <p className="text-sm">Subscribe to access MCQ collections from teachers</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
