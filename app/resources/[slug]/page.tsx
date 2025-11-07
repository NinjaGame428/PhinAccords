"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Music, 
  Video, 
  Download, 
  Users, 
  Guitar, 
  Piano, 
  Mic, 
  Headphones, 
  FileText, 
  Award, 
  Clock, 
  Star, 
  ExternalLink,
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  Share2,
  Heart,
  Bookmark,
  Printer
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState } from "react";

const ResourcePage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState("overview");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Mock resource data - in a real app, this would be fetched based on the slug
  const resource = {
    title: "Gospel Chord Theory Guide",
    description: "Comprehensive guide to understanding chord construction, progressions, and gospel music theory.",
    type: "PDF Guide",
    size: "2.3 MB",
    downloads: "1,234",
    category: "Theory",
    icon: <BookOpen className="h-6 w-6" />,
    author: "Dr. Sarah Johnson",
    lastUpdated: "2024-01-15",
    rating: 4.8,
    tags: ["chords", "theory", "gospel", "music", "education"],
    content: {
      overview: `This comprehensive guide covers everything you need to know about gospel chord theory. From basic triads to complex extended chords, you'll learn how to construct and use chords effectively in gospel music.

Key topics covered:
• Chord construction and voicing
• Gospel chord progressions
• Voice leading techniques
• Harmonic analysis
• Practical applications

Perfect for worship leaders, musicians, and anyone looking to deepen their understanding of gospel music harmony.`,
      
      chapters: [
        {
          title: "Introduction to Gospel Harmony",
          content: `Gospel music has a rich harmonic tradition that combines elements of blues, jazz, and traditional church music. Understanding these harmonic principles is essential for any gospel musician.

The foundation of gospel harmony lies in the use of extended chords, particularly 7th, 9th, and 13th chords. These chords create the characteristic "gospel sound" that listeners recognize immediately.

In this chapter, we'll explore:
- The history of gospel harmony
- Basic chord construction
- The role of the bass line
- Common gospel progressions`
        },
        {
          title: "Chord Construction and Voicing",
          content: `Proper chord voicing is crucial in gospel music. The way you arrange the notes of a chord can dramatically affect its emotional impact.

Key principles:
1. Root position vs. inversions
2. Close vs. open voicings
3. Doubling rules
4. Voice leading between chords

Practice exercises:
- Build major 7th chords in all keys
- Create smooth voice leading between I-IV-V progressions
- Experiment with different voicings of the same chord`
        },
        {
          title: "Gospel Chord Progressions",
          content: `Gospel music uses several characteristic progressions that create its distinctive sound. Understanding these progressions will help you recognize and create authentic gospel arrangements.

Common progressions:
- I-vi-IV-V (the "gospel progression")
- I-iii-vi-IV
- ii-V-I with gospel extensions
- Circle of fifths progressions

Each progression has its own emotional character and is used in different contexts within gospel music.`
        }
      ],
      
      exercises: [
        {
          title: "Chord Identification",
          description: "Identify the following chords and their functions in gospel progressions",
          content: "Cmaj7 - Am7 - Dm7 - G7"
        },
        {
          title: "Voice Leading Practice",
          description: "Create smooth voice leading between these chord changes",
          content: "C - Am - F - G"
        },
        {
          title: "Gospel Progression Analysis",
          description: "Analyze the harmonic function of each chord in this progression",
          content: "F - Am - Bb - C"
        }
      ],
      
      examples: [
        {
          title: "Amazing Grace - Chord Analysis",
          content: `Key: G Major

Verse 1:
G     C     G     D
A-maz-ing grace, how sweet the sound

G     C     G     D
That saved a wretch like me

G     C     G     D
I once was lost, but now am found

G     C     G     D
Was blind, but now I see

Analysis:
- The progression uses the classic I-IV-V pattern
- The melody emphasizes the root and third of each chord
- The rhythm creates a sense of forward motion`
        },
        {
          title: "How Great Thou Art - Advanced Harmony",
          content: `Key: C Major

Chorus:
C     Am    F     G
How great Thou art, how great Thou art

C     Am    F     G
And when I think that God His Son not sparing

C     Am    F     G
Sent Him to die, I scarce can take it in

C     Am    F     G
That on the cross my burden gladly bearing

Analysis:
- Uses the vi chord (Am) for emotional depth
- The progression creates a sense of resolution
- The melody follows the chord tones closely`
        }
      ]
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Theory": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Practice": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Training": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Leadership": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Technical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 xs:pt-20 sm:pt-24 min-h-screen">
        {/* Hero Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-background to-muted/20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="sm" className="rounded-full" asChild>
                <Link href="/resources">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resources
                </Link>
              </Button>
              <Badge className={getCategoryColor(resource.category)}>
                {resource.category}
              </Badge>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  {resource.icon}
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl xs:text-5xl sm:text-6xl font-bold tracking-tight mb-4">
                  {resource.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {resource.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>By {resource.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Updated {resource.lastUpdated}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>{resource.downloads} downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span>{resource.rating}/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="py-8 px-6 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg" className="rounded-full">
                <Download className="mr-2 h-5 w-5" />
                Download PDF
              </Button>
              <Button variant="outline" size="lg" className="rounded-full">
                <Printer className="mr-2 h-5 w-5" />
                Print
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full"
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark className={`mr-2 h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`mr-2 h-5 w-5 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button variant="outline" size="lg" className="rounded-full">
                <Share2 className="mr-2 h-5 w-5" />
                Share
              </Button>
            </div>
          </div>
        </section>

        {/* Content Tabs */}
        <section className="py-20 px-6 max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="exercises">Exercises</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Overview</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">{resource.content.overview}</div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="content" className="mt-8">
              <div className="space-y-8">
                {resource.content.chapters.map((chapter, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        {chapter.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-gray dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap">{chapter.content}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="exercises" className="mt-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold mb-6">Practice Exercises</h3>
                {resource.content.exercises.map((exercise, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        {exercise.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{exercise.description}</p>
                      <div className="bg-muted p-4 rounded-lg font-mono text-lg">
                        {exercise.content}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="examples" className="mt-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold mb-6">Musical Examples</h3>
                {resource.content.examples.map((example, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{example.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-gray dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap font-mono text-lg bg-muted p-4 rounded-lg">
                        {example.content}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Related Resources */}
        <section className="py-20 px-6 bg-secondary/20 dark:bg-secondary/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    Advanced Gospel Harmonies
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Learn complex harmony techniques used in contemporary gospel music.
                  </p>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="rounded-full" asChild>
                    <Link href="/resources/advanced-gospel-harmonies">
                      <BookOpen className="mr-2 h-4 w-4" /> View Resource
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    Gospel Chord Substitution Guide
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Learn how to substitute chords to create richer harmonies.
                  </p>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="rounded-full" asChild>
                    <Link href="/resources/gospel-chord-substitution-guide">
                      <BookOpen className="mr-2 h-4 w-4" /> View Resource
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ResourcePage;
