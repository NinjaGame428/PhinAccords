"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Music } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslatedRoute } from "@/lib/url-translations";
import LanguageSwitcher from "@/components/language-switcher";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { t, language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.invalidEmail'));
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Small delay to ensure auth state updates before redirect
        setTimeout(() => {
          router.push(getTranslatedRoute("/dashboard", language));
        }, 100);
      } else {
        setError(result.error || t('auth.invalidEmailPassword'));
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || t('auth.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col lg:flex-row">
      {/* Mobile Image - Shows on mobile, hidden on desktop */}
      <div className="lg:hidden w-full h-64 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/login%20image.png')",
          }}
        >
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-6 text-white">
          <h2 className="text-2xl font-bold text-center">{t('auth.welcomeToPhinAccords')}</h2>
          <p className="text-sm text-white/90 text-center mt-2">
            {t('auth.joinMusicians')}
          </p>
        </div>
      </div>

      {/* Left Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Link href={getTranslatedRoute('/', language)} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('auth.backToHome')}
              </Link>
              <LanguageSwitcher />
            </div>
            <div className="flex items-center space-x-2 lg:hidden">
              <Music className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">PhinAccords</h1>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('auth.signInTitle')}</h1>
              <p className="text-muted-foreground mt-1">{t('auth.welcomeBack')}</p>
            </div>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">{t('auth.signIn')}</CardTitle>
              <CardDescription>
                {t('auth.signInDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <Link href="#" className="text-sm text-primary hover:underline">
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('auth.enterPassword')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                {error && (
                  <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? t('auth.signingIn') : t('auth.signIn')}
                </Button>
              </form>

              <Separator />

              <div className="text-center text-sm">
                <span className="text-muted-foreground">{t('auth.dontHaveAccount')}</span>{" "}
                <Link 
                  href={getTranslatedRoute("/register", language)} 
                  className="text-primary hover:underline font-medium"
                >
                  {t('auth.signUp')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column - Full Screen Image (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/login%20image.png')",
          }}
        >
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="max-w-md space-y-6 text-center">
            <h2 className="text-3xl font-bold">{t('auth.welcomeToPhinAccords')}</h2>
            <p className="text-lg text-white/90">
              {t('auth.joinMusicians')}
            </p>
            <ul className="space-y-3 text-left list-none">
              <li className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span>{t('auth.accessChords')}</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span>{t('auth.interactiveDiagrams')}</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span>{t('auth.transposeChords')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
