import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, User, BookOpen, Shield } from "lucide-react";
import { toast } from "sonner";

type UserRole = "student" | "teacher" | "admin";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    // This is a placeholder - will be connected to Lovable Cloud
    if (isLogin) {
      toast.success("Login successful!");
      // Navigate based on role
      navigate(`/${selectedRole}-dashboard`);
    } else {
      toast.success("Account created successfully!");
      navigate(`/${selectedRole}-dashboard`);
    }
  };

  const roles = [
    {
      id: "student" as UserRole,
      icon: GraduationCap,
      title: "Student",
      description: "Practice MCQs and track progress",
    },
    {
      id: "teacher" as UserRole,
      icon: BookOpen,
      title: "Teacher",
      description: "Create and manage MCQ content",
    },
    {
      id: "admin" as UserRole,
      icon: Shield,
      title: "Admin",
      description: "Manage platform and users",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Island First
            </span>
          </div>
          <p className="text-muted-foreground">Smart MCQ Platform for Enhanced Learning</p>
        </div>

        <Card className="border-2 shadow-elegant bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin ? "Sign in to continue" : "Sign up to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-6">
              {/* Role Selection */}
              {!isLogin && (
                <div className="space-y-3">
                  <Label>Select Your Role</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                          selectedRole === role.id
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                      >
                        <role.icon className={`h-6 w-6 mx-auto mb-1 ${
                          selectedRole === role.id ? "text-primary" : "text-muted-foreground"
                        }`} />
                        <p className="text-xs font-medium">{role.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name Field (Sign Up Only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-gradient-hero hover:opacity-90 transition-opacity">
                {isLogin ? "Sign In" : "Create Account"}
              </Button>

              {/* Toggle Login/Signup */}
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
