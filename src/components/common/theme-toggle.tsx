'use client'

import React, { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeToggleProps {
  className?: string
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleTheme()
    }
  }

  if (!mounted) {
    return (
      <button
        className={`btn-six tran3s ${className}`}
        type="button"
        aria-label="Toggle theme"
        disabled
      >
        <i className="bi bi-circle-half"></i>
      </button>
    )
  }

  return (
    <button
      className={`btn btn-outline-secondary ${className}`}
      type="button"
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={theme === 'dark'}
      tabIndex={0}
    >
      {theme === 'light' ? (
        <i className="bi bi-moon-fill" aria-hidden="true"></i>
      ) : (
        <i className="bi bi-sun-fill" aria-hidden="true"></i>
      )}
    </button>
  )
}

export default ThemeToggle

