-- Seed data for development and testing
-- This file contains sample data to populate the database

-- Insert additional artists
INSERT INTO public.artists (name, bio, image_url, website) VALUES
('Taylor Swift', 'Country and pop superstar', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', 'https://taylorswift.com'),
('Ed Sheeran', 'Singer-songwriter and guitarist', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'https://edsheeran.com'),
('Adele', 'Soul and pop vocalist', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'https://adele.com'),
('John Mayer', 'Blues and rock guitarist', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'https://johnmayer.com'),
('Norah Jones', 'Jazz and pop singer-pianist', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400', 'https://norahjones.com');

-- Insert more songs with different genres and difficulty levels
INSERT INTO public.songs (title, artist, genre, key_signature, tempo, chords, lyrics, year, description) VALUES
('Shake It Off', 'Taylor Swift', 'Pop', 'C', 160, ARRAY['C', 'Am', 'F', 'G'], 'I stay up too late, got nothing in my brain...', 2014, 'Upbeat pop song with simple chord progression'),
('Perfect', 'Ed Sheeran', 'Pop', 'G', 95, ARRAY['G', 'Em', 'C', 'D'], 'I found a love for me, darling just dive right in...', 2017, 'Romantic ballad with beautiful melody'),
('Hello', 'Adele', 'Soul', 'F', 79, ARRAY['F', 'Am', 'Bb', 'C'], 'Hello, it''s me, I was wondering...', 2015, 'Powerful ballad with emotional depth'),
('Gravity', 'John Mayer', 'Blues', 'G', 120, ARRAY['G', 'C', 'D', 'Em'], 'Gravity is working against me...', 2006, 'Blues-influenced song with complex guitar work'),
('Don''t Know Why', 'Norah Jones', 'Jazz', 'F', 88, ARRAY['F', 'Bb', 'C', 'Dm'], 'I waited till I saw the sun...', 2002, 'Jazz-influenced pop with smooth vocals'),
('Wonderwall', 'Oasis', 'Rock', 'Em', 87, ARRAY['Em', 'G', 'D', 'C'], 'Today is gonna be the day...', 1995, 'Classic rock anthem with iconic chord progression'),
('Hallelujah', 'Leonard Cohen', 'Folk', 'C', 76, ARRAY['C', 'Am', 'F', 'G'], 'I heard there was a secret chord...', 1984, 'Spiritual folk song with deep meaning'),
('Hotel California', 'Eagles', 'Rock', 'Bm', 75, ARRAY['Bm', 'F#', 'A', 'E'], 'On a dark desert highway...', 1976, 'Epic rock song with complex arrangement'),
('Let It Be', 'The Beatles', 'Rock', 'C', 72, ARRAY['C', 'G', 'Am', 'F'], 'When I find myself in times of trouble...', 1970, 'Inspirational ballad with simple chords'),
('Blackbird', 'The Beatles', 'Folk', 'G', 85, ARRAY['G', 'Am', 'G', 'Am'], 'Blackbird singing in the dead of night...', 1968, 'Fingerpicking folk song');

-- Insert more resources
INSERT INTO public.resources (title, description, type, category, author, downloads, rating) VALUES
('Complete Guitar Method', 'Learn guitar from beginner to advanced', 'Book', 'Educational', 'Guitar Master', 1250, 4.8),
('Piano Theory Workbook', 'Comprehensive music theory for piano', 'Book', 'Educational', 'Piano Academy', 890, 4.6),
('Songwriting Masterclass', 'Professional songwriting techniques and tips', 'Video', 'Educational', 'Songwriter Pro', 567, 4.9),
('Chord Progressions Guide', 'Common chord progressions in all keys', 'PDF', 'Reference', 'Music Theory Expert', 2100, 4.7),
('Scales and Modes', 'Complete guide to scales and modes', 'PDF', 'Educational', 'Jazz Musician', 1450, 4.5),
('Recording Techniques', 'Home studio recording guide', 'Video', 'Technical', 'Audio Engineer', 780, 4.4),
('Music Business Guide', 'How to succeed in the music industry', 'Book', 'Business', 'Music Industry Pro', 650, 4.3),
('Guitar Maintenance', 'Keep your guitar in perfect condition', 'Article', 'Technical', 'Guitar Technician', 920, 4.6),
('Vocal Techniques', 'Improve your singing voice', 'Video', 'Educational', 'Vocal Coach', 1100, 4.8),
('Music Production', 'Modern music production techniques', 'Video', 'Technical', 'Music Producer', 890, 4.7);

-- Insert some sample ratings (these would normally be created by users)
INSERT INTO public.ratings (user_id, song_id, rating, comment) VALUES
-- Note: These would need actual user IDs from your auth.users table
-- For now, we'll skip ratings as they require authenticated users

-- Insert some sample favorites (these would normally be created by users)
-- Note: These would need actual user IDs from your auth.users table
-- For now, we'll skip favorites as they require authenticated users
