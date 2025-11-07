'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

type Language = 'en' | 'fr'

interface LanguageSwitcherProps {
  className?: string
  showLabel?: boolean
}

const languages: { code: Language; name: string; nativeName: string; flag: string; icon: string }[] = [
  { 
    code: 'en', 
    name: 'English', 
    nativeName: 'English',
    flag: '🇬🇧',
    icon: '🌐'
  },
  { 
    code: 'fr', 
    name: 'French', 
    nativeName: 'Français',
    flag: '🇫🇷',
    icon: '🌐'
  },
]

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '',
  showLabel = false 
}) => {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(!isOpen)
    }
  }

  const currentLanguage = languages.find((lang) => lang.code === language) ?? languages[0]

  if (!mounted) {
    return (
      <div className={`dropdown ${className}`} suppressHydrationWarning>
        <button
          className="btn btn-sm btn-outline-light dropdown-toggle d-flex align-items-center"
          type="button"
          disabled
          aria-label="Language selector"
        >
          <span className="me-2" style={{ fontSize: '1.2rem' }} aria-hidden="true">🇬🇧</span>
          <span>English</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef}>
      {showLabel && (
        <span className="text-muted small me-2" aria-hidden="true">
          {language === 'en' ? 'Language:' : 'Langue:'}
        </span>
      )}
      <button
        className="btn btn-sm btn-outline-light dropdown-toggle d-flex align-items-center"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select language"
        tabIndex={0}
      >
        <span className="me-2" style={{ fontSize: '1.2rem' }} aria-hidden="true">
          {currentLanguage?.flag || '🇬🇧'}
        </span>
        <span>{currentLanguage?.nativeName || 'English'}</span>
      </button>
      <ul
        className={`dropdown-menu ${isOpen ? 'show' : ''}`}
        style={{ minWidth: '180px' }}
        role="menu"
        aria-label="Language options"
      >
        {languages.map((lang) => (
          <li key={lang.code}>
            <button
              className={`dropdown-item d-flex align-items-center ${language === lang.code ? 'active' : ''}`}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleLanguageChange(lang.code)
                }
              }}
              role="menuitem"
              aria-label={`Switch to ${lang.nativeName}`}
              tabIndex={0}
            >
              <span className="me-2" style={{ fontSize: '1.2rem' }} aria-hidden="true">
                {lang.flag}
              </span>
              <span className="flex-grow-1">{lang.nativeName}</span>
              {language === lang.code && (
                <i className="bi bi-check ms-2 text-primary" aria-hidden="true"></i>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LanguageSwitcher

