import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AdminSession from '@/models/AdminSession';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'waroengku-secret-key-2025';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided', valid: false },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    
    // Verify JWT
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token', valid: false },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Check session in database
    const session = await AdminSession.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired', valid: false },
        { status: 401 }
      );
    }
    
    // Update last activity
    await AdminSession.findByIdAndUpdate(session._id, {
      $set: { lastActivityAt: new Date() },
    });
    
    return NextResponse.json({
      success: true,
      valid: true,
      session: {
        id: session._id,
        username: session.username,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        lastActivityAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Session verify error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed', valid: false },
      { status: 500 }
    );
  }
}
