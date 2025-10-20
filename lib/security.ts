/**
 * Security utilities for filtering sensitive content
 * 
 * IMPORTANT: Only blocks 6-digit verification codes
 * 4-digit codes are preserved for sign-in purposes
 */

// Patterns untuk detect kode verifikasi (ONLY 6 DIGITS - NOT 4 DIGITS)
const VERIFICATION_CODE_PATTERNS = [
  // 6 digit code ONLY (not 4, not 8)
  /\b\d{6}\b/g,
  
  // 6 digit dengan spacing atau separator
  /\b\d{3}[\s\-]\d{3}\b/g,
  
  // 6 digit dalam HTML/email context
  />\s*\d{6}\s*</g,
  
  // Letter spacing style (common in emails)
  /letter-spacing[^>]*>\s*\d{6}\s*</gi,
  
  // Common verification code keywords + 6 digits ONLY
  /(verification code|kode verifikasi|otp|pin|code|kode)[\s\S]{0,50}\b\d{6}\b/gi,
];

// Keywords yang indicate verification email
const VERIFICATION_KEYWORDS = [
  'verification code',
  'verify',
  'otp',
  'one-time password',
  'authentication code',
  'security code',
  'kode verifikasi',
  'kode otp',
  'konfirmasi',
  'aktivasi',
  'reset password',
  'two-factor',
  '2fa',
  'mfa',
];

/**
 * Check if content contains verification code
 */
export function containsVerificationCode(content: string): boolean {
  if (!content) return false;
  
  const lowerContent = content.toLowerCase();
  
  // Check for verification keywords
  const hasKeyword = VERIFICATION_KEYWORDS.some(keyword => 
    lowerContent.includes(keyword.toLowerCase())
  );
  
  // Check for 6-digit patterns
  const hasSixDigits = /\b\d{6}\b/.test(content);
  
  // If has both keyword and 6 digits, likely verification email
  if (hasKeyword && hasSixDigits) {
    return true;
  }
  
  // Check for standalone 6-digit codes (aggressive)
  // Only flag if found in isolation (not part of longer number)
  const sixDigitMatches = content.match(/\b\d{6}\b/g);
  if (sixDigitMatches && sixDigitMatches.length > 0) {
    // Check if it's in a verification context
    for (const match of sixDigitMatches) {
      const index = content.indexOf(match);
      const context = content.substring(Math.max(0, index - 100), Math.min(content.length, index + 100));
      
      // Check context for verification indicators
      if (VERIFICATION_KEYWORDS.some(kw => context.toLowerCase().includes(kw))) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check if email subject indicates verification
 */
export function isVerificationSubject(subject: string): boolean {
  if (!subject) return false;
  
  const lowerSubject = subject.toLowerCase();
  
  const verificationSubjectKeywords = [
    'verification',
    'verify',
    'confirm',
    'otp',
    'code',
    'authentication',
    'security',
    'kode',
    'verifikasi',
    'konfirmasi',
  ];
  
  return verificationSubjectKeywords.some(keyword => 
    lowerSubject.includes(keyword)
  );
}

/**
 * Sanitize content by removing/masking verification codes
 * (Optional: for display purposes)
 */
export function sanitizeVerificationCode(content: string): string {
  if (!content) return content;
  
  let sanitized = content;
  
  // Replace 6-digit codes with masked version
  sanitized = sanitized.replace(/\b(\d{6})\b/g, '******');
  
  // Replace in HTML context
  sanitized = sanitized.replace(/>\s*\d{6}\s*</g, '>******<');
  
  return sanitized;
}

/**
 * Filter messages to remove verification emails
 */
export function filterVerificationEmails<T extends { subject: string; body: string; snippet: string }>(
  messages: T[]
): T[] {
  return messages.filter(message => {
    // Check subject
    if (isVerificationSubject(message.subject)) {
      return false;
    }
    
    // Check body content
    if (containsVerificationCode(message.body)) {
      return false;
    }
    
    // Check snippet
    if (containsVerificationCode(message.snippet)) {
      return false;
    }
    
    return true;
  });
}

/**
 * Get statistics about filtered messages
 */
export function getFilterStats<T extends { subject: string; body: string; snippet: string }>(
  messages: T[]
): {
  total: number;
  filtered: number;
  remaining: number;
  filterRate: number;
} {
  const total = messages.length;
  const remaining = filterVerificationEmails(messages).length;
  const filtered = total - remaining;
  const filterRate = total > 0 ? (filtered / total) * 100 : 0;
  
  return {
    total,
    filtered,
    remaining,
    filterRate: Math.round(filterRate * 100) / 100,
  };
}

/**
 * Check if specific code pattern exists
 */
export function extractVerificationCodes(content: string): string[] {
  if (!content) return [];
  
  const codes: string[] = [];
  const matches = content.match(/\b\d{6}\b/g);
  
  if (matches) {
    codes.push(...matches);
  }
  
  return [...new Set(codes)]; // Remove duplicates
}
