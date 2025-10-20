/**
 * Security utilities for filtering sensitive content
 * 
 * Simple subject-based blacklist (no regex)
 */

// Blacklist subject keywords (exact phrases to block)
const BLACKLIST_SUBJECTS = [
  'kode verifikasimu',
  'your verification code',
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
 * Filter messages to remove blacklisted emails (subject-based only)
 */
export function filterVerificationEmails<T extends { subject: string; body: string; snippet: string }>(
  messages: T[]
): T[] {
  return messages.filter(message => {
    // Only check subject line against blacklist
    return !isBlacklistedSubject(message.subject);
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

