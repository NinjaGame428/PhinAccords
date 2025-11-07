"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  MessageSquare, 
  Users, 
  Heart,
  Music,
  Globe
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslatedRoute } from "@/lib/url-translations";
import Link from "next/link";

const ContactPage = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const inquiryTypes = [
    t('contact.generalInquiry'),
    t('contact.songRequest'),
    t('contact.technicalSupport'),
    t('contact.partnership'),
    t('contact.feedback'),
    t('contact.other')
  ];

  if (isSubmitted) {
    return (
      <>
        <Navbar />
        <main className="pt-16 xs:pt-20 sm:pt-24 min-h-screen">
          <section className="py-20 px-6 bg-gradient-to-br from-background to-muted/20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-4xl xs:text-5xl sm:text-6xl font-bold tracking-tight mb-6">
                {t('contact.messageSent')}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {t('contact.messageSentText')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="rounded-full" onClick={() => setIsSubmitted(false)}>
                  <MessageSquare className="mr-2 h-5 w-5" />
                  {t('contact.sendAnother')}
                </Button>
                <Button variant="outline" size="lg" className="rounded-full" asChild>
                  <Link href={getTranslatedRoute('/', language)}>{t('contact.backToHome')}</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 xs:pt-20 sm:pt-24 min-h-screen">
        <section className="pt-20 px-6 bg-gradient-to-br from-background to-muted/20" style={{ paddingBottom: 'calc(1.25rem - 75px)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl xs:text-5xl sm:text-6xl font-bold tracking-tight mb-6">
              {t('contact.title')}
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              {t('contact.subtitle')}
            </p>
          </div>
        </section>

        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-8">
              <Card className="p-6 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-primary" /> {t('contact.ourLocation')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">{t('contact.location')}</p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">{t('contact.sendMessage')}</CardTitle>
                  <p className="text-muted-foreground text-center">
                    {t('contact.formDescription')}
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('contact.fullName')} *</Label>
                        <Input
                          id="name"
                          placeholder={t('contact.fullName')}
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          required
                          className="rounded-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('contact.emailAddress')} *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                          className="rounded-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inquiryType">{t('contact.inquiryType')}</Label>
                      <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange("inquiryType", value)}>
                        <SelectTrigger className="rounded-full">
                          <SelectValue placeholder={t('contact.selectInquiryType')} />
                        </SelectTrigger>
                        <SelectContent>
                          {inquiryTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">{t('contact.subject')} *</Label>
                      <Input
                        id="subject"
                        placeholder={t('contact.briefDescription')}
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        required
                        className="rounded-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t('contact.message')} *</Label>
                      <Textarea
                        id="message"
                        placeholder={t('contact.tellUsMore')}
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        required
                        className="min-h-[120px] rounded-xl"
                      />
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">
                        <strong>{t('contact.responseTime')}:</strong> {t('contact.responseTimeText')}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                      <Button
                        type="submit"
                        size="lg"
                        className="rounded-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Clock className="mr-2 h-5 w-5 animate-spin" />
                            {t('contact.sending')}
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            {t('contact.send')}
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="rounded-full"
                        onClick={() => setFormData({
                          name: "",
                          email: "",
                          subject: "",
                          message: "",
                          inquiryType: ""
                        })}
                      >
                        {t('contact.clearForm')}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default ContactPage;
