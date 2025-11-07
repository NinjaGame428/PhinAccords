"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock,
  Heart,
  Download,
  Star,
  Music,
  FileText,
  BarChart3
} from "lucide-react";
import { fetchRecentActivity, type RecentActivity } from "@/lib/user-stats";

export default function ActivityPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (user) {
      loadRecentActivity();
    }
  }, [user]);

  const loadRecentActivity = async () => {
    if (!user) return;
    
    try {
      setIsLoadingData(true);
      const activity = await fetchRecentActivity(user.id);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const getActivityIcon = (icon: string) => {
    switch (icon) {
      case 'Heart':
        return Heart;
      case 'Download':
        return Download;
      case 'Star':
        return Star;
      default:
        return Clock;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('dashboard.justNow');
    if (diffInMinutes < 60) return `${diffInMinutes}m ${t('common.ago') || 'ago'}`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ${t('common.ago') || 'ago'}`;
    return `${Math.floor(diffInMinutes / 1440)}d ${t('common.ago') || 'ago'}`;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('dashboard.yourActivity')}</h1>
            <p className="text-muted-foreground">
              {t('dashboard.trackEngagementWithFinder')}
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{recentActivity.length}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.totalActivities')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {recentActivity.filter(a => a.icon === 'Heart').length}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('common.favorites')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {recentActivity.filter(a => a.icon === 'Download').length}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.downloads')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {recentActivity.filter(a => a.icon === 'Star').length}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.ratings')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('dashboard.activityTimeline')}</CardTitle>
                  <CardDescription>{t('dashboard.yourRecentInteractions')}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadRecentActivity} disabled={isLoadingData}>
                  <Clock className="h-4 w-4 mr-2" />
                  {isLoadingData ? t('dashboard.loading') : t('dashboard.refresh')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">{t('dashboard.loadingActivity')}</p>
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const IconComponent = getActivityIcon(activity.icon);
                    
                    return (
                      <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {formatTimeAgo(activity.timestamp)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
