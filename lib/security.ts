/**
 * Security utilities for filtering sensitive content
 * 
 * Blacklist based on subject + verification links
 */

// Blacklist subject keywords (exact phrases to block)
const BLACKLIST_SUBJECTS = [
  'kode verifikasimu',
  'your verification code',
];

// Blacklist URL patterns (verification/token links)
const BLACKLIST_URL_PATTERNS = [
  'verify?token=',
  'verification?token=',
  'confirm?token=',
  'activate?token=',
  '/verify/',
  '/verification/',
  '/confirm/',
  '/activate/',
];

/**
 * Check if subject contains blacklisted phrases
 */
export function isBlacklistedSubject(subject: string): boolean {
  if (!subject) return false;
  
  const lowerSubject = subject.toLowerCase().trim();
  
  // Check if subject contains any blacklisted phrase
  return BLACKLIST_SUBJECTS.some(blacklisted => 
    lowerSubject.includes(blacklisted.toLowerCase())
  );
}

/**
 * Check if body/snippet contains verification links
 */
export function containsVerificationLink(content: string): boolean {
  if (!content) return false;
  
  const lowerContent = content.toLowerCase();
  
  // Check if content contains any blacklisted URL pattern
  return BLACKLIST_URL_PATTERNS.some(pattern => 
    lowerContent.includes(pattern.toLowerCase())
  );
}


/**
 * Filter messages to remove blacklisted emails (subject + verification links)
 */
export function filterVerificationEmails<T extends { subject: string; body: string; snippet: string }>(
  messages: T[]
): T[] {
  return messages.filter(message => {
    // Check 1: Subject line blacklist
    if (isBlacklistedSubject(message.subject)) {
      return false;
    }
    
    // Check 2: Verification links in body
    if (containsVerificationLink(message.body)) {
      return false;
    }
    
    // Check 3: Verification links in snippet
    if (containsVerificationLink(message.snippet)) {
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

