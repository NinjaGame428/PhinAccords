export type UserRole = 'user' | 'admin' | 'moderator';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role: UserRole;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: 'en' | 'fr';
    notifications?: boolean;
  };
  stats?: {
    lastActive?: string | null;
    ratingsGiven?: number;
    favoriteSongs?: number;
    downloadedResources?: number;
  };
  is_banned?: boolean;
  ban_reason?: string;
  ban_expires_at?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
  join_date?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

