'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'
type Category = 'Fundamentals' | 'Practice' | 'Technique' | 'Theory' | 'Style' | 'Harmony' | 'Creativity' | 'Growth'

interface Tip {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  category: Category
  timeEstimate: string
  icon: string
}

const tips: Tip[] = [
  {
    id: '1',
    title: 'Proper Hand Position',
    description: 'Learn the correct hand position for playing piano. Keep your wrists level and fingers curved naturally.',
    difficulty: 'Beginner',
    category: 'Fundamentals',
    timeEstimate: '5 min',
    icon: 'bi-hand-index',
  },
  {
    id: '2',
    title: 'Chord Progressions',
    description: 'Master common gospel chord progressions like I-IV-V and I-vi-IV-V to play most worship songs.',
    difficulty: 'Intermediate',
    category: 'Harmony',
    timeEstimate: '15 min',
    icon: 'bi-music-note-beamed',
  },
  {
    id: '3',
    title: 'Finger Independence',
    description: 'Practice exercises to develop finger independence for smoother chord transitions.',
    difficulty: 'Intermediate',
    category: 'Practice',
    timeEstimate: '20 min',
    icon: 'bi-fingerprint',
  },
  {
    id: '4',
    title: 'Reading Chord Charts',
    description: 'Learn how to read and interpret chord charts quickly for faster song learning.',
    difficulty: 'Beginner',
    category: 'Fundamentals',
    timeEstimate: '10 min',
    icon: 'bi-file-earmark-music',
  },
  {
    id: '5',
    title: 'Worship Flow',
    description: 'Develop techniques for creating smooth transitions between songs during worship.',
    difficulty: 'Advanced',
    category: 'Style',
    timeEstimate: '30 min',
    icon: 'bi-heart',
  },
  {
    id: '6',
    title: 'Improvisation Basics',
    description: 'Start learning how to improvise simple melodies over chord progressions.',
    difficulty: 'Intermediate',
    category: 'Creativity',
    timeEstimate: '25 min',
    icon: 'bi-lightning',
  },
]

const TipsClient: React.FC = () => {
  const { t } = useLanguage()
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All')

  const filteredTips = tips.filter((tip) => {
    if (selectedDifficulty !== 'All' && tip.difficulty !== selectedDifficulty) return false
    if (selectedCategory !== 'All' && tip.category !== selectedCategory) return false
    return true
  })

  const difficultyColors = {
    Beginner: 'bg-success',
    Intermediate: 'bg-warning',
    Advanced: 'bg-danger',
  }

  const categoryColors = {
    Fundamentals: 'bg-primary',
    Practice: 'bg-info',
    Technique: 'bg-secondary',
    Theory: 'bg-dark',
    Style: 'bg-purple',
    Harmony: 'bg-indigo',
    Creativity: 'bg-pink',
    Growth: 'bg-teal',
  }

  return (
    <div className="tips-client">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="h3 mb-3">Piano & Guitar Tips</h2>
          <p className="text-muted">
            Explore tips and techniques organized by difficulty level to improve your worship music skills.
          </p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <label className="form-label">Filter by Difficulty</label>
          <select
            className="form-select"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | 'All')}
            aria-label="Filter tips by difficulty"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Filter by Category</label>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
            aria-label="Filter tips by category"
          >
            <option value="All">All Categories</option>
            <option value="Fundamentals">Fundamentals</option>
            <option value="Practice">Practice</option>
            <option value="Technique">Technique</option>
            <option value="Theory">Theory</option>
            <option value="Style">Style</option>
            <option value="Harmony">Harmony</option>
            <option value="Creativity">Creativity</option>
            <option value="Growth">Growth</option>
          </select>
        </div>
      </div>

      <div className="row">
        {filteredTips.length === 0 ? (
          <div className="col-12">
            <p className="text-center text-muted py-5">No tips found matching your filters.</p>
          </div>
        ) : (
          filteredTips.map((tip) => (
            <div key={tip.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className={`badge ${difficultyColors[tip.difficulty]} mb-2`}>
                      {tip.difficulty}
                    </div>
                    <div className={`badge ${categoryColors[tip.category]}`}>
                      {tip.category}
                    </div>
                  </div>

                  <div className="mb-3">
                    <i className={`bi ${tip.icon} text-primary`} style={{ fontSize: '2rem' }} aria-hidden="true"></i>
                  </div>

                  <h4 className="h5 mb-3">{tip.title}</h4>
                  <p className="text-muted mb-3">{tip.description}</p>

                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      <i className="bi bi-clock me-1" aria-hidden="true"></i>
                      {tip.timeEstimate}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body">
              <h3 className="h5 mb-3">Additional Resources</h3>
              <p className="mb-3">
                Looking for more learning materials? Check out our comprehensive resource library.
              </p>
              <a href="/resources" className="btn-one tran3s">
                Browse Resources
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TipsClient

