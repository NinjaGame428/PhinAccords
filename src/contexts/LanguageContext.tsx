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
    // Navigation
    'nav.home': 'Home',
    'nav.songs': 'Songs',
    'nav.pianoChords': 'Piano Chords',
    'nav.artists': 'Artists',
    'nav.resources': 'Resources',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    
    // Songs
    'songs.title': 'Songs',
    'songs.search': 'Search songs...',
    'songs.filter': 'Filter',
    'songs.noResults': 'No songs found',
    'songs.loading': 'Loading songs...',
    'songs.all': 'All Songs',
    'songs.popular': 'Popular Songs',
    'songs.recent': 'Recent Songs',
    
    // Song Details
    'song.details': 'Song Details',
    'song.artist': 'Artist',
    'song.key': 'Key',
    'song.difficulty': 'Difficulty',
    'song.favorite': 'Add to Favorites',
    'song.unfavorite': 'Remove from Favorites',
    'song.rating': 'Rating',
    'song.downloads': 'Downloads',
    'song.lyrics': 'Lyrics',
    'song.chords': 'Chords',
    'song.chordProgression': 'Chord Progression',
    'song.transpose': 'Transpose',
    
    // Piano Chords
    'pianoChords.title': 'Piano Chords',
    'pianoChords.search': 'Search chords...',
    'pianoChords.play': 'Play',
    'pianoChords.stop': 'Stop',
    
    // Artists
    'artists.title': 'Artists',
    'artists.search': 'Search artists...',
    'artists.bio': 'Biography',
    'artists.songs': 'Songs',
    
    // Resources
    'resources.title': 'Resources',
    'resources.search': 'Search resources...',
    'resources.download': 'Download',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.favorites': 'Favorites',
    'dashboard.downloads': 'Downloads',
    'dashboard.activity': 'Activity',
    'dashboard.settings': 'Settings',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.songs': 'Chansons',
    'nav.pianoChords': 'Accords Piano',
    'nav.artists': 'Artistes',
    'nav.resources': 'Ressources',
    'nav.dashboard': 'Tableau de bord',
    'nav.login': 'Connexion',
    'nav.register': 'Inscription',
    'nav.logout': 'Déconnexion',
    
    // Songs
    'songs.title': 'Chansons',
    'songs.search': 'Rechercher des chansons...',
    'songs.filter': 'Filtrer',
    'songs.noResults': 'Aucune chanson trouvée',
    'songs.loading': 'Chargement des chansons...',
    'songs.all': 'Toutes les chansons',
    'songs.popular': 'Chansons populaires',
    'songs.recent': 'Chansons récentes',
    
    // Song Details
    'song.details': 'Détails de la chanson',
    'song.artist': 'Artiste',
    'song.key': 'Tonalité',
    'song.difficulty': 'Difficulté',
    'song.favorite': 'Ajouter aux favoris',
    'song.unfavorite': 'Retirer des favoris',
    'song.rating': 'Note',
    'song.downloads': 'Téléchargements',
    'song.lyrics': 'Paroles',
    'song.chords': 'Accords',
    'song.chordProgression': 'Progression d\'accords',
    'song.transpose': 'Transposer',
    
    // Piano Chords
    'pianoChords.title': 'Accords Piano',
    'pianoChords.search': 'Rechercher des accords...',
    'pianoChords.play': 'Jouer',
    'pianoChords.stop': 'Arrêter',
    
    // Artists
    'artists.title': 'Artistes',
    'artists.search': 'Rechercher des artistes...',
    'artists.bio': 'Biographie',
    'artists.songs': 'Chansons',
    
    // Resources
    'resources.title': 'Ressources',
    'resources.search': 'Rechercher des ressources...',
    'resources.download': 'Télécharger',
    
    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.overview': 'Vue d\'ensemble',
    'dashboard.favorites': 'Favoris',
    'dashboard.downloads': 'Téléchargements',
    'dashboard.activity': 'Activité',
    'dashboard.settings': 'Paramètres',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.close': 'Fermer',
    'common.submit': 'Soumettre',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.clear': 'Effacer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
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
    // Load language from cookie (priority) or localStorage
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
      return null
    }

    const cookieLang = getCookie('language') as Language
    const saved = cookieLang || (typeof window !== 'undefined' ? localStorage.getItem('language') : null) as Language
    
    if (saved && (saved === 'en' || saved === 'fr')) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    
    // Save to both cookie and localStorage
    if (typeof document !== 'undefined') {
      document.cookie = `language=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
      localStorage.setItem('language', lang)
    }
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

