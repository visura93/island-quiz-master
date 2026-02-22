import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, AlertCircle, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['auth', 'common']);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await apiService.forgotPassword(email);
      setEmailSent(true);
      toast.success(t('auth:forgotPasswordPage.emailSent'));
    } catch (error: any) {
      const errorMessage = error.message || t('common:status.error');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
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
              <CardTitle className="text-2xl text-center">{t('auth:forgotPasswordPage.checkEmail')}</CardTitle>
              <CardDescription className="text-center">
                {t('auth:forgotPasswordPage.checkEmailDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200 flex items-start gap-2">
                  <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>
                    {t('auth:forgotPasswordPage.emailInfo', { email })}
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/auth")}
                  className="w-full"
                  variant="default"
                >
                  {t('auth:forgotPasswordPage.returnToSignIn')}
                </Button>
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className="w-full"
                  variant="outline"
                >
                  {t('auth:forgotPasswordPage.sendAnother')}
                </Button>
              </div>
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
          <p className="text-muted-foreground">{t('auth:forgotPasswordPage.subtitle')}</p>
        </div>

        <Card className="border-2 shadow-elegant bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t('auth:forgotPasswordPage.title')}</CardTitle>
            <CardDescription className="text-center">
              {t('auth:forgotPasswordPage.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth:forgotPasswordPage.emailAddress')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth:fields.emailPlaceholder')}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
                  required
                  autoFocus
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-hero hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? t('auth:forgotPasswordPage.sending') : t('auth:forgotPasswordPage.sendResetLink')}
              </Button>

              {/* Back to Sign In */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
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

export default ForgotPassword;
