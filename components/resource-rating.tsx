"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageCircle, Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";

interface ResourceRatingProps {
  resourceId: string;
  resourceTitle: string;
  resourceType: string;
  className?: string;
}

interface Rating {
  id: string;
  resourceId: string;
  rating: number;
  comment: string;
  timestamp: string;
  userId: string;
}

const ResourceRating: React.FC<ResourceRatingProps> = ({ 
  resourceId, 
  resourceTitle, 
  resourceType,
  className = '' 
}) => {
  const { user } = useAuth();
  const { favoriteResources, addResourceToFavorites, removeResourceFromFavorites, isResourceFavorite } = useFavorites();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [userComment, setUserComment] = useState<string>('');
  const [showCommentForm, setShowCommentForm] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);

  // Load ratings from localStorage
  useEffect(() => {
    const savedRatings = localStorage.getItem('resource_ratings');
    if (savedRatings) {
      const allRatings = JSON.parse(savedRatings);
      const resourceRatings = allRatings.filter((rating: Rating) => rating.resourceId === resourceId);
      setRatings(resourceRatings);
      
      // Find user's rating
      if (user) {
        const userRatingData = resourceRatings.find((rating: Rating) => rating.userId === user.id);
        if (userRatingData) {
          setUserRating(userRatingData.rating);
          setUserComment(userRatingData.comment);
        }
      }
    }
  }, [resourceId, user]);

  // Check if resource is favorited
  useEffect(() => {
    if (user) {
      setIsFavorited(isResourceFavorite(resourceId));
    }
  }, [isResourceFavorite, user, resourceId]);

  const handleRating = (rating: number) => {
    if (!user) {
      alert('Please log in to rate resources');
      return;
    }

    setUserRating(rating);
    
    // Save rating to localStorage
    const savedRatings = localStorage.getItem('resource_ratings');
    let allRatings: Rating[] = savedRatings ? JSON.parse(savedRatings) : [];
    
    // Remove existing rating from this user for this resource
    allRatings = allRatings.filter(rating => !(rating.resourceId === resourceId && rating.userId === user.id));
    
    // Add new rating
    const newRating: Rating = {
      id: `${resourceId}_${user.id}_${Date.now()}`,
      resourceId,
      rating,
      comment: userComment,
      timestamp: new Date().toISOString(),
      userId: user.id
    };
    
    allRatings.push(newRating);
    localStorage.setItem('resource_ratings', JSON.stringify(allRatings));
    
    // Update local state
    const resourceRatings = allRatings.filter(rating => rating.resourceId === resourceId);
    setRatings(resourceRatings);
  };

  const handleCommentSubmit = () => {
    if (!user) return;
    
    handleRating(userRating);
    setShowCommentForm(false);
  };

  const handleFavorite = () => {
    if (!user) {
      alert('Please log in to add favorites');
      return;
    }
    if (isFavorited) {
      removeResourceFromFavorites(resourceId);
    } else {
      addResourceToFavorites({
        id: resourceId,
        title: resourceTitle,
        type: resourceType,
        category: resourceType
      });
    }
    setIsFavorited(!isFavorited);
  };

  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-500';
    if (rating >= 3.5) return 'text-yellow-500';
    if (rating >= 2.5) return 'text-orange-500';
    return 'text-red-500';
  };

  const averageRating = calculateAverageRating();

  if (!user) {
    return (
      <div className={`mt-4 p-4 bg-muted/50 rounded-lg ${className}`}>
        <p className="text-sm text-muted-foreground text-center">
          Please log in to rate and review this resource
        </p>
      </div>
    );
  }

  return (
    <Card className={`mt-4 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Rate & Review</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavorite}
              className={`${isFavorited ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
            <Badge variant="outline" className="text-xs">
              {ratings.length} review{ratings.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Average Rating Display */}
        {ratings.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= averageRating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className={`font-medium ${getRatingColor(averageRating)}`}>
              {averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({ratings.length} review{ratings.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        {/* User Rating */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Your Rating:</p>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className={`transition-colors ${
                  star <= userRating
                    ? 'text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
              >
                <Star className="h-5 w-5 fill-current" />
              </button>
            ))}
          </div>
        </div>

        {/* Comment Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Add a Review:</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommentForm(!showCommentForm)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {showCommentForm ? 'Hide' : 'Add'} Comment
            </Button>
          </div>
          
          {showCommentForm && (
            <div className="space-y-2">
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Share your thoughts about this resource..."
                className="w-full p-2 border rounded-md resize-none"
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCommentForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCommentSubmit}
                  disabled={userRating === 0}
                >
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        {ratings.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Recent Reviews:</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {ratings.slice(-3).map((rating) => (
                <div key={rating.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= rating.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(rating.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {rating.comment && (
                    <p className="text-sm text-muted-foreground">{rating.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceRating;
