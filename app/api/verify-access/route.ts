import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ProtectedEmail from '@/models/ProtectedEmail';

// POST - Verify access key for email
export async function POST(request: NextRequest) {
  try {
    const { email, accessKey } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const protectedEmail = await ProtectedEmail.findOne({ email: email.toLowerCase() });
    
    // Email not protected or unlocked
    if (!protectedEmail || !protectedEmail.isLocked) {
      return NextResponse.json({
        success: true,
        protected: false,
        message: 'Email is not protected',
      });
    }
    
    // Email is protected and locked
    if (!accessKey) {
      return NextResponse.json({
        success: false,
        protected: true,
        locked: true,
        message: 'Access key required',
      });
    }
    
    // Verify access key
    const isValid = protectedEmail.accessKey === accessKey;
    
    if (!isValid) {
      return NextResponse.json({
        success: false,
        protected: true,
        locked: true,
        message: 'Invalid access key',
      }, { status: 403 });
    }
    
    // Update last accessed time and increment access count
    await ProtectedEmail.findByIdAndUpdate(protectedEmail._id, {
      $set: { lastAccessedAt: new Date() },
      $inc: { accessCount: 1 },
    });
    
    return NextResponse.json({
      success: true,
      protected: true,
      locked: false,
      message: 'Access granted',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify access' },
      { status: 500 }
    );
  }
}
