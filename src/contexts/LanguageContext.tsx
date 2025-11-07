'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'fr'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'songs.title': 'Songs',
    'songs.search': 'Search songs...',
    'songs.filter': 'Filter',
    'songs.noResults': 'No songs found',
    'songs.loading': 'Loading songs...',
    'song.details': 'Song Details',
    'song.artist': 'Artist',
    'song.key': 'Key',
    'song.difficulty': 'Difficulty',
    'song.favorite': 'Add to Favorites',
    'song.unfavorite': 'Remove from Favorites',
    'song.rating': 'Rating',
    'song.downloads': 'Downloads',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
  },
  fr: {
    'songs.title': 'Chansons',
    'songs.search': 'Rechercher des chansons...',
    'songs.filter': 'Filtrer',
    'songs.noResults': 'Aucune chanson trouvée',
    'songs.loading': 'Chargement des chansons...',
    'song.details': 'Détails de la chanson',
    'song.artist': 'Artiste',
    'song.key': 'Tonalité',
    'song.difficulty': 'Difficulté',
    'song.favorite': 'Ajouter aux favoris',
    'song.unfavorite': 'Retirer des favoris',
    'song.rating': 'Note',
    'song.downloads': 'Téléchargements',
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    // Load language from localStorage
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'en' || saved === 'fr')) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  const value = {
    language,
    setLanguage,
    t,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

