"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Settings, 
  Heart, 
  Download, 
  Star, 
  Music, 
  Clock, 
  LogOut,
  Edit,
  Save,
  X
} from "lucide-react";
import { 
  fetchUserStats, 
  fetchRecentActivity, 
  fetchFavoriteSongs, 
  fetchDownloadedResources,
  updateUserStats,
  type UserStats,
  type RecentActivity,
  type FavoriteSong,
  type DownloadedResource
} from "@/lib/user-stats";

export default function DashboardPage() {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [userStats, setUserStats] = useState<UserStats>({
    favoriteSongs: 0,
    downloadedResources: 0,
    ratingsGiven: 0,
    lastActive: new Date().toISOString()
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [favoriteSongs, setFavoriteSongs] = useState<FavoriteSong[]>([]);
  const [downloadedResources, setDownloadedResources] = useState<DownloadedResource[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (user) {
      setEditData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
      
      // Load real-time data
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      // Fetch all user data in parallel
      const [stats, activity, favorites, downloads] = await Promise.all([
        fetchUserStats(user.id),
        fetchRecentActivity(user.id),
        fetchFavoriteSongs(user.id),
        fetchDownloadedResources(user.id)
      ]);

      setUserStats(stats);
      setRecentActivity(activity);
      setFavoriteSongs(favorites);
      setDownloadedResources(downloads);

      // Update user stats in database
      await updateUserStats(user.id, stats);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(loadUserData, 30000);
    return () => clearInterval(interval);
  }, [user]);


  const handleSaveProfile = async () => {
    if (user) {
      // Clear previous errors
      setValidationErrors({});
      
      // Validate form
      const errors: {[key: string]: string} = {};
      
      if (!editData.firstName.trim()) {
        errors.firstName = t('dashboard.firstNameRequired');
      }
      
      if (!editData.lastName.trim()) {
        errors.lastName = t('dashboard.lastNameRequired');
      }
      
      if (!editData.email.trim()) {
        errors.email = t('dashboard.emailRequired');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
        errors.email = t('dashboard.validEmailRequired');
      }
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      try {
        setIsUpdating(true);
        const success = await updateProfile({
          firstName: editData.firstName,
          lastName: editData.lastName,
          email: editData.email,
        });
        
        if (success) {
          setIsEditing(false);
          setValidationErrors({});
          // Trigger stats update after profile change
          await loadUserData();
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        setValidationErrors({ general: t('dashboard.failedToUpdateProfile') });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
    setIsEditing(false);
  };

  const handlePreferenceChange = async (key: string, value: any) => {
    if (user) {
      // TODO: Implement preference updates when backend is ready
      console.log('Preference change:', key, value);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('dashboard.welcomeBack').replace('{name}', user?.firstName || t('common.user'))}</h1>
            <p className="text-muted-foreground">
              {t('dashboard.welcomeDescription')}
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">{t('dashboard.overview')}</TabsTrigger>
              <TabsTrigger value="profile">{t('dashboard.profile')}</TabsTrigger>
              <TabsTrigger value="activity">{t('dashboard.activity')}</TabsTrigger>
              <TabsTrigger value="settings">{t('dashboard.settings')}</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Header with Refresh Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{t('dashboard.yourStatistics')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.realTimeUpdates')}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadUserData}
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  {isUpdating ? t('dashboard.updating') : t('dashboard.refreshData')}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="relative">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('song.favoriteSongs')}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      {isUpdating && <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold transition-all duration-300">
                      {userStats.favoriteSongs}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('song.songsYouveSaved')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('song.downloads')}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      {isUpdating && <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold transition-all duration-300">
                      {userStats.downloadedResources}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('song.resourcesDownloaded')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('song.ratingsGiven')}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      {isUpdating && <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold transition-all duration-300">
                      {userStats.ratingsGiven}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('song.songsYouveRated')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('song.memberSince')}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {isUpdating && <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      }) : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user?.joinDate ? Math.floor((Date.now() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24)) : 0} {t('song.daysAgo')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
                    <CardDescription>{t('dashboard.latestInteractions')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => {
                        const IconComponent = activity.icon === 'Heart' ? Heart : 
                                            activity.icon === 'Download' ? Download : Star;
                        const timeAgo = new Date(activity.timestamp).toLocaleDateString();
                        
                        return (
                          <div key={activity.id} className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <IconComponent className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {activity.description} • {timeAgo}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">{t('dashboard.noRecentActivity')}</p>
                        <p className="text-xs text-muted-foreground">{t('dashboard.startExploring')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard.quickActions')}</CardTitle>
                    <CardDescription>{t('dashboard.commonTasks')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/songs")}>
                      <Music className="mr-2 h-4 w-4" />
                      {t('dashboard.browseSongs')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/dashboard/favorites")}>
                      <Heart className="mr-2 h-4 w-4" />
                      {t('dashboard.myFavorites')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/dashboard/downloads")}>
                      <Download className="mr-2 h-4 w-4" />
                      {t('dashboard.myDownloads')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/resources")}>
                      <Download className="mr-2 h-4 w-4" />
                      {t('dashboard.browseResources')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/request-song")}>
                      <Music className="mr-2 h-4 w-4" />
                      {t('dashboard.requestSong')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{t('dashboard.profileInformation')}</CardTitle>
                      <CardDescription>{t('dashboard.managePersonalInfo')}</CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('dashboard.editProfile')}
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleSaveProfile}
                          disabled={isUpdating}
                          className="flex items-center gap-2"
                        >
                          {isUpdating ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          {isUpdating ? t('dashboard.saving') : t('dashboard.saveChanges')}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                        >
                          <X className="mr-2 h-4 w-4" />
                          {t('dashboard.cancel')}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.avatar} alt={`${user?.firstName || ''} ${user?.lastName || ''}`} />
                      <AvatarFallback className="text-lg">
                        {(user?.firstName || 'U')[0]}{(user?.lastName || 'U')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{user?.firstName || ''} {user?.lastName || ''}</h3>
                      <p className="text-muted-foreground">{user?.email || ''}</p>
                      <Badge variant="secondary" className="mt-1">
                        {t('dashboard.memberSince')} {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {validationErrors.general && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{validationErrors.general}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('dashboard.firstName')}</Label>
                      <Input
                        id="firstName"
                        value={editData.firstName}
                        onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                        className={validationErrors.firstName ? 'border-red-500' : ''}
                      />
                      {validationErrors.firstName && (
                        <p className="text-sm text-red-600">{validationErrors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('dashboard.lastName')}</Label>
                      <Input
                        id="lastName"
                        value={editData.lastName}
                        onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                        className={validationErrors.lastName ? 'border-red-500' : ''}
                      />
                      {validationErrors.lastName && (
                        <p className="text-sm text-red-600">{validationErrors.lastName}</p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">{t('dashboard.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className={validationErrors.email ? 'border-red-500' : ''}
                      />
                      {validationErrors.email && (
                        <p className="text-sm text-red-600">{validationErrors.email}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{t('dashboard.activityHistory')}</CardTitle>
                      <CardDescription>{t('dashboard.trackEngagement')}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadUserData} disabled={isUpdating}>
                      <Clock className="h-4 w-4 mr-2" />
                      {isUpdating ? t('dashboard.updating') : t('dashboard.refresh')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => {
                        const IconComponent = activity.icon === 'Heart' ? Heart : 
                                            activity.icon === 'Download' ? Download : Star;
                        const timeAgo = new Date(activity.timestamp).toLocaleDateString();
                        
                        return (
                          <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <IconComponent className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{activity.title}</p>
                                <p className="text-sm text-muted-foreground">{activity.description}</p>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">{timeAgo}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t('dashboard.noActivityYet')}</h3>
                        <p className="text-muted-foreground mb-4">
                          {t('dashboard.startExploring')}
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button onClick={() => router.push("/songs")}>
                            {t('dashboard.browseSongs')}
                          </Button>
                          <Button variant="outline" onClick={() => router.push("/resources")}>
                            {t('dashboard.viewResources')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.preferences')}</CardTitle>
                  <CardDescription>{t('dashboard.customizeExperience')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('dashboard.language')}</Label>
                        <p className="text-sm text-muted-foreground">{t('dashboard.chooseLanguage')}</p>
                      </div>
                      <select 
                        value={user?.preferences?.language || 'en'}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        className="px-3 py-2 border rounded-md"
                      >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('dashboard.theme')}</Label>
                        <p className="text-sm text-muted-foreground">{t('dashboard.chooseTheme')}</p>
                      </div>
                      <select 
                        value={user?.preferences?.theme || 'system'}
                        onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                        className="px-3 py-2 border rounded-md"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('dashboard.notifications')}</Label>
                        <p className="text-sm text-muted-foreground">{t('dashboard.receiveEmailNotifications')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={user?.preferences?.notifications || false}
                        onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.accountActions')}</CardTitle>
                  <CardDescription>{t('dashboard.manageAccountSettings')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('dashboard.changePassword')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      {t('dashboard.exportData')}
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('dashboard.signOut')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
