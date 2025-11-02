import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, User, BookOpen, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type UserRole = "student" | "teacher" | "admin";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Show loading while auth context is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Debug authentication state
  console.log('Auth component render:', { 
    isAuthenticated, 
    user, 
    userRole: user?.role, 
    authLoading,
    isLoading 
  });

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Auth useEffect triggered:', { isAuthenticated, user, userRole: user?.role });
    
    if (isAuthenticated && user && user.role !== undefined) {
      console.log('User object:', user);
      console.log('User role:', user.role, typeof user.role);
      
      // Map numeric role to string role
      let userRole: string;
      if (typeof user.role === 'number') {
        // Map numeric roles: 0 = Student, 1 = Teacher, 2 = Admin (adjust as needed)
        const roleMap: { [key: number]: string } = {
          0: 'student',
          1: 'teacher', 
          2: 'admin'
        };
        userRole = roleMap[user.role] || 'student';
      } else if (typeof user.role === 'string') {
        userRole = user.role.toLowerCase();
      } else {
        userRole = 'student'; // fallback
      }
      
      const from = location.state?.from?.pathname || `/${userRole}-dashboard`;
      console.log('Navigating to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state?.from?.pathname]);

  if (isAuthenticated) {
    console.log('User is authenticated, should redirect...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Login successful!");
        // The user will be redirected by the useEffect below when isAuthenticated becomes true
      } else {
        if (!firstName || !lastName) {
          toast.error("Please enter both first and last name");
          setIsLoading(false);
          return;
        }

        const roleMap: Record<UserRole, 'Student' | 'Teacher' | 'Admin'> = {
          student: 'Student',
          teacher: 'Teacher',
          admin: 'Admin'
        };

        await register(firstName, lastName, email, password, roleMap[selectedRole]);
        toast.success("Account created successfully!");
        navigate(`/${selectedRole}-dashboard`, { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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

              {/* Name Fields (Sign Up Only) */}
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </>
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
              <Button 
                type="submit" 
                className="w-full bg-gradient-hero hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
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
