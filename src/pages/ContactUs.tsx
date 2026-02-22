import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Phone, MapPin, Clock, MessageSquare, Send, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const ContactUs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation(['landing', 'common']);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: t('landing:contact.messageSent'),
        description: t('landing:contact.messageSentDesc'),
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
                  {t('landing:contact.title')}
                </h1>
                <p className="text-sm text-muted-foreground">{t('landing:contact.subtitle')}</p>
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
        <div className="max-w-6xl mx-auto">
          {/* Company Info Section */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('landing:contact.helpTitle')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('landing:contact.helpSubtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Contact Information Cards */}
            <Card className="border-2 shadow-elegant bg-gradient-card hover:shadow-hover transition-all">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-gradient-hero rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('landing:contact.emailUs')}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('landing:contact.emailUsDesc')}
                </p>
                <a
                  href="mailto:support@islandfirst.lk"
                  className="text-primary hover:underline font-medium"
                >
                  support@islandfirst.lk
                </a>
                <br />
                <a
                  href="mailto:info@islandfirst.lk"
                  className="text-primary hover:underline font-medium"
                >
                  info@islandfirst.lk
                </a>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-elegant bg-gradient-card hover:shadow-hover transition-all">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-gradient-hero rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('landing:contact.callUs')}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('landing:contact.callUsDesc')}
                </p>
                <a
                  href="tel:+94112345678"
                  className="text-primary hover:underline font-medium block"
                >
                  +94 11 234 5678
                </a>
                <a
                  href="tel:+94771234567"
                  className="text-primary hover:underline font-medium block"
                >
                  +94 77 123 4567
                </a>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-elegant bg-gradient-card hover:shadow-hover transition-all">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-gradient-hero rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('landing:contact.visitUs')}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('landing:contact.visitUsDesc')}
                </p>
                <p className="text-sm font-medium">
                  123 Colombo Road,<br />
                  Colombo 07,<br />
                  Sri Lanka
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="border-2 shadow-elegant bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t('landing:contact.sendMessage')}
                </CardTitle>
                <CardDescription>
                  {t('landing:contact.sendMessageDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('landing:contact.fullName')}</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder={t('landing:contact.namePlaceholder')}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-modern"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('common:labels.email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t('landing:contact.emailPlaceholder')}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-modern"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('landing:contact.subject')}</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder={t('landing:contact.subjectPlaceholder')}
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="input-modern"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('landing:contact.message')}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder={t('landing:contact.messagePlaceholder')}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="input-modern resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-hero hover:opacity-90 transition-opacity"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('common:buttons.sending')}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t('landing:contact.sendButton')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <div className="space-y-6">
              {/* Office Hours */}
              <Card className="border-2 shadow-elegant bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t('landing:contact.officeHours')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{t('landing:contact.monFri')}</span>
                    <span className="text-muted-foreground">8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{t('landing:contact.sat')}</span>
                    <span className="text-muted-foreground">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{t('landing:contact.sun')}</span>
                    <span className="text-muted-foreground">{t('landing:contact.closed')}</span>
                  </div>
                </CardContent>
              </Card>

              {/* About Company */}
              <Card className="border-2 shadow-elegant bg-gradient-card">
                <CardHeader>
                  <CardTitle>{t('landing:contact.aboutTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('landing:contact.aboutText1')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('landing:contact.aboutText2')}
                  </p>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="border-2 shadow-elegant bg-gradient-card">
                <CardHeader>
                  <CardTitle>{t('landing:contact.connectWith')}</CardTitle>
                  <CardDescription>
                    {t('landing:contact.connectWithDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 justify-center">
                    <Button
                      size="icon"
                      variant="outline"
                      className="hover:bg-blue-100 hover:border-blue-400 transition-colors"
                      onClick={() => window.open('https://facebook.com/islandfirst', '_blank')}
                    >
                      <Facebook className="h-5 w-5 text-blue-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      onClick={() => window.open('https://twitter.com/islandfirst', '_blank')}
                    >
                      <Twitter className="h-5 w-5 text-blue-400" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="hover:bg-pink-50 hover:border-pink-300 transition-colors"
                      onClick={() => window.open('https://instagram.com/islandfirst', '_blank')}
                    >
                      <Instagram className="h-5 w-5 text-pink-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="hover:bg-blue-50 hover:border-blue-400 transition-colors"
                      onClick={() => window.open('https://linkedin.com/company/islandfirst', '_blank')}
                    >
                      <Linkedin className="h-5 w-5 text-blue-700" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <Card className="border-2 shadow-elegant bg-gradient-card mt-8">
            <CardHeader>
              <CardTitle>{t('landing:contact.faqTitle')}</CardTitle>
              <CardDescription>{t('landing:contact.faqSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">{t('landing:contact.faqItems.q1')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('landing:contact.faqItems.a1')}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">{t('landing:contact.faqItems.q2')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('landing:contact.faqItems.a2')}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">{t('landing:contact.faqItems.q3')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('landing:contact.faqItems.a3')}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">{t('landing:contact.faqItems.q4')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('landing:contact.faqItems.a4')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
