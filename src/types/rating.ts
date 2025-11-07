export interface Rating {
  id: string;
  user_id: string;
  song_id?: string;
  resource_id?: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
  updated_at: string;
}

