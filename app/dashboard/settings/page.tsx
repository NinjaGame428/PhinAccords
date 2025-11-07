"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Trash2,
  Key,
  Mail,
  Smartphone
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'system',
    notifications: true,
    emailNotifications: true,
    pushNotifications: false,
    autoSave: true,
    showTutorials: true
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(prev => ({ ...prev, ...user.preferences }));
    }
  }, [user]);

  const handlePreferenceChange = async (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    // TODO: Implement preference updates when backend is ready
    console.log('Preference change:', key, value);
  };

  const handleExportData = () => {
    // TODO: Implement data export
    console.log('Exporting user data...');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    console.log('Deleting account...');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('dashboard.settings')}</h1>
            <p className="text-muted-foreground">
              {t('dashboard.customizeExperience')}
            </p>
          </div>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.preferences')}</CardTitle>
              <CardDescription>{t('dashboard.customizeExperience')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>{t('dashboard.language')}</Label>
                      <p className="text-sm text-muted-foreground">{t('dashboard.chooseLanguage')}</p>
                    </div>
                  </div>
                  <select 
                    value={preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Palette className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>{t('dashboard.theme')}</Label>
                      <p className="text-sm text-muted-foreground">{t('dashboard.chooseTheme')}</p>
                    </div>
                  </div>
                  <select 
                    value={preferences.theme}
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>{t('dashboard.emailNotifications')}</Label>
                      <p className="text-sm text-muted-foreground">{t('dashboard.receiveEmailNotifications')}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>{t('dashboard.pushNotifications')}</Label>
                      <p className="text-sm text-muted-foreground">{t('dashboard.receivePushNotifications')}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.pushNotifications}
                    onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>{t('dashboard.autoSave')}</Label>
                      <p className="text-sm text-muted-foreground">{t('dashboard.automaticallySaveWork')}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.autoSave}
                    onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>{t('dashboard.showTutorials')}</Label>
                      <p className="text-sm text-muted-foreground">{t('dashboard.displayHelpfulTutorials')}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.showTutorials}
                    onChange={(e) => handlePreferenceChange('showTutorials', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('dashboard.security')}</CardTitle>
              <CardDescription>{t('dashboard.manageAccountSecurity')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label>{t('dashboard.password')}</Label>
                    <p className="text-sm text-muted-foreground">{t('dashboard.changePassword')}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {t('dashboard.changePassword')}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label>{t('dashboard.email')}</Label>
                    <p className="text-sm text-muted-foreground">{t('dashboard.updateEmailAddress')}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {t('dashboard.updateEmail')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('dashboard.dataManagement')}</CardTitle>
              <CardDescription>{t('dashboard.manageDataAndAccount')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label>{t('dashboard.exportData')}</Label>
                    <p className="text-sm text-muted-foreground">{t('dashboard.downloadYourData')}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  {t('dashboard.exportData')}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <div>
                    <Label className="text-red-600">{t('dashboard.deleteAccount')}</Label>
                    <p className="text-sm text-muted-foreground">{t('dashboard.permanentlyDeleteAccount')}</p>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                  {t('dashboard.deleteAccount')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
