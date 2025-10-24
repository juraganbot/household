import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AdminSession from '@/models/AdminSession';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'PLER';
const JWT_SECRET = process.env.JWT_SECRET || 'waroengku-secret-key-2025';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }
    
    // Verify password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Generate JWT token
    const tokenPayload = {
      username: 'admin',
      timestamp: Date.now(),
      random: crypto.randomBytes(16).toString('hex'),
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '24h',
    });
    
    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Create session in database
    const expiresAt = new Date(Date.now() + SESSION_DURATION);
    const session = await AdminSession.create({
      token,
      username: 'admin',
      ipAddress,
      userAgent,
      expiresAt,
      isActive: true,
    });
    
    return NextResponse.json({
      success: true,
      token,
      expiresAt: expiresAt.toISOString(),
      expiresIn: SESSION_DURATION,
      message: 'Login successful',
      session: {
        id: session._id,
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 }
    );
  }
}
