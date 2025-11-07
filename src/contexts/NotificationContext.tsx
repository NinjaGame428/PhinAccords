'use client'

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface NotificationContextType {
  notify: (message: string, type?: NotificationType) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message)
        break
      case 'error':
        toast.error(message)
        break
      case 'warning':
        toast.warning(message)
        break
      default:
        toast.info(message)
    }
  }, [])

  const success = useCallback((message: string) => notify(message, 'success'), [notify])
  const error = useCallback((message: string) => notify(message, 'error'), [notify])
  const info = useCallback((message: string) => notify(message, 'info'), [notify])
  const warning = useCallback((message: string) => notify(message, 'warning'), [notify])

  const value = {
    notify,
    success,
    error,
    info,
    warning,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {mounted && (
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      )}
    </NotificationContext.Provider>
  )
}

