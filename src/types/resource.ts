export interface Resource {
  id: string
  title: string
  description?: string
  type?: string
  category?: string
  file_url?: string
  file_size?: number
  downloads?: number
  rating?: number
  author?: string
  created_at?: string
  updated_at?: string
}

