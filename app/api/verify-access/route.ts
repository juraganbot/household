import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessKey, getProtectedEmailByAddress } from '@/lib/database';

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
    
    const protectedEmail = getProtectedEmailByAddress(email);
    
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
    const isValid = verifyAccessKey(email, accessKey);
    
    if (!isValid) {
      return NextResponse.json({
        success: false,
        protected: true,
        locked: true,
        message: 'Invalid access key',
      }, { status: 403 });
    }
    
    return NextResponse.json({
      success: true,
      protected: true,
      locked: false,
      message: 'Access granted',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to verify access' },
      { status: 500 }
    );
  }
}
