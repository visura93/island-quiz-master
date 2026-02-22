import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useQuizPreferences } from "@/contexts/QuizPreferencesContext";
import { ArrowLeft, User, Lock, Bell, Shield, Smartphone, Mail, Globe, Eye, Volume2, Vibrate } from "lucide-react";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['profile', 'common']);
  const { user } = useAuth();
  const { soundEnabled, hapticEnabled, toggleSound, toggleHaptic } = useQuizPreferences();

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/student-dashboard')}
                className="btn-modern"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  {t('profile:settings.title')}
                </h1>
                <p className="text-sm text-muted-foreground">{t('profile:settings.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="border-2 shadow-elegant bg-gradient-card max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">{t('profile:settings.cardTitle')}</CardTitle>
            <CardDescription>
              {t('profile:settings.cardSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
                <TabsTrigger value="profile" className="gap-2">
                  <User className="h-4 w-4" />
                  {t('profile:settings.tabs.profile')}
                </TabsTrigger>
                <TabsTrigger value="password" className="gap-2">
                  <Lock className="h-4 w-4" />
                  {t('profile:settings.tabs.password')}
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="h-4 w-4" />
                  {t('profile:settings.tabs.notifications')}
                </TabsTrigger>
                <TabsTrigger value="privacy" className="gap-2">
                  <Shield className="h-4 w-4" />
                  {t('profile:settings.tabs.privacy')}
                </TabsTrigger>
                <TabsTrigger value="preferences" className="gap-2">
                  <Globe className="h-4 w-4" />
                  {t('profile:settings.tabs.preferences')}
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {t('profile:settings.profile.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('profile:settings.profile.subtitle')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigate('/student-profile')}
                      className="w-full bg-gradient-hero hover:opacity-90 transition-opacity"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('profile:settings.profile.viewEdit')}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      {t('profile:settings.profile.hint')}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Password Tab */}
              <TabsContent value="password" className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      {t('profile:settings.password.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('profile:settings.password.subtitle')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigate('/reset-password')}
                      className="w-full bg-gradient-hero hover:opacity-90 transition-opacity"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {t('profile:settings.password.changeButton')}
                    </Button>
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">{t('profile:settings.password.requirements')}</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• {t('profile:settings.password.req1')}</li>
                        <li>• {t('profile:settings.password.req2')}</li>
                        <li>• {t('profile:settings.password.req3')}</li>
                        <li>• {t('profile:settings.password.req4')}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      {t('profile:settings.notifications.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('profile:settings.notifications.subtitle')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{t('profile:settings.notifications.email')}</p>
                          <p className="text-sm text-muted-foreground">{t('profile:settings.notifications.emailDesc')}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{t('common:status.comingSoon')}</div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{t('profile:settings.notifications.push')}</p>
                          <p className="text-sm text-muted-foreground">{t('profile:settings.notifications.pushDesc')}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{t('common:status.comingSoon')}</div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{t('profile:settings.notifications.reminders')}</p>
                          <p className="text-sm text-muted-foreground">{t('profile:settings.notifications.remindersDesc')}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{t('common:status.comingSoon')}</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy" className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {t('profile:settings.privacy.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('profile:settings.privacy.subtitle')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">{t('profile:settings.privacy.accountPrivacy')}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {t('profile:settings.privacy.accountPrivacyDesc')}
                      </p>
                      <div className="text-sm text-muted-foreground">{t('common:status.comingSoon')}</div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">{t('profile:settings.privacy.dataAnalytics')}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {t('profile:settings.privacy.dataAnalyticsDesc')}
                      </p>
                      <div className="text-sm text-muted-foreground">{t('common:status.comingSoon')}</div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">{t('profile:settings.privacy.twoFactor')}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {t('profile:settings.privacy.twoFactorDesc')}
                      </p>
                      <div className="text-sm text-muted-foreground">{t('common:status.comingSoon')}</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {t('profile:settings.preferences.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('profile:settings.preferences.subtitle')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{t('profile:settings.preferences.darkMode')}</p>
                        <p className="text-sm text-muted-foreground">{t('profile:settings.preferences.darkModeDesc')}</p>
                      </div>
                      <DarkModeToggle />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{t('profile:settings.preferences.language')}</p>
                        <p className="text-sm text-muted-foreground">{t('profile:settings.preferences.languageDesc')}</p>
                      </div>
                      <LanguageSwitcher />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{t('profile:settings.preferences.fontSize')}</p>
                        <p className="text-sm text-muted-foreground">{t('profile:settings.preferences.fontSizeDesc')}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">{t('common:status.comingSoon')}</div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{t('profile:settings.preferences.quizTimer')}</p>
                        <p className="text-sm text-muted-foreground">{t('profile:settings.preferences.quizTimerDesc')}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">{t('common:status.comingSoon')}</div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Volume2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium">{t('profile:settings.preferences.soundEffects')}</p>
                          <p className="text-sm text-muted-foreground">{t('profile:settings.preferences.soundEffectsDesc')}</p>
                        </div>
                      </div>
                      <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Vibrate className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium">{t('profile:settings.preferences.hapticFeedback')}</p>
                          <p className="text-sm text-muted-foreground">{t('profile:settings.preferences.hapticFeedbackDesc')}</p>
                        </div>
                      </div>
                      <Switch checked={hapticEnabled} onCheckedChange={toggleHaptic} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
