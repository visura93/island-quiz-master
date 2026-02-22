import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['auth', 'common']);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!token || !email) {
      toast.error(t('auth:resetPasswordPage.invalidLink'));
      navigate("/auth");
    }
  }, [token, email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    // Client-side validation
    const validationErrors: { [key: string]: string } = {};

    if (!password) {
      validationErrors.password = t('auth:resetPasswordPage.passwordRequired');
    } else if (password.length < 6) {
      validationErrors.password = t('auth:resetPasswordPage.passwordTooShort');
    }

    if (!confirmPassword) {
      validationErrors.confirmPassword = t('auth:resetPasswordPage.confirmRequired');
    } else if (password !== confirmPassword) {
      validationErrors.confirmPassword = t('auth:resetPasswordPage.passwordsMismatch');
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      await apiService.resetPassword(email!, token!, password);
      setResetSuccess(true);
      toast.success(t('auth:resetPasswordPage.resetSuccess'));
    } catch (error: any) {
      const errorMessage = error.message || t('common:status.error');
      if (errorMessage.toLowerCase().includes("expired") || errorMessage.toLowerCase().includes("invalid token")) {
        setFieldErrors({ general: t('auth:resetPasswordPage.expiredLink') });
      } else {
        setFieldErrors({ general: errorMessage });
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="h-10 w-10 text-primary" />
              <span className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                {t('common:appName')}
              </span>
            </div>
          </div>

          <Card className="border-2 shadow-elegant bg-gradient-card">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">{t('auth:resetPasswordPage.successTitle')}</CardTitle>
              <CardDescription className="text-center">
                {t('auth:resetPasswordPage.successDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-900 dark:text-green-200 text-center">
                  {t('auth:resetPasswordPage.successInfo')}
                </p>
              </div>

              <Button
                onClick={() => navigate("/auth")}
                className="w-full bg-gradient-hero hover:opacity-90 transition-opacity"
              >
                {t('auth:resetPasswordPage.goToSignIn')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              {t('common:appName')}
            </span>
          </div>
          <p className="text-muted-foreground">{t('auth:resetPasswordPage.subtitle')}</p>
        </div>

        <Card className="border-2 shadow-elegant bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t('auth:resetPasswordPage.title')}</CardTitle>
            <CardDescription className="text-center">
              {t('auth:resetPasswordPage.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error Display */}
              {fieldErrors.general && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.general}
                  </p>
                </div>
              )}

              {/* Email Display (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth:fields.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth:resetPasswordPage.newPassword')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('auth:resetPasswordPage.newPasswordPlaceholder')}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors({ ...fieldErrors, password: "" });
                      }
                    }}
                    className={`pr-10 ${fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    required
                    autoFocus
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
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.password}
                  </p>
                )}
                {!fieldErrors.password && (
                  <p className="text-xs text-muted-foreground">
                    {t('auth:passwordHint')}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth:resetPasswordPage.confirmNewPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t('auth:resetPasswordPage.confirmNewPasswordPlaceholder')}
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
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-hero hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? t('auth:resetPasswordPage.resetting') : t('auth:resetPasswordPage.resetButton')}
              </Button>

              {/* Back to Sign In */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="text-primary hover:underline"
                >
                  {t('common:buttons.backToSignIn')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            {t('common:buttons.backToHome')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
