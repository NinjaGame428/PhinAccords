'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  Music, 
  Guitar, 
  Piano, 
  BookOpen, 
  Star, 
  TrendingUp,
  Users,
  Clock,
  Target
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import Footer from '@/components/footer';

const TipsPage = () => {
  const [activeTab, setActiveTab] = useState('beginner');

  const tips = {
    beginner: [
      {
        title: "Start with Basic Chords",
        description: "Learn the fundamental chords (C, G, D, A, E, F) before moving to complex progressions.",
        icon: <Guitar className="h-6 w-6" />,
        difficulty: "Beginner",
        time: "5-10 minutes",
        category: "Fundamentals"
      },
      {
        title: "Practice Daily",
        description: "Even 15 minutes of daily practice is better than 2 hours once a week.",
        icon: <Clock className="h-6 w-6" />,
        difficulty: "Beginner",
        time: "15 minutes",
        category: "Practice"
      },
      {
        title: "Use a Metronome",
        description: "Start slow and gradually increase tempo. This builds muscle memory and timing.",
        icon: <Target className="h-6 w-6" />,
        difficulty: "Beginner",
        time: "10-15 minutes",
        category: "Technique"
      },
      {
        title: "Learn Chord Transitions",
        description: "Practice moving between chords smoothly. Focus on common progressions like C-G-Am-F.",
        icon: <TrendingUp className="h-6 w-6" />,
        difficulty: "Beginner",
        time: "20 minutes",
        category: "Progression"
      }
    ],
    intermediate: [
      {
        title: "Master Barre Chords",
        description: "Barre chords open up the entire fretboard and are essential for advanced playing.",
        icon: <Guitar className="h-6 w-6" />,
        difficulty: "Intermediate",
        time: "30-45 minutes",
        category: "Technique"
      },
      {
        title: "Learn Music Theory",
        description: "Understanding scales, modes, and chord construction will accelerate your learning.",
        icon: <BookOpen className="h-6 w-6" />,
        difficulty: "Intermediate",
        time: "45-60 minutes",
        category: "Theory"
      },
      {
        title: "Practice Fingerpicking",
        description: "Develop fingerpicking patterns to add texture and complexity to your playing.",
        icon: <Piano className="h-6 w-6" />,
        difficulty: "Intermediate",
        time: "30 minutes",
        category: "Technique"
      },
      {
        title: "Learn Different Genres",
        description: "Explore various musical styles to expand your vocabulary and techniques.",
        icon: <Music className="h-6 w-6" />,
        difficulty: "Intermediate",
        time: "60+ minutes",
        category: "Style"
      }
    ],
    advanced: [
      {
        title: "Master Complex Progressions",
        description: "Learn jazz progressions, modal interchange, and advanced harmonic concepts.",
        icon: <TrendingUp className="h-6 w-6" />,
        difficulty: "Advanced",
        time: "60+ minutes",
        category: "Harmony"
      },
      {
        title: "Develop Your Own Style",
        description: "Create unique arrangements and develop your personal musical voice.",
        icon: <Star className="h-6 w-6" />,
        difficulty: "Advanced",
        time: "90+ minutes",
        category: "Creativity"
      },
      {
        title: "Teach Others",
        description: "Teaching reinforces your knowledge and helps identify areas for improvement.",
        icon: <Users className="h-6 w-6" />,
        difficulty: "Advanced",
        time: "Variable",
        category: "Growth"
      },
      {
        title: "Record Your Progress",
        description: "Record yourself regularly to track improvement and identify areas to work on.",
        icon: <Music className="h-6 w-6" />,
        difficulty: "Advanced",
        time: "30 minutes",
        category: "Practice"
      }
    ]
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fundamentals': return 'bg-blue-100 text-blue-800';
      case 'Practice': return 'bg-purple-100 text-purple-800';
      case 'Technique': return 'bg-orange-100 text-orange-800';
      case 'Theory': return 'bg-indigo-100 text-indigo-800';
      case 'Style': return 'bg-pink-100 text-pink-800';
      case 'Harmony': return 'bg-teal-100 text-teal-800';
      case 'Creativity': return 'bg-rose-100 text-rose-800';
      case 'Growth': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Lightbulb className="h-12 w-12 text-primary mr-4" />
              <h1 className="text-4xl font-bold">Guitar & Piano Tips</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Expert tips and techniques to improve your guitar and piano playing skills. 
              From beginner fundamentals to advanced techniques.
            </p>
          </div>

          {/* Tips Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="beginner" className="flex items-center">
                <Guitar className="h-4 w-4 mr-2" />
                Beginner
              </TabsTrigger>
              <TabsTrigger value="intermediate" className="flex items-center">
                <Music className="h-4 w-4 mr-2" />
                Intermediate
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {Object.entries(tips).map(([level, levelTips]) => (
              <TabsContent key={level} value={level} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {levelTips.map((tip, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            {tip.icon}
                            <CardTitle className="ml-2 text-lg">{tip.title}</CardTitle>
                          </div>
                          <Badge className={getDifficultyColor(tip.difficulty)}>
                            {tip.difficulty}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {tip.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className={getCategoryColor(tip.category)}>
                            {tip.category}
                          </Badge>
                          <Badge variant="secondary">
                            {tip.time}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Learn More
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Additional Resources */}
          <div className="mt-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-6 w-6 mr-2" />
                  Additional Resources
                </CardTitle>
                <CardDescription>
                  More resources to help you on your musical journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <Music className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Video Tutorials</span>
                    <span className="text-sm text-muted-foreground">Step-by-step video guides</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <Guitar className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Chord Charts</span>
                    <span className="text-sm text-muted-foreground">Visual chord references</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <Piano className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Scale Practice</span>
                    <span className="text-sm text-muted-foreground">Scale exercises and patterns</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TipsPage;
