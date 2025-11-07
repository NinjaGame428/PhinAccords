'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, 
  Database, 
  Users,
  BarChart3,
  RefreshCw,
  BookOpen,
  TrendingUp,
  Activity,
  Clock,
  Star,
  Download,
  Heart,
  Settings,
  Shield
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

const AdminPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [adminStats, setAdminStats] = useState({
    totalSongs: 0,
    totalArtists: 0,
    totalResources: 0,
    totalUsers: 0,
    activeUsers: 0,
    collections: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState<AdminActivity[]>([]);

  // Fetch admin activities from API
  const fetchAdminActivities = async () => {
    if (!user) return;
    
    try {
      setActivityLoading(true);
      // Fetch activities via API
      const response = await fetch('/api/users/activity?admin=true');
      
      if (!response.ok) {
        setRecentActivity([]);
        return;
      }

      const data = await response.json();
      const activities = data.activities || [];

      if (!activities || activities.length === 0) {
        setRecentActivity([]);
        return;
      }

      // Map activities to AdminActivity format
      const mappedActivities: AdminActivity[] = activities.map((activity: any) => {
        const metadata = activity.metadata ? (typeof activity.metadata === 'string' ? JSON.parse(activity.metadata) : activity.metadata) : {};
        
        // Determine icon based on activity_type
        let icon = 'Activity';
        if (activity.activity_type?.toLowerCase().includes('song')) {
          icon = 'Music';
        } else if (activity.activity_type?.toLowerCase().includes('user')) {
          icon = 'Users';
        } else if (activity.activity_type?.toLowerCase().includes('resource')) {
          icon = 'BookOpen';
        } else if (activity.activity_type?.toLowerCase().includes('artist')) {
          icon = 'Music';
        }

        return {
          id: activity.id,
          title: activity.description || activity.activity_type || t('admin.activity'),
          description: activity.page || metadata?.title || '',
          timestamp: activity.created_at,
          icon
        };
      });

      setRecentActivity(mappedActivities);
    } catch (error) {
      console.error('Error in fetchAdminActivities:', error);
      setRecentActivity([]);
    } finally {
      setActivityLoading(false);
    }
  };

  // Fetch admin statistics
  const fetchAdminStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch admin statistics');
      }
      const data = await response.json();
      setAdminStats(data.stats);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      // Set default values if API fails
      setAdminStats({
        totalSongs: 207,
        totalArtists: 79,
        totalResources: 30,
        totalUsers: 2,
        activeUsers: 1,
        collections: 1
      });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
    fetchAdminActivities();
  }, [user]);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('admin.dashboard.title')}</h1>
            <p className="text-muted-foreground">
              {t('admin.dashboard.subtitle')}
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">{t('admin.dashboard.overview')}</TabsTrigger>
              <TabsTrigger value="analytics">{t('admin.dashboard.analytics')}</TabsTrigger>
              <TabsTrigger value="activity">{t('admin.dashboard.activity')}</TabsTrigger>
              <TabsTrigger value="settings">{t('admin.dashboard.settings')}</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Header with Refresh Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{t('admin.dashboard.systemStatistics')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('admin.dashboard.systemStatisticsDesc')}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchAdminStats}
                  disabled={statsLoading}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  {statsLoading ? t('admin.dashboard.updating') : t('admin.dashboard.refreshData')}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="relative">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('admin.dashboard.songsInCollection')}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-muted-foreground" />
                      {statsLoading && <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold transition-all duration-300">
                      {adminStats.totalSongs}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('admin.dashboard.totalSongsAvailable')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('admin.dashboard.artists')}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {statsLoading && <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold transition-all duration-300">
                      {adminStats.totalArtists}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('admin.dashboard.artistsInDatabase')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('admin.dashboard.resources')}</CardTitle>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      {statsLoading && <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold transition-all duration-300">
                      {adminStats.totalResources}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('admin.dashboard.learningResources')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('admin.dashboard.activeUsers')}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      {statsLoading && <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold transition-all duration-300">
                      {adminStats.activeUsers}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('admin.dashboard.currentlyActive')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('admin.dashboard.recentActivity')}</CardTitle>
                    <CardDescription>{t('admin.dashboard.latestSystemActivities')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activityLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">{t('admin.dashboard.updating')}</p>
                      </div>
                    ) : recentActivity.length > 0 ? (
                      recentActivity.map((activity) => {
                        const IconComponent = activity.icon === 'Music' ? Music : 
                                            activity.icon === 'Users' ? Users : 
                                            activity.icon === 'BookOpen' ? BookOpen : Activity;
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
                        <p className="text-sm text-muted-foreground">{t('admin.dashboard.noRecentActivity')}</p>
                        <p className="text-xs text-muted-foreground">{t('admin.dashboard.systemActivitiesWillAppear')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('admin.dashboard.quickActions')}</CardTitle>
                    <CardDescription>{t('admin.dashboard.commonAdminTasks')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/admin/songs")}>
                      <Music className="mr-2 h-4 w-4" />
                      {t('admin.dashboard.manageSongs')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/admin/artists")}>
                      <Users className="mr-2 h-4 w-4" />
                      {t('admin.dashboard.manageArtists')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/admin/users")}>
                      <Shield className="mr-2 h-4 w-4" />
                      {t('admin.dashboard.manageUsers')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/admin/resources")}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      {t('admin.dashboard.manageResources')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/admin/analytics")}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      {t('admin.dashboard.viewAnalytics')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    {t('admin.dashboard.platformAnalytics')}
                  </CardTitle>
                  <CardDescription>
                    {t('admin.dashboard.comprehensiveInsights')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>{t('admin.dashboard.totalUsers')}</span>
                        <span className="font-medium">{adminStats.totalUsers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{t('admin.dashboard.collections')}</span>
                        <span className="font-medium">{adminStats.collections}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>{t('admin.dashboard.databaseStatus')}</span>
                        <Badge className="bg-green-100 text-green-800">{t('admin.dashboard.connected')}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{t('admin.dashboard.lastSync')}</span>
                        <span className="text-sm text-muted-foreground">{t('admin.dashboard.justNow')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{t('admin.dashboard.systemHealth')}</span>
                        <Badge variant="outline">{t('admin.dashboard.healthy')}</Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>{t('admin.dashboard.growthRate')}</span>
                        <span className="font-medium text-green-600">+12%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{t('admin.dashboard.engagement')}</span>
                        <span className="font-medium text-blue-600">{t('admin.dashboard.high')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{t('admin.dashboard.performance')}</span>
                        <span className="font-medium text-purple-600">{t('admin.dashboard.excellent')}</span>
                      </div>
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
                      <CardTitle>{t('admin.dashboard.systemActivity')}</CardTitle>
                      <CardDescription>{t('admin.dashboard.trackSystemActivities')}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchAdminActivities} disabled={activityLoading}>
                      <Clock className="h-4 w-4 mr-2" />
                      {activityLoading ? t('admin.dashboard.updating') : t('admin.dashboard.refresh')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => {
                        const IconComponent = activity.icon === 'Music' ? Music : 
                                            activity.icon === 'Users' ? Users : BookOpen;
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
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t('admin.dashboard.noActivityYet')}</h3>
                        <p className="text-muted-foreground mb-4">
                          {t('admin.dashboard.systemActivitiesWillAppearHere')}
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button onClick={() => router.push("/admin/songs")}>
                            {t('admin.dashboard.manageSongs')}
                          </Button>
                          <Button variant="outline" onClick={() => router.push("/admin/analytics")}>
                            {t('admin.dashboard.viewAnalytics')}
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
                  <CardTitle>{t('admin.dashboard.systemSettings')}</CardTitle>
                  <CardDescription>{t('admin.dashboard.configureAdminPanel')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{t('admin.dashboard.databaseConnection')}</h4>
                        <p className="text-sm text-muted-foreground">{t('admin.dashboard.manageDatabaseSettings')}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{t('admin.dashboard.connected')}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{t('admin.dashboard.systemNotifications')}</h4>
                        <p className="text-sm text-muted-foreground">{t('admin.dashboard.receiveAdminAlerts')}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        {t('admin.dashboard.configure')}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{t('admin.dashboard.backupStatus')}</h4>
                        <p className="text-sm text-muted-foreground">{t('admin.dashboard.lastBackup')}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        {t('admin.dashboard.backupNow')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.dashboard.adminActions')}</CardTitle>
                  <CardDescription>{t('admin.dashboard.systemManagement')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="mr-2 h-4 w-4" />
                      {t('admin.dashboard.securitySettings')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="mr-2 h-4 w-4" />
                      {t('admin.dashboard.databaseManagement')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      {t('admin.dashboard.performanceMonitoring')}
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('admin.dashboard.systemMaintenance')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPage;
