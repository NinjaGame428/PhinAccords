'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Database,
  Mail,
  Shield,
  Bell,
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const SettingsPage = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'PhinAccords',
    siteDescription: 'Ultra-fast Gospel Chords webapp with 100x performance optimization',
    siteUrl: 'https://heavenkeys-chords-finder.vercel.app',
    adminEmail: 'admin@heavenkeys.ca',
    
    // Database Settings
    databaseUrl: 'Connected to Supabase PostgreSQL',
    databaseStatus: 'healthy',
    lastBackup: new Date().toISOString().split('T')[0],
    
    // Email Settings
    emailProvider: 'Supabase Auth',
    emailEnabled: true,
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: 'strong',
    ipWhitelist: false,
    
    // Notification Settings
    emailNotifications: true,
    systemAlerts: true,
    maintenanceMode: false,
    
    // Performance Settings
    cachingEnabled: true,
    cdnEnabled: true,
    compressionEnabled: true,
    imageOptimization: true
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{t('admin.settings.title')}</h1>
                <p className="text-muted-foreground">
                  {t('admin.settings.subtitle')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSave} disabled={saving}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                  {t('admin.settings.reset')}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? t('dashboard.updating') : t('admin.settings.saveChanges')}
                </Button>
              </div>
            </div>
            
            {/* Save Status */}
            {saveStatus === 'success' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-green-800">Settings saved successfully!</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-red-800">Failed to save settings. Please try again.</span>
              </div>
            )}
          </div>

          {/* General Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                {t('admin.settings.generalSettings')}
              </CardTitle>
              <CardDescription>
                {t('admin.settings.basicConfiguration')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">{t('admin.settings.siteName')}</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">{t('admin.settings.adminEmail')}</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="siteDescription">{t('admin.settings.siteDescription')}</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="siteUrl">{t('admin.settings.siteUrl')}</Label>
                <Input
                  id="siteUrl"
                  value={settings.siteUrl}
                  onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Database Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                {t('admin.settings.databaseSettings')}
              </CardTitle>
              <CardDescription>
                {t('admin.settings.connectionHealth')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{t('admin.settings.databaseStatus')}</span>
                <Badge className={getStatusColor(settings.databaseStatus)}>
                  {t('admin.settings.healthy')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('admin.settings.connection')}</span>
                <span className="text-sm text-muted-foreground">{settings.databaseUrl}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('admin.settings.lastBackup')}</span>
                <span className="text-sm text-muted-foreground">{settings.lastBackup}</span>
              </div>
              <Button variant="outline" className="w-full">
                <Database className="h-4 w-4 mr-2" />
                {t('admin.settings.testConnection')}
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                {t('admin.settings.securitySettings')}
              </CardTitle>
              <CardDescription>
                {t('admin.settings.configureSecurity')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorAuth">{t('admin.settings.twoFactorAuth')}</Label>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.require2FA')}</p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings({...settings, twoFactorAuth: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ipWhitelist">{t('admin.settings.ipWhitelist')}</Label>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.restrictAdminAccess')}</p>
                </div>
                <Switch
                  id="ipWhitelist"
                  checked={settings.ipWhitelist}
                  onCheckedChange={(checked) => setSettings({...settings, ipWhitelist: checked})}
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">{t('admin.settings.sessionTimeout')}</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                {t('admin.settings.notificationSettings')}
              </CardTitle>
              <CardDescription>
                {t('admin.settings.configureNotifications')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">{t('admin.settings.emailNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.sendEmailAlerts')}</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="systemAlerts">{t('admin.settings.systemAlerts')}</Label>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.showSystemAlerts')}</p>
                </div>
                <Switch
                  id="systemAlerts"
                  checked={settings.systemAlerts}
                  onCheckedChange={(checked) => setSettings({...settings, systemAlerts: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceMode">{t('admin.settings.maintenanceMode')}</Label>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.putSiteInMaintenance')}</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Performance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                {t('admin.settings.performanceSettings')}
              </CardTitle>
              <CardDescription>
                {t('admin.settings.optimizePerformance')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cachingEnabled">{t('admin.settings.cachingEnabled')}</Label>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.enableApplicationCaching')}</p>
                </div>
                <Switch
                  id="cachingEnabled"
                  checked={settings.cachingEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, cachingEnabled: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cdnEnabled">{t('admin.settings.cdnEnabled')}</Label>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.useCDN')}</p>
                </div>
                <Switch
                  id="cdnEnabled"
                  checked={settings.cdnEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, cdnEnabled: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compressionEnabled">{t('admin.settings.compressionEnabled')}</Label>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.enableGzipCompression')}</p>
                </div>
                <Switch
                  id="compressionEnabled"
                  checked={settings.compressionEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, compressionEnabled: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="imageOptimization">{t('admin.settings.imageOptimization')}</Label>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.optimizeImagesAutomatically')}</p>
                </div>
                <Switch
                  id="imageOptimization"
                  checked={settings.imageOptimization}
                  onCheckedChange={(checked) => setSettings({...settings, imageOptimization: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AdminLayout>
  );
};

export default SettingsPage;
