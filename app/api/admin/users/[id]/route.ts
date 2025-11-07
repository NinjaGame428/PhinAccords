import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const serverClient = createServerClient();

    const { data: user, error } = await serverClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const body = await request.json();
    const { action, ...updates } = body;
    const serverClient = createServerClient();

    let updateData: any = { updated_at: new Date().toISOString() };

    if (action) {
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
    } else {
      updateData = { ...updates, updated_at: new Date().toISOString() };
    }

    const { error } = await serverClient
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: action ? `User ${action} successfully` : 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const serverClient = createServerClient();

    const { error } = await serverClient
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
};
