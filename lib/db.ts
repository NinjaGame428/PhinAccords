import postgres, { Sql } from 'postgres';

type PostgresClient = Sql<{}>;

let dbInstance: PostgresClient | null = null;

// Function to create PostgreSQL client for Neon
const createDbClient = (): PostgresClient | null => {
  // Return existing instance if available (for serverless, this helps with connection reuse)
  if (dbInstance) {
    return dbInstance;
  }

  // Try NEON_DATABASE_URL first, then DATABASE_URL
  const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('[DB] ❌ Database URL not found. Please set NEON_DATABASE_URL or DATABASE_URL environment variable.');
    return null;
  }

  try {
    console.log('[DB] 🔌 Creating database connection...');
    
    // Parse URL to handle special characters properly
    let connectionString = databaseUrl;
    
    // Ensure SSL is properly configured
    if (!connectionString.includes('sslmode=')) {
      connectionString += connectionString.includes('?') ? '&' : '?';
      connectionString += 'sslmode=require';
    }
    
    // Create connection with optimized settings for serverless/edge
    const sql = postgres(connectionString, {
      max: 1, // Single connection for serverless
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: 'require',
      transform: {
        undefined: null
      },
      connection: {
        application_name: 'heavenkeys-chords-finder'
      }
    });
    
    dbInstance = sql;
    console.log('[DB] ✅ Database client created successfully');
    return sql;
  } catch (error: any) {
    console.error('[DB] ❌ Failed to create Neon database client:', error.message);
    console.error('[DB] Error details:', error);
    return null;
  }
};

// Create the client
const db = createDbClient();

// Helper function to safely execute queries
export const query = async <T = any>(queryFn: (sql: PostgresClient) => Promise<T>): Promise<T> => {
  if (!db) {
    const error = new Error('Database connection not available. Please check your NEON_DATABASE_URL or DATABASE_URL environment variable.');
    console.error('[DB] ❌', error.message);
    throw error;
  }
  
  try {
    return await queryFn(db);
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      severity: error.severity
    };
    
    console.error('[DB] ❌ Query error:', errorDetails);
    
    // Provide more helpful error messages
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      const tableMatch = error.message.match(/relation "([^"]+)"/);
      const tableName = tableMatch ? tableMatch[1] : 'unknown';
      throw new Error(`Database table "${tableName}" does not exist. Please run the migration script in Neon SQL Editor.`);
    }
    
    if (error.message?.includes('connection') || error.message?.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED') {
      throw new Error('Database connection failed. Please check your connection string and network connectivity.');
    }
    
    if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT') || error.code === 'ETIMEDOUT') {
      throw new Error('Database connection timed out. Please try again.');
    }
    
    if (error.message?.includes('password') || error.message?.includes('authentication') || error.code === '28P01') {
      throw new Error('Database authentication failed. Please check your connection credentials.');
    }
    
    if (error.message?.includes('database') && error.message?.includes('does not exist')) {
      throw new Error('Database does not exist. Please check your connection string.');
    }
    
    // Re-throw with original error for debugging
    throw error;
  }
};

// Export database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'moderator' | 'admin';
          created_at: string;
          updated_at: string;
        };
      };
      artists: {
        Row: {
          id: string;
          name: string;
          bio: string | null;
          image_url: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      songs: {
        Row: {
          id: string;
          title: string;
          artist_id: string;
          genre: string | null;
          key_signature: string | null;
          tempo: number | null;
          chords: string[] | null;
          lyrics: string | null;
          description: string | null;
          year: number | null;
          rating: number;
          downloads: number;
          created_at: string;
          updated_at: string;
          slug?: string | null;
          artist?: string | null;
        };
      };
      resources: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: 'pdf' | 'video' | 'audio' | 'image' | 'document' | null;
          category: string | null;
          file_url: string | null;
          file_size: number | null;
          downloads: number;
          rating: number;
          author: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}

export { db };
export default db;
