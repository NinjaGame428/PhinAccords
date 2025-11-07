"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  Clock,
  Search,
  Filter,
  File,
  Image,
  Video,
  Music
} from "lucide-react";
import { fetchDownloadedResources, type DownloadedResource } from "@/lib/user-stats";

export default function DownloadsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [downloadedResources, setDownloadedResources] = useState<DownloadedResource[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    if (user) {
      loadDownloadedResources();
    }
  }, [user]);

  const loadDownloadedResources = async () => {
    if (!user) return;
    
    try {
      setIsLoadingData(true);
      const downloads = await fetchDownloadedResources(user.id);
      setDownloadedResources(downloads);
    } catch (error) {
      console.error('Error loading downloaded resources:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const filteredResources = downloadedResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || resource.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
      case 'document':
        return FileText;
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      default:
        return File;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('dashboard.yourDownloads')}</h1>
            <p className="text-muted-foreground">
              {t('dashboard.resourcesForOffline')}
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder={t('dashboard.searchDownloads')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">{t('dashboard.allTypes')}</option>
              <option value="pdf">PDF</option>
              <option value="document">{t('common.document') || 'Document'}</option>
              <option value="image">{t('common.image') || 'Image'}</option>
              <option value="video">{t('common.video') || 'Video'}</option>
              <option value="audio">{t('common.audio') || 'Audio'}</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{downloadedResources.length}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.totalDownloads')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {downloadedResources.filter(r => r.type.toLowerCase() === 'pdf').length}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.pdfs')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <File className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {new Set(downloadedResources.map(r => r.category)).size}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.categories')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {downloadedResources.filter(resource => {
                        const resourceDate = new Date(resource.created_at);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return resourceDate > weekAgo;
                      }).length}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.thisWeek')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resources List */}
          {isLoadingData ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">{t('dashboard.loadingDownloads')}</p>
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => {
                const FileIcon = getFileIcon(resource.type);
                
                return (
                  <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                            <CardDescription className="mt-1">{resource.category}</CardDescription>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{resource.type.toUpperCase()}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatFileSize(resource.file_size || 0)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t('dashboard.downloaded')} {new Date(resource.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" className="flex-1">
                            {t('dashboard.open')}
                          </Button>
                          <Button size="sm" variant="outline">
                            {t('dashboard.share')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('dashboard.noDownloadsYet')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.startExploringResources')}
                </p>
                <Button onClick={() => router.push("/resources")}>
                  {t('dashboard.browseResources')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}