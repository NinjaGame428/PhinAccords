export interface UserStats {
  favoriteSongs: number;
  downloadedResources: number;
  ratingsGiven: number;
  lastActive: string;
}

export interface RecentActivity {
  id: string;
  type: 'favorite' | 'download' | 'rating';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface FavoriteSong {
  id: string;
  title: string;
  artist: string;
  genre: string;
  key_signature: string;
  created_at: string;
}

export interface DownloadedResource {
  id: string;
  title: string;
  type: string;
  category: string;
  file_size: number;
  created_at: string;
}

// Fetch real user statistics via API
export const fetchUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const response = await fetch(`/api/users/${userId}/stats`, { credentials: 'include' });
    
    if (!response.ok) {
      return {
        favoriteSongs: 0,
        downloadedResources: 0,
        ratingsGiven: 0,
        lastActive: new Date().toISOString()
      };
    }

    const data = await response.json();
    return data.stats || {
      favoriteSongs: 0,
      downloadedResources: 0,
      ratingsGiven: 0,
      lastActive: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      favoriteSongs: 0,
      downloadedResources: 0,
      ratingsGiven: 0,
      lastActive: new Date().toISOString()
    };
  }
};

// Fetch recent activity from API
export const fetchRecentActivity = async (userId: string): Promise<RecentActivity[]> => {
  try {
    const response = await fetch(`/api/users/${userId}/activity`, { credentials: 'include' });
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const activities = data.activities || [];

    return activities.map((activity: any) => {
      const metadata = activity.metadata ? (typeof activity.metadata === 'string' ? JSON.parse(activity.metadata) : activity.metadata) : {};
      
      let icon = 'Clock';
      let type: 'favorite' | 'download' | 'rating' = 'favorite';
      
      if (activity.activity_type?.toLowerCase().includes('favorite')) {
        icon = 'Heart';
        type = 'favorite';
      } else if (activity.activity_type?.toLowerCase().includes('download')) {
        icon = 'Download';
        type = 'download';
      } else if (activity.activity_type?.toLowerCase().includes('rating') || activity.activity_type?.toLowerCase().includes('rate')) {
        icon = 'Star';
        type = 'rating';
      }

      return {
        id: activity.id,
        type,
        title: activity.description || activity.activity_type || 'Activity',
        description: activity.page || metadata?.title || '',
        timestamp: activity.created_at,
        icon
      };
    }).slice(0, 20);
  } catch (error) {
    console.error('Error in fetchRecentActivity:', error);
    return [];
  }
};

// Fetch user's favorite songs via API
export const fetchFavoriteSongs = async (userId: string): Promise<FavoriteSong[]> => {
  try {
    const response = await fetch(`/api/users/${userId}/favorites`, { credentials: 'include' });
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.favorites || [];
  } catch (error) {
    console.error('Error fetching favorite songs:', error);
    return [];
  }
};

// Fetch user's downloaded resources via API
export const fetchDownloadedResources = async (userId: string): Promise<DownloadedResource[]> => {
  try {
    const response = await fetch(`/api/users/${userId}/downloads`, { credentials: 'include' });
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.resources || [];
  } catch (error) {
    console.error('Error fetching downloaded resources:', error);
    return [];
  }
};

// Update user stats in database via API
export const updateUserStats = async (userId: string, stats: UserStats): Promise<boolean> => {
  try {
    const response = await fetch(`/api/users/${userId}/stats`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(stats)
    });

    return response.ok;
  } catch (error) {
    console.error('Error updating user stats:', error);
    return false;
  }
};
