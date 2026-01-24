import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Phone, MapPin, Clock, MessageSquare, Send, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ContactUs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
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
                Contact Us
              </h1>
              <p className="text-sm text-muted-foreground">Get in touch with our team</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Company Info Section */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-4">We're Here to Help</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions or need assistance? Our team is ready to support you on your learning journey.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Contact Information Cards */}
            <Card className="border-2 shadow-elegant bg-gradient-card hover:shadow-hover transition-all">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-gradient-hero rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email Us</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Send us your queries anytime
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
                <h3 className="font-semibold text-lg mb-2">Call Us</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Mon-Fri from 8am to 5pm
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
                <h3 className="font-semibold text-lg mb-2">Visit Us</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Come say hello at our office
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
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-modern"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-modern"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="input-modern"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
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
                    Office Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Monday - Friday</span>
                    <span className="text-muted-foreground">8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Saturday</span>
                    <span className="text-muted-foreground">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Sunday</span>
                    <span className="text-muted-foreground">Closed</span>
                  </div>
                </CardContent>
              </Card>

              {/* About Company */}
              <Card className="border-2 shadow-elegant bg-gradient-card">
                <CardHeader>
                  <CardTitle>About Island First</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Island First is Sri Lanka's leading online learning platform, dedicated to helping students excel in their academic journey. We provide comprehensive quiz materials, practice papers, and learning resources for all grade levels.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Our mission is to make quality education accessible to every student across the island, empowering them to achieve their full potential through innovative learning solutions.
                  </p>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="border-2 shadow-elegant bg-gradient-card">
                <CardHeader>
                  <CardTitle>Connect With Us</CardTitle>
                  <CardDescription>
                    Follow us on social media for updates and tips
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
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">How do I reset my password?</h4>
                  <p className="text-sm text-muted-foreground">
                    Navigate to Settings → Password tab and click "Change Password" to reset your password securely.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                  <p className="text-sm text-muted-foreground">
                    We accept credit/debit cards, bank transfers, and mobile payment options for premium subscriptions.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">How can I track my learning progress?</h4>
                  <p className="text-sm text-muted-foreground">
                    Your dashboard displays comprehensive statistics including completed quizzes, average scores, and time spent learning.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, we offer a 7-day money-back guarantee for premium subscriptions. Contact support for assistance.
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
