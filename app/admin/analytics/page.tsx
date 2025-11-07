'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp,
  Users,
  Music,
  Eye,
  Download,
  Star,
  Activity,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';

interface AnalyticsData {
  overview: {
    totalSongs: number;
    totalArtists: number;
    totalUsers: number;
    totalResources: number;
    activeUsers: number;
    youtubeVideos: number;
    collections: number;
  };
  userGrowth: {
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    userGrowthRate: number;
  };
  engagement: {
    averageSessionsPerUser: number;
    totalPageViews: number;
    averageSessionDuration: number;
    bounceRate: number;
  };
  content: {
    mostPopularSongs: Array<{ title: string; artist: string; views: number }>;
    mostPopularArtists: Array<{ name: string; songCount: number }>;
    totalDownloads: number;
    averageRating: number;
  };
}

const AnalyticsPage = () => {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Don't use mock data - set to null to show error state
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <main className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <main className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Failed to load analytics</h2>
            <p className="text-muted-foreground mb-4">Please try again later</p>
            <Button onClick={fetchAnalytics}>Retry</Button>
          </div>
        </main>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{t('admin.analytics.title')}</h1>
                <p className="text-muted-foreground">
                  {t('admin.analytics.subtitle')}
                </p>
              </div>
              <Button variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                {t('admin.analytics.exportReport')}
              </Button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Music className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{analytics.overview.totalSongs}</p>
                    <p className="text-sm text-muted-foreground">{t('admin.analytics.totalSongs')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{analytics.overview.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">{t('admin.analytics.totalUsers')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Eye className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{analytics.engagement.totalPageViews}</p>
                    <p className="text-sm text-muted-foreground">{t('admin.analytics.pageViews')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Download className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{analytics.content.totalDownloads}</p>
                    <p className="text-sm text-muted-foreground">{t('admin.analytics.downloads')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  {t('admin.analytics.userGrowth')}
                </CardTitle>
                <CardDescription>
                  {t('admin.analytics.userAcquisitionGrowth')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>{t('admin.analytics.newUsersToday')}</span>
                    <span className="font-medium">{analytics.userGrowth.newUsersToday}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('admin.analytics.newUsersThisWeek')}</span>
                    <span className="font-medium">{analytics.userGrowth.newUsersThisWeek}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('admin.analytics.newUsersThisMonth')}</span>
                    <span className="font-medium">{analytics.userGrowth.newUsersThisMonth}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('admin.analytics.growthRate')}</span>
                    <Badge variant={analytics.userGrowth.userGrowthRate > 0 ? "default" : "secondary"}>
                      {analytics.userGrowth.userGrowthRate > 0 ? '+' : ''}{analytics.userGrowth.userGrowthRate}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  {t('admin.analytics.userEngagement')}
                </CardTitle>
                <CardDescription>
                  {t('admin.analytics.howUsersInteract')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>{t('admin.analytics.avgSessionsPerUser')}</span>
                    <span className="font-medium">{analytics.engagement.averageSessionsPerUser}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('admin.analytics.avgSessionDuration')}</span>
                    <span className="font-medium">{analytics.engagement.averageSessionDuration}m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('admin.analytics.bounceRate')}</span>
                    <span className="font-medium">{analytics.engagement.bounceRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('admin.analytics.activeUsers')}</span>
                    <span className="font-medium">{analytics.overview.activeUsers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Songs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Music className="h-5 w-5 mr-2" />
                  {t('admin.analytics.mostPopularSongs')}
                </CardTitle>
                <CardDescription>
                  {t('admin.analytics.topPerformingSongs')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.content.mostPopularSongs.map((song, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-muted-foreground">{t('admin.analytics.by')} {song.artist}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{song.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Artists */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  {t('admin.analytics.mostPopularArtists')}
                </CardTitle>
                <CardDescription>
                  {t('admin.analytics.artistsWithMostSongs')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.content.mostPopularArtists.map((artist, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{artist.name}</p>
                        <p className="text-sm text-muted-foreground">{t('admin.analytics.artist')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{artist.songCount} {t('admin.analytics.songs')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AnalyticsPage;
