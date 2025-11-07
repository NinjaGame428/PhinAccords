'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Search, Music } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import Footer from '@/components/footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedRoute } from '@/lib/url-translations';

export default function NotFound() {
  const { t, language } = useLanguage();
  
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <Music className="h-16 w-16 text-primary" />
              </div>
              <CardTitle className="text-4xl font-bold">{t('notFound.title')}</CardTitle>
              <CardDescription className="text-xl">
                {t('notFound.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                {t('notFound.message')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href={getTranslatedRoute('/', language)}>
                    <Home className="h-4 w-4 mr-2" />
                    {t('notFound.goHome')}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={getTranslatedRoute('/songs', language)}>
                    <Search className="h-4 w-4 mr-2" />
                    {t('notFound.browseSongs')}
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('notFound.goBack')}
                </Button>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-3">{t('notFound.popularPages')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Link href={getTranslatedRoute('/songs', language)} className="text-sm text-muted-foreground hover:text-primary">
                    {t('notFound.songs')}
                  </Link>
                  <Link href={getTranslatedRoute('/piano-chords', language)} className="text-sm text-muted-foreground hover:text-primary">
                    {t('notFound.pianoChords')}
                  </Link>
                  <Link href={getTranslatedRoute('/artists', language)} className="text-sm text-muted-foreground hover:text-primary">
                    {t('notFound.artists')}
                  </Link>
                  <Link href={getTranslatedRoute('/resources', language)} className="text-sm text-muted-foreground hover:text-primary">
                    {t('notFound.resources')}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
