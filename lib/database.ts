import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'database.json');

export interface ProtectedEmail {
  id: string;
  email: string;
  accessKey: string;
  createdAt: string;
  isLocked: boolean;
}

export interface Database {
  protectedEmails: ProtectedEmail[];
  adminConfig: {
    masterKey: string;
    createdAt: string;
    lastModified: string;
  };
  metadata: {
    version: string;
    totalProtectedEmails: number;
    totalLocked: number;
    totalUnlocked: number;
  };
}

// Ensure database file exists
function ensureDatabase() {
  const dir = path.dirname(DB_PATH);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(DB_PATH)) {
    const initialData: Database = {
      protectedEmails: [],
      adminConfig: {
        masterKey: "WAROENGKU_ADMIN_2025",
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
      metadata: {
        version: "1.0.0",
        totalProtectedEmails: 0,
        totalLocked: 0,
        totalUnlocked: 0,
      },
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
  }
}

// Read database
export function readDatabase(): Database {
  ensureDatabase();
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// Write database
export function writeDatabase(data: Database) {
  ensureDatabase();
  
  // Update metadata
  data.metadata.totalProtectedEmails = data.protectedEmails.length;
  data.metadata.totalLocked = data.protectedEmails.filter(e => e.isLocked).length;
  data.metadata.totalUnlocked = data.protectedEmails.filter(e => !e.isLocked).length;
  data.adminConfig.lastModified = new Date().toISOString();
  
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Get all protected emails
export function getAllProtectedEmails(): ProtectedEmail[] {
  const db = readDatabase();
  return db.protectedEmails;
}

// Get protected email by email address
export function getProtectedEmailByAddress(email: string): ProtectedEmail | null {
  const db = readDatabase();
  return db.protectedEmails.find(pe => pe.email === email) || null;
}

// Add protected email
export function addProtectedEmail(email: string, accessKey: string): ProtectedEmail {
  const db = readDatabase();
  
  const newEmail: ProtectedEmail = {
    id: Date.now().toString(),
    email,
    accessKey,
    createdAt: new Date().toISOString(),
    isLocked: true,
  };
  
  db.protectedEmails.push(newEmail);
  writeDatabase(db);
  
  return newEmail;
}

// Update protected email
export function updateProtectedEmail(id: string, updates: Partial<ProtectedEmail>): ProtectedEmail | null {
  const db = readDatabase();
  const index = db.protectedEmails.findIndex(pe => pe.id === id);
  
  if (index === -1) return null;
  
  db.protectedEmails[index] = {
    ...db.protectedEmails[index],
    ...updates,
  };
  
  writeDatabase(db);
  return db.protectedEmails[index];
}

// Delete protected email
export function deleteProtectedEmail(id: string): boolean {
  const db = readDatabase();
  const initialLength = db.protectedEmails.length;
  
  db.protectedEmails = db.protectedEmails.filter(pe => pe.id !== id);
  
  if (db.protectedEmails.length < initialLength) {
    writeDatabase(db);
    return true;
  }
  
  return false;
}

// Verify admin key
export function verifyAdminKey(key: string): boolean {
  const db = readDatabase();
  return db.adminConfig.masterKey === key;
}

// Verify access key for email
export function verifyAccessKey(email: string, accessKey: string): boolean {
  const protectedEmail = getProtectedEmailByAddress(email);
  
  if (!protectedEmail) return true; // Email not protected
  if (!protectedEmail.isLocked) return true; // Email unlocked
  
  return protectedEmail.accessKey === accessKey;
}

// Generate access key
export function generateAccessKey(): string {
  return `WRG-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
}

// Get database stats
export function getDatabaseStats() {
  const db = readDatabase();
  return db.metadata;
}
