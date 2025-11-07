'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useNotification } from '@/contexts/NotificationContext'
import ThemeToggle from '@/components/common/theme-toggle'
import LanguageSwitcher from '@/components/common/language-switcher'

const SettingsClient: React.FC = () => {
  const { t } = useLanguage()
  const { success } = useNotification()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    autoSave: true,
    showTutorials: true,
  })

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('userSettings')
    if (saved) {
      try {
        setSettings({ ...settings, ...JSON.parse(saved) })
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
    }
  }, [])

  const handleSettingChange = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('userSettings', JSON.stringify(newSettings))
    success('Settings saved!')
  }

  return (
    <div className="settings-client">
      <h1 className="h2 mb-4">{t('dashboard.settings')}</h1>

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="h5 mb-4">Preferences</h3>

              <div className="mb-4">
                <label className="form-label d-block mb-2">Language</label>
                <LanguageSwitcher />
              </div>

              <div className="mb-4">
                <label className="form-label d-block mb-2">Theme</label>
                <ThemeToggle />
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    aria-label="Enable email notifications"
                  />
                  <label className="form-check-label" htmlFor="emailNotifications">
                    Email Notifications
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="pushNotifications"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    aria-label="Enable push notifications"
                  />
                  <label className="form-check-label" htmlFor="pushNotifications">
                    Push Notifications
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="autoSave"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    aria-label="Enable auto-save"
                  />
                  <label className="form-check-label" htmlFor="autoSave">
                    Auto-save Settings
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showTutorials"
                    checked={settings.showTutorials}
                    onChange={(e) => handleSettingChange('showTutorials', e.target.checked)}
                    aria-label="Show tutorials"
                  />
                  <label className="form-check-label" htmlFor="showTutorials">
                    Show Tutorials
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3 className="h5 mb-4">Account Actions</h3>

              <div className="d-flex flex-column gap-3">
                <button
                  className="btn-six tran3s"
                  disabled
                  aria-label="Change password (coming soon)"
                >
                  Change Password (Coming Soon)
                </button>
                <button
                  className="btn-six tran3s"
                  disabled
                  aria-label="Export data (coming soon)"
                >
                  Export Data (Coming Soon)
                </button>
                <button
                  className="btn-six tran3s"
                  disabled
                  aria-label="Delete account (coming soon)"
                >
                  Delete Account (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsClient

