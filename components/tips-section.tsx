"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lightbulb, Users, Music } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TipsSection = () => {
  const { t } = useLanguage();
  const tips = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: t('tips.readingCharts'),
      description: t('tips.readingChartsDesc'),
      category: t('tips.category.beginner')
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: t('tips.transposeSongs'),
      description: t('tips.transposeSongsDesc'),
      category: t('tips.category.intermediate')
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: t('tips.leadingWorship'),
      description: t('tips.leadingWorshipDesc'),
      category: t('tips.category.advanced')
    },
    {
      icon: <Music className="h-6 w-6" />,
      title: t('tips.chordProgressions'),
      description: t('tips.chordProgressionsDesc'),
      category: t('tips.category.intermediate')
    }
  ];

  const getCategoryColor = (category: string) => {
    if (category === t('tips.category.beginner')) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    }
    if (category === t('tips.category.intermediate')) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
    if (category === t('tips.category.advanced')) {
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  return (
    <section id="tips" className="pt-20 pb-16 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl xs:text-4xl font-bold tracking-tight">
            {t('tips.title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('tips.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tips.map((tip, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {tip.icon}
                  </div>
                  <Badge className={getCategoryColor(tip.category)}>
                    {tip.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {tip.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            {t('tips.moreResources')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default TipsSection;
