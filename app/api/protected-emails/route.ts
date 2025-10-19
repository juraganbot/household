import { NextRequest, NextResponse } from 'next/server';
import {
  getAllProtectedEmails,
  addProtectedEmail,
  updateProtectedEmail,
  deleteProtectedEmail,
  verifyAdminKey,
  generateAccessKey,
  getDatabaseStats,
} from '@/lib/database';

// GET - Get all protected emails
export async function GET(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    
    if (!adminKey || !verifyAdminKey(adminKey)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const emails = getAllProtectedEmails();
    const stats = getDatabaseStats();
    
    return NextResponse.json({
      success: true,
      emails,
      stats,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to get protected emails' },
        { status: 500 }
      );
    }
  }
}

// POST - Add new protected email
export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    
    if (!adminKey || !verifyAdminKey(adminKey)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { email, accessKey } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    const finalKey = accessKey || generateAccessKey();
    const newEmail = addProtectedEmail(email, finalKey);
    
    return NextResponse.json({
      success: true,
      email: newEmail,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add protected email' },
      { status: 500 }
    );
  }
}

// PATCH - Update protected email
export async function PATCH(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    
    if (!adminKey || !verifyAdminKey(adminKey)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id, updates } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Email ID is required' },
        { status: 400 }
      );
    }
    
    const updatedEmail = updateProtectedEmail(id, updates);
    
    if (!updatedEmail) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      email: updatedEmail,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update protected email' },
      { status: 500 }
    );
  }
}

// DELETE - Delete protected email
export async function DELETE(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    
    if (!adminKey || !verifyAdminKey(adminKey)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Email ID is required' },
        { status: 400 }
      );
    }
    
    const deleted = deleteProtectedEmail(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Email deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete protected email' },
      { status: 500 }
    );
  }
}
