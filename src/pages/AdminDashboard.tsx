import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Total Users", value: "0", icon: Users, color: "text-primary" },
    { label: "Teachers", value: "0", icon: BookOpen, color: "text-secondary" },
    { label: "Students", value: "0", icon: GraduationCap, color: "text-accent" },
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground text-lg">Manage platform settings and users</p>
          </div>
          <Button className="bg-gradient-hero hover:opacity-90 transition-opacity">
            <Settings className="h-5 w-5 mr-2" />
            Settings
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

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 shadow-elegant bg-gradient-card">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                User Management
              </CardTitle>
              <CardDescription>Manage users and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No users to manage yet</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-elegant bg-gradient-card">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Platform Settings
              </CardTitle>
              <CardDescription>Configure system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Settings configuration coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
