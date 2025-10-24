import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ProtectedEmail from '@/models/ProtectedEmail';
import AdminSession from '@/models/AdminSession';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'waroengku-secret-key-2025';

async function verifyAdminSession(authHeader: string | null): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  
  try {
    jwt.verify(token, JWT_SECRET);
    await connectDB();
    
    const session = await AdminSession.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });
    
    if (session) {
      // Update last activity
      await AdminSession.findByIdAndUpdate(session._id, {
        $set: { lastActivityAt: new Date() },
      });
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

function generateAccessKey(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// GET - Get all protected emails
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    const isValid = await verifyAdminSession(authHeader);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or expired session' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const emails = await ProtectedEmail.find().sort({ createdAt: -1 }).lean();
    const totalCount = await ProtectedEmail.countDocuments();
    const lockedCount = await ProtectedEmail.countDocuments({ isLocked: true });
    const unlockedCount = await ProtectedEmail.countDocuments({ isLocked: false });
    
    return NextResponse.json({
      success: true,
      emails,
      stats: {
        total: totalCount,
        locked: lockedCount,
        unlocked: unlockedCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get protected emails' },
      { status: 500 }
    );
  }
}

// POST - Add new protected email
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    const isValid = await verifyAdminSession(authHeader);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or expired session' },
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
    
    await connectDB();
    
    const existing = await ProtectedEmail.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    const finalKey = accessKey || generateAccessKey();
    const newEmail = await ProtectedEmail.create({
      email: email.toLowerCase(),
      accessKey: finalKey,
      isLocked: true,
      accessCount: 0,
    });
    
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
    const authHeader = request.headers.get('authorization');
    
    const isValid = await verifyAdminSession(authHeader);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or expired session' },
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
    
    await connectDB();
    
    const updatedEmail = await ProtectedEmail.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
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
    const authHeader = request.headers.get('authorization');
    
    const isValid = await verifyAdminSession(authHeader);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or expired session' },
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
    
    await connectDB();
    
    const deleted = await ProtectedEmail.findByIdAndDelete(id);
    
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
