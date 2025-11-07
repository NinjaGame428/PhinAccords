# PhinAccords - Project Overview

## Mission Statement

**PhinAccords** is a comprehensive gospel music chords web application designed to help musicians, worship leaders, and music enthusiasts discover, learn, and practice gospel music. The platform aims to make anyone an accomplished worship pianist by providing:

- **100% Gospel Songs**: Exclusively gospel and Christian worship resources
- **Service Efficiency**: Easy access to accurate chord charts and learning materials
- **Community Support**: Tools and resources to excel in ministry

## Key Statistics

- **200+ Songs** in the database
- **79+ Artists** cataloged
- **30+ Learning Resources** available
- **Bilingual Support** (English/French)
- **100x Performance Improvement** through optimization

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **Bootstrap 5** - Component library
- **React Slick** - Carousel/slider components

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Row Level Security (RLS)
  - Storage

### State Management
- **React Context API** - Global state management
  - `AuthContext` - User authentication state
  - `FavoritesContext` - User favorites
  - `LanguageContext` - Internationalization
  - `NotificationContext` - Toast notifications
- **Redux Toolkit** - Additional state management (legacy)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── songs/         # Song endpoints
│   │   └── artists/       # Artist endpoints
│   ├── songs/             # Song pages
│   │   └── [slug]/        # Dynamic song detail page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── songs/             # Song-related components
│       ├── song-list.tsx
│       ├── song-card.tsx
│       ├── song-detail-client.tsx
│       └── enhanced-search.tsx
├── contexts/              # React Context providers
│   ├── AuthContext.tsx
│   ├── FavoritesContext.tsx
│   ├── LanguageContext.tsx
│   └── NotificationContext.tsx
├── lib/                   # Utility libraries
│   └── supabase.ts        # Supabase client
├── types/                 # TypeScript type definitions
│   ├── song.ts
│   ├── user.ts
│   ├── favorite.ts
│   └── rating.ts
└── providers/            # Provider composition
    └── app-providers.tsx
```

## Data Flow

1. **User Action** → Component Event Handler
2. **API Call** → Next.js API Route (`/app/api/*`)
3. **Database Query** → Supabase Client
4. **Response** → Context Update → UI Re-render

## Core Features

### 1. Song Management System

#### Song List Component
- Displays grid or list of songs
- Auto-refreshes every 30 seconds when page is visible
- Supports pagination and filtering
- Handles loading and error states

#### Song Detail Page
- Dynamic routing using song slugs
- Displays full lyrics with chord annotations
- Shows song metadata (artist, key, tempo, difficulty)
- Includes rating and favorite functionality
- Transpose feature for changing keys

#### Search Functionality
- Real-time search with 300ms debounce
- Autocomplete dropdown
- Filter by genre and key
- Click outside to close

### 2. User Authentication

- Supabase Auth integration
- Email/password authentication
- User profile management
- Role-based access (user, admin, moderator)

### 3. Favorites System

- Add/remove songs to favorites
- Persistent favorites per user
- Real-time updates via context

### 4. Internationalization

- English and French support
- Language switching
- Persistent language preference

### 5. Notifications

- Toast notifications for user actions
- Success, error, info, and warning types
- Auto-dismiss after 3 seconds

## Database Schema

### Core Tables

- **songs** - Song catalog with chords, lyrics, and metadata
- **artists** - Artist information
- **users** - Extended user profiles (links to Supabase Auth)
- **favorites** - User favorite songs and resources
- **ratings** - User ratings and reviews
- **resources** - Downloadable resources
- **piano_chords** - Piano chord library
- **song_requests** - User song requests

### Security

- Row Level Security (RLS) enabled on all tables
- Public read access to songs, artists, resources, chords
- Users can only access their own data (favorites, ratings, profiles)
- Admins have full access to all tables

## API Routes

### Songs
- `GET /api/songs` - List songs with filters and pagination
- `GET /api/songs/[slug]` - Get single song by slug

### Artists
- `GET /api/artists` - List artists with search

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials

3. **Run Database Migration**
   - Go to Supabase Dashboard → SQL Editor
   - Run `supabase/migrations/001_initial_schema.sql`

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Deployment

### Vercel (Frontend)
- Automatic deployments from GitHub
- Environment variables configured in Vercel dashboard
- See `VERCEL_ENV_SETUP.md` for details

### Supabase (Backend)
- Database hosted on Supabase
- See `SUPABASE_SETUP.md` for setup instructions
- See `SUPABASE_DATABASE_SETUP.md` for database schema

## Future Enhancements

- [ ] Piano chord diagram visualization
- [ ] Audio playback integration
- [ ] Advanced search filters
- [ ] User playlists
- [ ] Social sharing
- [ ] Mobile app (React Native)
- [ ] Offline support (PWA)
- [ ] Advanced analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your License Here]

## Support

For support, email [your-email] or create an issue in the repository.

