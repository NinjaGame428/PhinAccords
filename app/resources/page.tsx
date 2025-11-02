"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Music, Video, Download, Users, Guitar, Piano, Mic, Headphones, FileText, Award, Clock, Star, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import EnhancedSearch from "@/components/enhanced-search";
import ResourceRating from "@/components/resource-rating";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslatedRoute } from "@/lib/url-translations";

const ResourcesPage = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Resources");
  const [displayedResources, setDisplayedResources] = useState(12);
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch resources from API
  useEffect(() => {
    const fetchResources = async () => {
      console.log('🔄 Fetching resources from API...');
      setIsLoading(true);

      try {
        const response = await fetch('/api/resources?limit=1000');
        if (!response.ok) {
          throw new Error('Failed to fetch resources');
        }
        const data = await response.json();
        console.log('✅ Fetched resources:', data.resources?.length || 0);
        setResources(data.resources || []);
      } catch (error) {
        console.error('❌ Error fetching resources:', error);
        setResources([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Helper function to get icon based on category
  const getIconForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case 'theory':
      case 'chords':
        return <BookOpen className="h-6 w-6" />;
      case 'scales':
      case 'practice':
        return <Music className="h-6 w-6" />;
      case 'training':
      case 'course':
        return <Video className="h-6 w-6" />;
      case 'guitar':
        return <Guitar className="h-6 w-6" />;
      case 'piano':
        return <Piano className="h-6 w-6" />;
      case 'vocals':
        return <Mic className="h-6 w-6" />;
      case 'team':
        return <Users className="h-6 w-6" />;
      case 'tech':
        return <Headphones className="h-6 w-6" />;
      case 'resources':
        return <FileText className="h-6 w-6" />;
      case 'history':
        return <Award className="h-6 w-6" />;
      default:
        return <BookOpen className="h-6 w-6" />;
    }
  };


  const categories = [
    { name: "All Resources", count: resources.length },
    { name: "Theory", count: resources.filter(r => r.category === "Theory").length },
    { name: "Scales", count: resources.filter(r => r.category === "Scales").length },
    { name: "Chords", count: resources.filter(r => r.category === "Chords").length },
    { name: "Training", count: resources.filter(r => r.category === "Training").length },
    { name: "Templates", count: resources.filter(r => r.category === "Templates").length },
    { name: "Practice", count: resources.filter(r => r.category === "Practice").length },
    { name: "Leadership", count: resources.filter(r => r.category === "Leadership").length },
    { name: "Technical", count: resources.filter(r => r.category === "Technical").length },
    { name: "Legal", count: resources.filter(r => r.category === "Legal").length },
    { name: "Certification", count: resources.filter(r => r.category === "Certification").length },
    { name: "Maintenance", count: resources.filter(r => r.category === "Maintenance").length },
    { name: "Health", count: resources.filter(r => r.category === "Health").length },
    { name: "Finance", count: resources.filter(r => r.category === "Finance").length },
    { name: "Performance", count: resources.filter(r => r.category === "Performance").length },
    { name: "Administration", count: resources.filter(r => r.category === "Administration").length }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Theory":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Scales":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      case "Chords":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300";
      case "Training":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Templates":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Practice":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Leadership":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300";
      case "Technical":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "Legal":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Certification":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Maintenance":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300";
      case "Health":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      case "Finance":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "Performance":
        return "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300";
      case "Administration":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All Resources" || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const visibleResources = filteredResources.slice(0, displayedResources);
  const hasMoreResources = displayedResources < filteredResources.length;

  const handleLoadMore = () => {
    setDisplayedResources(prev => Math.min(prev + 12, filteredResources.length));
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 xs:pt-20 sm:pt-24 min-h-screen">
        <section className="py-20 px-6 max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              {t('resources.title')}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('resources.subtitle')}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar for Categories */}
            <aside className="w-full md:w-1/4">
              <Card className="p-6">
                <CardTitle className="mb-4 text-2xl">{t('resources.categories')}</CardTitle>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category.name}
                      variant={activeCategory === category.name ? "default" : "ghost"}
                      className="w-full justify-between"
                      onClick={() => {
                        setActiveCategory(category.name);
                        setDisplayedResources(12);
                      }}
                    >
                      {category.name}
                      <Badge variant="secondary">{category.count}</Badge>
                    </Button>
                  ))}
                </div>
              </Card>
            </aside>

            {/* Main Content for Resources */}
            <div className="w-full md:w-3/4">
              <div className="mb-8">
                <EnhancedSearch
                  placeholder={t('resources.searchPlaceholder')}
                  onSearch={(query) => {
                    setSearchQuery(query);
                    setDisplayedResources(12);
                  }}
                  onResultSelect={(result) => {
                    // Handle resource selection
                    console.log("Selected resource:", result);
                  }}
                  showFilters={true}
                  showSort={true}
                />
              </div>

              {isLoading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">{t('resources.loading')}</p>
                </div>
              ) : visibleResources.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  {t('resources.noResources')}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {visibleResources.map((resource, index) => (
                      <Card key={index} className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex-row items-center gap-4 pb-2">
                          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                            {resource.icon}
                          </div>
                          <div>
                            <CardTitle className="text-xl font-semibold">{resource.title}</CardTitle>
                            <Badge className={`mt-1 ${getCategoryColor(resource.category)}`}>
                              {resource.category}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <p className="text-muted-foreground text-sm mb-4">{resource.description}</p>
                          
                          {/* Rating Display */}
                          {resource.rating && (
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= Math.floor(resource.rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{resource.rating}</span>
                              <span className="text-xs text-muted-foreground">
                                ({resource.totalRatings} reviews)
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Type: {resource.type}</span>
                            <span>Size: {resource.size}</span>
                            <span>Downloads: {resource.downloads}</span>
                          </div>
                        </CardContent>
                        <div className="p-6 pt-0 flex justify-end gap-3">
                          <Button variant="outline" className="rounded-full" asChild>
                            <Link href={getTranslatedRoute(`/resources/${resource.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, language)}>
                              <BookOpen className="mr-2 h-4 w-4" /> View
                            </Link>
                          </Button>
                          <Button className="rounded-full">
                            <Download className="mr-2 h-4 w-4" /> Download
                          </Button>
                        </div>
                        
                        {/* Resource Rating Component */}
                        <ResourceRating
                          resourceId={resource.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                          resourceTitle={resource.title}
                          resourceType={resource.type}
                        />
                      </Card>
                    ))}
                  </div>

                  {hasMoreResources && (
                    <div className="text-center mt-12">
                      <Button 
                        size="lg" 
                        className="rounded-full"
                        onClick={handleLoadMore}
                      >
                        {t('resources.loadMore')} ({filteredResources.length - displayedResources} {t('resources.remaining')})
                        <ExternalLink className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Featured Collections */}
        <section className="py-20 px-6 bg-secondary/20 dark:bg-secondary/10">
          <div className="max-w-screen-xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
              {t('resources.featuredCollections')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 text-center">
                <CardTitle className="mb-4">{t('resources.beginnersBundle')}</CardTitle>
                <CardContent className="text-muted-foreground">
                  {t('resources.beginnersBundleDesc')}
                </CardContent>
                <Button className="mt-4 rounded-full">{t('resources.viewCollection')}</Button>
              </Card>
              <Card className="p-6 text-center">
                <CardTitle className="mb-4">{t('resources.worshipLeaderPack')}</CardTitle>
                <CardContent className="text-muted-foreground">
                  {t('resources.worshipLeaderPackDesc')}
                </CardContent>
                <Button className="mt-4 rounded-full">{t('resources.viewCollection')}</Button>
              </Card>
              <Card className="p-6 text-center">
                <CardTitle className="mb-4">{t('resources.musiciansToolkit')}</CardTitle>
                <CardContent className="text-muted-foreground">
                  {t('resources.musiciansToolkitDesc')}
                </CardContent>
                <Button className="mt-4 rounded-full">{t('resources.viewCollection')}</Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-20 px-6">
          <div className="max-w-screen-xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {t('resources.joinCommunity')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('resources.joinCommunityDesc')}
            </p>
            <Button size="lg" className="rounded-full">
              {t('resources.joinForum')}
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ResourcesPage;
