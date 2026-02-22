import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Building2, MessageCircle, Mail, Copy, CheckCircle2, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GraduationCap, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Payment = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation(['payment', 'common']);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast({
      title: t('payment:copied'),
      description: t('payment:copiedDesc', { field: fieldName }),
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/student-dashboard')}
          >
            <div className="p-2 bg-gradient-hero rounded-xl shadow-elegant">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                {t('common:appName')}
              </span>
              <p className="text-xs text-muted-foreground">{t('common:taglineShort')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Show Premium Status or Upgrade Button */}
            {user?.isPremium && user?.subscriptionEndDate && new Date(user.subscriptionEndDate) > new Date() ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-md">
                <Crown className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">
                  {t('payment:premiumActive')}
                </span>
              </div>
            ) : (
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hidden sm:flex bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold shadow-lg"
              >
                <Crown className="h-4 w-4 mr-2" />
                {t('payment:upgrade')}
              </Button>
            )}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">
                {t('payment:welcome', { name: user?.firstName })}
              </span>
            </div>
            <LanguageSwitcher />
            <DarkModeToggle />
            <Button variant="outline" onClick={handleLogout} className="btn-modern">
              <LogOut className="h-4 w-4 mr-2" />
              {t('common:buttons.logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/student-dashboard')}
          className="mb-6 btn-modern"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('payment:backToDashboard')}
        </Button>

        {/* Page Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full mb-4">
            <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">{t('payment:premiumSubscription')}</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            {t('payment:upgrade')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('payment:unlockFeatures')}
          </p>
        </div>

        {/* Subscription Plan Card */}
        <Card className="border-2 border-yellow-200 dark:border-yellow-800 shadow-elegant bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 mb-8">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl bg-gradient-hero bg-clip-text text-transparent mb-2">
              {t('payment:premiumPlan')}
            </CardTitle>
            <CardDescription className="text-lg text-foreground">
              {t('payment:threeMonths')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <div className="text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                Rs 1,000
              </div>
              <p className="text-muted-foreground">{t('payment:forThreeMonths')}</p>
            </div>

            {/* Features List */}
            <div className="bg-white/50 dark:bg-slate-900/30 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">{t('payment:whatYouGet')}</h3>
              <ul className="space-y-3 text-left">
                {[
                  t('payment:featuresList.unlimitedAccess'),
                  t('payment:featuresList.premiumContent'),
                  t('payment:featuresList.advancedAnalytics'),
                  t('payment:featuresList.prioritySupport'),
                  t('payment:featuresList.adFree'),
                  t('payment:featuresList.downloadable')
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <Card className="border-2 shadow-elegant bg-gradient-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              {t('payment:instructions.title')}
            </CardTitle>
            <CardDescription>
              {t('payment:instructions.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bank Details */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {t('payment:instructions.bankDetails')}
              </h3>
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                {/* Bank Name */}
                <div className="flex items-center justify-between group">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('payment:instructions.bankName')}</p>
                    <p className="font-semibold text-lg">Commercial Bank</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("Commercial Bank", t('payment:instructions.bankName'))}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedField === t('payment:instructions.bankName') ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="h-px bg-border"></div>

                {/* Account Name */}
                <div className="flex items-center justify-between group">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('payment:instructions.accountName')}</p>
                    <p className="font-semibold text-lg">A.B.C Weeffffffffff</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("A.B.C Weeffffffffff", t('payment:instructions.accountName'))}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedField === t('payment:instructions.accountName') ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="h-px bg-border"></div>

                {/* Account Number */}
                <div className="flex items-center justify-between group">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('payment:instructions.accountNumber')}</p>
                    <p className="font-semibold text-lg font-mono">123456789</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("123456789", t('payment:instructions.accountNumber'))}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedField === t('payment:instructions.accountNumber') ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">{t('payment:instructions.afterPayment')}</span>
              </div>
            </div>

            {/* Submit Receipt Instructions */}
            <div>
              <h3 className="font-semibold text-lg mb-4">{t('payment:instructions.shareReceipt')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('payment:instructions.shareReceiptDesc')}
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {/* WhatsApp Card */}
                <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-500 rounded-full">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">WhatsApp</h4>
                        <Badge className="bg-green-500 text-white mt-1">{t('payment:instructions.preferred')}</Badge>
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-slate-900/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <p className="font-mono font-semibold text-lg">+947111111111</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("+947111111111", "WhatsApp")}
                        >
                          {copiedField === "WhatsApp" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => window.open('https://wa.me/947111111111', '_blank')}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {t('payment:instructions.sendViaWhatsApp')}
                    </Button>
                  </CardContent>
                </Card>

                {/* Email Card */}
                <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-500 rounded-full">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{t('common:labels.email')}</h4>
                        <Badge variant="outline" className="mt-1">{t('payment:instructions.alternative')}</Badge>
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-slate-900/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <p className="font-semibold">viiii@gg.com</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("viiii@gg.com", t('common:labels.email'))}
                        >
                          {copiedField === t('common:labels.email') ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => window.location.href = 'mailto:viiii@gg.com?subject=Premium Subscription Payment Receipt'}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {t('payment:instructions.sendViaEmail')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                {t('payment:importantNote.title')}
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• {t('payment:importantNote.note1')}</li>
                <li>• {t('payment:importantNote.note2')}</li>
                <li>• {t('payment:importantNote.note3')}</li>
                <li>• {t('payment:importantNote.note4')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/student-dashboard')}
            className="btn-modern"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('payment:backToDashboard')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
