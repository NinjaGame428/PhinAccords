'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  FileText,
  Video,
  Image,
  Link
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';

interface Resource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'image' | 'link';
  description?: string;
  url?: string;
  created_at?: string;
  updated_at?: string;
  downloads?: number;
}

const ResourcesPage = () => {
  const { t } = useLanguage();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Fetch resources
  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/resources');
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      const data = await response.json();
      setResources(data.resources || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
      // Don't use mock data - set empty array to show no data state
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Filter resources based on search and type
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesType;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      case 'link': return <Link className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'document': return 'text-blue-600';
      case 'video': return 'text-red-600';
      case 'image': return 'text-green-600';
      case 'link': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const types = ['all', 'document', 'video', 'image', 'link'];

  return (
    <AdminLayout>
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{t('admin.resources.title')}</h1>
                <p className="text-muted-foreground">
                  {t('admin.resources.subtitle')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  {t('admin.resources.import')}
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin.resources.addResource')}
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Resources Grid */}
          <div className="grid gap-4 mb-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredResources.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t('admin.resources.noResources')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterType !== 'all' 
                      ? t('resources.noResources')
                      : t('admin.resources.addFirstResource')
                    }
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.resources.addFirst')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={getResourceColor(resource.type)}>
                            {getResourceIcon(resource.type)}
                          </div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Badge variant="secondary">{resource.type}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {resource.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {resource.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Downloads</span>
                          <span className="font-medium">{resource.downloads || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Added</span>
                          <span className="font-medium">
                            {new Date(resource.created_at || '').toLocaleDateString()}
                          </span>
                        </div>
                        {resource.url && (
                          <Button variant="outline" size="sm" className="w-full">
                            <Link className="h-4 w-4 mr-2" />
                            View Resource
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{resources.length}</p>
                    <p className="text-sm text-muted-foreground">Total Resources</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Download className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {resources.reduce((sum, resource) => sum + (resource.downloads || 0), 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Downloads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {resources.filter(r => r.type === 'document').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Documents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Video className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {resources.filter(r => r.type === 'video').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Videos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default ResourcesPage;
