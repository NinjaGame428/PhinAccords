import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const maxLimit = Math.min(limit, 200);
    const offset = (page - 1) * maxLimit;
    
    const serverClient = createServerClient();
    
    try {
      // Get total count
      let countQuery = serverClient
        .from('resources')
        .select('*', { count: 'exact', head: true });
      
      if (category && category !== 'All Resources') {
        countQuery = countQuery.eq('category', category);
      }
      if (type) {
        countQuery = countQuery.eq('type', type);
      }
      
      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error('❌ Error getting resource count:', countError);
        return NextResponse.json({ 
          resources: [], 
          pagination: { page, limit: maxLimit, total: 0, totalPages: 0 }
        });
      }

      // Fetch resources
      let query = serverClient
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + maxLimit - 1);

      if (category && category !== 'All Resources') {
        query = query.eq('category', category);
      }
      if (type) {
        query = query.eq('type', type);
      }

      const { data: resources, error: resourcesError } = await query;

      if (resourcesError) {
        console.error('❌ Error fetching resources:', resourcesError);
        return NextResponse.json({ 
          resources: [], 
          pagination: {
            page,
            limit: maxLimit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / maxLimit)
          }
        });
      }

      console.log(`✅ Successfully fetched ${resources?.length || 0} resources`);

      const response = NextResponse.json({ 
        resources: resources || [], 
        pagination: {
          page,
          limit: maxLimit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / maxLimit)
        }
      });
      
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      
      return response;
    } catch (dbError: any) {
      console.error('❌ Database error in GET /api/resources:', dbError);
      return NextResponse.json({ 
        resources: [],
        pagination: { page, limit: maxLimit, total: 0, totalPages: 0 },
        error: 'Database connection failed',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error('❌ Error in GET /api/resources:', error);
    return NextResponse.json({ 
      resources: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description,
      type,
      category,
      file_url,
      file_size,
      author
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ 
        error: 'Title is required',
        details: 'Please provide a resource title'
      }, { status: 400 });
    }
    
    if (!type || !type.trim()) {
      return NextResponse.json({ 
        error: 'Type is required',
        details: 'Please provide a resource type'
      }, { status: 400 });
    }

    if (!category || !category.trim()) {
      return NextResponse.json({ 
        error: 'Category is required',
        details: 'Please provide a resource category'
      }, { status: 400 });
    }

    if (!author || !author.trim()) {
      return NextResponse.json({ 
        error: 'Author is required',
        details: 'Please provide an author name'
      }, { status: 400 });
    }

    const serverClient = createServerClient();

    const { data: resourceData, error } = await serverClient
      .from('resources')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        type: type.trim(),
        category: category.trim(),
        file_url: file_url?.trim() || null,
        file_size: file_size || null,
        author: author.trim(),
        downloads: 0,
        rating: 0
      })
      .select()
      .single();

    if (error || !resourceData) {
      console.error('Error creating resource:', error);
      return NextResponse.json({ 
        error: 'Failed to create resource',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      }, { status: 500 });
    }

    const response = NextResponse.json({ resource: resourceData }, { status: 201 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    return response;
  } catch (error: any) {
    console.error('Error creating resource:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

