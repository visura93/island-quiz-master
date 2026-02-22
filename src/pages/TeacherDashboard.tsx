import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Plus, Users, FileText, DollarSign, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { WelcomeTutorial } from "@/components/WelcomeTutorial";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isNewUser, setIsNewUser } = useAuth();
  const { t } = useTranslation(['dashboard', 'common']);
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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const stats = [
    { label: t('dashboard:teacher.stats.totalMcqs'), value: "0", icon: FileText, color: "text-primary" },
    { label: t('dashboard:teacher.stats.activeStudents'), value: "0", icon: Users, color: "text-secondary" },
    { label: t('dashboard:teacher.stats.earnings'), value: "$0", icon: DollarSign, color: "text-success" },
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
              {t('common:appName')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {t('dashboard:teacher.welcome', { name: user?.firstName })}
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
            <h1 className="text-4xl font-bold mb-2">{t('dashboard:teacher.title')}</h1>
            <p className="text-muted-foreground text-lg">{t('dashboard:teacher.subtitle')}</p>
          </div>
          <Button className="bg-gradient-hero hover:opacity-90 transition-opacity">
            <Plus className="h-5 w-5 mr-2" />
            {t('dashboard:teacher.createMcqSet')}
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
            <CardTitle className="text-2xl">{t('dashboard:teacher.collections.title')}</CardTitle>
            <CardDescription>{t('dashboard:teacher.collections.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">{t('dashboard:teacher.collections.empty')}</p>
              <p className="text-sm mb-6">{t('dashboard:teacher.collections.emptyDesc')}</p>
              <Button className="bg-gradient-hero hover:opacity-90 transition-opacity">
                <Plus className="h-5 w-5 mr-2" />
                {t('dashboard:teacher.collections.createFirst')}
              </Button>
            </div>
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

export default TeacherDashboard;
