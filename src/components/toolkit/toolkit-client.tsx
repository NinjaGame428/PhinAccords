/**
 * PhinAccords Toolkit Client Component
 * Heavenkeys Ltd
 * 
 * Complete toolkit interface with all tools
 */

'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import Tuner from './tuner'
import Metronome from './metronome'
import LiveChordDetection from './live-chord-detection'
import { Music, Gauge, Mic, BookOpen } from 'lucide-react'

const ToolkitClient: React.FC = () => {
  const { t } = useLanguage()
  const { user, subscription } = useAuth()
  const [activeTab, setActiveTab] = useState<'tuner' | 'metronome' | 'live' | 'practice'>('tuner')

  const tools = [
    {
      id: 'tuner' as const,
      name: 'Tuner',
      icon: Music,
      description: 'Polyphonic tuner for guitar, ukulele, mandolin, and piano',
      requires: 'premium_toolkit' as const,
    },
    {
      id: 'metronome' as const,
      name: 'Metronome',
      icon: Gauge,
      description: 'Precision metronome with drumbeat and time signatures',
      requires: 'premium_toolkit' as const,
    },
    {
      id: 'live' as const,
      name: 'Live Chord Detection',
      icon: Mic,
      description: 'Real-time chord detection from microphone input',
      requires: 'premium_toolkit' as const,
    },
    {
      id: 'practice' as const,
      name: 'Practice Chords',
      icon: BookOpen,
      description: 'Learn and practice all chords with interactive diagrams',
      requires: 'premium_toolkit' as const,
    },
  ]

  return (
    <div className="toolkit-page">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="mb-3">PhinAccords Toolkit</h1>
        <p className="text-muted lead">
          Professional music tools designed to enhance your playing experience
        </p>
        {!user && (
          <div className="alert alert-info mt-4">
            <strong>Sign in required:</strong> Please log in to access the toolkit
          </div>
        )}
        {user && subscription?.tier !== 'premium_toolkit' && (
          <div className="alert alert-warning mt-4">
            <strong>Premium + Toolkit Required:</strong> Upgrade to access all toolkit features
            <br />
            <a href="/pricing" className="btn-one mt-2">
              Upgrade Now
            </a>
          </div>
        )}
      </div>

      {/* Tool Tabs */}
      <div className="card mb-4">
        <div className="card-body">
          <ul className="nav nav-tabs nav-justified" role="tablist">
            {tools.map((tool) => {
              const IconComponent = tool.icon
              const isActive = activeTab === tool.id
              const canAccess = user && (subscription?.tier === 'premium_toolkit' || subscription?.tier === 'basic')

              return (
                <li key={tool.id} className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${isActive ? 'active' : ''} ${!canAccess ? 'text-muted' : ''}`}
                    onClick={() => setActiveTab(tool.id)}
                    disabled={!canAccess}
                    type="button"
                    role="tab"
                  >
                    <IconComponent className="h-4 w-4 me-2" />
                    {tool.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Tool Content */}
      <div className="tab-content">
        {activeTab === 'tuner' && (
          <div className="tab-pane show active">
            <Tuner />
          </div>
        )}

        {activeTab === 'metronome' && (
          <div className="tab-pane show active">
            <Metronome />
          </div>
        )}

        {activeTab === 'live' && (
          <div className="tab-pane show active">
            <LiveChordDetection />
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="tab-pane show active">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Practice Chords</h5>
              </div>
              <div className="card-body text-center">
                <BookOpen className="h-5 w-5 mb-3 text-muted" />
                <p className="text-muted">
                  Interactive chord practice coming soon! This feature will include:
                </p>
                <ul className="list-unstyled text-start d-inline-block">
                  <li>✓ Complete chord library</li>
                  <li>✓ Interactive chord diagrams</li>
                  <li>✓ Practice mode with audio playback</li>
                  <li>✓ Progress tracking</li>
                  <li>✓ Personalized practice routines</li>
                </ul>
                <a href="/piano-chords" className="btn-one mt-3">
                  Browse Piano Chords
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features Overview */}
      <div className="row mt-5">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Toolkit Features</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {tools.map((tool) => {
                  const IconComponent = tool.icon
                  return (
                    <div key={tool.id} className="col-md-6 mb-3">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-3">
                          <div className="bg-color-one text-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                        </div>
                        <div>
                          <h6 className="mb-1">{tool.name}</h6>
                          <p className="text-muted small mb-0">{tool.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ToolkitClient

