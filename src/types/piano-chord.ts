export interface PianoChord {
  id: string
  chord_name: string
  chord_type?: string
  root_note?: string
  notes: string[]
  intervals?: string
  alternate_name?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  description?: string
  fingering?: string
  key_signature: string
  inversion?: number
  root_name?: string
  finger_positions?: Record<string, any>
  diagram_svg?: string
  diagram_data?: Record<string, any>
  chord_name_fr?: string
  description_fr?: string
  created_at?: string
  updated_at?: string
}

