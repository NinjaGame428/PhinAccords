'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Song } from '@/types/song'
import { useNotification } from '@/contexts/NotificationContext'
import SongEditor from './song-editor'

const AdminSongsClient: React.FC = () => {
  const { success, error: notifyError } = useNotification()
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchSongs()
  }, [searchQuery])

  const fetchSongs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      params.append('limit', '50')

      const response = await fetch(`/api/songs?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch songs')

      const data = await response.json()
      setSongs(data.songs || [])
    } catch (err: any) {
      notifyError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (song: Song) => {
    if (!confirm('Are you sure you want to delete this song?')) return

    try {
      const response = await fetch(`/api/songs/${song.slug}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete song')
      }

      success('Song deleted successfully!')
      fetchSongs()
    } catch (err: any) {
      notifyError(err.message)
    }
  }

  const handleEdit = (song: Song) => {
    setEditingSong(song)
    setShowEditor(true)
  }

  const handleEditorClose = () => {
    setShowEditor(false)
    setEditingSong(null)
    fetchSongs()
  }

  const handleEditorSave = async (songData: any) => {
    try {
      const url = editingSong ? `/api/songs/${editingSong.slug}` : '/api/songs'
      const method = editingSong ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save song')
      }

      success(editingSong ? 'Song updated successfully!' : 'Song added successfully!')
      handleEditorClose()
    } catch (err: any) {
      notifyError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-songs">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Songs</h1>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: '300px' }}
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn-one tran3s" onClick={() => setShowEditor(true)}>
            <i className="bi bi-plus-circle me-1"></i>
            Add Song
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Genre</th>
                  <th>Key</th>
                  <th>Difficulty</th>
                  <th>Downloads</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song) => (
                  <tr key={song.id}>
                    <td>
                      <Link href={`/songs/${song.slug}`} className="text-decoration-none">
                        {song.title}
                      </Link>
                    </td>
                    <td>{song.artist || song.artist_data?.name || '-'}</td>
                    <td>{song.genre || '-'}</td>
                    <td>{song.key_signature || '-'}</td>
                    <td>{song.difficulty || '-'}</td>
                    <td>{song.downloads || 0}</td>
                    <td>
                      {song.rating ? (
                        <>
                          <i className="bi bi-star-fill text-warning"></i> {song.rating.toFixed(1)}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn-six tran3s"
                          onClick={() => handleEdit(song)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn-six tran3s"
                          onClick={() => handleDelete(song)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showEditor && (
        <SongEditor song={editingSong} onClose={handleEditorClose} onSave={handleEditorSave} />
      )}
    </div>
  )
}

export default AdminSongsClient

