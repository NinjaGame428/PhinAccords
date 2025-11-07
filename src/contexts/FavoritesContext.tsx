'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import type { Favorite } from '@/types/favorite'

interface FavoritesContextType {
  favorites: Favorite[]
  favoriteSongIds: Set<string>
  favoriteResourceIds: Set<string>
  loading: boolean
  addFavorite: (songId?: string, resourceId?: string) => Promise<{ error: any }>
  removeFavorite: (songId?: string, resourceId?: string) => Promise<{ error: any }>
  isFavorite: (songId?: string, resourceId?: string) => boolean
  refreshFavorites: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(false)

  const favoriteSongIds = new Set(favorites.filter((f) => f.song_id).map((f) => f.song_id!))
  const favoriteResourceIds = new Set(
    favorites.filter((f) => f.resource_id).map((f) => f.resource_id!)
  )

  useEffect(() => {
    if (user) {
      refreshFavorites()
    } else {
      setFavorites([])
    }
  }, [user])

  const refreshFavorites = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      setFavorites(data || [])
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const addFavorite = async (songId?: string, resourceId?: string) => {
    if (!user) return { error: { message: 'Must be logged in' } }
    if (!songId && !resourceId) return { error: { message: 'Must provide song_id or resource_id' } }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          song_id: songId || null,
          resource_id: resourceId || null,
        })
        .select()
        .single()

      if (error) throw error

      setFavorites((prev) => [...prev, data])
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const removeFavorite = async (songId?: string, resourceId?: string) => {
    if (!user) return { error: { message: 'Must be logged in' } }

    try {
      let query = supabase.from('favorites').delete().eq('user_id', user.id)

      if (songId) {
        query = query.eq('song_id', songId)
      } else if (resourceId) {
        query = query.eq('resource_id', resourceId)
      }

      const { error } = await query

      if (error) throw error

      setFavorites((prev) =>
        prev.filter((f) => {
          if (songId) return f.song_id !== songId
          if (resourceId) return f.resource_id !== resourceId
          return true
        })
      )

      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const isFavorite = (songId?: string, resourceId?: string): boolean => {
    if (songId) return favoriteSongIds.has(songId)
    if (resourceId) return favoriteResourceIds.has(resourceId)
    return false
  }

  const value = {
    favorites,
    favoriteSongIds,
    favoriteResourceIds,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites,
  }

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

