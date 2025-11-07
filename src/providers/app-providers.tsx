'use client'

import React from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { NotificationProvider } from '@/contexts/NotificationContext'

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <FavoritesProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </FavoritesProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

