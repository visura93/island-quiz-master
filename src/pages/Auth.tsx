import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, User, BookOpen, AlertCircle, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type UserRole = "student" | "teacher";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, register, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Google Login Hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setFieldErrors({});

      try {
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        
        const userInfo = await userInfoResponse.json();
        
        // Create a JWT-like credential to send to backend
        const credential = JSON.stringify({
          email: userInfo.email,
          given_name: userInfo.given_name,
          family_name: userInfo.family_name,
          sub: userInfo.sub,
          email_verified: userInfo.email_verified,
        });

        const roleMap: Record<UserRole, 'Student' | 'Teacher'> = {
          student: 'Student',
          teacher: 'Teacher'
        };

        await loginWithGoogle(credential, roleMap[selectedRole]);
        toast.success("Google login successful!");
      } catch (error: any) {
        const errorMessage = error.message || "Google authentication failed. Please try again.";
        setFieldErrors({ general: errorMessage });
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Google authentication failed");
    },
  });

  // Redirect if already authenticated - MUST be called before any conditional returns
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
    setFieldErrors({});

    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Login successful!");
        setFieldErrors({});
        // The user will be redirected by the useEffect below when isAuthenticated becomes true
      } else {
        // Client-side validation
        const validationErrors: { [key: string]: string } = {};
        
        if (!firstName || !firstName.trim()) {
          validationErrors.firstName = "First name is required";
        }
        if (!lastName || !lastName.trim()) {
          validationErrors.lastName = "Last name is required";
        }
        if (!email || !email.trim()) {
          validationErrors.email = "Email is required";
        }
        if (!password) {
          validationErrors.password = "Password is required";
        }
        if (!confirmPassword) {
          validationErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
          validationErrors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(validationErrors).length > 0) {
          setFieldErrors(validationErrors);
          setIsLoading(false);
          return;
        }

        const roleMap: Record<UserRole, 'Student' | 'Teacher'> = {
          student: 'Student',
          teacher: 'Teacher'
        };

        await register(firstName, lastName, email, password, roleMap[selectedRole]);
        toast.success("Account created successfully!");
        navigate(`/${selectedRole}-dashboard`, { replace: true });
      }
    } catch (error: any) {
      // Handle structured error response from backend
      const newFieldErrors: { [key: string]: string } = {};
      
      if (error.errors && Array.isArray(error.errors)) {
        // Multiple validation errors - map to fields
        error.errors.forEach((err: string) => {
          if (err.toLowerCase().includes('email') || err.toLowerCase().includes('user with this email')) {
            newFieldErrors.email = err;
          } else if (err.toLowerCase().includes('password')) {
            newFieldErrors.password = err;
          } else if (err.toLowerCase().includes('first name')) {
            newFieldErrors.firstName = err;
          } else if (err.toLowerCase().includes('last name')) {
            newFieldErrors.lastName = err;
          } else {
            // For login errors or other general errors
            if (isLogin) {
              newFieldErrors.general = err;
            } else {
              newFieldErrors.password = err; // Default to password field for registration errors
            }
          }
        });
      } else {
        // Single error message
        const errorMessage = error.message || error.errorResponse?.message || "An error occurred. Please try again.";
        
        if (isLogin) {
          // For login errors, always show user-friendly message
          // Check if it's an authentication error (401 status or auth-related message)
          const lowerMessage = errorMessage.toLowerCase();
          const isAuthError = 
            error.status === 401 ||
            lowerMessage.includes('invalid') || 
            lowerMessage.includes('email') || 
            lowerMessage.includes('password') ||
            lowerMessage.includes('incorrect') ||
            lowerMessage.includes('wrong') ||
            lowerMessage.includes('unauthorized') ||
            lowerMessage.includes('401') ||
            lowerMessage.includes('authentication') ||
            lowerMessage.includes('login failed') ||
            errorMessage === 'An error occurred' ||
            errorMessage === 'An error occurred. Please try again.';
          
          if (isAuthError || !errorMessage || errorMessage.trim() === '') {
            newFieldErrors.general = "Invalid email or password. Please try again.";
          } else {
            // For other login errors, show the actual message
            newFieldErrors.general = errorMessage;
          }
        } else {
          newFieldErrors.password = errorMessage;
        }
      }
      
      setFieldErrors(newFieldErrors);
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
              {/* General Error Display (for login errors) */}
              {fieldErrors.general && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.general}
                  </p>
                </div>
              )}

              {/* Role Selection */}
              {!isLogin && (
                <div className="space-y-3">
                  <Label>Select Your Role</Label>
                  <div className="grid grid-cols-2 gap-2">
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
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (fieldErrors.firstName) {
                          setFieldErrors({ ...fieldErrors, firstName: "" });
                        }
                      }}
                      className={fieldErrors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}
                      required
                    />
                    {fieldErrors.firstName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (fieldErrors.lastName) {
                          setFieldErrors({ ...fieldErrors, lastName: "" });
                        }
                      }}
                      className={fieldErrors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}
                      required
                    />
                    {fieldErrors.lastName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {fieldErrors.lastName}
                      </p>
                    )}
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors({ ...fieldErrors, email: "" });
                    }
                  }}
                  className={fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                  required
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors({ ...fieldErrors, password: "" });
                      }
                    }}
                    className={`pr-10 ${fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.password}
                  </p>
                )}
                {!isLogin && !fieldErrors.password && (
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters and contain uppercase, lowercase, number, and special character
                  </p>
                )}
              </div>

              {/* Confirm Password Field (Sign Up Only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                        }
                      }}
                      className={`pr-10 ${fieldErrors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-hero hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => googleLogin()}
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isLogin ? "Sign in with Google" : "Sign up with Google"}
              </Button>

              {/* Forgot Password Link (Login Only) */}
              {isLogin && (
                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-muted-foreground hover:text-primary hover:underline transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Toggle Login/Signup */}
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFieldErrors({});
                    setPassword("");
                    setConfirmPassword("");
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                  }}
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
