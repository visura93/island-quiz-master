import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, TrendingUp, Shield, CheckCircle2, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: "Smart MCQ Management",
      description: "Create, organize, and manage multiple-choice questions with ease",
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Separate portals for teachers, students, and administrators",
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Track progress and identify areas for improvement",
    },
    {
      icon: Shield,
      title: "Secure & Scalable",
      description: "Cloud-based infrastructure with enterprise-grade security",
    },
  ];

  const benefits = {
    teachers: [
      "Upload and monetize MCQ content",
      "Monitor student progress in real-time",
      "Customize quiz settings and timers",
      "Earn through subscriptions",
    ],
    students: [
      "Access curated MCQ collections",
      "Practice with customizable settings",
      "Track your learning progress",
      "Flexible subscription plans",
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Island First
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Log In
            </Button>
            <Button onClick={() => navigate("/auth")} className="bg-gradient-hero hover:opacity-90 transition-opacity">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Smart MCQ Platform for{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Enhanced Learning
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Empowering teachers to create and monetize content while helping students
            excel through intelligent practice and analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-gradient-hero hover:opacity-90 transition-opacity text-lg px-8"
              onClick={() => navigate("/auth")}
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 border-2 hover:bg-muted"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground">Everything you need for effective MCQ-based learning</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-2 hover:shadow-hover transition-all duration-300 hover:-translate-y-1 bg-gradient-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl my-20">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* For Teachers */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">For Teachers</h3>
            </div>
            <ul className="space-y-4">
              {benefits.teachers.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-lg">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* For Students */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-3xl font-bold">For Students</h3>
            </div>
            <ul className="space-y-4">
              {benefits.students.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-lg">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8 bg-gradient-hero rounded-3xl p-12 shadow-elegant text-white">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Transform Learning?
          </h2>
          <p className="text-xl opacity-90">
            Join thousands of teachers and students already using Island First
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 text-lg px-8"
            onClick={() => navigate("/auth")}
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-semibold">Island First</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Island First. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
