"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoriteSong {
  id: number;
  title: string;
  artist: string;
  key: string;
  difficulty: string;
  category: string;
  addedAt: string;
}

interface FavoriteResource {
  id: string;
  title: string;
  type: string;
  category: string;
  addedAt: string;
}

interface FavoritesContextType {
  favoriteSongs: FavoriteSong[];
  favoriteResources: FavoriteResource[];
  addSongToFavorites: (song: Omit<FavoriteSong, 'addedAt'>) => void;
  removeSongFromFavorites: (songId: number) => void;
  addResourceToFavorites: (resource: Omit<FavoriteResource, 'addedAt'>) => void;
  removeResourceFromFavorites: (resourceId: string) => void;
  isSongFavorite: (songId: number) => boolean;
  isResourceFavorite: (resourceId: string) => boolean;
  clearAllFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteSongs, setFavoriteSongs] = useState<FavoriteSong[]>([]);
  const [favoriteResources, setFavoriteResources] = useState<FavoriteResource[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedSongs = localStorage.getItem('favoriteSongs');
    const savedResources = localStorage.getItem('favoriteResources');
    
    if (savedSongs) {
      setFavoriteSongs(JSON.parse(savedSongs));
    }
    if (savedResources) {
      setFavoriteResources(JSON.parse(savedResources));
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('favoriteSongs', JSON.stringify(favoriteSongs));
  }, [favoriteSongs]);

  useEffect(() => {
    localStorage.setItem('favoriteResources', JSON.stringify(favoriteResources));
  }, [favoriteResources]);

  const addSongToFavorites = (song: Omit<FavoriteSong, 'addedAt'>) => {
    const newFavorite: FavoriteSong = {
      ...song,
      addedAt: new Date().toISOString()
    };
    setFavoriteSongs(prev => [...prev, newFavorite]);
  };

  const removeSongFromFavorites = (songId: number) => {
    setFavoriteSongs(prev => prev.filter(song => song.id !== songId));
  };

  const addResourceToFavorites = (resource: Omit<FavoriteResource, 'addedAt'>) => {
    const newFavorite: FavoriteResource = {
      ...resource,
      addedAt: new Date().toISOString()
    };
    setFavoriteResources(prev => [...prev, newFavorite]);
  };

  const removeResourceFromFavorites = (resourceId: string) => {
    setFavoriteResources(prev => prev.filter(resource => resource.id !== resourceId));
  };

  const isSongFavorite = (songId: number) => {
    return favoriteSongs.some(song => song.id === songId);
  };

  const isResourceFavorite = (resourceId: string) => {
    return favoriteResources.some(resource => resource.id === resourceId);
  };

  const clearAllFavorites = () => {
    setFavoriteSongs([]);
    setFavoriteResources([]);
  };

  const value: FavoritesContextType = {
    favoriteSongs,
    favoriteResources,
    addSongToFavorites,
    removeSongFromFavorites,
    addResourceToFavorites,
    removeResourceFromFavorites,
    isSongFavorite,
    isResourceFavorite,
    clearAllFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
