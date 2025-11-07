import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export const PATCH = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { action, userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs are required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    const serverClient = createServerClient();

    if (action === 'delete') {
      const { error } = await serverClient
        .from('users')
        .delete()
        .in('id', userIds);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to delete users' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${userIds.length} users`,
      });
    }

    let updateData: any = { updated_at: new Date().toISOString() };

    switch (action) {
      case 'activate':
        updateData.status = 'active';
        break;
      case 'deactivate':
        updateData.status = 'inactive';
        break;
      case 'ban':
        updateData.status = 'banned';
        break;
      case 'unban':
        updateData.status = 'active';
        break;
      case 'make_admin':
        updateData.role = 'admin';
        break;
      case 'make_moderator':
        updateData.role = 'moderator';
        break;
      case 'make_user':
        updateData.role = 'user';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const { error } = await serverClient
      .from('users')
      .update(updateData)
      .in('id', userIds);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update users' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}d ${userIds.length} users`,
    });
  } catch (error) {
    console.error('Error in bulk action:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
};

export const DELETE = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs are required' },
        { status: 400 }
      );
    }

    const serverClient = createServerClient();
    const { error } = await serverClient
      .from('users')
      .delete()
      .in('id', userIds);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete users' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${userIds.length} users`,
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json(
      { error: 'Failed to delete users' },
      { status: 500 }
    );
  }
};
