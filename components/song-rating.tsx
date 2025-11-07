"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Heart, LogIn } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

interface SongRatingProps {
  songId: number;
  songTitle: string;
  songArtist: string;
  className?: string;
}

interface Rating {
  id: string;
  songId: number;
  rating: number;
  comment: string;
  timestamp: string;
  userId: string;
}

const SongRating: React.FC<SongRatingProps> = ({ 
  songId, 
  songTitle, 
  songArtist, 
  className = '' 
}) => {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hasUserRated, setHasUserRated] = useState(false);
  const [userExistingRating, setUserExistingRating] = useState<Rating | null>(null);
  const { isSongFavorite, addSongToFavorites, removeSongFromFavorites } = useFavorites();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Load ratings from localStorage
  useEffect(() => {
    const savedRatings = localStorage.getItem(`song-ratings-${songId}`);
    if (savedRatings) {
      const parsedRatings = JSON.parse(savedRatings);
      setRatings(parsedRatings);
      
      // Check if current user has already rated this song
      if (user) {
        const existingRating = parsedRatings.find((rating: Rating) => rating.userId === user.id);
        if (existingRating) {
          setHasUserRated(true);
          setUserExistingRating(existingRating);
          setUserRating(existingRating.rating);
          setComment(existingRating.comment || '');
        }
      }
      
      // Calculate average rating
      if (parsedRatings.length > 0) {
        const sum = parsedRatings.reduce((acc: number, rating: Rating) => acc + rating.rating, 0);
        setAverageRating(sum / parsedRatings.length);
        setTotalRatings(parsedRatings.length);
      }
    }

    // Load user's previous rating (fallback for non-logged in users)
    if (!user) {
      const userRatingKey = `user-rating-${songId}`;
      const savedUserRating = localStorage.getItem(userRatingKey);
      if (savedUserRating) {
        setUserRating(parseInt(savedUserRating));
      }
    }
  }, [songId, user]);

  const handleRatingClick = (rating: number) => {
    if (hasUserRated) {
      // If user has already rated, remove their rating
      const updatedRatings = ratings.filter(r => r.userId !== user?.id);
      setRatings(updatedRatings);
      localStorage.setItem(`song-ratings-${songId}`, JSON.stringify(updatedRatings));
      
      // Update average rating
      if (updatedRatings.length > 0) {
        const sum = updatedRatings.reduce((acc, r) => acc + r.rating, 0);
        setAverageRating(sum / updatedRatings.length);
      } else {
        setAverageRating(0);
      }
      setTotalRatings(updatedRatings.length);
      
      // Reset user rating state
      setUserRating(0);
      setComment('');
      setHasUserRated(false);
      setUserExistingRating(null);
      setShowCommentForm(false);
      
      return;
    }
    
    setUserRating(rating);
    
    // Save user rating
    localStorage.setItem(`user-rating-${songId}`, rating.toString());
    
    // Create new rating entry
    const newRating: Rating = {
      id: `rating-${Date.now()}`,
      songId,
      rating,
      comment: comment || '',
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous'
    };

    // Update ratings
    const updatedRatings = [...ratings, newRating];
    setRatings(updatedRatings);
    localStorage.setItem(`song-ratings-${songId}`, JSON.stringify(updatedRatings));
    
    // Recalculate average
    const sum = updatedRatings.reduce((acc, rating) => acc + rating.rating, 0);
    setAverageRating(sum / updatedRatings.length);
    setTotalRatings(updatedRatings.length);
    
    setHasUserRated(true);
    setUserExistingRating(newRating);
    setShowCommentForm(true);
  };

  const handleToggleFavorite = () => {
    if (isSongFavorite(songId)) {
      removeSongFromFavorites(songId);
    } else {
      addSongToFavorites({
        id: songId,
        title: songTitle,
        artist: songArtist,
        key: 'C', // Default key
        difficulty: 'Medium', // Default difficulty
        category: 'Gospel' // Default category
      });
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-500";
    if (rating >= 3) return "text-yellow-500";
    if (rating >= 2) return "text-orange-500";
    return "text-red-500";
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "";
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Rate This Song
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Help other musicians by rating this song's chord progression and difficulty
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Login Required Message */}
        {!user ? (
          <div className="text-center py-8 bg-muted/50 rounded-lg">
            <LogIn className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Login Required</h3>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to rate songs and add them to your favorites.
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild className="rounded-full">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Current Rating Display */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer transition-colors ${
                        star <= (hoverRating || userRating)
                          ? 'fill-current text-yellow-500'
                          : 'text-gray-300'
                      }`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRatingClick(star)}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {hasUserRated 
                    ? `${t('song.youRatedThis')} ${getRatingText(userRating)} - ${t('song.clickToRemoveRating')}`
                    : userRating > 0 
                      ? getRatingText(userRating) 
                      : t('song.rateThisSong')
                  }
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={handleToggleFavorite}
                >
                  <Heart className={`h-4 w-4 ${isSongFavorite(songId) ? 'fill-current text-red-500' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Comment Form */}
            {userRating > 0 && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setShowCommentForm(!showCommentForm)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {showCommentForm ? t('song.hideComment') : t('song.addComment')}
                </Button>
                
                {showCommentForm && (
                  <div className="space-y-3">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t('song.comment')}
                      className="w-full p-3 border rounded-lg resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRatingClick(userRating)}
                        className="rounded-full"
                      >
                        {t('song.submitComment')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCommentForm(false)}
                        className="rounded-full"
                      >
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Average Rating */}
        {totalRatings > 0 && (
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating)
                        ? 'fill-current text-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold">{averageRating.toFixed(1)}</span>
            </div>
            <Badge variant="secondary">
              {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}

        {/* Recent Ratings */}
        {ratings.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Recent Ratings</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {ratings.slice(-3).reverse().map((rating) => (
                <div key={rating.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= rating.rating
                            ? 'fill-current text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{getRatingText(rating.rating)}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(rating.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {rating.comment && (
                      <p className="text-sm text-muted-foreground">{rating.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SongRating;