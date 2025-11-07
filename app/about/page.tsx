"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Heart, Users, Award, Globe } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslatedRoute } from "@/lib/url-translations";

const AboutPage = () => {
  const { t, language } = useLanguage();

  const values = [
    {
      icon: <Music className="h-8 w-8" />,
      title: t('about.musicalExcellence'),
      description: t('about.musicalExcellenceDesc')
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: t('about.passionateMinistry'),
      description: t('about.passionateMinistryDesc')
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t('about.communitySupport'),
      description: t('about.communitySupportDesc')
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: t('about.qualityResources'),
      description: t('about.qualityResourcesDesc')
    }
  ];

  return (
    <>
      <Navbar />
      <main className="pt-16 xs:pt-20 sm:pt-24 min-h-screen">
        {/* Hero Section */}
        <section className="pt-20 pb-12 px-6 bg-gradient-to-br from-background to-muted/20">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl xs:text-5xl sm:text-6xl font-bold tracking-tight mb-6">
              {t('about.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
              {t('about.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="rounded-full" asChild>
                <Link href={getTranslatedRoute('/songs', language)}>
                  <Music className="mr-2 h-5 w-5" />
                  {t('about.exploreSongs')}
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full" asChild>
                <Link href={getTranslatedRoute('/contact', language)}>
                  <Users className="mr-2 h-5 w-5" />
                  {t('about.joinCommunity')}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="pt-12 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl xs:text-4xl font-bold tracking-tight mb-6">
                {t('about.missionTitle')}
              </h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-4xl mx-auto">
                {t('about.missionText1')}
              </p>
              <p className="text-lg text-muted-foreground mb-8 max-w-4xl mx-auto">
                {t('about.missionText2')}
              </p>
            </div>

            {/* Two Convictions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-4">{t('about.missionDistinctionTitle')}</h3>
                <p className="text-muted-foreground mb-6">{t('about.missionDistinctionText')}</p>
                
                {/* Bible Verses for Distinction */}
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-medium mb-2">{t('about.verse1')}</p>
                    <p className="text-sm text-muted-foreground">{t('about.verse1Ref')}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-medium mb-2">{t('about.verse3')}</p>
                    <p className="text-sm text-muted-foreground">{t('about.verse3Ref')}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-medium mb-2">{t('about.verse5')}</p>
                    <p className="text-sm text-muted-foreground">{t('about.verse5Ref')}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-6 italic">{t('about.versesConclusion')}</p>
              </Card>

              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-4">{t('about.missionEfficiencyTitle')}</h3>
                <p className="text-muted-foreground mb-6">{t('about.missionEfficiencyText')}</p>
                
                {/* Bible Verses for Service */}
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-medium mb-2">{t('about.verse2')}</p>
                    <p className="text-sm text-muted-foreground">{t('about.verse2Ref')}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-medium mb-2">{t('about.verse4')}</p>
                    <p className="text-sm text-muted-foreground">{t('about.verse4Ref')}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-medium mb-2">{t('about.verse6')}</p>
                    <p className="text-sm text-muted-foreground">{t('about.verse6Ref')}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Resources Section */}
            <Card className="p-6 mb-8">
              <p className="text-lg text-muted-foreground">
                {t('about.missionResources')}
              </p>
            </Card>

            {/* Conclusion */}
            <div className="text-center mb-8">
              <p className="text-lg text-muted-foreground mb-8 max-w-4xl mx-auto">
                {t('about.missionConclusion')}
              </p>
              <Button size="lg" className="rounded-full" asChild>
                <Link href={getTranslatedRoute('/register', language)}>
                  {t('about.getStarted')}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="pt-12 pb-12 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl xs:text-4xl font-bold tracking-tight mb-4">
                {t('about.valuesTitle')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('about.valuesSubtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AboutPage;
